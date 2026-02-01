"use server";

import { createClient } from "@/lib/supabase/server";

export async function setUserRole(role: "investor" | "seller") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  await supabase.from("profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", user.id);
}
