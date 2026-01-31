"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitQuietSale(formData: FormData): Promise<
  { error: string } | { publicToken: string }
> {
  const address_line_1 = formData.get("address_line_1") as string;
  const postcode = formData.get("postcode") as string;
  const contact_name = formData.get("contact_name") as string;
  const contact_email = formData.get("contact_email") as string;
  if (!address_line_1?.trim() || !postcode?.trim() || !contact_name?.trim() || !contact_email?.trim()) {
    return { error: "Please fill in required fields." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("landlord_submissions")
    .insert({
      address_line_1: address_line_1.trim(),
      address_line_2: (formData.get("address_line_2") as string)?.trim() || null,
      city: (formData.get("city") as string)?.trim() || null,
      postcode: postcode.trim().toUpperCase(),
      contact_name: contact_name.trim(),
      contact_email: contact_email.trim(),
      contact_phone: (formData.get("contact_phone") as string)?.trim() || null,
    })
    .select("public_token")
    .single();
  if (error) {
    console.error("Quiet sale submit error:", error.message);
    return { error: "Submission failed. Please try again." };
  }
  revalidatePath("/quiet-sale");
  return { publicToken: data.public_token };
}
