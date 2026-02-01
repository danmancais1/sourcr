"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export async function createBillingPortalSession(formData: FormData) {
  const stripe = getStripe();
  const workspaceId = formData.get("workspaceId") as string;
  const supabase = await createClient();
  const currentWsId = await getCurrentWorkspaceId(supabase);
  if (!currentWsId || currentWsId !== workspaceId) throw new Error("Unauthorised");

  const { data: ws } = await supabase.from("workspaces").select("stripe_customer_id").eq("id", workspaceId).single();
  if (!ws?.stripe_customer_id) {
    throw new Error("No billing account. Complete checkout first.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: ws.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/app/settings#billing`,
  });

  if (session.url) redirect(session.url);
  throw new Error("Failed to open portal");
}

export async function updateWorkspaceName(formData: FormData) {
  const workspaceId = formData.get("workspaceId") as string;
  const name = (formData.get("name") as string)?.trim();
  const supabase = await createClient();
  const currentWsId = await getCurrentWorkspaceId(supabase);
  if (!currentWsId || currentWsId !== workspaceId || !name) return;

  await supabase.from("workspaces").update({ name, updated_at: new Date().toISOString() }).eq("id", workspaceId);
}