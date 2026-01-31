import { SupabaseClient } from "@supabase/supabase-js";

export async function getCurrentWorkspace(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: row } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(*)")
    .eq("user_id", user.id)
    .limit(1)
    .single();
  const ws = (row as { workspaces: Record<string, unknown> } | null)?.workspaces;
  return ws ? (ws as { id: string; name: string; slug: string; plan: string }) : null;
}

export async function getCurrentWorkspaceId(supabase: SupabaseClient): Promise<string | null> {
  const ws = await getCurrentWorkspace(supabase);
  return ws?.id ?? null;
}
