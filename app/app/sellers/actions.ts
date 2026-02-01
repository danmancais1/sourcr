"use server";

import { createClient } from "@/lib/supabase/server";

export type SellerDirectoryEntry = {
  id: string;
  display_name: string;
  contact_email: string;
  contact_phone: string | null;
  areas_or_criteria: string | null;
};

export async function getSellerDirectory(): Promise<SellerDirectoryEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("seller_directory")
    .select("id, display_name, contact_email, contact_phone, areas_or_criteria")
    .order("display_name");
  return (data ?? []) as SellerDirectoryEntry[];
}
