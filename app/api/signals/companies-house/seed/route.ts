import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SeedBody = { company_numbers: string[] };

/**
 * POST /api/signals/companies-house/seed
 * Body: { company_numbers: ["01234567", ...] }
 * Inserts into watchlist_companies if not present (no duplicate company_number).
 */
export async function POST(request: Request) {
  let body: SeedBody;
  try {
    body = (await request.json()) as SeedBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body. Expected { company_numbers: string[] }" },
      { status: 400 }
    );
  }

  const companyNumbers = Array.isArray(body.company_numbers)
    ? body.company_numbers
        .map((n) => (typeof n === "string" ? n.trim() : ""))
        .filter(Boolean)
    : [];
  if (companyNumbers.length === 0) {
    return NextResponse.json(
      { error: "company_numbers must be a non-empty array" },
      { status: 400 }
    );
  }

  const supabase = await createServiceRoleClient();
  const inserted: string[] = [];
  const skipped: string[] = [];

  for (const company_number of companyNumbers) {
    const { data: existing } = await supabase
      .from("watchlist_companies")
      .select("id")
      .eq("company_number", company_number)
      .maybeSingle();

    if (existing) {
      skipped.push(company_number);
      continue;
    }

    const { error } = await supabase.from("watchlist_companies").insert({
      company_number,
      company_name: null,
      enabled: true,
    });
    if (error) {
      return NextResponse.json(
        { error: `Failed to insert ${company_number}: ${error.message}` },
        { status: 500 }
      );
    }
    inserted.push(company_number);
  }

  return NextResponse.json({
    inserted,
    skipped,
    message: `Inserted ${inserted.length}, skipped (already present) ${skipped.length}`,
  });
}
