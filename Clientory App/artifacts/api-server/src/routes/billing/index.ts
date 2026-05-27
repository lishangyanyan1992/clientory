import { Router, type IRouter } from "express";
import { SubscribeBusinessBody } from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  usersTable,
  businessesTable,
  businessSubscriptionsTable,
  businessUsagePeriodsTable,
} from "@workspace/db/schema";
import { eq, and, lte, gte, desc } from "drizzle-orm";
import { verifyEmailToken } from "../../services/otp";
import { createCheckoutSession, createPortalSession } from "../../services/stripe";
import { getAppUrl } from "../../services/app-base-url";
import { PLAN_CONFIG } from "@workspace/billing";

const router: IRouter = Router();

router.post("/billing/subscribe", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    if (!emailToken) {
      res.status(401).json({ error: "Email verification required" });
      return;
    }
    const verifiedEmail = verifyEmailToken(emailToken);
    if (!verifiedEmail) {
      res.status(401).json({ error: "Invalid or expired email token" });
      return;
    }

    const [user] = await db
      .insert(usersTable)
      .values({ email: verifiedEmail, emailVerified: true })
      .onConflictDoUpdate({ target: usersTable.email, set: { emailVerified: true, updatedAt: new Date() } })
      .returning();

    if (!user) {
      res.status(500).json({ error: "Failed to resolve user" });
      return;
    }

    const bodyResult = SubscribeBusinessBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "businessId is required" });
      return;
    }
    const { businessId } = bodyResult.data;

    const businessIdNum = parseInt(businessId, 10);
    const [business] = await db
      .select()
      .from(businessesTable)
      .where(and(eq(businessesTable.id, businessIdNum), eq(businessesTable.userId, user.id)));

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    const priceId = PLAN_CONFIG.stripePriceId;
    if (!priceId) {
      res.status(500).json({ error: "Stripe price ID not configured" });
      return;
    }

    const successUrl = new URL(getAppUrl("settings/billing"));
    successUrl.searchParams.set("success", "1");
    successUrl.searchParams.set("businessId", businessId);
    const cancelUrl = getAppUrl("settings/billing");

    const result = await createCheckoutSession(user, businessIdNum, priceId, successUrl.toString(), cancelUrl);

    res.json({ url: result.url, type: result.type });
  } catch (err) {
    console.error("POST /billing/subscribe error:", err);
    res.status(500).json({ error: "Failed to create billing session" });
  }
});

router.post("/billing/portal", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    if (!emailToken) {
      res.status(401).json({ error: "Email verification required" });
      return;
    }
    const verifiedEmail = verifyEmailToken(emailToken);
    if (!verifiedEmail) {
      res.status(401).json({ error: "Invalid or expired email token" });
      return;
    }

    const [user] = await db
      .insert(usersTable)
      .values({ email: verifiedEmail, emailVerified: true })
      .onConflictDoUpdate({ target: usersTable.email, set: { emailVerified: true, updatedAt: new Date() } })
      .returning();

    if (!user) {
      res.status(500).json({ error: "Failed to resolve user" });
      return;
    }

    if (!user.stripeCustomerId) {
      res.status(400).json({ error: "No billing account found" });
      return;
    }

    const returnUrl = getAppUrl("settings/billing");
    const url = await createPortalSession(user.stripeCustomerId, returnUrl);

    res.json({ url });
  } catch (err) {
    console.error("POST /billing/portal error:", err);
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

router.get("/billing/status/:businessId", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    if (!emailToken) {
      res.status(401).json({ error: "Email verification required" });
      return;
    }
    const verifiedEmail = verifyEmailToken(emailToken);
    if (!verifiedEmail) {
      res.status(401).json({ error: "Invalid or expired email token" });
      return;
    }

    const [user] = await db
      .insert(usersTable)
      .values({ email: verifiedEmail, emailVerified: true })
      .onConflictDoUpdate({ target: usersTable.email, set: { emailVerified: true, updatedAt: new Date() } })
      .returning();

    if (!user) {
      res.status(500).json({ error: "Failed to resolve user" });
      return;
    }

    const businessIdNum = parseInt(req.params.businessId, 10);
    if (isNaN(businessIdNum)) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    const [business] = await db
      .select()
      .from(businessesTable)
      .where(and(eq(businessesTable.id, businessIdNum), eq(businessesTable.userId, user.id)));

    if (!business) {
      res.status(404).json({ error: "Business not found" });
      return;
    }

    const now = new Date();

    const [subscription] = await db
      .select()
      .from(businessSubscriptionsTable)
      .where(eq(businessSubscriptionsTable.businessId, businessIdNum))
      .orderBy(desc(businessSubscriptionsTable.createdAt))
      .limit(1);

    const [usagePeriod] = await db
      .select()
      .from(businessUsagePeriodsTable)
      .where(
        and(
          eq(businessUsagePeriodsTable.businessId, businessIdNum),
          lte(businessUsagePeriodsTable.billingPeriodStart, now),
          gte(businessUsagePeriodsTable.billingPeriodEnd, now),
        ),
      );

    const isFreeUser = !user.freeReportUsedAt;

    res.json({
      businessId: String(businessIdNum),
      isFree: isFreeUser,
      subscription: subscription
        ? {
            status: subscription.status,
            currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          }
        : null,
      usage: usagePeriod
        ? {
            scansUsed: usagePeriod.scansUsed,
            scansLimit: usagePeriod.scansLimit,
            periodEnd: usagePeriod.billingPeriodEnd.toISOString(),
          }
        : null,
      isPaid:
        !!subscription &&
        subscription.currentPeriodEnd > now &&
        (subscription.status === "active" ||
          subscription.status === "past_due" ||
          subscription.status === "canceled"),
    });
  } catch (err) {
    console.error("GET /billing/status error:", err);
    res.status(500).json({ error: "Failed to get billing status" });
  }
});

export default router;
