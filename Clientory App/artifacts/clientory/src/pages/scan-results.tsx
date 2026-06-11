import { useState, useEffect, useMemo, type ReactNode } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useGetScan, getBillingStatus } from "@workspace/api-client-react";
import { BILLING_PRICE_LABEL } from "@/lib/billing-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import {
  analyzeMention,
  serviceKeywordsFromPrompt,
  summarizeQuality,
  type MentionAnalysis,
} from "@/lib/mention-parser";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lightbulb,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Briefcase,
  Trophy,
  Target,
  XCircle,
  Download,
  History,
  ArrowRight,
  Users,
  Building2,
  Globe,
  Brain,
  TrendingDown,
} from "lucide-react";

// ─── Static config ───────────────────────────────────────────────────────────

const PROVIDER_DISPLAY: Record<string, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  gemini: "Gemini",
};
const PROVIDER_ORDER = ["openai", "anthropic", "gemini"];
// Providers actually run today. Gemini + Perplexity are surfaced as paid-unlock
// upsells (Gemini needs a billed Google key; Perplexity is not yet integrated).
const ACTIVE_PROVIDERS = ["openai", "anthropic"];
const LOCKED_PROVIDERS = ["Gemini", "Perplexity"];

const CATEGORY_META: Record<string, { label: string; tooltip: string }> = {
  BRAND_DIRECT: { label: "Brand Recognition", tooltip: "Searches for your firm by name" },
  CATEGORY_GEO: { label: "Local Search", tooltip: "Searches for firms in your area" },
  SPECIALTY_LONGTAIL: { label: "Specialty Services", tooltip: "Searches for your specific expertise" },
  PROBLEM_SYMPTOM: { label: "Problem-Based Search", tooltip: "Searches that start from a client pain point" },
  PERSONA_DRIVEN: { label: "Persona-Based Search", tooltip: "Searches by client type and stage" },
};
const CATEGORY_ORDER = Object.keys(CATEGORY_META);

function categoryMeta(key: string) {
  return CATEGORY_META[key] ?? { label: key.replace(/_/g, " ").toLowerCase(), tooltip: "" };
}

function verdictFor(score: number): string {
  if (score <= 0) return "Not yet on AI's radar";
  if (score < 30) return "Rarely mentioned";
  if (score < 60) return "Occasionally mentioned";
  if (score < 90) return "Frequently mentioned";
  return "Highly visible";
}

// ─── Types ───────────────────────────────────────────────────────────────────

type RawResult = {
  id: string;
  scanPromptId: string;
  provider: string;
  response: string | null;
  mentioned: boolean;
  // Whether this answer was web-grounded (live search) vs. from the model's
  // training memory. The same provider can appear twice per prompt, once each.
  grounded?: boolean;
  searched?: boolean;
  sources?: unknown[];
  createdAt: string;
};
type AnalyzedResult = RawResult & { analysis: MentionAnalysis };
type AnalyzedPrompt = {
  prompt: {
    id: string;
    scanId: string;
    prompt: string;
    category: string;
    audience?: "individual" | "business" | null;
    executed?: boolean;
  };
  results: AnalyzedResult[];
};

// ─── Score gauge (unchanged) ─────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const percentage = score || 0;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  let color = "hsl(var(--destructive))";
  if (percentage >= 40) color = "hsl(var(--accent))";
  if (percentage >= 70) color = "hsl(var(--success))";

  return (
    <div className="relative w-64 h-64 flex items-center justify-center mx-auto">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="128" cy="128" r="120" className="stroke-muted/30" strokeWidth="12" fill="transparent" />
        <circle
          cx="128"
          cy="128"
          r="120"
          stroke={color}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-6xl font-display font-bold tracking-tighter" style={{ color }}>
          {percentage.toFixed(0)}
          <span className="text-4xl">%</span>
        </span>
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">Visibility</span>
      </div>
    </div>
  );
}

// ─── Level 1: provider + quality stat cards ──────────────────────────────────

type StatTone = "good" | "warn" | "bad" | "muted";

// Threshold-colour a mention rate so the section reads as a diagnostic at a
// glance (strong / mixed / weak) rather than everything-is-green.
function rateTone(rate: number): StatTone {
  if (rate >= 60) return "good";
  if (rate >= 35) return "warn";
  if (rate > 0) return "bad";
  return "muted";
}

const STAT_TONE_COLOR: Record<StatTone, string> = {
  good: "text-success",
  warn: "text-amber-500",
  bad: "text-destructive",
  muted: "text-muted-foreground",
};

// Official brand marks (single-path SVGs, Simple Icons). OpenAI's logo is
// monochrome by design → currentColor; the others carry their brand color.
const PROVIDER_LOGOS: Record<string, { path: string; color: string }> = {
  ChatGPT: {
    color: "currentColor",
    path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  },
  Claude: {
    color: "#D97757",
    path: "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z",
  },
  Gemini: {
    color: "#8E75B2",
    path: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  },
  Perplexity: {
    color: "#1FB8CD",
    path: "M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z",
  },
};

function ProviderLogo({ name, className = "w-4 h-4" }: { name: string; className?: string }) {
  const logo = PROVIDER_LOGOS[name];
  if (!logo) return null;
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill={logo.color} aria-hidden="true">
      <path d={logo.path} />
    </svg>
  );
}

function StatCard({
  title,
  value,
  sub,
  tone,
  split,
}: {
  title: string;
  value: string;
  sub: string;
  tone: StatTone;
  split?: { memory: number; web: number } | null;
}) {
  // Value is intentionally text-xl (not 2xl): the overall score gauge is the
  // hero number, these per-AI metrics are subordinate.
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-4 flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <ProviderLogo name={title} className="w-3.5 h-3.5" />
        {title}
      </span>
      <span className={`text-xl font-bold tabular-nums leading-tight ${STAT_TONE_COLOR[tone]}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
      {split && (
        <div className="mt-1.5 pt-1.5 border-t border-border/40 flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-muted-foreground" title="From training memory">
            <Brain className="w-3 h-3 shrink-0" />
            <span className={`font-semibold tabular-nums ${STAT_TONE_COLOR[rateTone(split.memory)]}`}>
              {split.memory}%
            </span>
          </span>
          <span className="flex items-center gap-1 text-muted-foreground" title="Live web search">
            <Globe className="w-3 h-3 shrink-0" />
            <span className={`font-semibold tabular-nums ${STAT_TONE_COLOR[rateTone(split.web)]}`}>
              {split.web}%
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

// Same shape as StatCard, but gated behind a paid unlock. Shows an honest teaser
// (this assistant ran 0 of N prompts) rather than a blurred fake number — a
// concrete zero motivates more than a smudge.
function LockedStatCard({ title, total }: { title: string; total: number }) {
  return (
    <Link
      to="/settings/billing"
      className="group rounded-xl border border-dashed border-border bg-muted/20 p-4 flex flex-col gap-1 hover:border-primary/40 transition-colors"
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <ProviderLogo
          name={title}
          className="w-3.5 h-3.5 grayscale opacity-50 transition group-hover:grayscale-0 group-hover:opacity-100"
        />
        {title}
      </span>
      <span className="text-xl font-bold tabular-nums leading-tight text-muted-foreground/40">—</span>
      <span className="text-xs text-muted-foreground">
        Ran 0 of {total} · <span className="font-medium text-primary group-hover:underline">unlock</span>
      </span>
    </Link>
  );
}

// ─── Mention Quality scorecard ────────────────────────────────────────────────

type SignalRates = { topThree: number; described: number; city: number; service: number };

// Each quality signal maps to a concrete fix — that mapping is what turns the
// score into advice. Copy is the action shown when this signal is the weakest.
const QUALITY_SIGNAL_META: {
  key: keyof SignalRates;
  label: string;
  icon: typeof Trophy;
  explain: string;
  action: (city: string | null) => string;
}[] = [
  {
    key: "topThree",
    label: "Top 3",
    icon: Trophy,
    explain: "How often a mention lands in the top 3 of a ranked list",
    action: () =>
      "AI names you but never in its top 3 — build authority with reviews, directories and “best of” placements.",
  },
  {
    key: "described",
    label: "Described",
    icon: Briefcase,
    explain: "How often AI says something substantive about your firm",
    action: () =>
      "AI knows your name but little else — give it material: richer site copy, a real About page, structured data.",
  },
  {
    key: "city",
    label: "City tied",
    icon: MapPin,
    explain: "How often the mention connects you to your location",
    action: (city) =>
      `AI often forgets you're in ${city ?? "your city"} — strengthen local signals: Google Business Profile and consistent location info.`,
  },
  {
    key: "service",
    label: "Service tied",
    icon: Target,
    explain: "How often the mention links you to the service being asked about",
    action: () =>
      "Mentions aren't tied to the services clients search for — build out dedicated practice-area pages.",
  },
];

const SIGNAL_BAR_COLOR: Record<"good" | "warn" | "bad", string> = {
  good: "bg-success",
  warn: "bg-amber-500",
  bad: "bg-destructive",
};

// Signals use a stricter tone than rateTone: 0% here is a failure, not "muted".
function signalTone(rate: number): "good" | "warn" | "bad" {
  if (rate >= 60) return "good";
  if (rate >= 35) return "warn";
  return "bad";
}

function MentionQualityCard({
  label,
  mentionCount,
  rates,
  tiers,
  city,
}: {
  label: string;
  mentionCount: number;
  rates: SignalRates;
  tiers: { strong: number; highlighted: number; described: number; bare: number };
  city: string | null;
}) {
  const weakest = QUALITY_SIGNAL_META.reduce((lo, m) => (rates[m.key] < rates[lo.key] ? m : lo));
  const tierParts = [
    `${tiers.strong} strongly recommended`,
    `${tiers.highlighted} highlighted`,
    `${tiers.described} described`,
    ...(tiers.bare > 0 ? [`${tiers.bare} bare`] : []),
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Mention Quality
          </span>
          <span className="text-xl font-bold leading-tight text-success">{label}</span>
        </div>
        <span className="text-xs text-muted-foreground">{tierParts.join(" · ")}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-2.5">
        {QUALITY_SIGNAL_META.map((m) => {
          const rate = rates[m.key];
          const tone = signalTone(rate);
          return (
            <div key={m.key} title={m.explain}>
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <span className="flex items-center gap-1">
                  <m.icon className="w-3 h-3 shrink-0" /> {m.label}
                </span>
                <span className={`font-semibold tabular-nums ${STAT_TONE_COLOR[tone]}`}>{rate}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/40 mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full ${SIGNAL_BAR_COLOR[tone]} transition-all duration-700`}
                  style={{ width: `${rate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {mentionCount > 0 && rates[weakest.key] < 80 && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground border-t border-border/40 pt-2.5">
          <Lightbulb className="w-3.5 h-3.5 shrink-0 text-amber-600 mt-[1px]" />
          <span>{weakest.action(city)}</span>
        </p>
      )}
    </div>
  );
}

// ─── Level 3: per-provider result with Mention Quality breakdown ──────────────

function QualityBadge({ analysis }: { analysis: MentionAnalysis }) {
  const variant =
    analysis.qualityScore >= 4 ? "default" : analysis.qualityScore >= 2 ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="gap-1">
      <Trophy className="w-3 h-3" /> {analysis.qualityLabel}
    </Badge>
  );
}

function SignalChip({ ok, label, icon: Icon }: { ok: boolean; label: string; icon: typeof MapPin }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${
        ok ? "text-success bg-success/10" : "text-muted-foreground/60 bg-muted/30 line-through"
      }`}
    >
      <Icon className="w-3 h-3" /> {label}
    </span>
  );
}

function ProviderResult({ r }: { r: AnalyzedResult }) {
  const [expanded, setExpanded] = useState(false);
  const name = PROVIDER_DISPLAY[r.provider] ?? r.provider;
  const hasResponse = Boolean(r.response?.trim());
  const { analysis } = r;

  return (
    <div className="p-5 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <ProviderLogo name={name} className="w-4 h-4" />
          <span className="font-semibold text-sm">{name}</span>
          <span
            className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded"
            title={r.grounded ? "Answered using live web search" : "Answered from the model's training memory"}
          >
            {r.grounded ? <Globe className="w-2.5 h-2.5" /> : <Brain className="w-2.5 h-2.5" />}
            {r.grounded ? "Web" : "Memory"}
          </span>
        </span>
        {r.mentioned ? (
          <span className="flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> Mentioned
          </span>
        ) : hasResponse ? (
          <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
            <XCircle className="w-3 h-3" /> Not mentioned
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" /> No answer
          </span>
        )}
      </div>

      {/* Mention Quality breakdown — only when actually mentioned */}
      {r.mentioned && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="gap-1">
              {analysis.rank !== null ? `Ranked #${analysis.rank}` : "Mentioned"}
            </Badge>
            <QualityBadge analysis={analysis} />
          </div>
          <div className="flex flex-wrap gap-1">
            <SignalChip ok={analysis.signals.topThree} label="Top 3" icon={Trophy} />
            <SignalChip ok={analysis.signals.hasDescription} label="Described" icon={Briefcase} />
            <SignalChip ok={analysis.signals.cityMatched} label="City" icon={MapPin} />
            <SignalChip ok={analysis.signals.serviceMatched} label="Service" icon={Target} />
          </div>
          {analysis.snippet && (
            <blockquote className="text-xs text-foreground/80 italic border-l-2 border-primary/40 pl-2.5 py-0.5">
              “{analysis.snippet}”
            </blockquote>
          )}
        </div>
      )}

      {/* Raw response — collapsed by default */}
      {hasResponse ? (
        <div>
          {expanded && (
            <p className="text-xs text-foreground/70 leading-relaxed whitespace-pre-wrap mt-1">{r.response}</p>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 flex items-center gap-0.5 text-xs text-primary hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" /> Hide full response
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" /> View full response
              </>
            )}
          </button>
        </div>
      ) : (
        <p className="text-xs italic text-muted-foreground">No response received from this model.</p>
      )}
    </div>
  );
}

function PromptCard({ p, label }: { p: AnalyzedPrompt; label: string }) {
  const mentions = p.results.filter((r) => r.mentioned).length;
  const total = p.results.length;
  const isGood = mentions > 0;

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
      <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 block">{label}</span>
          <h3 className="text-base font-medium">"{p.prompt.prompt}"</h3>
        </div>
        <div
          className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap ${
            isGood ? "bg-success/10 text-success" : "bg-muted/50 text-muted-foreground"
          }`}
        >
          {isGood ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          Mentioned by {mentions} / {total} AIs
        </div>
      </div>
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {[...p.results]
          .sort((a, b) => PROVIDER_ORDER.indexOf(a.provider) - PROVIDER_ORDER.indexOf(b.provider))
          .map((r) => (
            <ProviderResult key={r.id} r={r} />
          ))}
      </div>
    </Card>
  );
}

// A prompt that was generated but not run (free-tier cap). The prompt text is
// shown (so the user sees the search they're missing) but the AI results are gated.
function LockedPromptCard({ p, label }: { p: AnalyzedPrompt; label: string }) {
  return (
    <Card className="overflow-hidden border-dashed border-border/60 shadow-sm">
      <div className="p-5 bg-muted/20 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">
            {label}
          </span>
          <h3 className="text-base font-medium text-muted-foreground">"{p.prompt.prompt}"</h3>
        </div>
        <span className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 whitespace-nowrap bg-muted/50 text-muted-foreground shrink-0">
          <Lock className="w-3.5 h-3.5" /> Not run
        </span>
      </div>
      <Link
        to="/settings/billing"
        className="flex items-center justify-center gap-2 p-4 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
      >
        <Lock className="w-4 h-4" /> Upgrade to run this search across the AI assistants <ArrowRight className="w-4 h-4" />
      </Link>
    </Card>
  );
}

// ─── Level 2: category accordion ─────────────────────────────────────────────

function ProviderDots({ prompts }: { prompts: AnalyzedPrompt[] }) {
  return (
    <span className="flex items-center gap-1.5">
      {ACTIVE_PROVIDERS.map((prov) => {
        const mentioned = prompts.some((p) => p.results.some((r) => r.provider === prov && r.mentioned));
        return (
          <Tooltip key={prov}>
            <TooltipTrigger asChild>
              <span
                className={`w-2.5 h-2.5 rounded-full ${mentioned ? "bg-success" : "bg-muted-foreground/25"}`}
              />
            </TooltipTrigger>
            <TooltipContent>
              {PROVIDER_DISPLAY[prov]}: {mentioned ? "mentioned" : "not mentioned"}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </span>
  );
}

function CategoryAccordion({ prompts }: { prompts: AnalyzedPrompt[] }) {
  // Group by category, preserving the canonical order.
  const byCategory = new Map<string, AnalyzedPrompt[]>();
  for (const p of prompts) {
    const key = p.prompt.category;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(p);
  }
  const orderedKeys = [
    ...CATEGORY_ORDER.filter((k) => byCategory.has(k)),
    ...[...byCategory.keys()].filter((k) => !CATEGORY_ORDER.includes(k)),
  ];

  // Open the first category that actually ran by default, so the prompt-level
  // proof (the queries we sent + what each AI answered) is visible immediately
  // rather than hidden behind a collapsed accordion.
  const firstRanKey = orderedKeys.find((k) =>
    byCategory.get(k)!.some((p) => p.prompt.executed !== false),
  );
  const defaultOpen = firstRanKey ? [firstRanKey] : orderedKeys.slice(0, 1);

  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className="rounded-xl border border-border/60 divide-y divide-border/60 overflow-hidden"
    >
      {orderedKeys.map((key) => {
        const group = byCategory.get(key)!;
        const meta = categoryMeta(key);
        const ran = group.filter((p) => p.prompt.executed !== false);
        const lockedCount = group.length - ran.length;
        const mentionedPrompts = ran.filter((p) => p.results.some((r) => r.mentioned)).length;
        return (
          <AccordionItem key={key} value={key} className="border-b-0 px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm sm:text-base">{meta.label}</span>
                  {meta.tooltip && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60" />
                      </TooltipTrigger>
                      <TooltipContent>{meta.tooltip}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ProviderDots prompts={ran} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    {ran.length > 0 ? `${mentionedPrompts} / ${ran.length} mentioned` : "locked"}
                    {lockedCount > 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-0.5 text-primary/80">
                        <Lock className="w-3 h-3" /> {lockedCount}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 pb-2">
                {group.map((p, i) =>
                  p.prompt.executed === false ? (
                    <LockedPromptCard key={p.prompt.id} p={p} label={`${meta.label} ${i + 1}`} />
                  ) : (
                    <PromptCard key={p.prompt.id} p={p} label={`${meta.label} ${i + 1}`} />
                  ),
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function PromptBreakdown({ prompts }: { prompts: AnalyzedPrompt[] }) {
  const individual = prompts.filter((p) => p.prompt.audience === "individual");
  const business = prompts.filter((p) => p.prompt.audience === "business");
  const hasAudienceData = individual.length > 0 && business.length > 0;

  if (!hasAudienceData) {
    return <CategoryAccordion prompts={prompts} />;
  }

  return (
    <Tabs defaultValue="individual" className="w-full">
      <TabsList>
        <TabsTrigger value="individual" className="gap-1.5">
          <Users className="w-4 h-4" /> Individual Clients
        </TabsTrigger>
        <TabsTrigger value="business" className="gap-1.5">
          <Building2 className="w-4 h-4" /> Business Clients
        </TabsTrigger>
      </TabsList>
      <TabsContent value="individual">
        <CategoryAccordion prompts={individual} />
      </TabsContent>
      <TabsContent value="business">
        <CategoryAccordion prompts={business} />
      </TabsContent>
    </Tabs>
  );
}

// ─── Locked feature gate (unchanged) ─────────────────────────────────────────

function LockedFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
      <div className="flex justify-center mb-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Lock className="w-6 h-6 text-primary" />
        </div>
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Link
        to="/settings/billing"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Unlock with {BILLING_PRICE_LABEL} <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

// Render **bold** spans within a single line of markdown text.
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    /^\*\*[^*]+\*\*$/.test(part) ? (
      <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{part}</span>
    ),
  );
}

// Minimal, dependency-free markdown renderer for the synthesized report. Handles
// the constrained subset the prompt emits: headings, bullet lists, paragraphs,
// and inline **bold**. Intentionally not a full markdown engine — no raw HTML, so
// it's safe to render model output directly.
function MarkdownLite({ content }: { content: string }) {
  const blocks: ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const items = [...listItems];
    blocks.push(
      <ul key={`ul-${key++}`} className="list-disc pl-5 space-y-2 my-3">
        {items.map((it, i) => (
          <li key={i} className="text-foreground leading-relaxed">
            {renderInline(it, `li-${key}-${i}`)}
          </li>
        ))}
      </ul>,
    );
    listItems = [];
  };

  for (const raw of content.split("\n")) {
    const line = raw.trimEnd();
    if (/^\s*[-*]\s+/.test(line)) {
      listItems.push(line.replace(/^\s*[-*]\s+/, ""));
    } else if (/^#{1,6}\s+/.test(line)) {
      flushList();
      blocks.push(
        <h3 key={`h-${key++}`} className="text-lg font-semibold mt-4 mb-2">
          {renderInline(line.replace(/^#{1,6}\s+/, ""), `h-${key}`)}
        </h3>,
      );
    } else if (line.trim() === "") {
      flushList();
    } else {
      flushList();
      blocks.push(
        <p key={`p-${key++}`} className="text-foreground leading-relaxed my-2">
          {renderInline(line, `p-${key}`)}
        </p>,
      );
    }
  }
  flushList();
  return <div>{blocks}</div>;
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ScanResults() {
  const params = useParams<{ id: string }>();
  const scanId = params.id || "";
  const emailToken = localStorage.getItem("emailToken");
  const { data, isLoading, error } = useGetScan(scanId, {
    request: emailToken ? { headers: { "x-email-token": emailToken } } : undefined,
  });
  const [isPaid, setIsPaid] = useState<boolean | null>(null);

  useEffect(() => {
    if (!data?.scan) return;
    const scanData = data.scan as typeof data.scan & { businessId?: string | null; isFreeReport?: boolean };

    if (scanData.isFreeReport) {
      setIsPaid(false);
      return;
    }

    if (scanData.businessId && emailToken) {
      getBillingStatus(scanData.businessId, { headers: { "x-email-token": emailToken } })
        .then((status) => {
          setIsPaid(status.isPaid ?? false);
        })
        .catch(() => setIsPaid(false));
    } else {
      setIsPaid(false);
    }
  }, [data, emailToken]);

  // Parse mention quality from stored response text (no network). Must run
  // before any early return to keep hook order stable.
  const scanForMemo = data?.scan;
  const promptsForMemo = data?.prompts;
  const analyzed: AnalyzedPrompt[] = useMemo(() => {
    if (!scanForMemo || !promptsForMemo) return [];
    const businessName = scanForMemo.businessName;
    const city = (scanForMemo.location || "").split(",")[0]?.trim() || null;
    return (promptsForMemo as unknown as AnalyzedPrompt[]).map((p) => {
      const serviceKeywords = serviceKeywordsFromPrompt(p.prompt.prompt, businessName, city);
      return {
        ...p,
        results: p.results.map((r) => ({
          ...r,
          analysis: analyzeMention(r.response, businessName, { city, serviceKeywords }),
        })),
      };
    });
  }, [scanForMemo, promptsForMemo]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-lg text-muted-foreground">Loading your results...</p>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Could not load results</h2>
          <p className="text-muted-foreground">
            We couldn't find the scan you're looking for. It might still be processing or the ID is invalid.
          </p>
        </div>
      </Layout>
    );
  }

  const { scan, recommendations, report } = data;
  // The report/recommendations are populated by the backend only when the report
  // is viewable (free first report OR paid). Their presence is the source of truth
  // for whether this section is unlocked.
  const hasImprovementContent = !!report || (recommendations?.length ?? 0) > 0;
  const score = scan.score || 0;

  // ── Level 1 aggregates ──
  const providerStats = ACTIVE_PROVIDERS.map((prov) => {
    let total = 0;
    let mentions = 0;
    let memT = 0;
    let memM = 0;
    let webT = 0;
    let webM = 0;
    for (const p of analyzed) {
      for (const r of p.results) {
        if (r.provider !== prov) continue;
        total++;
        if (r.mentioned) mentions++;
        if (r.grounded) {
          webT++;
          if (r.mentioned) webM++;
        } else {
          memT++;
          if (r.mentioned) memM++;
        }
      }
    }
    const rate = total > 0 ? Math.round((mentions / total) * 100) : 0;
    // Per-provider memory vs. web split — only meaningful when both modes ran.
    const split =
      memT > 0 && webT > 0
        ? { memory: Math.round((memM / memT) * 100), web: Math.round((webM / webT) * 100) }
        : null;
    return { prov, total, mentions, rate, split };
  });

  const qualityScores: number[] = [];
  for (const p of analyzed) for (const r of p.results) if (r.mentioned) qualityScores.push(r.analysis.qualityScore);
  const quality = summarizeQuality(qualityScores);

  // Per-signal breakdown across all mentions — each signal maps to a concrete
  // action (authority, site copy, local SEO, service pages), which is what makes
  // the quality score actionable rather than a single opaque label.
  const signalCounts = { topThree: 0, described: 0, city: 0, service: 0 };
  const tierCounts = { strong: 0, highlighted: 0, described: 0, bare: 0 };
  for (const p of analyzed) {
    for (const r of p.results) {
      if (!r.mentioned) continue;
      const { signals, qualityScore } = r.analysis;
      if (signals.topThree) signalCounts.topThree++;
      if (signals.hasDescription) signalCounts.described++;
      if (signals.cityMatched) signalCounts.city++;
      if (signals.serviceMatched) signalCounts.service++;
      if (qualityScore >= 4) tierCounts.strong++;
      else if (qualityScore >= 2) tierCounts.highlighted++;
      else if (qualityScore >= 1) tierCounts.described++;
      else tierCounts.bare++;
    }
  }
  const mentionCount = qualityScores.length;
  const signalPct = (n: number) => (mentionCount > 0 ? Math.round((n / mentionCount) * 100) : 0);
  const signalRates = {
    topThree: signalPct(signalCounts.topThree),
    described: signalPct(signalCounts.described),
    city: signalPct(signalCounts.city),
    service: signalPct(signalCounts.service),
  };

  // Memory vs. web-grounded split — how visibility changes when the assistant
  // answers from training memory vs. a live web search. The web rate mirrors the
  // backend's groundedScore; surfacing it exposes the gap the blended score hides.
  let memHits = 0;
  let memTotal = 0;
  let webHits = 0;
  let webTotal = 0;
  for (const p of analyzed) {
    for (const r of p.results) {
      if (r.grounded) {
        webTotal++;
        if (r.mentioned) webHits++;
      } else {
        memTotal++;
        if (r.mentioned) memHits++;
      }
    }
  }
  const memoryRate = memTotal > 0 ? Math.round((memHits / memTotal) * 100) : 0;
  const webRate = webTotal > 0 ? Math.round((webHits / webTotal) * 100) : 0;
  const showModeSplit = memTotal > 0 && webTotal > 0;

  // Composite "AI Visibility Score": coverage (memory + web, equal) 70% +
  // mention quality 30%. Quality avg is 0–4 → ×25 to put it on a 0–100 scale.
  const coverage =
    memTotal > 0 && webTotal > 0
      ? Math.round((memoryRate + webRate) / 2)
      : memTotal > 0
        ? memoryRate
        : webRate;
  const qualityNorm = quality.avg !== null ? quality.avg * 25 : 0;
  // Prefer the backend's canonical composite; fall back to a client-side compute
  // for legacy scans run before the score was stored.
  const clientTotalScore = Math.round(0.7 * coverage + 0.3 * qualityNorm);
  const totalScore = scan.totalScore ?? clientTotalScore;

  // Weakest search category — gives the report a spine ("fix this first").
  const categoryStats = CATEGORY_ORDER.map((key) => {
    let total = 0;
    let mentions = 0;
    for (const p of analyzed) {
      if (p.prompt.category !== key) continue;
      for (const r of p.results) {
        total++;
        if (r.mentioned) mentions++;
      }
    }
    return { key, total, mentions, rate: total > 0 ? Math.round((mentions / total) * 100) : 0 };
  }).filter((c) => c.total > 0);
  // Only surface a callout when there's a genuine gap (a category below full coverage).
  const weakest =
    categoryStats.length > 0
      ? categoryStats.reduce((lo, c) => (c.rate < lo.rate ? c : lo))
      : null;
  const weakestGap = weakest && weakest.rate < 100 ? weakest : null;

  const showPaidFeatures = isPaid === true;
  const billingLoading = isPaid === null;

  // Free-tier scans run only a sample of the generated searches.
  const totalSearches = analyzed.length;
  const ranSearches = analyzed.filter((p) => p.prompt.executed !== false).length;
  const hasLockedSearches = ranSearches > 0 && ranSearches < totalSearches;

  // Subtitle meta: tell the user the scope + freshness of the report.
  // `ranSearches` (not totalSearches) so the count reflects what actually ran —
  // a free-tier scan that only executed a 5-search sample reads "5 searches".
  const scannedProviders = providerStats.map((s) => PROVIDER_DISPLAY[s.prov]).join(" & ");
  const scannedOn = new Date(scan.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  // Title-case the raw businessType slug (e.g. "law" → "Law").
  const cleanBusinessType = scan.businessType
    ? scan.businessType.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : null;

  return (
    <Layout>
      <TooltipProvider delayDuration={150}>
        <div className="bg-primary/5 border-b border-border/50 pt-12 pb-12">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                AI Visibility Report
                <span className="block text-xl md:text-2xl font-semibold text-foreground/70 mt-1">
                  {scan.businessName}
                </span>
              </h1>
              <div className="text-muted-foreground text-sm space-y-1">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 shrink-0" /> {scan.location}
                  </span>
                  {cleanBusinessType && (
                    <>
                      <span aria-hidden className="text-border">·</span>
                      <span>{cleanBusinessType}</span>
                    </>
                  )}
                </p>
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span>
                    {ranSearches} search{ranSearches === 1 ? "" : "es"} on {scannedProviders}
                  </span>
                  <span aria-hidden className="text-border">·</span>
                  <span>Scanned {scannedOn}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 mt-8 pb-24 space-y-8 relative">
          <div className="flex items-center justify-between gap-4 p-4 bg-success/10 border border-success/20 rounded-xl text-sm">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-success shrink-0" />
              <p className="text-foreground">A copy of this report has been sent to your email address.</p>
            </div>
            {!billingLoading && (
              <div className="flex items-center gap-2">
                {showPaidFeatures ? (
                  <Button variant="outline" size="sm" className="flex items-center gap-2" disabled>
                    <Download className="w-4 h-4" /> Export
                  </Button>
                ) : (
                  <Link
                    to="/settings/billing"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" /> Export (Upgrade)
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* ── Level 1: Hero ── */}
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 glass-panel pt-6">
              <CardContent className="flex flex-col items-center">
                <ScoreGauge score={totalScore} />
                <p className="mt-4 text-lg font-bold text-center">{verdictFor(totalScore)}</p>
                <p className="text-center text-sm text-muted-foreground mt-2 px-4 inline-flex items-center justify-center gap-1 flex-wrap">
                  Your overall AI visibility — how often and how prominently AI assistants name your firm.
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/60 cursor-help shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-left">
                      <p className="font-semibold mb-1.5">How this score is built</p>
                      <p className="mb-1.5">
                        <span className="font-medium text-foreground">70% coverage</span> — how often you're named,
                        averaging your memory ({memoryRate}%) and live-web ({webRate}%) scores.
                      </p>
                      <p>
                        <span className="font-medium text-foreground">30% quality</span> — how prominently you're named
                        when you are (rank, description, location &amp; service match).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </p>
                {showModeSplit && (
                  <div className="mt-4 w-full">
                    <div className="flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                      Where AI finds you
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="w-3 h-3 text-muted-foreground/60 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs text-left font-normal normal-case tracking-normal">
                          <p className="font-semibold mb-1.5">Two ways AI surfaces your firm</p>
                          <p className="mb-1.5">
                            <span className="font-medium text-foreground">From memory</span> — what the model already
                            learned about you during training. Reflects your long-term reputation.
                          </p>
                          <p className="mb-1.5">
                            <span className="font-medium text-foreground">Live web search</span> — whether you appear
                            when the AI searches the web in real time. Depends on current web content, citations and
                            freshness.
                          </p>
                          <p>
                            A lower web score points to a content &amp; citation gap — AI can't find you when it looks
                            you up live. As more assistants default to live search, this is increasingly the score that
                            matters.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-border/60 bg-muted/10 p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          <Brain className="w-3 h-3" /> From memory
                        </div>
                        <div className={`text-lg font-bold tabular-nums ${STAT_TONE_COLOR[rateTone(memoryRate)]}`}>
                          {memoryRate}%
                        </div>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-muted/10 p-2.5 text-center">
                        <div className="flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                          <Globe className="w-3 h-3" /> Live web search
                        </div>
                        <div className={`text-lg font-bold tabular-nums ${STAT_TONE_COLOR[rateTone(webRate)]}`}>
                          {webRate}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {hasLockedSearches && (
                  <Link
                    to="/settings/billing"
                    className="mt-3 inline-flex items-center gap-1.5 text-center text-xs font-medium text-primary hover:underline px-4"
                  >
                    <Lock className="w-3 h-3 shrink-0" />
                    Based on a {ranSearches}-search sample — unlock all {totalSearches} for your complete score
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 glass-panel flex flex-col">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" /> Performance by AI
                </CardTitle>
                <Link
                  to="/settings/billing"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
                >
                  Unlock Gemini &amp; Perplexity <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {/* Every AI assistant in one row — live metrics next to locked teasers. */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {providerStats.map((s) => (
                    <StatCard
                      key={s.prov}
                      title={PROVIDER_DISPLAY[s.prov]}
                      value={`${s.rate}%`}
                      sub={`${s.mentions} of ${s.total} answers`}
                      tone={rateTone(s.rate)}
                      split={s.split}
                    />
                  ))}
                  {LOCKED_PROVIDERS.map((name) => (
                    <LockedStatCard key={name} title={name} total={providerStats[0]?.total ?? 0} />
                  ))}
                </div>
                {mentionCount > 0 ? (
                  <MentionQualityCard
                    label={quality.label}
                    mentionCount={mentionCount}
                    rates={signalRates}
                    tiers={tierCounts}
                    city={(scan.location || "").split(",")[0]?.trim() || null}
                  />
                ) : (
                  <StatCard title="Mention Quality" value="—" sub="not mentioned yet" tone="muted" />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Spine: point the firm at the single weakest search type first. */}
          {weakestGap && (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <TrendingDown className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-foreground">
                  Biggest opportunity: {categoryMeta(weakestGap.key).label}
                </p>
                <p className="text-muted-foreground">
                  You're named in just {weakestGap.rate}% of these searches ({weakestGap.mentions} of{" "}
                  {weakestGap.total}) — the best place to focus first.
                </p>
              </div>
            </div>
          )}

          {!billingLoading && !showPaidFeatures && (
            <LockedFeature
              title="Report History"
              description="Subscribe to track your AI visibility over time and compare reports across different billing cycles."
            />
          )}

          {!billingLoading && showPaidFeatures && (
            <Card className="glass-panel">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Report History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">Previous reports for this firm will appear here.</p>
              </CardContent>
            </Card>
          )}

          {/* ── Level 2 + 3: Category breakdown ── */}
          <div>
            <h2 className="text-2xl font-bold pb-1">Search Breakdown</h2>
            <p className="text-muted-foreground text-sm mb-4">
              How you show up across different kinds of searches. Expand any category to see the exact prompts and
              what each AI said.
            </p>
            <PromptBreakdown prompts={analyzed} />
          </div>

          <h2 className="text-2xl font-bold pt-8">How to Improve</h2>

          {scan.status === "completed" && !hasImprovementContent ? (
            <LockedFeature
              title="Detailed recommendations locked"
              description="Subscribe to unlock all actionable recommendations and start improving your AI visibility today."
            />
          ) : report ? (
            // Preferred: LLM-synthesized, firm-specific report (markdown).
            <Card className="glass-panel overflow-hidden border-primary/20 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent"></div>
              <CardContent className="p-6">
                <MarkdownLite content={report} />
              </CardContent>
            </Card>
          ) : (
            // Fallback: deterministic recommendations (synthesis failed or pending).
            <Card className="glass-panel overflow-hidden border-primary/20 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-accent"></div>
              <CardContent className="p-0">
                <ul className="divide-y divide-border/50">
                  {recommendations && recommendations.length > 0 ? (
                    recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="mt-1 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0">
                          <Lightbulb className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-foreground leading-relaxed">{rec}</p>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="p-6 text-muted-foreground text-center">
                      Recommendations will appear once the scan completes.
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          )}

          {!billingLoading && !showPaidFeatures && (
            <div className="mt-8 p-6 rounded-2xl border-2 border-primary/30 bg-primary/5 text-center">
              <h3 className="text-xl font-bold mb-2">Get the full picture</h3>
              <p className="text-muted-foreground mb-4">
                Subscribe to unlock ongoing monitoring, full recommendations, report history, and exports for{" "}
                {BILLING_PRICE_LABEL}.
              </p>
              <Link
                to="/settings/billing"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
              >
                Subscribe — {BILLING_PRICE_LABEL} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </TooltipProvider>
    </Layout>
  );
}
