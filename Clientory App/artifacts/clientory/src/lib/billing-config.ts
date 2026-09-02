import { PLAN_STATIC_CONFIG } from "@workspace/billing";

export const BILLING_CONFIG = {
  monthlyPriceUsd: PLAN_STATIC_CONFIG.monthlyPriceUsd,
  scansPerCycle: PLAN_STATIC_CONFIG.scansPerCycle,
  freeTotalScans: PLAN_STATIC_CONFIG.features.free.scansTotal,
  paidTrialDays: 30,
  betaAccessDays: 90,
} as const;
export const BILLING_PRICE_LABEL = `$${BILLING_CONFIG.monthlyPriceUsd}/month`;
export const PAID_TRIAL_LABEL = `${BILLING_CONFIG.paidTrialDays}-day paid-plan trial`;
export const BETA_ACCESS_LABEL = `${BILLING_CONFIG.betaAccessDays / 30} months free`;

// Cadence, not credits. A subscription is one scan per week: run it yourself,
// or it runs automatically if you don't. The `scansPerCycle` number (4) is
// that weekly cadence over a month — never present it as an allowance the user
// spends down separately from auto-scans.
export const BILLING_SCANS_LABEL = "One scan a week — run it yourself, or it runs automatically";

// Prompts run per scan by tier. The scan engine lives in the product app
// (app.clientory.org), not in this repo — these must match what it actually
// runs. Update both sides together; these numbers are customer-facing.
export const PROMPTS_PER_FREE_SCAN = 5;
export const PROMPTS_PER_PAID_SCAN = 25;

export const FREE_PROMPTS_LABEL = `${PROMPTS_PER_FREE_SCAN} AI search prompts`;
export const PAID_PROMPTS_LABEL = `${PROMPTS_PER_PAID_SCAN} AI search prompts per scan`;
