import { PLAN_STATIC_CONFIG } from "@workspace/billing";

export const BILLING_CONFIG = {
  monthlyPriceUsd: PLAN_STATIC_CONFIG.monthlyPriceUsd,
  scansPerCycle: PLAN_STATIC_CONFIG.scansPerCycle,
  freeTotalScans: PLAN_STATIC_CONFIG.features.free.scansTotal,
} as const;
export const BILLING_PRICE_LABEL = `$${BILLING_CONFIG.monthlyPriceUsd}/month`;
export const BILLING_SCANS_LABEL = `${BILLING_CONFIG.scansPerCycle} scans per billing cycle`;
