"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export async function syncCheckoutSession(sessionId: string) {
  const stripe = getStripe();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const workspaceId = session.client_reference_id ?? (session.subscription as { metadata?: { workspace_id?: string } })?.metadata?.workspace_id;
  if (!workspaceId || typeof workspaceId !== "string") return;

  const customerId = session.customer as string;
  const subId = session.subscription as string;
  let priceId: string | null = null;

  if (subId) {
    const sub = await stripe.subscriptions.retrieve(subId);
    priceId = sub.items?.data?.[0]?.price?.id ?? null;
  }

  const plan = priceId?.includes("pro") ? "pro" : "starter";

  await supabase
    .from("workspaces")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subId || null,
      stripe_price_id: priceId,
      plan,
      updated_at: new Date().toISOString(),
    })
    .eq("id", workspaceId);

  redirect("/app/dashboard");
}