import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import {
  getCompanyProfile,
  getInsolvency,
  getCharges,
  getFilingHistory,
} from "@/lib/companies-house";
import { mapCompanyToSignals } from "@/lib/signals/companies-house-mapper";
import type { SignalRecord } from "@/lib/signals/types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_SIZE = 5;
const WATCHLIST_LIMIT = 200;

type RunError = { company_number: string; message: string };

/**
 * POST /api/signals/companies-house/run
 * Processes watchlist companies, fetches CH data, upserts signals.
 * Batches of 5 companies concurrently; 429 backoff is in chFetch.
 */
export async function POST() {
  if (!process.env.COMPANIES_HOUSE_API_KEY) {
    return NextResponse.json(
      { error: "COMPANIES_HOUSE_API_KEY is not set" },
      { status: 500 }
    );
  }

  const supabase = await createServiceRoleClient();
  const startedAt = new Date().toISOString();

  const { data: watchlist, error: watchError } = await supabase
    .from("watchlist_companies")
    .select("id, company_number, company_name")
    .eq("enabled", true)
    .limit(WATCHLIST_LIMIT)
    .order("created_at", { ascending: true });

  if (watchError) {
    return NextResponse.json(
      { error: `Failed to read watchlist: ${watchError.message}` },
      { status: 500 }
    );
  }

  const companies = watchlist ?? [];
  if (companies.length === 0) {
    return NextResponse.json({
      processed_count: 0,
      upserted_count: 0,
      errors_count: 0,
      errors: [],
      message: "No enabled companies in watchlist",
    });
  }

  const errors: RunError[] = [];
  let totalUpserted = 0;

  for (let i = 0; i < companies.length; i += BATCH_SIZE) {
    const batch = companies.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (row) => {
        const companyNumber = row.company_number;
        const companyName = (row.company_name ?? "").trim();

        const [profileResult, insolvencyResult, chargesResult, filingResult] =
          await Promise.allSettled([
            getCompanyProfile(companyNumber),
            getInsolvency(companyNumber),
            getCharges(companyNumber),
            getFilingHistory(companyNumber),
          ]);

        const profile =
          profileResult.status === "fulfilled" ? profileResult.value : null;
        const insolvency =
          insolvencyResult.status === "fulfilled" ? insolvencyResult.value : null;
        const charges =
          chargesResult.status === "fulfilled" ? chargesResult.value : null;
        const filingHistory =
          filingResult.status === "fulfilled" ? filingResult.value : null;

        const fetchError =
          profileResult.status === "rejected"
            ? profileResult.reason?.message
            : insolvencyResult.status === "rejected"
              ? insolvencyResult.reason?.message
              : chargesResult.status === "rejected"
                ? chargesResult.reason?.message
                : filingResult.status === "rejected"
                  ? filingResult.reason?.message
                  : null;

        if (fetchError) {
          throw new Error(fetchError);
        }

        const resolvedName =
          (profile as { company_name?: string } | null)?.company_name ??
          companyName;

        const signals = mapCompanyToSignals(companyNumber, resolvedName, {
          profile,
          insolvency,
          charges,
          filingHistory,
        });

        return { companyNumber, signals };
      })
    );

    const allSignals: SignalRecord[] = [];
    for (let j = 0; j < results.length; j++) {
      const r = results[j];
      const companyNumber = batch[j]!.company_number;
      if (r.status === "rejected") {
        errors.push({
          company_number: companyNumber,
          message: r.reason?.message ?? String(r.reason),
        });
        continue;
      }
      if (r.status === "fulfilled" && r.value.signals.length > 0) {
        allSignals.push(...r.value.signals);
      }
    }

    if (allSignals.length > 0) {
      const rows = allSignals.map((s) => ({
        workspace_id: null,
        source: s.source,
        source_id: s.source_id,
        category: s.category,
        headline: s.headline,
        occurred_at: s.occurred_at,
        company_number: s.company_number,
        company_name: s.company_name,
        confidence: s.confidence,
        raw: s.raw,
      }));

      const { error: upsertError } = await supabase
        .from("signal_events")
        .upsert(rows, {
          onConflict: "source,source_id",
          ignoreDuplicates: false,
        });

      if (upsertError) {
        for (const s of allSignals) {
          errors.push({
            company_number: s.company_number,
            message: `Upsert failed: ${upsertError.message}`,
          });
        }
      } else {
        totalUpserted += rows.length;
      }
    }
  }

  const finishedAt = new Date().toISOString();
  await supabase.from("signal_runs").insert({
    source: "companies_house",
    started_at: startedAt,
    finished_at: finishedAt,
    processed_count: companies.length,
    created_signals: totalUpserted,
    errors: errors.slice(0, 100),
  });

  return NextResponse.json({
    processed_count: companies.length,
    upserted_count: totalUpserted,
    errors_count: errors.length,
    errors: errors.slice(0, 50),
    message: `Processed ${companies.length} companies, upserted ${totalUpserted} signals, ${errors.length} errors`,
  });
}
