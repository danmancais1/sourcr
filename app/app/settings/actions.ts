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

  const { data: ws } = await supabase.from("workspaces").select("stripe_customer_id").eq("id", workspaceId).maybeSingle();
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

export type InvestorDirectoryEntry = {
  display_name: string;
  contact_email: string;
  contact_phone: string | null;
  postcodes_or_areas: string | null;
  criteria: string | null;
};

export async function getInvestorDirectoryEntry(workspaceId: string): Promise<InvestorDirectoryEntry | null> {
  const supabase = await createClient();
  const currentWsId = await getCurrentWorkspaceId(supabase);
  if (!currentWsId || currentWsId !== workspaceId) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("investor_directory")
    .select("display_name, contact_email, contact_phone, postcodes_or_areas, criteria")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return data as InvestorDirectoryEntry | null;
}

export async function upsertInvestorDirectory(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const workspaceId = formData.get("workspaceId") as string;
  const currentWsId = await getCurrentWorkspaceId(supabase);
  if (!currentWsId || currentWsId !== workspaceId) return { error: "Unauthorised" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const display_name = (formData.get("display_name") as string)?.trim();
  const contact_email = (formData.get("contact_email") as string)?.trim();
  if (!display_name || !contact_email) return { error: "Name and email required." };

  const contact_phone = (formData.get("contact_phone") as string)?.trim() || null;
  const postcodes_or_areas = (formData.get("postcodes_or_areas") as string)?.trim() || null;
  const criteria = (formData.get("criteria") as string)?.trim() || null;

  const { error } = await supabase.from("investor_directory").upsert(
    {
      workspace_id: workspaceId,
      user_id: user.id,
      display_name,
      contact_email,
      contact_phone,
      postcodes_or_areas,
      criteria,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" }
  );
  if (error) {
    console.error("Investor directory upsert error:", error.message);
    return { error: "Failed to save." };
  }
  return {};
}