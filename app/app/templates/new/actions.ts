"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspaceId } from "@/lib/workspace";

export async function createTemplateAction(formData: FormData) {
  const supabase = await createClient();
  const workspaceId = await getCurrentWorkspaceId(supabase);
  if (!workspaceId) return;
  const name = (formData.get("name") as string)?.trim();
  const channel = (formData.get("channel") as string) || "letter";
  const body = (formData.get("body") as string)?.trim();
  if (!name || !body) return;
  const subject = (formData.get("subject") as string)?.trim() || null;
  const { data } = await supabase
    .from("templates")
    .insert({
      workspace_id: workspaceId,
      name,
      channel,
      subject: channel === "email" ? subject : null,
      body,
    })
    .select("id")
    .single();
  if (data?.id) redirect("/app/templates/" + data.id);
}
