import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

async function getSupabaseAdmin() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await getSupabaseAdmin();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      let subId = session.subscription as string;
      if (typeof subId !== "string" && subId) subId = (subId as Stripe.Subscription).id;

      const userId = session.metadata?.user_id;
      const workspaceName = session.metadata?.workspace_name;
      const planFromMeta = session.metadata?.plan;

      if (!userId || !workspaceName || !subId) {
        break;
      }

      const customerId = session.customer as string;
      const sub = await stripe.subscriptions.retrieve(subId);
      const priceId = sub?.items?.data?.[0]?.price?.id ?? null;
      const plan = planFromMeta === "pro" ? "pro" : "starter";

      // Idempotency: workspace may already exist if webhook was retried
      const { data: existing } = await supabase
        .from("workspaces")
        .select("id")
        .eq("stripe_subscription_id", subId)
        .limit(1)
        .maybeSingle();

      if (existing?.id) {
        break;
      }

      const slug =
        workspaceName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "workspace";
      const slugUnique = `${slug}-${Date.now()}`;

      const { data: workspace, error: wsError } = await supabase
        .from("workspaces")
        .insert({
          name: workspaceName,
          slug: slugUnique,
          plan,
          stripe_customer_id: customerId,
          stripe_subscription_id: subId,
          stripe_price_id: priceId,
        })
        .select("id")
        .single();

      if (wsError || !workspace?.id) {
        console.error("Webhook workspace create error:", wsError?.message, wsError?.code);
        break;
      }

      const { error: memberError } = await supabase.from("workspace_members").insert({
        workspace_id: workspace.id,
        user_id: userId,
        role: "owner",
      });

      if (memberError) {
        console.error("Webhook workspace_member create error:", memberError.message, memberError.code);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("stripe_subscription_id", sub.id)
        .limit(1)
        .maybeSingle();
      if (!workspace?.id) break;

      if (event.type === "customer.subscription.deleted") {
        await supabase
          .from("workspaces")
          .update({
            stripe_subscription_id: null,
            stripe_price_id: null,
            plan: "starter",
            updated_at: new Date().toISOString(),
          })
          .eq("id", workspace.id);
      } else {
        const priceId = sub.items?.data?.[0]?.price?.id ?? null;
        const plan = priceId?.includes("pro") ? "pro" : "starter";
        await supabase
          .from("workspaces")
          .update({
            stripe_subscription_id: sub.id,
            stripe_price_id: priceId,
            plan,
            updated_at: new Date().toISOString(),
          })
          .eq("id", workspace.id);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}