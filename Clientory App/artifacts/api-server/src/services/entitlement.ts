import { db } from "@workspace/db";
import {
  usersTable,
  businessSubscriptionsTable,
  businessUsagePeriodsTable,
} from "@workspace/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export type EntitlementCode =
  | "ALLOWED"
  | "FREE_REPORT_ALREADY_USED"
  | "SUBSCRIPTION_REQUIRED"
  | "BUSINESS_PLAN_LIMIT_REACHED"
  | "SUBSCRIPTION_INACTIVE"
  | "BILLING_PERIOD_ENDED";

export interface EntitlementResult {
  code: EntitlementCode;
  allowed: boolean;
  isFreeReport?: boolean;
  periodEnd?: Date;
  scansUsed?: number;
  scansLimit?: number;
}

export async function checkScanEntitlement(userId: number, businessId: number): Promise<EntitlementResult> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    return { code: "SUBSCRIPTION_REQUIRED", allowed: false };
  }

  if (user.isAdmin) {
    return { code: "ALLOWED", allowed: true, isFreeReport: false };
  }

  const now = new Date();

  const [subscription] = await db
    .select()
    .from(businessSubscriptionsTable)
    .where(eq(businessSubscriptionsTable.businessId, businessId))
    .orderBy(desc(businessSubscriptionsTable.createdAt))
    .limit(1);

  if (!subscription) {
    if (!user.freeReportUsedAt) {
      return { code: "ALLOWED", allowed: true, isFreeReport: true };
    }
    return { code: "FREE_REPORT_ALREADY_USED", allowed: false };
  }

  const isPeriodActive = subscription.currentPeriodEnd > now;

  const hasAccess =
    subscription.status === "active" ||
    subscription.status === "past_due" ||
    (subscription.status === "canceled" && isPeriodActive);

  if (!hasAccess) {
    if (subscription.status === "canceled") {
      return { code: "BILLING_PERIOD_ENDED", allowed: false };
    }
    return { code: "SUBSCRIPTION_INACTIVE", allowed: false };
  }

  if (!isPeriodActive) {
    return { code: "BILLING_PERIOD_ENDED", allowed: false };
  }

  const [usagePeriod] = await db
    .select()
    .from(businessUsagePeriodsTable)
    .where(
      and(
        eq(businessUsagePeriodsTable.businessId, businessId),
        lte(businessUsagePeriodsTable.billingPeriodStart, now),
        gte(businessUsagePeriodsTable.billingPeriodEnd, now),
      ),
    );

  if (!usagePeriod) {
    return { code: "SUBSCRIPTION_REQUIRED", allowed: false };
  }

  if (usagePeriod.scansUsed >= usagePeriod.scansLimit) {
    return {
      code: "BUSINESS_PLAN_LIMIT_REACHED",
      allowed: false,
      periodEnd: subscription.currentPeriodEnd,
      scansUsed: usagePeriod.scansUsed,
      scansLimit: usagePeriod.scansLimit,
    };
  }

  return {
    code: "ALLOWED",
    allowed: true,
    isFreeReport: false,
    periodEnd: subscription.currentPeriodEnd,
    scansUsed: usagePeriod.scansUsed,
    scansLimit: usagePeriod.scansLimit,
  };
}
