"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export async function sendMessageAction(matchId: string, workspaceId: string, body: string) {
  const supabase = await createClient();
  const currentWs = await getCurrentWorkspaceId(supabase);
  if (currentWs !== workspaceId) return;
  await supabase.from("messages").insert({
    match_id: matchId,
    sender_type: "investor",
    sender_workspace_id: workspaceId,
    body,
  });
  revalidatePath("/app/messaging");
}
