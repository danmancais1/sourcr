"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export type DashboardData = {
  workspace: { id: string; name: string; plan: string } | null;
  leadsCount: number;
  campaignsCount: number;
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { workspace: null, leadsCount: 0, campaignsCount: 0 };
  }

  const { data: memberships } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(id, name, plan)")
    .eq("user_id", user.id);
  const first = (memberships ?? [])[0] as { workspaces?: { id: string; name: string; plan: string } } | undefined;
  const workspaces = first?.workspaces;
  const ws = Array.isArray(workspaces) ? workspaces?.[0] : workspaces;

  if (!ws?.id) {
    return { workspace: null, leadsCount: 0, campaignsCount: 0 };
  }

  const { count: leadsCount } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", ws.id);

  const { count: campaignsCount } = await supabase
    .from("campaigns")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", ws.id);

  return {
    workspace: { id: ws.id, name: ws.name, plan: ws.plan },
    leadsCount: leadsCount ?? 0,
    campaignsCount: campaignsCount ?? 0,
  };
}

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