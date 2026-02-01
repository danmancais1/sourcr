"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function setUserRole(role: "investor" | "seller") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: updated, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      role,
      updated_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error) {
    console.error("setUserRole failed:", error.message);
    throw new Error(error.message || "Failed to save your choice. Please try again.");
  }
  if (!updated) {
    console.error("setUserRole: no profile row for user", user.id);
    throw new Error("Profile not found. Please refresh the page and try again.");
  }

  revalidatePath("/app");
  revalidatePath("/app/dashboard");
  revalidatePath("/seller");
  revalidatePath("/seller/dashboard");
}
