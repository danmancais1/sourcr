/**
 * Scoring engine: 0–100 with breakdown_json.
 * Weights: insolvency +40, gazette +35, multiple charges +15, low EPC (E or worse) +10, long hold +8, manual signal severity 1–5 -> +2..+10
 */

export interface ScoreBreakdown {
  insolvency?: number;
  gazette?: number;
  charges?: number;
  lowEpc?: number;
  longHold?: number;
  manualSignal?: number;
  total: number;
}

const MAX_SCORE = 100;

export function computeScore(components: {
  hasInsolvency?: boolean;
  gazetteHits?: number;
  chargesCount?: number;
  epcBand?: string | null;
  yearsHeld?: number | null;
  manualSignalSeverity?: number | null;
}): { score: number; breakdown: ScoreBreakdown } {
  const breakdown: ScoreBreakdown = {
    total: 0,
  };
  if (components.hasInsolvency) {
    breakdown.insolvency = 40;
    breakdown.total += 40;
  }
  if (components.gazetteHits && components.gazetteHits > 0) {
    breakdown.gazette = Math.min(35, components.gazetteHits * 10);
    breakdown.total += breakdown.gazette;
  }
  if (components.chargesCount && components.chargesCount >= 2) {
    breakdown.charges = 15;
    breakdown.total += 15;
  }
  const lowBands = ["e", "f", "g"];
  if (components.epcBand && lowBands.includes(components.epcBand.toLowerCase())) {
    breakdown.lowEpc = 10;
    breakdown.total += 10;
  }
  if (components.yearsHeld != null && components.yearsHeld >= 5) {
    breakdown.longHold = 8;
    breakdown.total += 8;
  }
  if (components.manualSignalSeverity != null && components.manualSignalSeverity >= 1 && components.manualSignalSeverity <= 5) {
    breakdown.manualSignal = 2 + (components.manualSignalSeverity - 1) * 2;
    breakdown.total += breakdown.manualSignal;
  }
  const score = Math.min(MAX_SCORE, breakdown.total);
  return { score, breakdown };
}
