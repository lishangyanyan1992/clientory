import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  businessesTable,
  promptSetsTable,
  legacyPromptSetsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyEmailToken } from "../../services/otp";
import { generateFirmPrompts } from "../scans/engine";

const router: IRouter = Router();

async function resolveUser(emailToken: string | undefined, res: Parameters<Parameters<typeof router.post>[1]>[1]) {
  if (!emailToken) {
    res.status(401).json({ error: "Email verification required" });
    return null;
  }
  const verifiedEmail = verifyEmailToken(emailToken);
  if (!verifiedEmail) {
    res.status(401).json({ error: "Invalid or expired email token" });
    return null;
  }
  const [user] = await db
    .insert(usersTable)
    .values({ email: verifiedEmail, emailVerified: true })
    .onConflictDoUpdate({ target: usersTable.email, set: { emailVerified: true, updatedAt: new Date() } })
    .returning();
  return user || null;
}

async function resolveBusinessOwnership(
  businessId: number,
  userId: number,
  res: Parameters<Parameters<typeof router.post>[1]>[1],
) {
  const [business] = await db
    .select()
    .from(businessesTable)
    .where(and(eq(businessesTable.id, businessId), eq(businessesTable.userId, userId)));
  if (!business) {
    res.status(404).json({ error: "Business not found" });
    return null;
  }
  return business;
}

function formatPromptSet(ps: typeof promptSetsTable.$inferSelect) {
  return {
    id: String(ps.id),
    businessId: String(ps.businessId),
    generatedAt: ps.generatedAt.toISOString(),
    prompts: ps.prompts,
    isLocked: ps.isLocked,
    substitutionNotes: ps.substitutionNotes,
    createdAt: ps.createdAt.toISOString(),
  };
}

// POST /businesses/:id/prompt-sets/generate
router.post("/businesses/:id/prompt-sets/generate", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    const user = await resolveUser(emailToken, res);
    if (!user) return;

    const businessId = parseInt(req.params.id, 10);
    if (isNaN(businessId)) {
      res.status(400).json({ error: "Invalid business ID" });
      return;
    }

    const business = await resolveBusinessOwnership(businessId, user.id, res);
    if (!business) return;

    // If a PromptSet already exists and is locked, return it (idempotent)
    const [existing] = await db
      .select()
      .from(promptSetsTable)
      .where(eq(promptSetsTable.businessId, businessId))
      .orderBy(desc(promptSetsTable.createdAt))
      .limit(1);

    if (existing) {
      res.status(200).json(formatPromptSet(existing));
      return;
    }

    const { prompts, substitutionNotes } = await generateFirmPrompts(business);

    const [promptSet] = await db
      .insert(promptSetsTable)
      .values({
        businessId,
        prompts,
        isLocked: true,
        substitutionNotes: substitutionNotes || null,
      })
      .returning();

    res.status(201).json(formatPromptSet(promptSet));
  } catch (err) {
    console.error("POST /businesses/:id/prompt-sets/generate error:", err);
    res.status(500).json({ error: "Failed to generate prompt set" });
  }
});

// GET /businesses/:id/prompt-sets/current
router.get("/businesses/:id/prompt-sets/current", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    const user = await resolveUser(emailToken, res);
    if (!user) return;

    const businessId = parseInt(req.params.id, 10);
    if (isNaN(businessId)) {
      res.status(400).json({ error: "Invalid business ID" });
      return;
    }

    const business = await resolveBusinessOwnership(businessId, user.id, res);
    if (!business) return;

    const [promptSet] = await db
      .select()
      .from(promptSetsTable)
      .where(eq(promptSetsTable.businessId, businessId))
      .orderBy(desc(promptSetsTable.createdAt))
      .limit(1);

    if (!promptSet) {
      res.status(404).json({ error: "No prompt set found for this business" });
      return;
    }

    res.json(formatPromptSet(promptSet));
  } catch (err) {
    console.error("GET /businesses/:id/prompt-sets/current error:", err);
    res.status(500).json({ error: "Failed to retrieve prompt set" });
  }
});

// POST /businesses/:id/prompt-sets/regenerate
// Only available if profile has been updated since last generation
router.post("/businesses/:id/prompt-sets/regenerate", async (req, res) => {
  try {
    const emailToken = req.headers["x-email-token"] as string | undefined;
    const user = await resolveUser(emailToken, res);
    if (!user) return;

    const businessId = parseInt(req.params.id, 10);
    if (isNaN(businessId)) {
      res.status(400).json({ error: "Invalid business ID" });
      return;
    }

    const business = await resolveBusinessOwnership(businessId, user.id, res);
    if (!business) return;

    const [currentSet] = await db
      .select()
      .from(promptSetsTable)
      .where(eq(promptSetsTable.businessId, businessId))
      .orderBy(desc(promptSetsTable.createdAt))
      .limit(1);

    if (currentSet) {
      // Check if profile has been updated since last generation
      const profileUpdated = business.profileUpdatedAt;
      if (profileUpdated && profileUpdated <= currentSet.generatedAt) {
        res.status(409).json({
          error: "Profile has not been updated since the last prompt set was generated. Update your firm profile first.",
        });
        return;
      }

      // Archive the current prompt set
      await db.insert(legacyPromptSetsTable).values({
        businessId,
        originalPromptSetId: currentSet.id,
        generatedAt: currentSet.generatedAt,
        prompts: currentSet.prompts,
        isLocked: currentSet.isLocked,
        substitutionNotes: currentSet.substitutionNotes,
        createdAt: currentSet.createdAt,
      });

      await db.delete(promptSetsTable).where(eq(promptSetsTable.id, currentSet.id));
    }

    const { prompts, substitutionNotes } = await generateFirmPrompts(business);

    const [newSet] = await db
      .insert(promptSetsTable)
      .values({
        businessId,
        prompts,
        isLocked: true,
        substitutionNotes: substitutionNotes || null,
      })
      .returning();

    res.status(201).json(formatPromptSet(newSet));
  } catch (err) {
    console.error("POST /businesses/:id/prompt-sets/regenerate error:", err);
    res.status(500).json({ error: "Failed to regenerate prompt set" });
  }
});

// PATCH and PUT on existing sets → 405 (immutable)
router.patch("/businesses/:id/prompt-sets/:setId", (_req, res) => {
  res.status(405).json({
    error: "Prompt sets are immutable once created. To get a new set, update your firm profile and regenerate.",
  });
});

router.put("/businesses/:id/prompt-sets/:setId", (_req, res) => {
  res.status(405).json({
    error: "Prompt sets are immutable once created. To get a new set, update your firm profile and regenerate.",
  });
});

export default router;
