/**
 * Land Registry Price Paid Data: import CSV and comps queries.
 * CSV columns (no header in official file): transaction_id, price, transfer_date, postcode, property_type, old_new, duration, paon, saon, street, locality, town, district, county, ppd_category, record_status
 * https://www.gov.uk/government/statistical-data-sets/price-paid-data-downloads
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const PPD_CSV_URL =
  "https://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-monthly-update-new-version.csv";

function parsePpdRow(line: string): {
  transaction_id: string;
  price: number;
  transfer_date: string;
  postcode: string;
  property_type: string | null;
  paon: string | null;
  saon: string | null;
  street: string | null;
  locality: string | null;
  town: string | null;
  district: string | null;
  county: string | null;
} | null {
  const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
  if (parts.length < 10) return null;
  const price = parseInt(parts[1], 10);
  if (isNaN(price)) return null;
  const transferDate = parts[2];
  if (!transferDate || transferDate.length < 8) return null;
  const postcode = parts[3] ?? "";
  return {
    transaction_id: parts[0] ?? "",
    price,
    transfer_date: transferDate,
    postcode,
    property_type: parts[4] || null,
    paon: parts[7] || null,
    saon: parts[8] || null,
    street: parts[9] || null,
    locality: parts[10] || null,
    town: parts[11] || null,
    district: parts[12] || null,
    county: parts[13] || null,
  };
}

export async function downloadAndImportPpd(supabase: SupabaseClient): Promise<{ imported: number; errors: number }> {
  const res = await fetch(PPD_CSV_URL);
  if (!res.ok) throw new Error("Failed to download PPD CSV");
  const text = await res.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  let imported = 0;
  let errors = 0;
  const batch: ReturnType<typeof parsePpdRow>[] = [];
  for (let i = 0; i < lines.length; i++) {
    const row = parsePpdRow(lines[i]);
    if (!row) {
      errors++;
      continue;
    }
    batch.push(row);
    if (batch.length >= 500) {
      const { error } = await supabase.from("ppd_transactions").upsert(batch, {
        onConflict: "transaction_id",
        ignoreDuplicates: false,
      });
      if (error) errors += batch.length;
      else imported += batch.length;
      batch.length = 0;
    }
  }
  if (batch.length) {
    const { error } = await supabase.from("ppd_transactions").upsert(batch, {
      onConflict: "transaction_id",
      ignoreDuplicates: false,
    });
    if (error) errors += batch.length;
    else imported += batch.length;
  }
  return { imported, errors };
}

export function postcodeToSector(postcode: string): string {
  const normalized = postcode.replace(/\s/g, "").toUpperCase();
  const match = normalized.match(/^([A-Z]{1,2}[0-9][0-9A-Z]?)([0-9][A-Z]{2})$/);
  if (match) return match[1] + " " + match[2].charAt(0);
  return normalized.substring(0, 4);
}

export async function getCompsByPostcodeSector(
  supabase: SupabaseClient,
  postcode: string,
  options?: { limit?: number }
): Promise<{ medianPrice: number; sales: { price: number; transfer_date: string; postcode: string }[] }> {
  const sector = postcodeToSector(postcode);
  const pattern = sector.replace(" ", "") + "%";
  const { data: rows } = await supabase
    .from("ppd_transactions")
    .select("price, transfer_date, postcode")
    .ilike("postcode", pattern)
    .order("transfer_date", { ascending: false })
    .limit(options?.limit ?? 100);
  const sales = (rows ?? []).map((r: any) => ({
    price: r.price,
    transfer_date: r.transfer_date,
    postcode: r.postcode,
  }));
  const prices = sales.map((s) => s.price);
  const medianPrice =
    prices.length === 0
      ? 0
      : prices.slice().sort((a, b) => a - b)[Math.floor(prices.length / 2)] ?? 0;
  const last10 = sales.slice(0, 10);
  return { medianPrice, sales: last10 };
}
