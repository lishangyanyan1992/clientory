import { Router, type IRouter } from "express";
import { CreateScanBody, GetScanParams, StreamScanProgressParams } from "@workspace/api-zod";
import { db } from "@workspace/db";
import {
  scansTable,
  scanPromptsTable,
  scanResultsTable,
  usersTable,
  businessesTable,
  businessSubscriptionsTable,
  businessUsageEventsTable,
  businessUsagePeriodsTable,
} from "@workspace/db/schema";
import { eq, and, lte, gte, isNull, sql, gt } from "drizzle-orm";
import { EventEmitter } from "events";
import { verifyEmailToken } from "../../services/otp";
import { validateScanInput } from "../../services/validation";
import { buildCacheKey, findCachedScan, storeCacheEntry } from "../../services/scan-cache";
import { checkRateLimit, hashIp, getClientIp } from "../../services/rate-limit";
import { checkScanEntitlement } from "../../services/entitlement";
import { getAppBaseUrl } from "../../services/app-base-url";
import { timedQuery } from "../../services/business-logger";

const router: IRouter = Router();

const scanEmitters = new Map<number, EventEmitter>();

async function getScanEngine() {
  return import("./engine");
}

router.post("/scans", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    if (!emailToken) {
      res.status(401).json({ error: "Email verification required" });
      return;
    }

    const verifiedEmail = verifyEmailToken(emailToken);
    if (!verifiedEmail) {
      res.status(401).json({ error: "Invalid or expired email token. Please verify your email again." });
      return;
    }

    const body = CreateScanBody.parse(req.body);

    const validation = validateScanInput(body.businessName, body.businessType, body.location);
    if (!validation.valid) {
      res.status(422).json({ error: validation.error });
      return;
    }

    const cacheKey = buildCacheKey(body.businessName, body.businessType, body.location, verifiedEmail);

    const cachedScanId = await findCachedScan(cacheKey);
    if (cachedScanId) {
      const [cachedScan] = await db.select().from(scansTable).where(eq(scansTable.id, cachedScanId));
      if (cachedScan) {
        res.status(200).json({
          id: String(cachedScan.id),
          businessName: cachedScan.businessName,
          businessType: cachedScan.businessType,
          location: cachedScan.location,
          description: cachedScan.description,
          website: cachedScan.website,
          status: cachedScan.status,
          score: cachedScan.score,
          createdAt: cachedScan.createdAt.toISOString(),
          cached: true,
        });
        return;
      }
    }

    const [user] = await db
      .insert(usersTable)
      .values({ email: verifiedEmail, emailVerified: true })
      .onConflictDoUpdate({ target: usersTable.email, set: { emailVerified: true, updatedAt: new Date() } })
      .returning();

    if (!user) {
      res.status(500).json({ error: "Failed to resolve user. Please try again." });
      return;
    }

    const businessId = parseInt(body.businessId, 10);
    if (isNaN(businessId)) {
      res.status(400).json({ error: "Invalid businessId" });
      return;
    }

    const [business] = await db
      .select()
      .from(businessesTable)
      .where(and(eq(businessesTable.id, businessId), eq(businessesTable.userId, user.id)));

    if (!business) {
      res.status(404).json({ error: "Business not found or not owned by you" });
      return;
    }

    const entitlement = await checkScanEntitlement(user.id, businessId);
    if (!entitlement.allowed) {
      res.status(402).json({
        error: "Scan not allowed",
        entitlementCode: entitlement.code,
        periodEnd: entitlement.periodEnd?.toISOString(),
        scansUsed: entitlement.scansUsed,
        scansLimit: entitlement.scansLimit,
      });
      return;
    }

    const clientIp = getClientIp(req);
    const ipRateKey = `scan:ip:${hashIp(clientIp)}`;
    const ipRateResult = await checkRateLimit(ipRateKey, 10, 60 * 60 * 1000);
    if (!ipRateResult.allowed) {
      res.status(429).json({
        error: "Too many scan requests. Please try again later.",
        retryAfter: Math.ceil((ipRateResult.resetAt.getTime() - Date.now()) / 1000),
      });
      return;
    }

    const isFreeReport = !!entitlement.isFreeReport;

    const [scan] = await db.insert(scansTable).values({
      businessName: body.businessName,
      businessType: body.businessType,
      location: body.location,
      description: body.description || null,
      website: body.website || null,
      status: "pending",
      userEmail: verifiedEmail,
      ipHash: hashIp(clientIp),
      businessId: businessId,
      isFreeReport,
    }).returning();

    if (isFreeReport) {
      const claimResult = await db
        .update(usersTable)
        .set({ freeReportUsedAt: new Date() })
        .where(and(eq(usersTable.id, user.id), isNull(usersTable.freeReportUsedAt)))
        .returning();

      if (claimResult.length === 0) {
        await db.delete(scansTable).where(eq(scansTable.id, scan.id));
        res.status(402).json({
          error: "Scan not allowed",
          entitlementCode: "FREE_REPORT_ALREADY_USED",
        });
        return;
      }
    }

    const emitter = new EventEmitter();
    emitter.setMaxListeners(50);
    scanEmitters.set(scan.id, emitter);

    res.status(201).json({
      id: String(scan.id),
      businessName: scan.businessName,
      businessType: scan.businessType,
      location: scan.location,
      description: scan.description,
      website: scan.website,
      status: scan.status,
      score: scan.score,
      createdAt: scan.createdAt.toISOString(),
    });

    const appBaseUrl = getAppBaseUrl();
    let paidUsageTracked = false;
    let scanningPhaseStarted = false;

    const { runScan } = await getScanEngine();

    runScan(scan.id, (event) => {
      if (event.type === "scanning" && !scanningPhaseStarted) {
        scanningPhaseStarted = true;
      }

      if (isFreeReport && event.type === "error" && !scanningPhaseStarted) {
        db.update(usersTable)
          .set({ freeReportUsedAt: null })
          .where(eq(usersTable.id, user.id))
          .catch((err) => console.error("Failed to release free report claim:", err));
      }

      if (!isFreeReport && !paidUsageTracked && event.type === "scanning") {
        paidUsageTracked = true;
        (async () => {
          try {
            const now = new Date();
            const [period] = await db
              .select()
              .from(businessUsagePeriodsTable)
              .where(
                and(
                  eq(businessUsagePeriodsTable.businessId, businessId),
                  lte(businessUsagePeriodsTable.billingPeriodStart, now),
                  gte(businessUsagePeriodsTable.billingPeriodEnd, now),
                ),
              );

            if (period) {
              const insertedEvents = await db
                .insert(businessUsageEventsTable)
                .values({
                  businessId,
                  scanId: scan.id,
                  billingPeriodStart: period.billingPeriodStart,
                })
                .onConflictDoNothing()
                .returning();

              if (insertedEvents.length > 0) {
                await db
                  .update(businessUsagePeriodsTable)
                  .set({ scansUsed: sql`${businessUsagePeriodsTable.scansUsed} + 1` })
                  .where(eq(businessUsagePeriodsTable.id, period.id));
              }
            }
          } catch (err) {
            console.error("Failed to record paid usage event:", err);
          }
        })();
      }

      const em = scanEmitters.get(scan.id);
      if (em) {
        em.emit("progress", event);
        if (event.type === "completed" || event.type === "error") {
          setTimeout(() => {
            scanEmitters.delete(scan.id);
          }, 30000);
        }
      }

      if (event.type === "completed" && event.score != null) {
        storeCacheEntry(cacheKey, scan.id).catch(console.error);

        (async () => {
          try {
            const prompts = await timedQuery(
              "email_prompts_fetch",
              () => db.select().from(scanPromptsTable).where(eq(scanPromptsTable.scanId, scan.id)),
            );
            const allResults = await timedQuery(
              "email_results_fetch",
              () => Promise.all(
                prompts.map((p) => db.select().from(scanResultsTable).where(eq(scanResultsTable.scanPromptId, p.id))),
              ),
            );
            const flatResults = allResults.flat();

            const makeProviderStats = () => ({
              openai: { name: "ChatGPT (OpenAI)", mentions: 0, total: 0 },
              anthropic: { name: "Claude (Anthropic)", mentions: 0, total: 0 },
              gemini: { name: "Gemini (Google)", mentions: 0, total: 0 },
            });

            const stats = makeProviderStats();
            const mentionsByProvider: Record<string, number> = { openai: 0, anthropic: 0, gemini: 0 };

            // Build a map from promptId → results by provider for prompt-level email rows
            const resultsByPromptId = new Map<number, Record<string, boolean>>();
            for (let i = 0; i < prompts.length; i++) {
              const pid = prompts[i].id;
              const provMap: Record<string, boolean> = { openai: false, anthropic: false, gemini: false };
              for (const r of allResults[i]) {
                provMap[r.provider] = r.mentioned;
              }
              resultsByPromptId.set(pid, provMap);
            }

            const individualPrompts = prompts.filter((p) => p.audience === "individual");
            const businessPrompts = prompts.filter((p) => p.audience === "business");
            const individualPromptIds = new Set(individualPrompts.map((p) => p.id));
            const businessPromptIds = new Set(businessPrompts.map((p) => p.id));
            const indivStats = makeProviderStats();
            const bizStats = makeProviderStats();

            for (const r of flatResults) {
              const s = stats[r.provider];
              if (s) {
                s.total++;
                if (r.mentioned) {
                  s.mentions++;
                  mentionsByProvider[r.provider]++;
                }
              }
              if (individualPromptIds.has(r.scanPromptId)) {
                const is = indivStats[r.provider];
                if (is) { is.total++; if (r.mentioned) is.mentions++; }
              } else if (businessPromptIds.has(r.scanPromptId)) {
                const bs = bizStats[r.provider];
                if (bs) { bs.total++; if (r.mentioned) bs.mentions++; }
              }
            }

            const buildPromptRows = (ps: typeof prompts) =>
              ps.map((p) => {
                const m = resultsByPromptId.get(p.id) ?? {};
                return { text: p.prompt, openai: !!m["openai"], anthropic: !!m["anthropic"], gemini: !!m["gemini"] };
              });

            const hasIndividual = individualPrompts.length > 0;
            const hasBusiness = businessPrompts.length > 0;

            const computeAudienceScore = (statsObj: ReturnType<typeof makeProviderStats>): number => {
              const vals = Object.values(statsObj);
              const totalMentions = vals.reduce((a, v) => a + v.mentions, 0);
              const totalCount = vals.reduce((a, v) => a + v.total, 0);
              return totalCount > 0 ? Math.round((totalMentions / totalCount) * 100) : 0;
            };

            const audienceSections =
              hasIndividual && hasBusiness
                ? [
                    { audience: "individual" as const, providerStats: Object.values(indivStats), promptRows: buildPromptRows(individualPrompts) },
                    { audience: "business" as const, providerStats: Object.values(bizStats), promptRows: buildPromptRows(businessPrompts) },
                  ]
                : undefined;

            const audienceScores =
              hasIndividual && hasBusiness
                ? { individual: computeAudienceScore(indivStats), business: computeAudienceScore(bizStats) }
                : undefined;

            const { generateRecommendations } = await getScanEngine();
            const recs = generateRecommendations(
              event.score ?? 0,
              scan.businessName,
              scan.businessType,
              mentionsByProvider,
              prompts.length,
            );

            const { sendReportEmail } = await import("../../services/email");
            await sendReportEmail(verifiedEmail, {
              businessName: scan.businessName,
              businessType: scan.businessType,
              location: scan.location,
              score: event.score ?? 0,
              scanId: scan.id,
              appBaseUrl,
              providerStats: Object.values(stats),
              recommendations: recs,
              audienceSections,
              audienceScores,
            });
          } catch (err) {
            console.error("Failed to send report email:", err);
          }
        })();
      }
    }).catch(console.error);
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : "Invalid input",
    });
  }
});

router.get("/scans/:id", async (req, res) => {
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

    const { id } = GetScanParams.parse(req.params);
    const scanId = parseInt(id, 10);
    if (isNaN(scanId)) {
      res.status(404).json({ error: "Scan not found" });
      return;
    }

    const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, scanId));
    if (!scan) {
      res.status(404).json({ error: "Scan not found" });
      return;
    }

    if (scan.userEmail !== verifiedEmail) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    let hasPaidSubscription = false;

    if (scan.businessId) {
      const now = new Date();
      const [sub] = await db
        .select({
          status: businessSubscriptionsTable.status,
          currentPeriodEnd: businessSubscriptionsTable.currentPeriodEnd,
        })
        .from(businessSubscriptionsTable)
        .where(eq(businessSubscriptionsTable.businessId, scan.businessId))
        .orderBy(sql`${businessSubscriptionsTable.createdAt} desc`)
        .limit(1);

      if (sub) {
        const isPeriodActive = sub.currentPeriodEnd > now;
        hasPaidSubscription =
          sub.status === "active" ||
          sub.status === "past_due" ||
          (sub.status === "canceled" && isPeriodActive);
      }
    }

    const canViewScanData = scan.isFreeReport || hasPaidSubscription;

    const prompts = canViewScanData
      ? await db.select().from(scanPromptsTable).where(eq(scanPromptsTable.scanId, scanId))
      : [];

    const promptsWithResults = await Promise.all(
      prompts.map(async (prompt) => {
        const results = await db.select().from(scanResultsTable).where(eq(scanResultsTable.scanPromptId, prompt.id));
        return {
          prompt: {
            id: String(prompt.id),
            scanId: String(prompt.scanId),
            prompt: prompt.prompt,
            category: prompt.category,
            audience: prompt.audience ?? null,
          },
          results: results.map((r) => ({
            id: String(r.id),
            scanPromptId: String(r.scanPromptId),
            provider: r.provider,
            response: r.response,
            mentioned: r.mentioned,
            createdAt: r.createdAt.toISOString(),
          })),
        };
      }),
    );

    const mentionsByProvider: Record<string, number> = { openai: 0, anthropic: 0, gemini: 0 };
    promptsWithResults.forEach((p) => {
      p.results.forEach((r) => {
        if (r.mentioned) {
          mentionsByProvider[r.provider] = (mentionsByProvider[r.provider] || 0) + 1;
        }
      });
    });

    const recommendations =
      hasPaidSubscription && scan.status === "completed"
        ? (await getScanEngine()).generateRecommendations(
            scan.score ?? 0,
            scan.businessName,
            scan.businessType,
            mentionsByProvider,
            prompts.length,
          )
        : [];

    res.json({
      scan: {
        id: String(scan.id),
        businessName: scan.businessName,
        businessType: scan.businessType,
        location: scan.location,
        description: scan.description,
        website: scan.website,
        status: scan.status,
        score: scan.score,
        createdAt: scan.createdAt.toISOString(),
        businessId: scan.businessId ? String(scan.businessId) : null,
        isFreeReport: scan.isFreeReport,
      },
      prompts: promptsWithResults,
      recommendations,
      locked: !canViewScanData,
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});

router.get("/scans/:id/stream", async (req, res) => {
  try {
    const emailToken =
      (req.headers["x-email-token"] as string | undefined) ||
      (req.query.token as string | undefined);
    if (!emailToken) {
      res.status(401).json({ error: "Email verification required" });
      return;
    }
    const verifiedEmail = verifyEmailToken(emailToken);
    if (!verifiedEmail) {
      res.status(401).json({ error: "Invalid or expired email token" });
      return;
    }

    const { id } = StreamScanProgressParams.parse(req.params);
    const scanId = parseInt(id, 10);

    if (isNaN(scanId)) {
      res.status(404).json({ error: "Scan not found" });
      return;
    }

    const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, scanId));
    if (!scan) {
      res.status(404).json({ error: "Scan not found" });
      return;
    }

    if (scan.userEmail !== verifiedEmail) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    if (scan.status === "completed") {
      res.write(`data: ${JSON.stringify({ type: "completed", score: scan.score, message: "Scan already completed" })}\n\n`);
      res.end();
      return;
    }

    if (scan.status === "failed") {
      res.write(`data: ${JSON.stringify({ type: "error", message: "Scan failed" })}\n\n`);
      res.end();
      return;
    }

    const emitter = scanEmitters.get(scanId);
    if (!emitter) {
      res.write(`data: ${JSON.stringify({ type: "status", message: "Scan is processing..." })}\n\n`);

      const checkInterval = setInterval(async () => {
        const [updated] = await db.select().from(scansTable).where(eq(scansTable.id, scanId));
        if (updated && (updated.status === "completed" || updated.status === "failed")) {
          clearInterval(checkInterval);
          if (updated.status === "completed") {
            res.write(`data: ${JSON.stringify({ type: "completed", score: updated.score, message: "Scan complete!" })}\n\n`);
          } else {
            res.write(`data: ${JSON.stringify({ type: "error", message: "Scan failed" })}\n\n`);
          }
          res.end();
        }
      }, 2000);

      req.on("close", () => {
        clearInterval(checkInterval);
      });
      return;
    }

    const onProgress = (event: unknown) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      if (
        typeof event === "object" &&
        event !== null &&
        "type" in event &&
        ((event as { type: string }).type === "completed" || (event as { type: string }).type === "error")
      ) {
        emitter.removeListener("progress", onProgress);
        res.end();
      }
    };

    emitter.on("progress", onProgress);

    req.on("close", () => {
      emitter.removeListener("progress", onProgress);
    });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Internal error",
    });
  }
});

export default router;
