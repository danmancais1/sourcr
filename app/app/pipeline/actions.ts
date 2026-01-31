"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export async function updateLeadStageAction(formData: FormData) {
  const leadId = formData.get("leadId") as string;
  const stage = formData.get("stage") as string;
  if (!leadId || !stage) return;
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return;
  await supabase.from("leads").update({ pipeline_stage: stage, updated_at: new Date().toISOString() }).eq("id", leadId).eq("workspace_id", workspaceId);
  revalidatePath("/app/pipeline");
  revalidatePath("/app/leads");
}
