"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";
import { revalidatePath } from "next/cache";
import { SOURCING_CATEGORY_IDS } from "@/lib/sourcing-categories";

export async function createSellerAd(formData: FormData): Promise<{ error: string } | { success: true }> {
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim();
  const signal_tag = (formData.get("signal_tag") as string)?.trim() || null;
  const contact_name = (formData.get("contact_name") as string)?.trim();
  const contact_email = (formData.get("contact_email") as string)?.trim();
  const contact_phone = (formData.get("contact_phone") as string)?.trim() || null;

  if (!title || !description || !contact_name || !contact_email) {
    return { error: "Please fill in title, description, name and email." };
  }
  if (signal_tag && !SOURCING_CATEGORY_IDS.includes(signal_tag as any)) {
    return { error: "Invalid category." };
  }

  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return { error: "Not authorised." };

  const { error } = await supabase.from("seller_ads").insert({
    workspace_id: workspaceId,
    title,
    description,
    signal_tag,
    contact_name,
    contact_email,
    contact_phone,
    status: "active",
  });

  if (error) {
    console.error("Seller ad create error:", error.message);
    return { error: "Failed to post ad. Please try again." };
  }
  revalidatePath("/seller/post-ad");
  revalidatePath("/seller/ads");
  return { success: true };
}

export async function getMySellerAds(): Promise<
  { id: string; title: string; description: string; signal_tag: string | null; status: string; created_at: string }[]
> {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return [];

  const { data } = await supabase
    .from("seller_ads")
    .select("id, title, description, signal_tag, status, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  return (data ?? []) as any;
}
