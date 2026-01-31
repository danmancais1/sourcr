import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

async function getSupabaseAdmin() {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: Request) {
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
      const workspaceId = session.client_reference_id ?? session.subscription as string;
      let subId = session.subscription as string;
      if (typeof subId !== "string" && subId) subId = (subId as Stripe.Subscription).id;
      if (session.customer_email && workspaceId) {
        const customerId = session.customer as string;
        const sub = subId ? await stripe.subscriptions.retrieve(subId) : null;
        const priceId = sub?.items?.data?.[0]?.price?.id ?? null;
        const plan = priceId?.includes("pro") ? "pro" : "starter";
        await supabase
          .from("workspaces")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subId || null,
            stripe_price_id: priceId || null,
            plan,
            updated_at: new Date().toISOString(),
          })
          .eq("id", workspaceId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const workspaceId = sub.metadata?.workspace_id;
      if (!workspaceId) break;
      if (event.type === "customer.subscription.deleted") {
        await supabase
          .from("workspaces")
          .update({
            stripe_subscription_id: null,
            stripe_price_id: null,
            plan: "starter",
            updated_at: new Date().toISOString(),
          })
          .eq("id", workspaceId);
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
          .eq("id", workspaceId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
