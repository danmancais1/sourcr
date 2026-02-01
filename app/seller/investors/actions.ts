"use server";

import { createClient } from "@/lib/supabase/server";

export type InvestorDirectoryEntry = {
  id: string;
  display_name: string;
  contact_email: string;
  contact_phone: string | null;
  postcodes_or_areas: string | null;
  criteria: string | null;
};

export async function getInvestorDirectory(): Promise<InvestorDirectoryEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investor_directory")
    .select("id, display_name, contact_email, contact_phone, postcodes_or_areas, criteria")
    .order("display_name");
  return (data ?? []) as InvestorDirectoryEntry[];
}
