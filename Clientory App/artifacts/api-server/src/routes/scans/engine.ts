import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { batchProcessWithSSE } from "@workspace/integrations-openai-ai-server/batch";
import { db } from "@workspace/db";
import {
  observeOpenAI,
  propagateAttributes,
  startActiveObservation,
  startObservation,
} from "../../services/langfuse";
import OpenAI from "openai";
import {
  scansTable,
  scanPromptsTable,
  scanResultsTable,
  promptSetsTable,
  businessesTable,
  symptomQueryCacheTable,
} from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Business, PromptItem, Scan, ScanPrompt } from "@workspace/db/schema";

// ─── Model config (override via env vars) ────────────────────────────────────
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-5.2";
const ANTHROPIC_QUERY_MODEL = process.env.ANTHROPIC_QUERY_MODEL ?? "claude-sonnet-4-6";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
const SYMPTOM_MODEL = process.env.SYMPTOM_MODEL ?? "claude-haiku-4-5";

// observeOpenAI wraps the client so every chat.completions.create() call is
// automatically captured as a Langfuse generation (model, tokens, latency, cost).
// Falls back to a plain OpenAI client when Langfuse is not configured.
const openai = observeOpenAI(new OpenAI({ apiKey: process.env.OPENAI_API_KEY }));
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const genai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

type ProgressCallback = (event: {
  type: string;
  promptIndex?: number;
  totalPrompts?: number;
  provider?: string;
  prompt?: string;
  mentioned?: boolean;
  message?: string;
  score?: number;
}) => void;

// ─── Static symptom map (30 entries across law, accounting, consulting, marketing) ────────────────
// v1: COMPARISON prompts are NOT generated even if competitors are present (reserved for v2)
// v2 TODO: add COMPARISON category using directCompetitors field
// v2 TODO: add SERVICE_EXPLANATORY, VALIDATION, COST_PRICING categories
const SYMPTOM_MAP: Record<string, string> = {
  "trademark registration": "Someone is using my brand name, what are my legal options?",
  "M&A advisory": "We received an acquisition offer, who should we talk to first?",
  "employment litigation": "An employee is threatening to sue my company, what should I do?",
  "contract drafting": "I need someone to review a vendor contract before I sign, who should I call?",
  "estate planning": "I want to set up a trust for my children, where do I start?",
  "real estate transaction": "I am buying commercial property for my business, do I need a lawyer?",
  "IP licensing": "A large company wants to license our software, who negotiates that?",
  "securities compliance": "We are raising a seed round and need legal help with the paperwork",
  "business formation": "I want to start an LLC with two partners, what is the process?",
  "immigration law": "My company needs to sponsor a foreign employee for a work visa, who handles that?",
  "IRS audit defense": "I got an IRS audit notice for my LLC, what should I do?",
  "sales tax nexus": "I am selling SaaS in 30 states and just got a sales tax compliance letter, help",
  "R&D credit studies": "I heard there is a tax credit for software development, is my company eligible?",
  "financial statement audit": "Our investors are requiring an audit before funding, who do we hire?",
  "CFO advisory": "We are a 40-person company and need fractional CFO help, what should I look for?",
  "payroll services": "Managing payroll for our growing team is taking too much time, who can take this over?",
  "international tax": "We just expanded to Europe and do not understand VAT obligations, help",
  "business valuation": "I am planning to sell my business and need to know what it is worth, who helps?",
  "cost segregation study": "I bought a commercial building last year and my CPA mentioned accelerated depreciation",
  "multi-state tax compliance": "We operate in 12 states and our tax filings are getting very complicated",
  "digital transformation": "Our processes are still manual and we are losing to faster competitors, who can help?",
  "organizational design": "Our company doubled in size and nothing works anymore, we need help restructuring",
  "market entry strategy": "We want to launch in the US market from abroad and need a strategy, who do we hire?",
  "supply chain optimization": "Our supply chain delays are killing our margins, who fixes this?",
  "change management": "We are rolling out new software and our team is resisting, who helps with adoption?",
  "SEO strategy": "Our website gets almost no organic traffic and competitors outrank us everywhere, who fixes this?",
  "performance marketing": "We spend tens of thousands a month on ads and cannot tell what is working, who audits this?",
  "brand positioning": "We pivoted our company and need to rethink our brand and messaging, who helps?",
  "content marketing strategy": "We publish content but it does not rank or drive leads, who builds us a real strategy?",
  "marketing attribution": "We cannot connect our marketing spend to actual revenue, who helps set up attribution?",
};

// L1: in-memory cache for Claude Haiku symptom lookups (process lifetime)
const symptomMemoryCache = new Map<string, string>();

function getFirmTypeLabel(firmType: string): string {
  const labels: Record<string, string> = {
    law: "law firm",
    accounting: "accounting firm",
    consulting: "consulting firm",
    marketing_agency: "marketing agency",
    other: "professional firm",
  };
  return labels[firmType] || firmType.replace(/_/g, " ") + " firm";
}

function getHqLocation(firm: Business): { city: string; state: string } | null {
  const locs = firm.locations as Array<{ city: string; state: string; isHQ: boolean }> | null;
  if (locs && locs.length > 0) {
    const hq = locs.find((l) => l.isHQ) || locs[0];
    return { city: hq.city, state: hq.state };
  }
  if (firm.location) {
    const parts = firm.location.split(",").map((s) => s.trim());
    return { city: parts[0] || firm.location, state: parts[1] || "" };
  }
  return null;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function isValidPromptLength(text: string): boolean {
  const wc = wordCount(text);
  return wc >= 4 && wc <= 30;
}

// #4: Prefer specialties over deliverables; sort by word count within each group.
function selectMostDistinctive(specialties: string[], deliverables: string[], count: number): string[] {
  const sortByWordCount = (arr: string[]) => [...arr].sort((a, b) => b.split(" ").length - a.split(" ").length);
  return [...sortByWordCount(specialties), ...sortByWordCount(deliverables)].slice(0, count);
}

// #5: Token-overlap deduplication. Returns overlap ratio in [0,1].
function tokenOverlap(a: string, b: string): number {
  const tokA = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
  const tokB = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
  let intersect = 0;
  for (const t of tokA) if (tokB.has(t)) intersect++;
  return intersect / Math.max(tokA.size, tokB.size);
}

// #6: Brand prompt variants — rotated deterministically.
const BRAND_TEMPLATES: Array<(name: string, firmLabel: string) => string> = [
  (name, firmLabel) => `What do people say about ${name} ${firmLabel}?`,
  (name, firmLabel) => `Reviews of ${name} ${firmLabel}`,
  (name, firmLabel) => `Is ${name} a good ${firmLabel}?`,
  (name, firmLabel) => `${name} ${firmLabel} reputation`,
];

function generateBrandDirect(firm: Business, seed = 0): PromptItem {
  const name = firm.brandName || firm.legalName || firm.name;
  const firmLabel = getFirmTypeLabel(firm.firmType || firm.businessType);
  const professionalFirmTypes = ["law", "accounting", "consulting", "marketing_agency"];
  const text = professionalFirmTypes.includes(firm.firmType || "")
    ? BRAND_TEMPLATES[seed % BRAND_TEMPLATES.length](name, firmLabel)
    : `Tell me about ${name}`;
  return {
    id: crypto.randomUUID(),
    category: "BRAND_DIRECT",
    text,
    sourceVariables: { name, firmLabel },
  };
}

function generateCategoryGeo(firm: Business): PromptItem[] {
  const hq = getHqLocation(firm);
  const firmLabel = getFirmTypeLabel(firm.firmType || firm.businessType);
  const services = (firm.primaryServices as string[] | null) || [];
  const deliverables = (firm.deliverables as string[] | null) || [];
  const industries = (firm.industriesServed as string[] | null) || [];

  const service1 = services[0] || deliverables[0] || firmLabel + " services";
  const service2 = services[1] || services[0] || deliverables[0] || firmLabel + " services";
  const industry1 = industries[0] || "businesses";
  const city = hq?.city || "your city";
  const state = hq?.state || "your state";

  const candidates: PromptItem[] = [
    {
      id: crypto.randomUUID(),
      category: "CATEGORY_GEO",
      text: `best ${service1} ${firmLabel} in ${city}, ${state}`,
      sourceVariables: { service: service1, firmLabel, city, state },
    },
    {
      id: crypto.randomUUID(),
      category: "CATEGORY_GEO",
      text: `top ${firmLabel} for ${industry1} in ${city}`,
      sourceVariables: { firmLabel, industry: industry1, city },
    },
    {
      id: crypto.randomUUID(),
      category: "CATEGORY_GEO",
      text: `leading ${service2} firms in ${state}`,
      sourceVariables: { service: service2, state },
    },
  ];

  return candidates.filter((p) => isValidPromptLength(p.text));
}

function generateSpecialtyLongtail(firm: Business): PromptItem[] {
  const firmLabel = getFirmTypeLabel(firm.firmType || firm.businessType);
  const specialties = (firm.specialties as string[] | null) || [];
  const deliverables = (firm.deliverables as string[] | null) || [];
  const industries = (firm.industriesServed as string[] | null) || [];

  // #4: specialties take priority over deliverables
  const distinctive = selectMostDistinctive(specialties, deliverables, 2);
  if (distinctive.length === 0) return [];

  const industry = industries[0] || "clients";
  const prompts: PromptItem[] = [];

  if (distinctive[0]) {
    const text = `${firmLabel} who handle ${distinctive[0]}`;
    if (isValidPromptLength(text)) {
      prompts.push({
        id: crypto.randomUUID(),
        category: "SPECIALTY_LONGTAIL",
        text,
        sourceVariables: { firmLabel, specialty: distinctive[0] },
      });
    }
  }

  if (distinctive[1]) {
    const text = `${firmLabel} specializing in ${distinctive[1]} for ${industry}`;
    if (isValidPromptLength(text)) {
      prompts.push({
        id: crypto.randomUUID(),
        category: "SPECIALTY_LONGTAIL",
        text,
        sourceVariables: { firmLabel, deliverable: distinctive[1], industry },
      });
    }
  }

  return prompts;
}

// #1: Word-boundary matching — require all words of the shorter string to appear in the longer,
// with at least 2-word overlap to prevent single-word false matches like "ip" → "IP licensing".
// When multiple keys match, the longest (most specific) key wins.
function findSymptomMapMatch(normalized: string): string | null {
  const normWords = normalized.split(/\s+/).filter(Boolean);
  let bestMatch: { overlap: number; value: string } | null = null;

  for (const [key, value] of Object.entries(SYMPTOM_MAP)) {
    const keyNorm = key.toLowerCase();
    if (keyNorm === normalized) return value; // exact match short-circuits

    const keyWords = keyNorm.split(/\s+/);
    const normSet = new Set(normWords);
    const overlap = keyWords.filter((w) => normSet.has(w)).length;
    const minLen = Math.min(normWords.length, keyWords.length);

    // All words of the shorter string must be present, and at least 2 must overlap
    if (overlap === minLen && overlap >= 2) {
      if (!bestMatch || overlap > bestMatch.overlap) {
        bestMatch = { overlap, value };
      }
    }
  }

  return bestMatch?.value ?? null;
}

async function getSymptomQuery(deliverable: string): Promise<string | null> {
  const normalized = deliverable.toLowerCase().trim();

  // Static map (word-boundary matching)
  const staticMatch = findSymptomMapMatch(normalized);
  if (staticMatch) return staticMatch;

  // L1: in-memory cache
  if (symptomMemoryCache.has(normalized)) return symptomMemoryCache.get(normalized)!;

  // L2: DB cache
  try {
    const [cached] = await db
      .select()
      .from(symptomQueryCacheTable)
      .where(eq(symptomQueryCacheTable.deliverable, normalized))
      .limit(1);
    if (cached) {
      symptomMemoryCache.set(normalized, cached.symptomQuery);
      return cached.symptomQuery;
    }
  } catch {
    // DB unavailable — fall through to Haiku
  }

  // L3: Claude Haiku — traced as a Langfuse generation, auto-nested under the
  // active scan span via OTel context propagation.
  try {
    const promptText = `Write a realistic problem/symptom query a prospect would type into an AI assistant when they have a problem that would lead them to hire a professional for "${deliverable}". The query must be 8-20 words, first person. Return ONLY the query, no quotes, no explanation.`;

    const gen = startObservation(
      "haiku-symptom-query",
      {
        model: SYMPTOM_MODEL,
        input: [{ role: "user", content: promptText }],
        metadata: { deliverable, cacheLevel: "L3-llm" } as Record<string, string>,
      },
      { asType: "generation" },
    );

    const message = await anthropic.messages.create({
      model: SYMPTOM_MODEL,
      max_tokens: 128,
      messages: [{ role: "user", content: promptText }],
    });
    const block = message.content[0];
    const query = block.type === "text" ? block.text.trim() : null;

    gen.update({
      output: query ?? "",
      usageDetails: {
        input: message.usage.input_tokens,
        output: message.usage.output_tokens,
      },
    }).end();
    if (query && isValidPromptLength(query)) {
      symptomMemoryCache.set(normalized, query);
      // Persist to DB (fire-and-forget — don't block scan)
      db.insert(symptomQueryCacheTable)
        .values({ deliverable: normalized, symptomQuery: query })
        .onConflictDoNothing()
        .catch(() => undefined);
      return query;
    }
  } catch {
    // Silent — slot will be redistributed
  }

  return null;
}

// #8: Parallel Haiku calls via Promise.all instead of sequential loop.
async function generateProblemSymptom(firm: Business, targetCount = 3): Promise<PromptItem[]> {
  const deliverables = (firm.deliverables as string[] | null) || [];
  const primaryServices = (firm.primaryServices as string[] | null) || [];

  const candidates = [...deliverables, ...primaryServices];
  if (candidates.length === 0) return [];

  // Spread across different service areas (group by first word)
  const grouped = new Map<string, string[]>();
  for (const c of candidates) {
    const key = c.split(" ")[0].toLowerCase();
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(c);
  }

  const spread: string[] = [];
  const groups = [...grouped.values()];
  let i = 0;
  while (spread.length < Math.min(targetCount * 2, candidates.length) && i < groups.length * 2) {
    const group = groups[i % groups.length];
    const item = group[Math.floor(i / groups.length)];
    if (item && !spread.includes(item)) spread.push(item);
    i++;
  }

  const symptomTexts = await Promise.all(spread.map((d) => getSymptomQuery(d)));

  const prompts: PromptItem[] = [];
  for (let j = 0; j < spread.length && prompts.length < targetCount; j++) {
    const text = symptomTexts[j];
    if (text) {
      prompts.push({
        id: crypto.randomUUID(),
        category: "PROBLEM_SYMPTOM",
        text,
        sourceVariables: { deliverable: spread[j] },
      });
    }
  }

  return prompts;
}

// #3: Deterministic rotation via profileUpdatedAt timestamp (changes on each allowed regen).
function getRotationSeed(firm: Business): number {
  const ts = (firm as Business & { profileUpdatedAt?: Date | null }).profileUpdatedAt?.getTime()
    ?? firm.createdAt.getTime();
  return Math.floor(ts / 1000);
}

function generatePersonaDriven(firm: Business, seed = 0): PromptItem {
  const firmLabel = getFirmTypeLabel(firm.firmType || firm.businessType);
  const decisionMakers = (firm.decisionMakers as string[] | null) || [];
  const clientStages = (firm.clientStages as string[] | null) || [];
  const industries = (firm.industriesServed as string[] | null) || [];
  const primaryServices = (firm.primaryServices as string[] | null) || [];
  const hq = getHqLocation(firm);

  const dmLabels: Record<string, string> = {
    founder: "founder",
    ceo: "CEO",
    cfo: "CFO",
    general_counsel: "general counsel",
    coo: "COO",
    individual: "individual",
    head_of_finance: "head of finance",
    business_owner: "business owner",
    hr_manager: "HR manager",
    talent_acquisition: "talent acquisition lead",
    global_mobility: "global mobility manager",
    cfo_controller: "CFO",
  };

  const stageLabels: Record<string, string> = {
    pre_seed: "pre-seed",
    seed: "seed-stage",
    series_a_plus: "Series A+",
    established_sme: "established",
    enterprise: "enterprise",
    individual: "personal",
    family_business: "family-owned",
    small_business: "small",
    mid_size_business: "mid-size",
    venture_backed_startup: "venture-backed",
    nonprofit: "nonprofit",
  };

  // #3: Rotate through all available options deterministically
  const pick = <T>(arr: T[], fallback: T): T =>
    arr.length > 0 ? arr[seed % arr.length] : fallback;

  const dm = dmLabels[pick(decisionMakers, "founder")] ?? "founder";
  const stage = stageLabels[pick(clientStages, "established_sme")] ?? "growing";
  const industry = pick(industries, "professional services");
  const service = pick(primaryServices, firmLabel + " services");
  const state = hq?.state || "the US";

  const text = `I am a ${dm} at a ${stage} ${industry} company in ${state}, who should I hire for ${service}?`;

  return {
    id: crypto.randomUUID(),
    category: "PERSONA_DRIVEN",
    text: isValidPromptLength(text) ? text : `I need to hire a ${firmLabel} for ${service}, any recommendations?`,
    sourceVariables: { dm, stage, industry, state, service },
  };
}

// Internal: generate a batch of up to `targetTotal` prompts for a given firm view.
async function generatePromptBatch(
  firm: Business,
  targetTotal: number,
  seed = 0,
): Promise<{ prompts: PromptItem[]; substitutionNotes: string }> {
  const rawPrompts: PromptItem[] = [];
  const notes: string[] = [];

  // 1. BRAND_DIRECT (1) — #6: rotate template
  rawPrompts.push(generateBrandDirect(firm, seed));

  // 2. CATEGORY_GEO (3)
  const geoPrompts = generateCategoryGeo(firm);
  rawPrompts.push(...geoPrompts);
  if (geoPrompts.length < 3) {
    notes.push(`Generated ${geoPrompts.length}/3 geo-category prompts; insufficient location or service data.`);
  }

  // 3. SPECIALTY_LONGTAIL (2, may be less)
  const specialtyPrompts = generateSpecialtyLongtail(firm);
  rawPrompts.push(...specialtyPrompts);
  const specialtyShortfall = 2 - specialtyPrompts.length;
  if (specialtyShortfall > 0) {
    notes.push(
      `Generated ${specialtyPrompts.length}/2 specialty prompts. Redistributed ${specialtyShortfall} slot(s) to problem-symptom.`,
    );
  }

  // 4. PROBLEM_SYMPTOM (3 + redistributed slots) — #8: parallel Haiku calls
  const problemTarget = 3 + specialtyShortfall + Math.max(0, 3 - geoPrompts.length);
  const problemPrompts = await generateProblemSymptom(firm, problemTarget);
  rawPrompts.push(...problemPrompts);
  if (problemPrompts.length < 3) {
    notes.push(
      `Generated ${problemPrompts.length}/3 problem-symptom prompts. Add more deliverables for fuller coverage.`,
    );
  }

  // 5. PERSONA_DRIVEN (1) — #3: seeded rotation
  rawPrompts.push(generatePersonaDriven(firm, seed));

  // Backfill to targetTotal with supplemental CATEGORY_GEO prompts
  const hq = getHqLocation(firm);
  const firmLabel = getFirmTypeLabel(firm.firmType || firm.businessType);
  const services = (firm.primaryServices as string[] | null) || [];
  let backfillIndex = 0;
  while (rawPrompts.length < targetTotal && backfillIndex < 30) {
    const service = services[backfillIndex % Math.max(services.length, 1)] || firmLabel + " services";
    const city = hq?.city || "your city";
    const state = hq?.state || "your state";
    const templates = [
      `${firmLabel} for ${service} in ${city}`,
      `best ${firmLabel} near ${city} ${state}`,
      `${service} professionals in ${state}`,
    ];
    const text = templates[backfillIndex % templates.length];
    if (isValidPromptLength(text)) {
      rawPrompts.push({
        id: crypto.randomUUID(),
        category: "CATEGORY_GEO",
        text,
        sourceVariables: { firmLabel, service, city, state },
      });
      notes.push("Added supplemental geo-category prompt to reach target total.");
    }
    backfillIndex++;
  }

  // #5: Deduplicate by token overlap (>60% overlap = duplicate)
  const deduped: PromptItem[] = [];
  for (const p of rawPrompts) {
    if (!deduped.some((e) => tokenOverlap(e.text, p.text) > 0.6)) {
      deduped.push(p);
    }
  }

  return { prompts: deduped.slice(0, targetTotal), substitutionNotes: notes.join(" ") };
}

// Main combinatorial engine — v2: up to 20 prompts (10 consumer + 10 business)
// Uses separate individual/business service data when available; falls back to combined data (legacy).
// Architecture supports: (a) COMPARISON category in v3 (uses directCompetitors),
// (b) SERVICE_EXPLANATORY, VALIDATION, COST_PRICING in v4
export async function generateFirmPrompts(
  firm: Business,
): Promise<{ prompts: PromptItem[]; substitutionNotes: string }> {
  type FirmExt = Business & {
    individualServices?: string[] | null;
    individualDeliverables?: string[] | null;
    individualSpecialties?: string[] | null;
    businessServices?: string[] | null;
    businessDeliverables?: string[] | null;
    businessSpecialties?: string[] | null;
  };
  const firmExt = firm as FirmExt;

  const hasIndividualData = (firmExt.individualServices?.length ?? 0) > 0;
  const hasBusinessData = (firmExt.businessServices?.length ?? 0) > 0;

  // #3: Compute rotation seed from profileUpdatedAt (stable per profile version, changes on regen)
  const seed = getRotationSeed(firm);

  // Legacy mode: no individual/business split — generate 10 prompts from combined data
  if (!hasIndividualData && !hasBusinessData) {
    return generatePromptBatch(firm, 10, seed);
  }

  const allPrompts: PromptItem[] = [];
  const allNotes: string[] = [];

  if (hasIndividualData) {
    const consumerFirm: Business = {
      ...firm,
      primaryServices: firmExt.individualServices ?? [],
      deliverables: firmExt.individualDeliverables ?? [],
      specialties: firmExt.individualSpecialties ?? [],
      // #11: keep industriesServed; use individual-appropriate defaults for stage/DM if unset
      clientStages: (firm.clientStages as string[] | null)?.length
        ? firm.clientStages
        : (["individual"] as unknown as typeof firm.clientStages),
      decisionMakers: (firm.decisionMakers as string[] | null)?.length
        ? firm.decisionMakers
        : (["individual"] as unknown as typeof firm.decisionMakers),
    };
    const { prompts, substitutionNotes } = await generatePromptBatch(consumerFirm, 10, seed);
    allPrompts.push(...prompts.map((p) => ({ ...p, audience: "individual" as const })));
    if (substitutionNotes) allNotes.push(`[Individuals] ${substitutionNotes}`);
  }

  if (hasBusinessData) {
    const businessFirm: Business = {
      ...firm,
      primaryServices: firmExt.businessServices ?? [],
      deliverables: firmExt.businessDeliverables ?? [],
      specialties: firmExt.businessSpecialties ?? [],
    };
    const { prompts, substitutionNotes } = await generatePromptBatch(businessFirm, 10, seed);
    allPrompts.push(...prompts.map((p) => ({ ...p, audience: "business" as const })));
    if (substitutionNotes) allNotes.push(`[Businesses] ${substitutionNotes}`);
  }

  return { prompts: allPrompts, substitutionNotes: allNotes.join(" ") };
}

// Template fallback for legacy businesses without firm profile data
function generateTemplatePrompts(
  businessName: string,
  businessType: string,
  location: string,
  description?: string | null,
): { prompt: string; category: string }[] {
  void description;
  return [
    { prompt: `Can you recommend a good ${businessType} in ${location}?`, category: "recommendation" },
    { prompt: `Who is the best ${businessType} near ${location}?`, category: "best_in_area" },
    { prompt: `I am looking for ${businessType} services in ${location}, any suggestions?`, category: "category_search" },
    { prompt: `Tell me about ${businessName}`, category: "direct_search" },
    { prompt: `Compare ${businessType} options in ${location}`, category: "comparison" },
  ];
}

interface QueryResult {
  text: string;
  promptTokens?: number;
  completionTokens?: number;
}

async function queryOpenAI(prompt: string): Promise<QueryResult> {
  const response = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    max_completion_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return {
    text: response.choices[0]?.message?.content ?? "",
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
  };
}

async function queryAnthropic(prompt: string): Promise<QueryResult> {
  // Manual instrumentation — Anthropic has no Langfuse drop-in wrapper yet.
  // startObservation creates a generation nested under the active scan span
  // via OTel automatic context propagation.
  const gen = startObservation(
    "anthropic-visibility-query",
    { model: ANTHROPIC_QUERY_MODEL, input: [{ role: "user", content: prompt }] },
    { asType: "generation" },
  );

  const message = await anthropic.messages.create({
    model: ANTHROPIC_QUERY_MODEL,
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  const text = block.type === "text" ? block.text : "";

  gen.update({
    output: text,
    usageDetails: {
      input: message.usage.input_tokens,
      output: message.usage.output_tokens,
    },
  }).end();

  return { text, promptTokens: message.usage.input_tokens, completionTokens: message.usage.output_tokens };
}

async function queryGemini(prompt: string): Promise<QueryResult> {
  // Manual instrumentation — Gemini has no Langfuse drop-in wrapper yet.
  const gen = startObservation(
    "gemini-visibility-query",
    { model: GEMINI_MODEL, input: [{ role: "user", content: prompt }] },
    { asType: "generation" },
  );

  const response = await genai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 1024 },
  });
  const text = response.text ?? "";

  gen.update({
    output: text,
    usageDetails: {
      input: response.usageMetadata?.promptTokenCount ?? 0,
      output: response.usageMetadata?.candidatesTokenCount ?? 0,
    },
  }).end();

  return {
    text,
    promptTokens: response.usageMetadata?.promptTokenCount,
    completionTokens: response.usageMetadata?.candidatesTokenCount,
  };
}

// #2: Stopword-aware mention detection.
// Exact phrase match is preferred; multi-word fallback requires ALL significant words present.
// Avoids false positives from shared common words like "Law", "Group", "Associates".
const FIRM_STOPWORDS = new Set([
  "law", "group", "associates", "llp", "llc", "inc", "firm", "and", "the", "of",
  "&", "co", "corp", "pc", "pllc", "pa", "partner", "partners",
]);

function checkMention(response: string, businessName: string): boolean {
  const normalizedResponse = response.toLowerCase();
  const normalizedName = businessName.toLowerCase();

  // 1. Exact phrase match
  if (normalizedResponse.includes(normalizedName)) return true;

  // 2. Significant-word match (strip stopwords and punctuation)
  const significantWords = normalizedName
    .split(/[\s,&.]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 2 && !FIRM_STOPWORDS.has(w));

  // Only apply multi-word fallback when we have ≥2 significant words
  if (significantWords.length >= 2) {
    return significantWords.every((w) => normalizedResponse.includes(w));
  }

  return false;
}

export function generateRecommendations(
  score: number,
  businessName: string,
  businessType: string,
  mentionsByProvider: Record<string, number>,
  totalPrompts: number,
): string[] {
  const recommendations: string[] = [];

  if (score === 0) {
    recommendations.push(
      `Your firm "${businessName}" was not mentioned by any AI assistant. This is common and there are concrete steps to improve visibility.`,
    );
  } else if (score < 30) {
    recommendations.push(
      `Your visibility score is low. AI assistants rarely mention "${businessName}" when prospects search for ${businessType} services.`,
    );
  } else if (score < 60) {
    recommendations.push(
      `You have moderate AI visibility. Some AI assistants know about "${businessName}" but there is room for improvement.`,
    );
  } else {
    recommendations.push(
      `Strong visibility. "${businessName}" is frequently mentioned by AI assistants when prospects search for ${businessType} services.`,
    );
  }

  recommendations.push(
    "Maintain a professional website with clear information about services, locations, and credentials.",
    "Get listed on major business directories (Google Business Profile, Avvo, Martindale, or industry-specific) as AI models use these as sources.",
    "Encourage satisfied clients to leave reviews on Google and industry platforms.",
    "Publish helpful content related to your practice areas and locations to increase your digital footprint.",
    "Ensure your firm name, address, and phone number are consistent across all online listings.",
  );

  const providerEntries = Object.entries(mentionsByProvider);
  const weakProviders = providerEntries.filter(([, count]) => count === 0).map(([p]) => p);
  if (weakProviders.length > 0 && weakProviders.length < 3) {
    const names = weakProviders.map((p) => {
      if (p === "openai") return "ChatGPT";
      if (p === "anthropic") return "Claude";
      return "Gemini";
    });
    recommendations.push(
      `You are not appearing in ${names.join(" or ")} results. Focus on building a stronger online presence across all AI assistants.`,
    );
  }

  void totalPrompts;
  return recommendations;
}

interface ScanTask {
  promptId: number;
  prompt: string;
  provider: "openai" | "anthropic" | "gemini";
  promptIndex: number;
  totalPrompts: number;
}

interface ScanTaskResult {
  response: string;
  mentioned: boolean;
  provider: string;
  promptId: number;
}

const providerQueryFns: Record<string, (prompt: string) => Promise<QueryResult>> = {
  openai: queryOpenAI,
  anthropic: queryAnthropic,
  gemini: queryGemini,
};

const providerDisplayNames: Record<string, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  gemini: "Gemini",
};

export async function runScan(scanId: number, onProgress: ProgressCallback) {
  // Fetch the scan first so we can add meaningful metadata to the trace.
  const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, scanId));
  if (!scan) throw new Error("Scan not found");

  // propagateAttributes sets trace-level context (name, tags, metadata) that
  // all nested observations (OpenAI, Anthropic, Gemini, Haiku) inherit
  // automatically via OTel context propagation.
  return propagateAttributes(
    {
      traceName: "visibility-scan",
      tags: ["scan", scan.businessType],
      metadata: {
        scanId: String(scanId),
        businessName: scan.businessName,
        businessType: scan.businessType,
        location: scan.location,
      },
    },
    () => _runScan(scan, scanId, onProgress),
  );
}

async function _runScan(
  scan: Scan,
  scanId: number,
  onProgress: ProgressCallback,
) {
  // startActiveObservation creates the root span for this scan. All nested
  // AI calls are automatically children via OTel's AsyncLocalStorage context.
  return startActiveObservation("run-scan", async (obs) => {
    try {

    await db.update(scansTable).set({ status: "generating_prompts" }).where(eq(scansTable.id, scanId));
    onProgress({ type: "status", message: "Preparing search prompts..." });

    let promptsToUse: { prompt: string; category: string; audience?: "individual" | "business" | null }[] = [];

    // Use the business's locked PromptSet if available
    if (scan.businessId) {
      const [latestSet] = await db
        .select()
        .from(promptSetsTable)
        .where(eq(promptSetsTable.businessId, scan.businessId))
        .orderBy(desc(promptSetsTable.createdAt))
        .limit(1);

      if (latestSet?.prompts && latestSet.isLocked) {
        const items = latestSet.prompts as PromptItem[];
        promptsToUse = items.map((p) => ({ prompt: p.text, category: p.category, audience: p.audience ?? null }));
        onProgress({
          type: "status",
          message: `Using ${promptsToUse.length} locked prompts from firm profile...`,
        });
      }
    }

    // Fallback: generate using the combinatorial engine with firm profile data
    if (promptsToUse.length === 0 && scan.businessId) {
      const [business] = await db
        .select()
        .from(businessesTable)
        .where(eq(businessesTable.id, scan.businessId));
      if (business && (business.firmType || business.primaryServices || business.deliverables)) {
        onProgress({ type: "status", message: "Generating prompts from firm profile..." });
        const { prompts } = await generateFirmPrompts(business);
        promptsToUse = prompts.map((p) => ({ prompt: p.text, category: p.category, audience: p.audience ?? null }));
      }
    }

    // Final fallback: simple templates
    if (promptsToUse.length === 0) {
      onProgress({ type: "status", message: "Generating search prompts..." });
      promptsToUse = generateTemplatePrompts(
        scan.businessName,
        scan.businessType,
        scan.location,
        scan.description,
      );
    }

    const insertedPrompts: ScanPrompt[] = [];
    for (const p of promptsToUse) {
      const [inserted] = await db
        .insert(scanPromptsTable)
        .values({ scanId, prompt: p.prompt, category: p.category, audience: p.audience ?? null })
        .returning();
      insertedPrompts.push(inserted);
    }

    onProgress({
      type: "prompts_generated",
      totalPrompts: insertedPrompts.length,
      message: `Prepared ${insertedPrompts.length} search prompts`,
    });

    await db.update(scansTable).set({ status: "scanning" }).where(eq(scansTable.id, scanId));

    const providers: Array<"openai" | "anthropic" | "gemini"> = ["openai", "anthropic", "gemini"];
    const tasks: ScanTask[] = [];
    for (let i = 0; i < insertedPrompts.length; i++) {
      for (const provider of providers) {
        tasks.push({
          promptId: insertedPrompts[i].id,
          prompt: insertedPrompts[i].prompt,
          provider,
          promptIndex: i,
          totalPrompts: insertedPrompts.length,
        });
      }
    }

    const results = await batchProcessWithSSE<ScanTask, ScanTaskResult>(
      tasks,
      async (task) => {
        // OpenAI calls are auto-traced by observeOpenAI.
        // Anthropic/Gemini calls create their own startObservation inside
        // queryAnthropic/queryGemini — they are automatically nested under
        // startActiveObservation("run-scan") via OTel context propagation.
        const queryFn = providerQueryFns[task.provider];
        const result = await queryFn(task.prompt);
        const mentioned = checkMention(result.text, scan.businessName);

        await db.insert(scanResultsTable).values({
          scanPromptId: task.promptId,
          provider: task.provider,
          response: result.text,
          mentioned,
        });
        return { response: result.text, mentioned, provider: task.provider, promptId: task.promptId };
      },
      (event: { type: string; [key: string]: unknown }) => {
        if (event.type === "processing") {
          const task = event.item as ScanTask;
          onProgress({
            type: "scanning",
            promptIndex: task.promptIndex,
            totalPrompts: task.totalPrompts,
            provider: task.provider,
            prompt: task.prompt,
            message: `Testing prompt ${task.promptIndex + 1}/${task.totalPrompts} on ${providerDisplayNames[task.provider]}...`,
          });
        } else if (event.type === "progress") {
          const result = event.result as ScanTaskResult | undefined;
          const task = tasks[event.index as number];
          if (result && task) {
            onProgress({
              type: "result",
              promptIndex: task.promptIndex,
              provider: task.provider,
              prompt: task.prompt,
              mentioned: result.mentioned,
              message: result.mentioned
                ? `Found mention on ${providerDisplayNames[task.provider]}!`
                : `No mention on ${providerDisplayNames[task.provider]}`,
            });
          } else if (task) {
            onProgress({
              type: "result",
              promptIndex: task.promptIndex,
              provider: task.provider,
              prompt: task.prompt,
              mentioned: false,
              message: `Error querying ${providerDisplayNames[task.provider]}`,
            });
          }
        }
      },
      { retries: 5, minTimeout: 2000, maxTimeout: 30000 },
    );

    let totalMentions = 0;
    const totalChecks = tasks.length;
    for (const result of results) {
      if (result && result.mentioned) totalMentions++;
    }

    const score = Math.round((totalMentions / totalChecks) * 100);
    await db.update(scansTable).set({ status: "completed", score }).where(eq(scansTable.id, scanId));

    // Record the final score on the root observation so it appears as the
    // trace output in the Langfuse UI.
    obs.update({ output: { score, totalMentions, totalChecks } });

    onProgress({ type: "completed", score, message: `Scan complete! Visibility score: ${score}%` });
  } catch (err) {
    await db.update(scansTable).set({ status: "failed" }).where(eq(scansTable.id, scanId));
    obs.update({ metadata: { error: err instanceof Error ? err.message : "Scan failed" } } as Parameters<typeof obs.update>[0]);
    onProgress({ type: "error", message: err instanceof Error ? err.message : "Scan failed" });
  }
  }); // end startActiveObservation
}
