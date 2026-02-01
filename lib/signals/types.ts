/**
 * Internal signals model for the UK motivated seller lead engine.
 */

export type SignalCategory =
  | "financial_distress"
  | "corporate_disposal"
  | "watchlist_update";

export type SignalSource = "companies_house";

export type SignalRecord = {
  source: SignalSource;
  source_id: string;
  category: SignalCategory;
  headline: string;
  occurred_at: string;
  company_number: string;
  company_name: string;
  confidence: number;
  raw: Record<string, unknown>;
};
