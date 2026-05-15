import Stripe from "stripe";
import { db } from "@workspace/db";
import { usersTable, businessSubscriptionsTable } from "@workspace/db/schema";
import { eq, and } from "drizzle-orm";
import { PLAN_CONFIG } from "@workspace/billing";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is required");
  return new Stripe(key, { apiVersion: "2026-03-25.dahlia" });
}

export async function getOrCreateStripeCustomer(user: { id: number; email: string }): Promise<string> {
  const stripe = getStripe();

  const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, user.id));
  if (dbUser?.stripeCustomerId) {
    return dbUser.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email: user.email,
    metadata: { userId: String(user.id) },
  });

  await db.update(usersTable).set({ stripeCustomerId: customer.id }).where(eq(usersTable.id, user.id));

  return customer.id;
}

export async function createCheckoutSession(
  user: { id: number; email: string },
  businessId: number,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
): Promise<{ url: string; type: "checkout" | "portal" }> {
  const stripe = getStripe();

  const [existingSub] = await db
    .select()
    .from(businessSubscriptionsTable)
    .where(
      and(
        eq(businessSubscriptionsTable.businessId, businessId),
        eq(businessSubscriptionsTable.status, "active"),
      ),
    );

  if (existingSub) {
    const customerId = await getOrCreateStripeCustomer(user);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: cancelUrl,
    });
    return { url: portalSession.url, type: "portal" };
  }

  const customerId = await getOrCreateStripeCustomer(user);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId: String(user.id), businessId: String(businessId) },
    subscription_data: {
      metadata: { userId: String(user.id), businessId: String(businessId) },
    },
  });

  if (!session.url) throw new Error("No Stripe checkout URL returned");
  return { url: session.url, type: "checkout" };
}

export async function createPortalSession(stripeCustomerId: string, returnUrl: string): Promise<string> {
  const stripe = getStripe();
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
  return session.url;
}

export function constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is required");
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
