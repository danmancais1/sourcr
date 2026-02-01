/**
 * Maps Companies House API responses into internal SignalRecord format.
 */

import type { SignalRecord } from "./types";
import type {
  CompanyProfile,
  InsolvencyResponse,
  ChargesResponse,
  FilingHistoryResponse,
} from "@/lib/companies-house";

export type CompanyData = {
  profile: CompanyProfile | null;
  insolvency: InsolvencyResponse | null;
  charges: ChargesResponse | null;
  filingHistory: FilingHistoryResponse | null;
};

const SOURCE: SignalRecord["source"] = "companies_house";

function isoNow(): string {
  return new Date().toISOString();
}

export function mapCompanyToSignals(
  companyNumber: string,
  companyName: string,
  data: CompanyData
): SignalRecord[] {
  const signals: SignalRecord[] = [];
  const { profile, insolvency, charges, filingHistory } = data;

  if (insolvency && (insolvency.details?.length ?? 0) > 0) {
    signals.push({
      source: SOURCE,
      source_id: `insolvency:${companyNumber}`,
      category: "financial_distress",
      headline: `Insolvency recorded for ${companyName || companyNumber}`,
      occurred_at: isoNow(),
      company_number: companyNumber,
      company_name: companyName || "",
      confidence: 90,
      raw: insolvency as unknown as Record<string, unknown>,
    });
  }

  const status = profile?.company_status;
  if (status && status.toLowerCase() !== "active") {
    signals.push({
      source: SOURCE,
      source_id: `status:${companyNumber}:${status}`,
      category: "corporate_disposal",
      headline: `Company status: ${status} — ${companyName || companyNumber}`,
      occurred_at: isoNow(),
      company_number: companyNumber,
      company_name: companyName || "",
      confidence: status.toLowerCase() === "dissolved" ? 85 : 70,
      raw: (profile || {}) as unknown as Record<string, unknown>,
    });
  }

  const chargesTotal = charges?.total_count ?? 0;
  if (chargesTotal > 0) {
    signals.push({
      source: SOURCE,
      source_id: `charges:${companyNumber}:${chargesTotal}`,
      category: "watchlist_update",
      headline: `${companyName || companyNumber}: ${chargesTotal} charge(s) on file`,
      occurred_at: isoNow(),
      company_number: companyNumber,
      company_name: companyName || "",
      confidence: 40,
      raw: (charges || {}) as unknown as Record<string, unknown>,
    });
  }

  const filings = filingHistory?.items ?? [];
  if (filings.length > 0) {
    const latest = filings[0];
    const txId = (latest?.transaction_id ?? "unknown") as string;
    signals.push({
      source: SOURCE,
      source_id: `filings:${companyNumber}:${txId}`,
      category: "watchlist_update",
      headline: `Filing history available for ${companyName || companyNumber}`,
      occurred_at: isoNow(),
      company_number: companyNumber,
      company_name: companyName || "",
      confidence: 30,
      raw: (filingHistory || {}) as unknown as Record<string, unknown>,
    });
  }

  return signals;
}
