"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ProfileData = {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export async function getProfile(): Promise<ProfileData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, bio")
    .eq("id", user.id)
    .maybeSingle();
  return data as ProfileData | null;
}

export async function updateProfile(formData: FormData): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name,
      bio,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    console.error("Profile update error:", error.message);
    return { error: "Failed to save profile." };
  }
  revalidatePath("/app/settings");
  revalidatePath("/seller/settings");
  return {};
}

export async function uploadAvatar(formData: FormData): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) return { error: "No file selected." };
  if (file.size > 2 * 1024 * 1024) return { error: "File must be under 2MB." };
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) return { error: "Only JPEG, PNG, WebP or GIF allowed." };

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) {
    console.error("Avatar upload error:", uploadError.message);
    return { error: "Upload failed. Ensure the avatars bucket exists in Supabase Storage." };
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
  const url = urlData?.publicUrl ?? "";

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: url, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (updateError) {
    console.error("Profile avatar_url update error:", updateError.message);
    return { error: "Upload succeeded but profile update failed." };
  }
  revalidatePath("/app/settings");
  revalidatePath("/seller/settings");
  return { url };
}
