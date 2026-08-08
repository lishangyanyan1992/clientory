import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { db } from "@workspace/db";
import {
  businessesTable,
  scanPromptsTable,
  scanResultEntitiesTable,
  scanResultsTable,
  scansTable,
} from "@workspace/db/schema";
import type { Scan, ScanResultSource } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import {
  getCompetitorExtractionPrompt,
  startObservation,
} from "../../services/langfuse";
import { logBusinessEvent } from "../../services/business-logger";

const GAP_ANALYSIS_VERSION = 1;
const EXTRACTION_BATCH_SIZE = 8;
const MAX_RESPONSE_CHARS = 4_000;
const MIN_CONFIDENCE = 0.6;
const EXTRACTION_MODEL =
  process.env.COMPETITOR_EXTRACTION_MODEL ?? "claude-haiku-4-5";

export const MOCK_COMPETITOR_NAMES = [
  "Northstar Immigration Law",
  "Harbor Legal Group",
] as const;

const extractedBatchSchema = z.array(
  z.object({
    resultId: z.number().int().positive(),
    firms: z.array(
      z.object({
        name: z.string().trim().min(2).max(200),
        rank: z.number().int().positive().max(50).nullable().optional(),
        confidence: z.number().min(0).max(1),
      }),
    ),
  }),
);

type ExtractionRow = {
  resultId: number;
  prompt: string;
  provider: string;
  grounded: boolean;
  response: string;
};

export type GapAnalysisStatus =
  | "unavailable"
  | "not_started"
  | "processing"
  | "completed"
  | "partial"
  | "failed";

export type CompetitorGapAnalysis = {
  status: GapAnalysisStatus;
  completeness: "none" | "partial" | "complete";
  isLocked: boolean;
  targetMentions: number;
  targetShareOfVoice: number | null;
  totalGaps: number;
  visibleGapCount: number;
  lockedCount: number;
  leadingCompetitor: string | null;
  competitors: Array<{
    name: string;
    mentions: number;
    shareOfVoice: number;
    providers: string[];
    topRank: number | null;
  }>;
  gaps: Array<{
    promptId: string;
    prompt: string;
    category: string;
    audience: "individual" | "business" | null;
    provider: string;
    grounded: boolean;
    competitor: { name: string; rank: number | null; snippet: string };
    sources: ScanResultSource[];
    action: { type: string; title: string; description: string };
  }>;
};

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  return new Anthropic({ apiKey });
}

export function isCompetitorGapEnabled(): boolean {
  return process.env.COMPETITOR_GAPS_ENABLED === "true";
}

export function normalizeFirmName(name: string): string {
  const basic = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const words = basic.split(/\s+/);
  const suffixes = [
    ["p", "l", "l", "c"],
    ["l", "l", "p"],
    ["l", "l", "c"],
    ["p", "c"],
    ["p", "a"],
    ["l", "p"],
  ];
  const compactSuffixes = new Set([
    "llp",
    "llc",
    "pllc",
    "pc",
    "pa",
    "lp",
    "inc",
    "corp",
    "corporation",
  ]);
  while (words.length > 0) {
    const dottedSuffix = suffixes.find(
      (suffix) =>
        words.length >= suffix.length &&
        suffix.every(
          (word, index) => words[words.length - suffix.length + index] === word,
        ),
    );
    if (dottedSuffix) {
      words.splice(-dottedSuffix.length);
      continue;
    }
    if (compactSuffixes.has(words.at(-1) ?? "")) {
      words.pop();
      continue;
    }
    break;
  }
  const stripped = words.join(" ").trim();
  return stripped || basic;
}

export function isTargetFirm(candidate: string, aliases: string[]): boolean {
  const normalized = normalizeFirmName(candidate);
  return aliases.some((alias) => {
    const target = normalizeFirmName(alias);
    if (!target || !normalized) return false;
    return (
      normalized === target ||
      (Math.min(normalized.length, target.length) >= 6 &&
        (normalized.includes(target) || target.includes(normalized)))
    );
  });
}

export function evidenceSnippetFor(response: string, firmName: string): string | null {
  const lower = response.toLowerCase();
  const exactIdx = lower.indexOf(firmName.toLowerCase());
  if (exactIdx >= 0) {
    const start = Math.max(0, exactIdx - 100);
    const end = Math.min(response.length, exactIdx + firmName.length + 140);
    return `${start > 0 ? "…" : ""}${response.slice(start, end).trim()}${end < response.length ? "…" : ""}`;
  }

  const tokens = normalizeFirmName(firmName)
    .split(" ")
    .filter((token) => token.length > 2);
  if (tokens.length < 2) return null;
  const line = response.split(/\r?\n/).find((candidateLine) => {
    const normalizedLine = normalizeFirmName(candidateLine);
    return tokens.every((token) => normalizedLine.includes(token));
  });
  return line ? line.trim().slice(0, 260) : null;
}

function parseJsonText(text: string): unknown {
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();
  return JSON.parse(cleaned);
}

export function parseExtractionResponse(text: string) {
  return extractedBatchSchema.parse(parseJsonText(text));
}

export function deriveGapAnalysisStatus(successfulBatches: number, failedBatches: number) {
  return failedBatches === 0 ? "completed" : successfulBatches > 0 ? "partial" : "failed";
}

async function extractBatch(rows: ExtractionRow[], aliases: string[]) {
  const { text: promptText, promptClient } =
    await getCompetitorExtractionPrompt({
      targetAliases: aliases.join(" | "),
      results: JSON.stringify(
        rows.map((row) => ({
          resultId: row.resultId,
          prompt: row.prompt,
          provider: row.provider,
          grounded: row.grounded,
          response: row.response.slice(0, MAX_RESPONSE_CHARS),
        })),
      ),
    });

  const gen = startObservation(
    "competitor-extraction",
    {
      model: EXTRACTION_MODEL,
      input: [{ role: "user", content: promptText }],
      metadata: { batchSize: rows.length },
      ...(promptClient ? { prompt: promptClient } : {}),
    },
    { asType: "generation" },
  );

  try {
    const message = await getAnthropicClient().messages.create({
      model: EXTRACTION_MODEL,
      max_tokens: 1_500,
      messages: [{ role: "user", content: promptText }],
    });
    const block = message.content[0];
    const output = block?.type === "text" ? block.text : "[]";
    const parsed = parseExtractionResponse(output);
    gen
      .update({
        output,
        usageDetails: {
          input: message.usage.input_tokens,
          output: message.usage.output_tokens,
        },
      })
      .end();
    return parsed;
  } catch (error) {
    gen
      .update({
        metadata: {
          error: error instanceof Error ? error.message : "extraction failed",
        },
      })
      .end();
    throw error;
  }
}

export async function analyzeCompetitorsForScan(scan: Scan): Promise<void> {
  if (!isCompetitorGapEnabled()) return;

  const startedAt = Date.now();
  try {
    await db
      .update(scansTable)
      .set({
        gapAnalysisStatus: "processing",
        gapAnalysisVersion: GAP_ANALYSIS_VERSION,
      })
      .where(eq(scansTable.id, scan.id));

    const rows = await db
      .select({
        resultId: scanResultsTable.id,
        prompt: scanPromptsTable.prompt,
        provider: scanResultsTable.provider,
        grounded: scanResultsTable.grounded,
        response: scanResultsTable.response,
      })
      .from(scanResultsTable)
      .innerJoin(
        scanPromptsTable,
        eq(scanPromptsTable.id, scanResultsTable.scanPromptId),
      )
      .where(eq(scanPromptsTable.scanId, scan.id));

    const aliases = [scan.businessName];
    if (scan.businessId) {
      const [business] = await db
        .select({
          name: businessesTable.name,
          legalName: businessesTable.legalName,
          brandName: businessesTable.brandName,
        })
        .from(businessesTable)
        .where(eq(businessesTable.id, scan.businessId));
      if (business)
        aliases.push(
          ...[business.name, business.legalName, business.brandName].filter(
            (x): x is string => !!x,
          ),
        );
    }

    let successfulBatches = 0;
    let failedBatches = 0;
    let entityCount = 0;

    for (let start = 0; start < rows.length; start += EXTRACTION_BATCH_SIZE) {
      const batch = rows.slice(start, start + EXTRACTION_BATCH_SIZE);
      try {
        const extracted = scan.mock
          ? batch.map((row) => ({
              resultId: row.resultId,
              firms: MOCK_COMPETITOR_NAMES.filter((name) =>
                row.response.includes(name),
              ).map((name, index) => ({
                name,
                rank: index + 1,
                confidence: 1,
              })),
            }))
          : await extractBatch(batch, aliases);
        const byResultId = new Map(batch.map((row) => [row.resultId, row]));

        for (const item of extracted) {
          const row = byResultId.get(item.resultId);
          if (!row) continue;
          const seen = new Set<string>();
          for (const firm of item.firms) {
            if (
              firm.confidence < MIN_CONFIDENCE ||
              isTargetFirm(firm.name, aliases)
            )
              continue;
            const normalizedName = normalizeFirmName(firm.name);
            if (!normalizedName || seen.has(normalizedName)) continue;
            const evidenceSnippet = evidenceSnippetFor(row.response, firm.name);
            if (!evidenceSnippet) continue;
            seen.add(normalizedName);
            const inserted = await db
              .insert(scanResultEntitiesTable)
              .values({
                scanResultId: row.resultId,
                displayName: firm.name.trim(),
                normalizedName,
                rank: firm.rank ?? null,
                evidenceSnippet,
                confidence: firm.confidence,
              })
              .onConflictDoNothing()
              .returning({ id: scanResultEntitiesTable.id });
            entityCount += inserted.length;
          }
        }
        successfulBatches++;
      } catch {
        failedBatches++;
      }
    }

    const gapAnalysisStatus = deriveGapAnalysisStatus(successfulBatches, failedBatches);
    await db
      .update(scansTable)
      .set({ gapAnalysisStatus })
      .where(eq(scansTable.id, scan.id));

    logBusinessEvent(
      gapAnalysisStatus === "failed"
        ? "gap_analysis_failed"
        : "gap_analysis_completed",
      {
        scanId: scan.id,
        businessId: scan.businessId ?? undefined,
        status: gapAnalysisStatus,
        entityCount,
        successfulBatches,
        failedBatches,
        durationMs: Date.now() - startedAt,
      },
    );
  } catch (error) {
    try {
      await db
        .update(scansTable)
        .set({ gapAnalysisStatus: "failed" })
        .where(eq(scansTable.id, scan.id));
    } catch {
      // Extraction is additive; status persistence must never fail the primary scan.
    }
    logBusinessEvent("gap_analysis_failed", {
      scanId: scan.id,
      businessId: scan.businessId ?? undefined,
      reason:
        error instanceof Error ? error.message : "Unknown extraction error",
      durationMs: Date.now() - startedAt,
    });
  }
}

type GapInputPrompt = {
  id: number;
  prompt: string;
  category: string;
  audience: "individual" | "business" | null;
};

type GapInputResult = {
  id: number;
  scanPromptId: number;
  provider: string;
  mentioned: boolean;
  grounded: boolean;
  sources: ScanResultSource[];
};

type GapInputEntity = {
  scanResultId: number;
  displayName: string;
  normalizedName: string;
  rank: number | null;
  evidenceSnippet: string;
};

const DIRECTORY_DOMAINS = [
  "avvo.com",
  "martindale.com",
  "justia.com",
  "findlaw.com",
  "lawyers.com",
  "chambers.com",
];

function hostname(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function actionForGap(
  competitorName: string,
  grounded: boolean,
  sources: ScanResultSource[],
): { type: string; title: string; description: string } {
  if (!grounded || sources.length === 0) {
    return {
      type: "authority",
      title: "Strengthen your firm’s authority signals",
      description: `AI recalled ${competitorName} without live search. Build consistent firm profiles, expert mentions, and service-specific content.`,
    };
  }

  const domain = hostname(sources[0].url);
  if (
    DIRECTORY_DOMAINS.some(
      (known) => domain === known || domain.endsWith(`.${known}`),
    )
  ) {
    return {
      type: "directory",
      title: `Audit your presence on ${domain}`,
      description: `This directory was used in the same answer that recommended ${competitorName}. Complete and strengthen your firm’s profile there.`,
    };
  }
  if (domain.endsWith(".gov")) {
    return {
      type: "authoritative_content",
      title: "Publish an authoritative explainer",
      description: `Create a practical answer grounded in ${domain} guidance and connect it clearly to your firm’s relevant service.`,
    };
  }

  const domainKey = normalizeFirmName(domain.split(".")[0] ?? "").replace(
    /\s/g,
    "",
  );
  const competitorKey = normalizeFirmName(competitorName).replace(/\s/g, "");
  if (domainKey.length >= 5 && competitorKey.includes(domainKey)) {
    return {
      type: "owned_content",
      title: "Build a stronger service and location page",
      description: `${competitorName}’s own site was used in this answer. Publish a clearer, evidence-rich page addressing the same client need.`,
    };
  }

  return {
    type: "digital_pr",
    title: `Pursue inclusion on ${domain || "the cited publication"}`,
    description: `This source appeared in the same answer that recommended ${competitorName}. Seek an expert contribution, profile, or relevant inclusion.`,
  };
}

export function buildCompetitorGapAnalysis(args: {
  status: Scan["gapAnalysisStatus"] | "unavailable";
  prompts: GapInputPrompt[];
  results: GapInputResult[];
  entities: GapInputEntity[];
  fullAccess: boolean;
}): CompetitorGapAnalysis {
  const { status, prompts, results, entities, fullAccess } = args;
  const completeness =
    status === "completed"
      ? "complete"
      : status === "partial"
        ? "partial"
        : "none";
  const promptById = new Map(prompts.map((prompt) => [prompt.id, prompt]));
  const resultById = new Map(results.map((result) => [result.id, result]));
  const targetMentions = results.filter((result) => result.mentioned).length;

  const competitorMap = new Map<
    string,
    {
      name: string;
      mentions: number;
      providers: Set<string>;
      topRank: number | null;
    }
  >();
  for (const entity of entities) {
    const result = resultById.get(entity.scanResultId);
    if (!result) continue;
    const current = competitorMap.get(entity.normalizedName) ?? {
      name: entity.displayName,
      mentions: 0,
      providers: new Set<string>(),
      topRank: null,
    };
    current.mentions++;
    current.providers.add(result.provider);
    if (
      entity.rank != null &&
      (current.topRank == null || entity.rank < current.topRank)
    )
      current.topRank = entity.rank;
    if (entity.displayName.length > current.name.length)
      current.name = entity.displayName;
    competitorMap.set(entity.normalizedName, current);
  }

  const totalMentionInstances =
    targetMentions +
    [...competitorMap.values()].reduce((sum, item) => sum + item.mentions, 0);
  const competitors = [...competitorMap.values()]
    .map((item) => ({
      name: item.name,
      mentions: item.mentions,
      shareOfVoice: totalMentionInstances
        ? Math.round((item.mentions / totalMentionInstances) * 1_000) / 10
        : 0,
      providers: [...item.providers].sort(),
      topRank: item.topRank,
    }))
    .sort(
      (a, b) =>
        b.mentions - a.mentions ||
        (a.topRank ?? 99) - (b.topRank ?? 99) ||
        a.name.localeCompare(b.name),
    );

  const frequencyByName = new Map(
    competitors.map((item) => [normalizeFirmName(item.name), item.mentions]),
  );
  const gaps = entities
    .flatMap((entity) => {
      const result = resultById.get(entity.scanResultId);
      if (!result || result.mentioned) return [];
      const prompt = promptById.get(result.scanPromptId);
      if (!prompt) return [];
      return [
        {
          promptId: String(prompt.id),
          prompt: prompt.prompt,
          category: prompt.category,
          audience: prompt.audience,
          provider: result.provider,
          grounded: result.grounded,
          competitor: {
            name: entity.displayName,
            rank: entity.rank,
            snippet: entity.evidenceSnippet,
          },
          sources: result.sources,
          action: actionForGap(
            entity.displayName,
            result.grounded,
            result.sources,
          ),
          _frequency: frequencyByName.get(entity.normalizedName) ?? 0,
        },
      ];
    })
    .sort(
      (a, b) =>
        Number(b.grounded && b.sources.length > 0) -
          Number(a.grounded && a.sources.length > 0) ||
        (a.competitor.rank ?? 99) - (b.competitor.rank ?? 99) ||
        b._frequency - a._frequency ||
        Number(a.promptId) - Number(b.promptId),
    )
    .map(({ _frequency, ...gap }) => gap);

  const visibleGaps = fullAccess ? gaps : gaps.slice(0, 1);
  const visibleCompetitors = fullAccess ? competitors : competitors.slice(0, 1);
  return {
    status,
    completeness,
    isLocked: !fullAccess && gaps.length > visibleGaps.length,
    targetMentions,
    targetShareOfVoice: totalMentionInstances
      ? Math.round((targetMentions / totalMentionInstances) * 1_000) / 10
      : null,
    totalGaps: gaps.length,
    visibleGapCount: visibleGaps.length,
    lockedCount: Math.max(0, gaps.length - visibleGaps.length),
    leadingCompetitor: competitors[0]?.name ?? null,
    competitors: visibleCompetitors,
    gaps: visibleGaps,
  };
}
