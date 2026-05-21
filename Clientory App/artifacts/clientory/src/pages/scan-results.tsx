import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout";
import { useGetScan, getBillingStatus } from "@workspace/api-client-react";
import { BILLING_PRICE_LABEL } from "@/lib/billing-config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import {
  AlertCircle,
  Bot,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Lock,
  Mail,
  Target,
  XCircle,
  Download,
  History,
  ArrowRight,
  Users,
  Building2,
} from "lucide-react";

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

type PromptWithResults = {
  prompt: { id: string; scanId: string; prompt: string; category: string; audience?: "individual" | "business" | null };
  results: { id: string; scanPromptId: string; provider: string; response: string | null; mentioned: boolean; createdAt: string }[];
};

function PromptCard({ p, label }: { p: PromptWithResults; label: string }) {
  const mentions = p.results.filter((r) => r.mentioned).length;
  const total = p.results.length;
  const isGood = mentions > 0;

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md">
      <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 block">{label}</span>
          <h3 className="text-lg font-medium">"{p.prompt.prompt}"</h3>
        </div>
        <div
          className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap ${
            isGood ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
          }`}
        >
          {isGood ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          Mentioned by {mentions} / {total} AIs
        </div>
      </div>
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {p.results.map((r) => (
          <div key={r.id} className="p-6 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold capitalize text-sm text-muted-foreground">{r.provider}</span>
              {r.mentioned ? (
                <span className="flex items-center text-xs font-bold text-success">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Yes
                </span>
              ) : (
                <span className="flex items-center text-xs font-bold text-muted-foreground">
                  <XCircle className="w-3 h-3 mr-1" /> No
                </span>
              )}
            </div>
            <div className="text-sm text-foreground/80 line-clamp-4 relative group cursor-pointer">
              {r.response || <span className="italic text-muted-foreground">No response generated.</span>}
              <div className="absolute inset-0 bg-background/95 p-2 hidden group-hover:block overflow-y-auto border border-border rounded-md shadow-lg z-10 text-xs">
                {r.response}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AudienceScore({ audience, prompts }: { audience: "individual" | "business"; prompts: PromptWithResults[] }) {
  const totalResults = prompts.reduce((sum, p) => sum + p.results.length, 0);
  const mentionedResults = prompts.reduce((sum, p) => sum + p.results.filter((r) => r.mentioned).length, 0);
  const score = totalResults > 0 ? Math.round((mentionedResults / totalResults) * 100) : 0;

  const isIndividual = audience === "individual";
  const Icon = isIndividual ? Users : Building2;
  const label = isIndividual ? "Family / Individual Immigration" : "Employer-Sponsored Immigration";

  let scoreColor = "text-destructive";
  if (score >= 40) scoreColor = "text-accent";
  if (score >= 70) scoreColor = "text-success";

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-muted/20">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-xs text-muted-foreground">{prompts.length} prompt{prompts.length !== 1 ? "s" : ""}</p>
      </div>
      <span className={`text-2xl font-bold tabular-nums ${scoreColor}`}>{score}%</span>
    </div>
  );
}

function PromptBreakdown({ prompts }: { prompts: PromptWithResults[] }) {
  const individualPrompts = prompts.filter((p) => p.prompt.audience === "individual");
  const businessPrompts = prompts.filter((p) => p.prompt.audience === "business");
  const uncategorizedPrompts = prompts.filter((p) => !p.prompt.audience);
  const hasAudienceData = individualPrompts.length > 0 && businessPrompts.length > 0;

  if (!hasAudienceData) {
    return (
      <div className="grid gap-6">
        {prompts.map((p, i) => (
          <PromptCard key={p.prompt.id} p={p} label={`Test Prompt ${i + 1}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 gap-4">
        <AudienceScore audience="individual" prompts={individualPrompts} />
        <AudienceScore audience="business" prompts={businessPrompts} />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Family / Individual Immigration Searches</h3>
        </div>
        <div className="grid gap-6">
          {individualPrompts.map((p, i) => (
            <PromptCard key={p.prompt.id} p={p} label={`Individual Prompt ${i + 1}`} />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Employer-Sponsored Immigration Searches</h3>
        </div>
        <div className="grid gap-6">
          {businessPrompts.map((p, i) => (
            <PromptCard key={p.prompt.id} p={p} label={`Business Prompt ${i + 1}`} />
          ))}
        </div>
      </div>

      {uncategorizedPrompts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-muted-foreground">Other Prompts</h3>
          </div>
          <div className="grid gap-6">
            {uncategorizedPrompts.map((p, i) => (
              <PromptCard key={p.prompt.id} p={p} label={`Test Prompt ${i + 1}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

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

  const { scan, prompts, recommendations } = data;

  const providerStats = {
    openai: { name: "ChatGPT (OpenAI)", mentions: 0, total: 0, fill: "hsl(var(--primary))" },
    anthropic: { name: "Claude (Anthropic)", mentions: 0, total: 0, fill: "hsl(var(--accent))" },
    gemini: { name: "Gemini (Google)", mentions: 0, total: 0, fill: "hsl(var(--success))" },
  };

  prompts.forEach((p) => {
    p.results.forEach((r) => {
      if (r.provider in providerStats) {
        const stat = providerStats[r.provider as keyof typeof providerStats];
        stat.total++;
        if (r.mentioned) stat.mentions++;
      }
    });
  });

  const chartData = Object.values(providerStats).map((stat) => ({
    name: stat.name.split(" ")[0],
    rate: stat.total > 0 ? Math.round((stat.mentions / stat.total) * 100) : 0,
    fill: stat.fill,
  }));

  const showPaidFeatures = isPaid === true;
  const billingLoading = isPaid === null;

  const audienceIndividualPrompts = prompts.filter((p) => p.prompt.audience === "individual");
  const audienceBusinessPrompts = prompts.filter((p) => p.prompt.audience === "business");
  const hasAudienceBreakdown = audienceIndividualPrompts.length > 0 && audienceBusinessPrompts.length > 0;

  const calcAudienceScore = (ps: typeof prompts) => {
    const total = ps.reduce((s, p) => s + p.results.length, 0);
    const mentions = ps.reduce((s, p) => s + p.results.filter((r) => r.mentioned).length, 0);
    return total > 0 ? Math.round((mentions / total) * 100) : 0;
  };

  const audienceScoreColor = (s: number) => {
    if (s >= 70) return "text-success";
    if (s >= 40) return "text-accent";
    return "text-destructive";
  };

  const individualScore = hasAudienceBreakdown ? calcAudienceScore(audienceIndividualPrompts) : null;
  const businessScore = hasAudienceBreakdown ? calcAudienceScore(audienceBusinessPrompts) : null;

  return (
    <Layout>
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

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-1 glass-panel pt-6">
            <CardContent className="flex flex-col items-center">
              <ScoreGauge score={scan.score || 0} />
              <p className="text-center text-sm text-muted-foreground mt-6 px-4">
                This score represents how often your firm was mentioned when we asked AI assistants for
                recommendations in your immigration practice areas.
              </p>
              {hasAudienceBreakdown && individualScore !== null && businessScore !== null && (
                <div className="w-full mt-5 space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span className="flex-1 text-sm font-medium">Individual</span>
                    <span className={`text-lg font-bold tabular-nums ${audienceScoreColor(individualScore)}`}>{individualScore}%</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="flex-1 text-sm font-medium">Business</span>
                    <span className={`text-lg font-bold tabular-nums ${audienceScoreColor(businessScore)}`}>{businessScore}%</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 glass-panel flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" /> Performance by AI
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "transparent" }}
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
                    formatter={(value: number) => [`${value}% Visibility`, "Score"]}
                  />
                  <Bar dataKey="rate" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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

        <h2 className="text-2xl font-bold pt-8">Prompt Breakdown</h2>
        <PromptBreakdown prompts={prompts} />

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
              Subscribe to unlock ongoing monitoring, full recommendations, report history, and exports for {BILLING_PRICE_LABEL}.
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
    </Layout>
  );
}
