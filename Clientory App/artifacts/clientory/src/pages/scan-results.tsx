import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";

// ─── Static config ───────────────────────────────────────────────────────────

const PROVIDER_DISPLAY: Record<string, string> = {
  openai: "ChatGPT",
  anthropic: "Claude",
  gemini: "Gemini",
};
const PROVIDER_ORDER = ["openai", "anthropic", "gemini"];

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
  createdAt: string;
};
type AnalyzedResult = RawResult & { analysis: MentionAnalysis };
type AnalyzedPrompt = {
  prompt: { id: string; scanId: string; prompt: string; category: string; audience?: "individual" | "business" | null };
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

function StatCard({
  title,
  value,
  sub,
  tone,
}: {
  title: string;
  value: string;
  sub: string;
  tone: "good" | "muted";
}) {
  const valueColor = tone === "good" ? "text-success" : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border/60 bg-muted/10 p-4 flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
      <span className={`text-2xl font-bold tabular-nums leading-tight ${valueColor}`}>{value}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
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
        <span className="font-semibold text-sm">{name}</span>
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

// ─── Level 2: category accordion ─────────────────────────────────────────────

function ProviderDots({ prompts }: { prompts: AnalyzedPrompt[] }) {
  return (
    <span className="flex items-center gap-1.5">
      {PROVIDER_ORDER.map((prov) => {
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

  return (
    <Accordion type="multiple" className="rounded-xl border border-border/60 divide-y divide-border/60 overflow-hidden">
      {orderedKeys.map((key) => {
        const group = byCategory.get(key)!;
        const meta = categoryMeta(key);
        const mentionedPrompts = group.filter((p) => p.results.some((r) => r.mentioned)).length;
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
                  <ProviderDots prompts={group} />
                  <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                    {mentionedPrompts} / {group.length} mentioned
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4 pb-2">
                {group.map((p, i) => (
                  <PromptCard key={p.prompt.id} p={p} label={`${meta.label} ${i + 1}`} />
                ))}
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
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white text-sm font-medium"
      >
        Upgrade — {BILLING_PRICE_LABEL} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
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

  const { scan, recommendations } = data;
  const score = scan.score || 0;

  // ── Level 1 aggregates ──
  const providerStats = PROVIDER_ORDER.map((prov) => {
    let total = 0;
    let mentions = 0;
    for (const p of analyzed) {
      for (const r of p.results) {
        if (r.provider !== prov) continue;
        total++;
        if (r.mentioned) mentions++;
      }
    }
    const rate = total > 0 ? Math.round((mentions / total) * 100) : 0;
    return { prov, total, mentions, rate };
  });

  const qualityScores: number[] = [];
  for (const p of analyzed) for (const r of p.results) if (r.mentioned) qualityScores.push(r.analysis.qualityScore);
  const quality = summarizeQuality(qualityScores);

  const showPaidFeatures = isPaid === true;
  const billingLoading = isPaid === null;

  return (
    <Layout>
      <TooltipProvider delayDuration={150}>
        <div className="bg-primary/5 border-b border-border/50 pt-12 pb-24">
          <div className="container max-w-6xl mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Visibility Report: {scan.businessName}</h1>
              <p className="text-muted-foreground text-lg flex items-center gap-2">
                <Target className="w-5 h-5" /> {scan.businessType} in {scan.location}
              </p>
            </div>
          </div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 -mt-16 pb-24 space-y-8 z-10 relative">
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
                <ScoreGauge score={score} />
                <p className="mt-4 text-lg font-bold text-center">{verdictFor(score)}</p>
                <p className="text-center text-sm text-muted-foreground mt-2 px-4">
                  How often your firm was mentioned when we asked AI assistants for recommendations in your
                  practice areas.
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 glass-panel flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" /> Performance by AI
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {providerStats.map((s) => (
                    <StatCard
                      key={s.prov}
                      title={PROVIDER_DISPLAY[s.prov]}
                      value={`${s.rate}%`}
                      sub={`${s.mentions} of ${s.total} prompts`}
                      tone={s.rate > 0 ? "good" : "muted"}
                    />
                  ))}
                  <StatCard
                    title="Mention Quality"
                    value={quality.avg !== null ? quality.label : "—"}
                    sub={
                      quality.avg !== null
                        ? `across ${qualityScores.length} mention${qualityScores.length === 1 ? "" : "s"}`
                        : "not mentioned yet"
                    }
                    tone={quality.avg !== null && quality.avg >= 1 ? "good" : "muted"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

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

          {!billingLoading && !showPaidFeatures && scan.status === "completed" ? (
            <LockedFeature
              title="Detailed recommendations locked"
              description="Subscribe to unlock all actionable recommendations and start improving your AI visibility today."
            />
          ) : (
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
