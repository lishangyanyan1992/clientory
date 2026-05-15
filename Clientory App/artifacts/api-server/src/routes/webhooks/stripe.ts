import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  stripeEventsTable,
  businessSubscriptionsTable,
  businessUsagePeriodsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { constructWebhookEvent } from "../../services/stripe";
import { PLAN_CONFIG } from "@workspace/billing";
import type Stripe from "stripe";

const router: IRouter = Router();

function getSubscriptionPeriod(subscription: Stripe.Subscription): { periodStart: Date; periodEnd: Date } {
  const item = subscription.items.data[0];
  if (item) {
    return {
      periodStart: new Date(item.current_period_start * 1000),
      periodEnd: new Date(item.current_period_end * 1000),
    };
  }
  const anchor = subscription.billing_cycle_anchor;
  const now = new Date(anchor * 1000);
  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return { periodStart: now, periodEnd: nextMonth };
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const parent = invoice.parent as { subscription_details?: { subscription?: string | { id: string } | null } } | null;
  if (!parent?.subscription_details?.subscription) return null;
  const sub = parent.subscription_details.subscription;
  return typeof sub === "string" ? sub : sub.id;
}

router.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  if (!sig) {
    res.status(400).json({ error: "Missing stripe-signature header" });
    return;
  }

  let event: Stripe.Event;
  try {
    event = constructWebhookEvent(req.body as Buffer, sig);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  try {
    const inserted = await db
      .insert(stripeEventsTable)
      .values({ stripeEventId: event.id })
      .onConflictDoNothing()
      .returning();

    if (inserted.length === 0) {
      res.status(200).json({ received: true });
      return;
    }
  } catch (err) {
    console.error("Failed to record stripe event:", err);
    res.status(500).json({ error: "Internal error" });
    return;
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const businessId = session.metadata?.businessId;
        const subscriptionId = session.subscription as string;

        if (!userId || !businessId || !subscriptionId) break;

        const { default: StripeSDK } = await import("stripe");
        const stripe = new StripeSDK(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const { periodStart, periodEnd } = getSubscriptionPeriod(subscription);

        const businessIdNum = parseInt(businessId, 10);

        const [existingSubRow] = await db
          .select({ id: businessSubscriptionsTable.id })
          .from(businessSubscriptionsTable)
          .where(eq(businessSubscriptionsTable.stripeSubscriptionId, subscriptionId));

        if (!existingSubRow) {
          const activeDups = await db
            .select({ id: businessSubscriptionsTable.id, stripeSubscriptionId: businessSubscriptionsTable.stripeSubscriptionId })
            .from(businessSubscriptionsTable)
            .where(
              and(
                eq(businessSubscriptionsTable.businessId, businessIdNum),
                eq(businessSubscriptionsTable.status, "active"),
              ),
            );

          for (const dup of activeDups) {
            try {
              await stripe.subscriptions.cancel(dup.stripeSubscriptionId);
            } catch (cancelErr) {
              console.error("Failed to cancel duplicate Stripe subscription:", dup.stripeSubscriptionId, cancelErr);
            }
            await db
              .update(businessSubscriptionsTable)
              .set({ status: "canceled", updatedAt: new Date() })
              .where(eq(businessSubscriptionsTable.id, dup.id));
          }

          await db.insert(businessSubscriptionsTable).values({
            userId: parseInt(userId, 10),
            businessId: businessIdNum,
            stripeSubscriptionId: subscriptionId,
            stripePriceId: (subscription.items.data[0]?.price?.id) ?? "",
            status: "active",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
          });

          await db.insert(businessUsagePeriodsTable).values({
            businessId: businessIdNum,
            billingPeriodStart: periodStart,
            billingPeriodEnd: periodEnd,
            scansLimit: PLAN_CONFIG.scansPerCycle,
            scansUsed: 0,
          }).onConflictDoNothing();
        }

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const metadataBusinessId = subscription.metadata?.businessId;

        const [existingSub] = await db
          .select()
          .from(businessSubscriptionsTable)
          .where(eq(businessSubscriptionsTable.stripeSubscriptionId, subscription.id));

        if (!existingSub) {
          console.warn("subscription.updated: no matching subscription row for", subscription.id);
          break;
        }

        if (metadataBusinessId && String(existingSub.businessId) !== metadataBusinessId) {
          console.warn(
            "subscription.updated: metadata businessId mismatch — expected",
            existingSub.businessId,
            "got",
            metadataBusinessId,
          );
          break;
        }

        const { periodStart, periodEnd } = getSubscriptionPeriod(subscription);

        let status: "active" | "past_due" | "canceled" | "incomplete" = "incomplete";
        if (subscription.status === "active") status = "active";
        else if (subscription.status === "past_due") status = "past_due";
        else if (subscription.status === "canceled") status = "canceled";

        await db
          .update(businessSubscriptionsTable)
          .set({
            status,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date(),
          })
          .where(eq(businessSubscriptionsTable.id, existingSub.id));

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await db
          .update(businessSubscriptionsTable)
          .set({ status: "canceled", updatedAt: new Date() })
          .where(eq(businessSubscriptionsTable.stripeSubscriptionId, subscription.id));
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (!subscriptionId) break;

        const [sub] = await db
          .select()
          .from(businessSubscriptionsTable)
          .where(eq(businessSubscriptionsTable.stripeSubscriptionId, subscriptionId));

        if (!sub) break;

        const { default: StripeSDK } = await import("stripe");
        const stripe = new StripeSDK(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-03-25.dahlia" });
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const { periodStart, periodEnd } = getSubscriptionPeriod(subscription);

        await db
          .insert(businessUsagePeriodsTable)
          .values({
            businessId: sub.businessId,
            billingPeriodStart: periodStart,
            billingPeriodEnd: periodEnd,
            scansLimit: PLAN_CONFIG.scansPerCycle,
            scansUsed: 0,
          })
          .onConflictDoNothing();

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = getInvoiceSubscriptionId(invoice);
        if (!subscriptionId) break;

        await db
          .update(businessSubscriptionsTable)
          .set({ status: "past_due", updatedAt: new Date() })
          .where(eq(businessSubscriptionsTable.stripeSubscriptionId, subscriptionId));

        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    await db
      .delete(stripeEventsTable)
      .where(eq(stripeEventsTable.stripeEventId, event.id))
      .catch((delErr) => console.error("Failed to remove failed event record:", delErr));
    res.status(500).json({ error: "Processing failed" });
    return;
  }

  res.status(200).json({ received: true });
});

export default router;
