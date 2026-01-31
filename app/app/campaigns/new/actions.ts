"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export async function createCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return;
  const name = (formData.get("name") as string)?.trim();
  if (!name) return;
  const templateId = (formData.get("template_id") as string)?.trim() || null;
  const b2b_confirmed = formData.get("b2b_confirmed") === "1";
  const { data } = await supabase
    .from("campaigns")
    .insert({
      workspace_id: workspaceId,
      name,
      template_id: templateId || null,
      b2b_confirmed,
      status: "draft",
    })
    .select("id")
    .single();
  if (data?.id) redirect("/app/campaigns/" + data.id);
}
