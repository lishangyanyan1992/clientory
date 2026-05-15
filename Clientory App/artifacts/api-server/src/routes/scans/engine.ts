import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { batchProcessWithSSE } from "@workspace/integrations-openai-ai-server/batch";
import { db } from "@workspace/db";
import {
  scansTable,
  scanPromptsTable,
  scanResultsTable,
  promptSetsTable,
  businessesTable,
} from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Business, PromptItem } from "@workspace/db/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

// In-memory cache for Claude Haiku symptom lookups (process lifetime)
const symptomQueryCache = new Map<string, string>();

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

function selectMostDistinctive(items: string[], count: number): string[] {
  return [...items]
    .sort((a, b) => b.split(" ").length - a.split(" ").length)
    .slice(0, count);
}

function generateBrandDirect(firm: Business): PromptItem {
  const name = firm.brandName || firm.legalName || firm.name;
  const firmLabel = getFirmTypeLabel(firm.firmType || firm.businessType);
  const professionalFirmTypes = ["law", "accounting", "consulting", "marketing_agency"];
  const text = professionalFirmTypes.includes(firm.firmType || "")
    ? `Is ${name} a reputable ${firmLabel}?`
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

  const candidates = [...specialties, ...deliverables];
  const distinctive = selectMostDistinctive(candidates, 2);
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

async function getSymptomQuery(deliverable: string): Promise<string | null> {
  const normalized = deliverable.toLowerCase().trim();

  // Check static map (partial match)
  for (const [key, value] of Object.entries(SYMPTOM_MAP)) {
    if (normalized.includes(key.toLowerCase()) || key.toLowerCase().includes(normalized)) {
      return value;
    }
  }

  if (symptomQueryCache.has(normalized)) {
    return symptomQueryCache.get(normalized)!;
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 128,
      messages: [
        {
          role: "user",
          content: `Write a realistic problem/symptom query a prospect would type into an AI assistant when they have a problem that would lead them to hire a professional for "${deliverable}". The query must be 8-20 words, first person. Return ONLY the query, no quotes, no explanation.`,
        },
      ],
    });
    const block = message.content[0];
    const query = block.type === "text" ? block.text.trim() : null;
    if (query && isValidPromptLength(query)) {
      symptomQueryCache.set(normalized, query);
      return query;
    }
  } catch {
    // Silent — slot will be redistributed
  }

  return null;
}

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

  const prompts: PromptItem[] = [];
  for (const deliverable of spread) {
    if (prompts.length >= targetCount) break;
    const symptomText = await getSymptomQuery(deliverable);
    if (symptomText) {
      prompts.push({
        id: crypto.randomUUID(),
        category: "PROBLEM_SYMPTOM",
        text: symptomText,
        sourceVariables: { deliverable },
      });
    }
  }

  return prompts;
}

function generatePersonaDriven(firm: Business): PromptItem {
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
  };

  const stageLabels: Record<string, string> = {
    pre_seed: "pre-seed",
    seed: "seed-stage",
    series_a_plus: "Series A+",
    established_sme: "established",
    enterprise: "enterprise",
    individual: "personal",
    family_business: "family-owned",
  };

  const dm = dmLabels[decisionMakers[0]] || "founder";
  const stage = stageLabels[clientStages[0]] || "growing";
  const industry = industries[0] || "professional services";
  const service = primaryServices[0] || firmLabel + " services";
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
): Promise<{ prompts: PromptItem[]; substitutionNotes: string }> {
  const prompts: PromptItem[] = [];
  const notes: string[] = [];

  // 1. BRAND_DIRECT (1)
  prompts.push(generateBrandDirect(firm));

  // 2. CATEGORY_GEO (3)
  const geoPrompts = generateCategoryGeo(firm);
  prompts.push(...geoPrompts);
  if (geoPrompts.length < 3) {
    notes.push(`Generated ${geoPrompts.length}/3 geo-category prompts; insufficient location or service data.`);
  }

  // 3. SPECIALTY_LONGTAIL (2, may be less)
  const specialtyPrompts = generateSpecialtyLongtail(firm);
  prompts.push(...specialtyPrompts);
  const specialtyShortfall = 2 - specialtyPrompts.length;
  if (specialtyShortfall > 0) {
    notes.push(
      `Generated ${specialtyPrompts.length}/2 specialty prompts. Redistributed ${specialtyShortfall} slot(s) to problem-symptom.`,
    );
  }

  // 4. PROBLEM_SYMPTOM (3 + redistributed slots)
  const problemTarget = 3 + specialtyShortfall + Math.max(0, 3 - geoPrompts.length);
  const problemPrompts = await generateProblemSymptom(firm, problemTarget);
  prompts.push(...problemPrompts);
  if (problemPrompts.length < 3) {
    notes.push(
      `Generated ${problemPrompts.length}/3 problem-symptom prompts. Add more deliverables for fuller coverage.`,
    );
  }

  // 5. PERSONA_DRIVEN (1)
  prompts.push(generatePersonaDriven(firm));

  // Backfill to targetTotal with supplemental CATEGORY_GEO prompts
  const hq = getHqLocation(firm);
  const firmLabel = getFirmTypeLabel(firm.firmType || firm.businessType);
  const services = (firm.primaryServices as string[] | null) || [];
  let backfillIndex = 0;
  while (prompts.length < targetTotal && backfillIndex < 30) {
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
      prompts.push({
        id: crypto.randomUUID(),
        category: "CATEGORY_GEO",
        text,
        sourceVariables: { firmLabel, service, city, state },
      });
      notes.push("Added supplemental geo-category prompt to reach target total.");
    }
    backfillIndex++;
  }

  return { prompts: prompts.slice(0, targetTotal), substitutionNotes: notes.join(" ") };
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

  // Legacy mode: no individual/business split — generate 10 prompts from combined data
  if (!hasIndividualData && !hasBusinessData) {
    return generatePromptBatch(firm, 10);
  }

  const allPrompts: PromptItem[] = [];
  const allNotes: string[] = [];

  if (hasIndividualData) {
    const consumerFirm: Business = {
      ...firm,
      primaryServices: firmExt.individualServices ?? [],
      deliverables: firmExt.individualDeliverables ?? [],
      specialties: firmExt.individualSpecialties ?? [],
      industriesServed: null,
      clientStages: null,
      decisionMakers: null,
    };
    const { prompts, substitutionNotes } = await generatePromptBatch(consumerFirm, 10);
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
    const { prompts, substitutionNotes } = await generatePromptBatch(businessFirm, 10);
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

async function queryOpenAI(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.2",
    max_completion_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content ?? "";
}

async function queryAnthropic(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  const block = message.content[0];
  return block.type === "text" ? block.text : "";
}

async function queryGemini(prompt: string): Promise<string> {
  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 1024 },
  });
  return response.text ?? "";
}

function checkMention(response: string, businessName: string): boolean {
  const normalizedResponse = response.toLowerCase();
  const normalizedName = businessName.toLowerCase();
  if (normalizedResponse.includes(normalizedName)) return true;
  const words = normalizedName.split(/\s+/).filter((w) => w.length > 2);
  if (words.length > 1) {
    const matchCount = words.filter((w) => normalizedResponse.includes(w)).length;
    if (matchCount >= Math.ceil(words.length * 0.7)) return true;
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

const providerQueryFns: Record<string, (prompt: string) => Promise<string>> = {
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
  try {
    const [scan] = await db.select().from(scansTable).where(eq(scansTable.id, scanId));
    if (!scan) throw new Error("Scan not found");

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

    const insertedPrompts = [];
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
        const queryFn = providerQueryFns[task.provider];
        const response = await queryFn(task.prompt);
        const mentioned = checkMention(response, scan.businessName);
        await db.insert(scanResultsTable).values({
          scanPromptId: task.promptId,
          provider: task.provider,
          response,
          mentioned,
        });
        return { response, mentioned, provider: task.provider, promptId: task.promptId };
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
    onProgress({ type: "completed", score, message: `Scan complete! Visibility score: ${score}%` });
  } catch (err) {
    await db.update(scansTable).set({ status: "failed" }).where(eq(scansTable.id, scanId));
    onProgress({ type: "error", message: err instanceof Error ? err.message : "Scan failed" });
  }
}
