import { NextResponse } from "next/server";
import {
  getCompanyProfile,
  getInsolvency,
  getCharges,
  getFilingHistory,
} from "@/lib/companies-house";
import { mapCompanyToSignals } from "@/lib/signals/companies-house-mapper";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * GET /api/signals/companies-house/test?companyNumber=XXXXXX
 * Fetches Companies House data for one company, maps to signals, returns profile + signals.
 * No DB write.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyNumber = searchParams.get("companyNumber")?.trim();
  if (!companyNumber) {
    return NextResponse.json(
      { error: "Missing companyNumber query parameter" },
      { status: 400 }
    );
  }

  if (!process.env.COMPANIES_HOUSE_API_KEY) {
    return NextResponse.json(
      { error: "COMPANIES_HOUSE_API_KEY is not set" },
      { status: 500 }
    );
  }

  const results = await Promise.allSettled([
    getCompanyProfile(companyNumber),
    getInsolvency(companyNumber),
    getCharges(companyNumber),
    getFilingHistory(companyNumber),
  ]);

  const [profileResult, insolvencyResult, chargesResult, filingResult] = results;
  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  const insolvency =
    insolvencyResult.status === "fulfilled" ? insolvencyResult.value : null;
  const charges =
    chargesResult.status === "fulfilled" ? chargesResult.value : null;
  const filingHistory =
    filingResult.status === "fulfilled" ? filingResult.value : null;

  const companyName =
    (profile as { company_name?: string } | null)?.company_name ?? "";

  const signals = mapCompanyToSignals(companyNumber, companyName, {
    profile,
    insolvency,
    charges,
    filingHistory,
  });

  return NextResponse.json({
    profile: profile ?? null,
    insolvency: insolvency ?? null,
    charges: charges ?? null,
    filingHistory: filingHistory ?? null,
    signals,
    errors: [
      profileResult.status === "rejected" && profileResult.reason?.message,
      insolvencyResult.status === "rejected" && insolvencyResult.reason?.message,
      chargesResult.status === "rejected" && chargesResult.reason?.message,
      filingResult.status === "rejected" && filingResult.reason?.message,
    ].filter(Boolean),
  });
}
