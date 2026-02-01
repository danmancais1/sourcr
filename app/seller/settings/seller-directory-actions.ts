"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";
import { revalidatePath } from "next/cache";

export type SellerDirectoryEntry = {
  display_name: string;
  contact_email: string;
  contact_phone: string | null;
  areas_or_criteria: string | null;
};

export async function getSellerDirectoryEntry(): Promise<SellerDirectoryEntry | null> {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("seller_directory")
    .select("display_name, contact_email, contact_phone, areas_or_criteria")
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return data as SellerDirectoryEntry | null;
}

export async function upsertSellerDirectory(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return { error: "Unauthorised" };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const display_name = (formData.get("display_name") as string)?.trim();
  const contact_email = (formData.get("contact_email") as string)?.trim();
  if (!display_name || !contact_email) return { error: "Name and email required." };

  const contact_phone = (formData.get("contact_phone") as string)?.trim() || null;
  const areas_or_criteria = (formData.get("areas_or_criteria") as string)?.trim() || null;

  const { error } = await supabase.from("seller_directory").upsert(
    {
      workspace_id: workspaceId,
      user_id: user.id,
      display_name,
      contact_email,
      contact_phone,
      areas_or_criteria,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" }
  );
  if (error) {
    console.error("Seller directory upsert error:", error.message);
    return { error: "Failed to save." };
  }
  revalidatePath("/seller/settings");
  return {};
}
