"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitPropertyAction(formData: FormData): Promise<
  { error: string } | { success: true }
> {
  const address_line_1 = formData.get("address_line_1") as string;
  const postcode = formData.get("postcode") as string;
  const contact_name = formData.get("contact_name") as string;
  const contact_email = formData.get("contact_email") as string;
  const consent = formData.get("consent") === "on";
  if (!address_line_1?.trim() || !postcode?.trim() || !contact_name?.trim() || !contact_email?.trim() || !consent) {
    return { error: "Please fill in required fields and consent." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("landlord_submissions")
    .insert({
      address_line_1: address_line_1.trim(),
      address_line_2: (formData.get("address_line_2") as string)?.trim() || null,
      city: (formData.get("city") as string)?.trim() || null,
      postcode: postcode.trim().toUpperCase(),
      contact_name: contact_name.trim(),
      contact_email: contact_email.trim(),
      contact_phone: (formData.get("contact_phone") as string)?.trim() || null,
    });
  if (error) {
    console.error("Property submit error:", error.message);
    return { error: "Submission failed. Please try again." };
  }
  revalidatePath("/seller/dashboard");
  return { success: true };
}
