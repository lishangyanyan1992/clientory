export interface BusinessInfo {
  name: string;
  website: string;
  companyType: string;
  location: string;
  services: string[];
  targetClients: string;
  industries: string;
}

export interface PromptResult {
  prompt: string;
  intent: string;
  model: string;
  mentioned: boolean;
  rank: number | null;
  responseQuality: number;
  clarity: number;
  persuasiveness: number;
  overallScore: number;
}

export interface ModelScores {
  chatgpt: number;
  gemini: number;
  claude: number;
  perplexity: number;
}

export interface ModelMetrics {
  responseQuality: number;
  clarity: number;
  persuasiveness: number;
  overallScore: number;
  mentionRate: number;
}

export interface RecommendationItem {
  title: string;
  description: string;
  priority?: string;
}

export interface Recommendations {
  content: RecommendationItem[];
  authority: RecommendationItem[];
  directories: RecommendationItem[];
  structured_data: RecommendationItem[];
}

export interface TopPrompt {
  prompt: string;
  avgScore: number;
  bestModel: string;
}

export interface ScanResult {
  visibility_score: number;
  model_scores: ModelScores;
  model_metrics: Record<string, ModelMetrics>;
  tests_run: number;
  mentions: number;
  average_rank: number;
  top_competitors: string[];
  prompt_results: PromptResult[];
  recommendations: Recommendations;
  top_prompts: TopPrompt[];
  model_rankings: { model: string; score: number }[];
}

export const LLM_NAMES = ["ChatGPT", "Gemini", "Claude", "Perplexity"];

type PromptIntent = "recommendation" | "comparison" | "problem" | "urgent" | "trust" | "local";

interface PromptTemplate {
  intent: PromptIntent;
  templates: string[];
}

const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    intent: "recommendation",
    templates: [
      "Best {type} in {city}",
      "Top {type}s in {city}",
      "Recommended {type} near me in {city}",
      "Can you recommend a {type} in {city}?",
      "Who are the best {type}s in {city}?",
      "Good {type} in {city}",
      "Which {type} should I hire in {city}?",
      "Best {service} expert in {city}",
      "Top {service} {type} in {city}",
      "Recommended {service} services in {city}",
    ],
  },
  {
    intent: "comparison",
    templates: [
      "{city} {type} comparison",
      "Compare {type}s in {city}",
      "Which {type} is better in {city}?",
      "{type} vs {type} in {city}",
      "How do {type}s in {city} compare?",
      "Best {service} vs other options in {city}",
      "Top 5 {type}s in {city} ranked",
      "List of {type}s in {city} with ratings",
    ],
  },
  {
    intent: "problem",
    templates: [
      "I need help with {service} in {city}",
      "Who handles {service} cases in {city}?",
      "{service} problems - who to call in {city}",
      "Need a {type} for {service} issue in {city}",
      "Looking for {service} help in {city}",
      "Where can I get {service} assistance in {city}?",
      "{service} specialist {city}",
      "Expert for {service} issues in {city}",
    ],
  },
  {
    intent: "urgent",
    templates: [
      "Need a {type} urgently in {city}",
      "Emergency {type} in {city}",
      "Quick {service} help in {city}",
      "Same day {type} {city}",
      "Immediate {service} assistance {city}",
      "ASAP {type} in {city}",
      "24/7 {type} in {city}",
    ],
  },
  {
    intent: "trust",
    templates: [
      "Trusted {type}s in {city}",
      "Most reputable {type} in {city}",
      "Reliable {type} in {city}",
      "{type} with good reviews in {city}",
      "Highly rated {type} in {city}",
      "Is {name} a good {type}?",
      "{name} reviews",
      "{name} {city} reputation",
      "Most experienced {type} in {city}",
      "Award-winning {type} in {city}",
    ],
  },
  {
    intent: "local",
    templates: [
      "{type} near me in {city}",
      "Local {type} in {city}",
      "{city} based {type}",
      "{type} in downtown {city}",
      "{type} serving {city} area",
      "Nearby {type} in {city}",
      "{service} services near {city}",
      "{type} in {city} metro area",
    ],
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generatePrompts(info: BusinessInfo, count: number = 50): string[] {
  const { name, companyType, location, services } = info;
  const city = location.split(",")[0]?.trim() || location;
  const typeLabel = companyType.replace(/_/g, " ");

  const allPrompts: string[] = [];

  for (const category of PROMPT_TEMPLATES) {
    for (const template of category.templates) {
      let prompt = template
        .replace(/{city}/g, city)
        .replace(/{type}/g, typeLabel)
        .replace(/{name}/g, name);

      if (template.includes("{service}")) {
        for (const service of services) {
          allPrompts.push(prompt.replace(/{service}/g, service));
        }
      } else {
        allPrompts.push(prompt);
      }
    }
  }

  const shuffled = shuffleArray(allPrompts);
  return shuffled.slice(0, count);
}

export interface ScanProgress {
  phase: "generating" | "preparing" | "testing" | "analyzing" | "complete";
  currentLLM?: string;
  promptsCompleted: number;
  totalPrompts: number;
  completedTests: { prompt: string; llm: string; mentioned: boolean }[];
}

export function generateDemoResult(info: BusinessInfo): ScanResult {
  const prompts = generatePrompts(info, 50);
  const intents: PromptIntent[] = ["recommendation", "comparison", "problem", "urgent", "trust", "local"];
  const models = LLM_NAMES;
  const rand = seededRandom(42);

  // Model-specific bias: some models are better at mentioning
  const modelBias: Record<string, number> = {
    ChatGPT: 0.48,
    Gemini: 0.52,
    Claude: 0.38,
    Perplexity: 0.60,
  };

  const promptResults: PromptResult[] = [];
  for (const prompt of prompts) {
    for (const model of models) {
      const mentioned = rand() < modelBias[model];
      const responseQuality = Math.round(55 + rand() * 40);
      const clarity = Math.round(50 + rand() * 45);
      const persuasiveness = Math.round(40 + rand() * 50);
      const overallScore = Math.round((responseQuality * 0.35 + clarity * 0.35 + persuasiveness * 0.3));

      promptResults.push({
        prompt,
        intent: intents[Math.floor(rand() * intents.length)],
        model,
        mentioned,
        rank: mentioned ? Math.floor(rand() * 8) + 1 : null,
        responseQuality,
        clarity,
        persuasiveness,
        overallScore,
      });
    }
  }

  const mentions = promptResults.filter((r) => r.mentioned).length;
  const mentionedWithRank = promptResults.filter((r) => r.rank !== null);
  const avgRank = mentionedWithRank.length > 0
    ? +(mentionedWithRank.reduce((s, r) => s + r.rank!, 0) / mentionedWithRank.length).toFixed(1)
    : 0;

  // Calculate per-model metrics
  const modelMetrics: Record<string, ModelMetrics> = {};
  for (const model of models) {
    const modelResults = promptResults.filter((r) => r.model === model);
    const modelMentions = modelResults.filter((r) => r.mentioned).length;
    modelMetrics[model.toLowerCase()] = {
      responseQuality: Math.round(modelResults.reduce((s, r) => s + r.responseQuality, 0) / modelResults.length),
      clarity: Math.round(modelResults.reduce((s, r) => s + r.clarity, 0) / modelResults.length),
      persuasiveness: Math.round(modelResults.reduce((s, r) => s + r.persuasiveness, 0) / modelResults.length),
      overallScore: Math.round(modelResults.reduce((s, r) => s + r.overallScore, 0) / modelResults.length),
      mentionRate: Math.round((modelMentions / modelResults.length) * 100),
    };
  }

  // Model scores (visibility)
  const modelScores: ModelScores = {
    chatgpt: modelMetrics.chatgpt.overallScore,
    gemini: modelMetrics.gemini.overallScore,
    claude: modelMetrics.claude.overallScore,
    perplexity: modelMetrics.perplexity.overallScore,
  };

  // Top performing prompts
  const promptMap = new Map<string, { total: number; count: number; bestModel: string; bestScore: number }>();
  for (const r of promptResults) {
    const existing = promptMap.get(r.prompt) || { total: 0, count: 0, bestModel: "", bestScore: 0 };
    existing.total += r.overallScore;
    existing.count++;
    if (r.overallScore > existing.bestScore) {
      existing.bestModel = r.model;
      existing.bestScore = r.overallScore;
    }
    promptMap.set(r.prompt, existing);
  }
  const topPrompts: TopPrompt[] = Array.from(promptMap.entries())
    .map(([prompt, data]) => ({
      prompt,
      avgScore: Math.round(data.total / data.count),
      bestModel: data.bestModel,
    }))
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 10);

  // Model rankings
  const modelRankings = Object.entries(modelScores)
    .map(([model, score]) => ({ model, score }))
    .sort((a, b) => b.score - a.score);

  return {
    visibility_score: Math.round((mentions / promptResults.length) * 100),
    model_scores: modelScores,
    model_metrics: modelMetrics,
    tests_run: promptResults.length,
    mentions,
    average_rank: avgRank,
    top_competitors: [
      "Boardman & Clark LLP",
      "Stafford Rosenbaum LLP",
      "Axley Brynelson LLP",
      "DeWitt LLP",
      "Godfrey & Kahn SC",
    ],
    prompt_results: promptResults,
    recommendations: {
      content: [
        { title: "Create dedicated practice area pages for Madison", description: "Build individual landing pages for business law, contracts, and litigation targeting Madison-specific queries that LLMs pull from.", priority: "high" },
        { title: "Publish thought leadership articles", description: "Create in-depth articles on Wisconsin business law topics. LLMs prioritize authoritative, educational content.", priority: "high" },
        { title: "Add FAQ sections to service pages", description: "Answer common client questions directly on your site. LLMs frequently extract FAQ content for responses.", priority: "medium" },
        { title: "Create case study content", description: "Publish anonymized case studies showing successful outcomes. This builds credibility with both LLMs and prospects.", priority: "medium" },
      ],
      authority: [
        { title: "Get featured in Wisconsin legal publications", description: "Contribute articles to Wisconsin Lawyer magazine and State Bar publications to boost authority signals.", priority: "high" },
        { title: "Build backlinks from local business organizations", description: "Get listed on Greater Madison Chamber of Commerce and local business association websites.", priority: "medium" },
        { title: "Secure client testimonials and reviews", description: "Actively collect Google and Avvo reviews. LLMs reference review sentiment when making recommendations.", priority: "high" },
      ],
      directories: [
        { title: "Claim all legal directory profiles", description: "Verify and optimize Avvo, Martindale-Hubbell, FindLaw, and Justia profiles with consistent information.", priority: "high" },
        { title: "Optimize Google Business Profile", description: "Ensure your GBP has complete information, photos, and regular posts about your practice areas.", priority: "high" },
      ],
      structured_data: [
        { title: "Add LegalService schema markup", description: "Implement Organization, LegalService, and Attorney structured data on all relevant pages.", priority: "high" },
        { title: "Add FAQPage schema to content pages", description: "Mark up FAQ sections with proper schema so LLMs can easily parse your content.", priority: "medium" },
        { title: "Implement LocalBusiness markup", description: "Add LocalBusiness schema with geo-coordinates, service area, and operating hours.", priority: "medium" },
      ],
    },
    top_prompts: topPrompts,
    model_rankings: modelRankings,
  };
}

export const SERVICE_OPTIONS: Record<string, string[]> = {
  law_firm: ["Criminal law", "Corporate law", "Personal injury", "Immigration law", "Family law", "Employment law", "Real estate law", "Intellectual property", "Business law", "Contracts", "Litigation"],
  accounting_firm: ["Tax preparation", "Bookkeeping", "Audit", "Financial advisory", "Payroll", "Forensic accounting"],
  marketing_agency: ["SEO", "PPC advertising", "Social media marketing", "Content marketing", "Branding", "Web design"],
  consulting_firm: ["Management consulting", "IT consulting", "Strategy consulting", "HR consulting", "Operations consulting"],
  other: ["Advisory services", "Professional services", "Technical services", "Training & education"],
};

export const COMPANY_TYPES = [
  { value: "law_firm", label: "Law Firm" },
  { value: "accounting_firm", label: "Accounting Firm" },
  { value: "marketing_agency", label: "Marketing / Ad Agency" },
  { value: "consulting_firm", label: "Consulting Firm" },
  { value: "other", label: "Other Professional Services" },
];
