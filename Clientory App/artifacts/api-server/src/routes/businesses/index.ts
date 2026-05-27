import { Router, type IRouter } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "@workspace/db";
import {
  businessesTable,
  usersTable,
  businessSubscriptionsTable,
  businessUsagePeriodsTable,
  promptSetsTable,
} from "@workspace/db/schema";
import { eq, and, lte, gte, desc, gt, sql } from "drizzle-orm";
import { verifyEmailToken } from "../../services/otp";
import { checkRateLimit, hashIp, getClientIp } from "../../services/rate-limit";
import { SuggestCompetitorsBody, CreateBusinessBody } from "@workspace/api-zod";
import type { FirmLocation } from "@workspace/db/schema";

const router: IRouter = Router();

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  return new Anthropic({ apiKey });
}

async function upsertUser(verifiedEmail: string) {
  const [user] = await db
    .insert(usersTable)
    .values({ email: verifiedEmail, emailVerified: true })
    .onConflictDoUpdate({ target: usersTable.email, set: { emailVerified: true, updatedAt: new Date() } })
    .returning();
  return user;
}

function deriveLocation(locations: FirmLocation[] | null | undefined, fallback: string): string {
  if (locations && locations.length > 0) {
    const hq = locations.find((l) => l.isHQ) || locations[0];
    return hq.state ? `${hq.city}, ${hq.state}` : hq.city;
  }
  return fallback || "Unknown";
}

function formatBusiness(business: typeof businessesTable.$inferSelect, extra: {
  subscription?: { status: string; currentPeriodEnd: Date; cancelAtPeriodEnd: boolean } | null;
  usage?: { scansUsed: number; scansLimit: number; billingPeriodEnd: Date } | null;
  hasPromptSet?: boolean;
} = {}) {
  return {
    id: String(business.id),
    userId: String(business.userId),
    name: business.name,
    website: business.website,
    businessType: business.businessType,
    location: business.location,
    description: business.description,
    // New firm profile fields
    legalName: business.legalName,
    brandName: business.brandName,
    firmType: business.firmType,
    yearFounded: business.yearFounded,
    partners: business.partners,
    locations: business.locations,
    geographicScope: business.geographicScope,
    primaryServices: business.primaryServices,
    deliverables: business.deliverables,
    specialties: business.specialties,
    industriesServed: business.industriesServed,
    clientStages: business.clientStages,
    decisionMakers: business.decisionMakers,
    directCompetitors: business.directCompetitors,
    rankings: business.rankings,
    authoritySignals: business.authoritySignals,
    topGSCQueries: business.topGSCQueries,
    clientType: business.clientType,
    individualServices: business.individualServices,
    individualDeliverables: business.individualDeliverables,
    individualSpecialties: business.individualSpecialties,
    businessServices: business.businessServices,
    businessDeliverables: business.businessDeliverables,
    businessSpecialties: business.businessSpecialties,
    profileUpdatedAt: business.profileUpdatedAt?.toISOString() ?? null,
    hasPromptSet: extra.hasPromptSet ?? false,
    createdAt: business.createdAt.toISOString(),
    subscription: extra.subscription
      ? {
          status: extra.subscription.status,
          currentPeriodEnd: extra.subscription.currentPeriodEnd.toISOString(),
          cancelAtPeriodEnd: extra.subscription.cancelAtPeriodEnd,
        }
      : null,
    usage: extra.usage
      ? {
          scansUsed: extra.usage.scansUsed,
          scansLimit: extra.usage.scansLimit,
          periodEnd: extra.usage.billingPeriodEnd.toISOString(),
        }
      : null,
  };
}

// POST /businesses/suggest-competitors — public endpoint (IP rate limited, no auth required)
// Uses Claude Haiku to suggest 3-5 likely competitors
router.post("/businesses/suggest-competitors", async (req, res) => {
  try {
    const clientIp = getClientIp(req);
    const rateKey = `suggest-competitors:ip:${hashIp(clientIp)}`;
    const rateResult = await checkRateLimit(rateKey, 10, 60 * 60 * 1000);
    if (!rateResult.allowed) {
      res.status(429).json({ error: "Too many requests. Please try again later." });
      return;
    }

    const parseResult = SuggestCompetitorsBody.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.issues[0]?.message ?? "Invalid request body" });
      return;
    }
    const { firmType, city, state, primaryServices } = parseResult.data;

    const servicesStr = primaryServices?.length ? ` that handles ${primaryServices.slice(0, 3).join(", ")}` : "";
    const prompt = `Suggest 3-5 real, specific competing professional firms for a ${firmType.replace(/_/g, " ")} firm in ${city}, ${state}${servicesStr}. Return ONLY a JSON array of objects with "name" (string) and "location" (optional string like "City, State") fields. No explanation, no markdown.`;

    const message = await getAnthropicClient().messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content[0];
    if (block.type !== "text") {
      res.json({ suggestions: [] });
      return;
    }

    let suggestions: { name: string; location?: string }[] = [];
    try {
      const cleaned = block.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const parsed: unknown = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        suggestions = parsed
          .filter(
            (item): item is { name: string; location?: string } =>
              typeof item === "object" && item !== null && typeof (item as Record<string, unknown>).name === "string",
          )
          .slice(0, 5);
      }
    } catch {
      suggestions = [];
    }

    res.json({ suggestions });
  } catch (err) {
    console.error("POST /businesses/suggest-competitors error:", err);
    res.status(500).json({ error: "Failed to suggest competitors" });
  }
});

// POST /businesses — create or update firm profile
router.post("/businesses", async (req, res) => {
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

    const user = await upsertUser(verifiedEmail);
    if (!user) {
      res.status(500).json({ error: "Failed to resolve user" });
      return;
    }

    const bodyResult = CreateBusinessBody.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.issues[0]?.message ?? "Invalid request body" });
      return;
    }
    const {
      // Legacy fields
      name: legacyName,
      website,
      businessType: legacyBusinessType,
      location: legacyLocation,
      description,
      // New firm profile fields
      legalName,
      brandName,
      firmType,
      yearFounded,
      partners,
      locations,
      geographicScope,
      primaryServices,
      deliverables,
      specialties,
      industriesServed,
      clientStages,
      decisionMakers,
      directCompetitors,
      rankings,
      authoritySignals,
      topGSCQueries,
      clientType,
      individualServices,
      individualDeliverables,
      individualSpecialties,
      businessServices,
      businessDeliverables,
      businessSpecialties,
    } = bodyResult.data;

    // Derive canonical name, businessType, location for backward compat with billing/scans
    const canonicalName = legalName || legacyName;
    const canonicalBusinessType = firmType || legacyBusinessType;
    const canonicalLocation = deriveLocation(locations || null, legacyLocation || "");

    if (!canonicalName || !canonicalBusinessType || !canonicalLocation) {
      res.status(400).json({ error: "name (or legalName), businessType (or firmType), and location are required" });
      return;
    }

    const existingBusinesses = await db
      .select()
      .from(businessesTable)
      .where(eq(businessesTable.userId, user.id));

    const matchingBusiness = existingBusinesses.find(
      (b) =>
        (b.legalName && b.legalName === legalName) ||
        (b.name === canonicalName && b.businessType === canonicalBusinessType && b.location === canonicalLocation),
    );

    if (!matchingBusiness && existingBusinesses.length >= 1 && !user.isAdmin) {
      const now = new Date();
      const [{ activeSubCount }] = await db
        .select({ activeSubCount: sql<number>`count(*)::int` })
        .from(businessSubscriptionsTable)
        .innerJoin(businessesTable, eq(businessesTable.id, businessSubscriptionsTable.businessId))
        .where(
          and(
            eq(businessesTable.userId, user.id),
            and(
              gt(businessSubscriptionsTable.currentPeriodEnd, now),
              sql`(${businessSubscriptionsTable.status} = 'active' OR ${businessSubscriptionsTable.status} = 'past_due' OR ${businessSubscriptionsTable.status} = 'canceled')`,
            ),
          ),
        );

      if (existingBusinesses.length >= (activeSubCount ?? 0) + 1) {
        res.status(402).json({
          error: "Subscription required to create additional firm profiles",
          entitlementCode: "SUBSCRIPTION_REQUIRED",
        });
        return;
      }
    }

    const hasNewProfileData = !!(
      legalName || firmType || locations?.length || primaryServices?.length || deliverables?.length
    );

    let business;
    if (matchingBusiness) {
      [business] = await db
        .update(businessesTable)
        .set({
          name: canonicalName,
          website: website ?? matchingBusiness.website,
          businessType: canonicalBusinessType,
          location: canonicalLocation,
          description: description ?? matchingBusiness.description,
          legalName: legalName ?? matchingBusiness.legalName,
          brandName: brandName !== undefined ? brandName : matchingBusiness.brandName,
          firmType: firmType ?? matchingBusiness.firmType,
          yearFounded: yearFounded !== undefined ? yearFounded : matchingBusiness.yearFounded,
          partners: partners ?? matchingBusiness.partners,
          locations: locations ?? matchingBusiness.locations,
          geographicScope: geographicScope ?? matchingBusiness.geographicScope,
          primaryServices: primaryServices ?? matchingBusiness.primaryServices,
          deliverables: deliverables ?? matchingBusiness.deliverables,
          specialties: specialties ?? matchingBusiness.specialties,
          industriesServed: industriesServed ?? matchingBusiness.industriesServed,
          clientStages: clientStages ?? matchingBusiness.clientStages,
          decisionMakers: decisionMakers ?? matchingBusiness.decisionMakers,
          directCompetitors: directCompetitors ?? matchingBusiness.directCompetitors,
          rankings: rankings ?? matchingBusiness.rankings,
          authoritySignals: authoritySignals ?? matchingBusiness.authoritySignals,
          topGSCQueries: topGSCQueries ?? matchingBusiness.topGSCQueries,
          clientType: clientType !== undefined ? clientType : matchingBusiness.clientType,
          individualServices: individualServices ?? matchingBusiness.individualServices,
          individualDeliverables: individualDeliverables ?? matchingBusiness.individualDeliverables,
          individualSpecialties: individualSpecialties ?? matchingBusiness.individualSpecialties,
          businessServices: businessServices ?? matchingBusiness.businessServices,
          businessDeliverables: businessDeliverables ?? matchingBusiness.businessDeliverables,
          businessSpecialties: businessSpecialties ?? matchingBusiness.businessSpecialties,
          profileUpdatedAt: hasNewProfileData ? new Date() : matchingBusiness.profileUpdatedAt,
          updatedAt: new Date(),
        })
        .where(eq(businessesTable.id, matchingBusiness.id))
        .returning();
    } else {
      [business] = await db
        .insert(businessesTable)
        .values({
          userId: user.id,
          name: canonicalName,
          website: website || null,
          businessType: canonicalBusinessType,
          location: canonicalLocation,
          description: description || null,
          legalName: legalName || null,
          brandName: brandName || null,
          firmType: firmType || null,
          yearFounded: yearFounded || null,
          partners: partners || null,
          locations: locations || null,
          geographicScope: geographicScope || null,
          primaryServices: primaryServices || null,
          deliverables: deliverables || null,
          specialties: specialties || null,
          industriesServed: industriesServed || null,
          clientStages: clientStages || null,
          decisionMakers: decisionMakers || null,
          directCompetitors: directCompetitors || null,
          rankings: rankings || null,
          authoritySignals: authoritySignals || null,
          topGSCQueries: topGSCQueries || null,
          clientType: clientType || null,
          individualServices: individualServices || null,
          individualDeliverables: individualDeliverables || null,
          individualSpecialties: individualSpecialties || null,
          businessServices: businessServices || null,
          businessDeliverables: businessDeliverables || null,
          businessSpecialties: businessSpecialties || null,
          profileUpdatedAt: hasNewProfileData ? new Date() : null,
        })
        .returning();
    }

    res.status(matchingBusiness ? 200 : 201).json(formatBusiness(business));
  } catch (err) {
    console.error("POST /businesses error:", err);
    res.status(500).json({ error: "Failed to create or update business" });
  }
});

// GET /businesses — list user businesses with subscription state and prompt set status
router.get("/businesses", async (req, res) => {
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

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, verifiedEmail));
    if (!user) {
      res.status(200).json({ businesses: [] });
      return;
    }

    const businesses = await db
      .select()
      .from(businessesTable)
      .where(eq(businessesTable.userId, user.id));

    const now = new Date();

    const businessesWithStatus = await Promise.all(
      businesses.map(async (business) => {
        const [subscription] = await db
          .select()
          .from(businessSubscriptionsTable)
          .where(eq(businessSubscriptionsTable.businessId, business.id))
          .orderBy(desc(businessSubscriptionsTable.createdAt))
          .limit(1);

        const [usagePeriod] = await db
          .select()
          .from(businessUsagePeriodsTable)
          .where(
            and(
              eq(businessUsagePeriodsTable.businessId, business.id),
              lte(businessUsagePeriodsTable.billingPeriodStart, now),
              gte(businessUsagePeriodsTable.billingPeriodEnd, now),
            ),
          );

        const [promptSet] = await db
          .select({ id: promptSetsTable.id })
          .from(promptSetsTable)
          .where(eq(promptSetsTable.businessId, business.id))
          .orderBy(desc(promptSetsTable.createdAt))
          .limit(1);

        return formatBusiness(business, {
          subscription: subscription || null,
          usage: usagePeriod || null,
          hasPromptSet: !!promptSet,
        });
      }),
    );

    res.json({ businesses: businessesWithStatus });
  } catch (err) {
    console.error("GET /businesses error:", err);
    res.status(500).json({ error: "Failed to list businesses" });
  }
});

export default router;
