import { PLAN_STATIC_CONFIG } from "@workspace/billing";

export const BILLING_CONFIG = {
  monthlyPriceUsd: PLAN_STATIC_CONFIG.monthlyPriceUsd,
  scansPerCycle: PLAN_STATIC_CONFIG.scansPerCycle,
  freeTotalScans: PLAN_STATIC_CONFIG.features.free.scansTotal,
} as const;
export const BILLING_PRICE_LABEL = `$${BILLING_CONFIG.monthlyPriceUsd}/month`;
export const BILLING_SCANS_LABEL = `${BILLING_CONFIG.scansPerCycle} scans per billing cycle`;

// Prompts run per scan by tier. The scan engine lives in the product app
// (app.clientory.org), not in this repo — these must match what it actually
// runs. Update both sides together; these numbers are customer-facing.
export const PROMPTS_PER_FREE_SCAN = 5;
export const PROMPTS_PER_PAID_SCAN = 25;

export const FREE_PROMPTS_LABEL = `${PROMPTS_PER_FREE_SCAN} AI search prompts`;
export const PAID_PROMPTS_LABEL = `${PROMPTS_PER_PAID_SCAN} AI search prompts per scan`;
