"use server";

import { createClient } from "@/lib/supabase/server";

export type AppSession = {
  role: "investor" | "seller" | null;
  hasWorkspace: boolean;
};

export async function getAppSession(): Promise<AppSession> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { role: null, hasWorkspace: false };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  const role = (profile as { role?: string } | null)?.role as "investor" | "seller" | null | undefined;
  if (!role || (role !== "investor" && role !== "seller")) {
    return { role: null, hasWorkspace: false };
  }

  const { data: membership } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  return {
    role,
    hasWorkspace: Boolean(membership?.workspace_id),
  };
}
