/**
 * Sourcing lead categories (signal_tag for landlord submissions, signal_type for leads/signals).
 * Used in Sourcing page, quiet-sale form, and feeds.
 */
export const SOURCING_CATEGORIES = [
  { id: "financial_distress", label: "Financial Distress", description: "Owners under serious money pressure" },
  { id: "probate_seller", label: "Probate", description: "Life event sellers (probate, death, relocation)" },
  { id: "landlord_exit", label: "Landlord Exit", description: "Landlord fatigue, compliance, capex pressure" },
  { id: "corporate_disposal", label: "Corporate Disposal", description: "Business shutting down, asset sale" },
  { id: "stuck_asset", label: "Underperforming", description: "Long time on market, failed development" },
  { id: "portfolio_rebalance", label: "Portfolio Rebalance", description: "Selling part of portfolio" },
  { id: "private_sale", label: "Private Sale", description: "Off-market, quiet sale, direct inbound" },
] as const;

export type SourcingCategoryId = (typeof SOURCING_CATEGORIES)[number]["id"];

export const SOURCING_CATEGORY_IDS = SOURCING_CATEGORIES.map((c) => c.id);

export function getCategoryLabel(id: string): string {
  return SOURCING_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}
