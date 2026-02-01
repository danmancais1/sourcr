"use server";
import { createClient } from "@/lib/supabase/server";

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