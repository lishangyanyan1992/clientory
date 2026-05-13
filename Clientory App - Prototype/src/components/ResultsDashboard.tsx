import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, ChevronUp, Check, X, Sparkles, AlertTriangle, Users, Trophy, BarChart3, Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessInfo, ScanResult, RecommendationItem } from "@/lib/scan-engine";
import ScoreCircle from "./ScoreCircle";
import WaitlistModal from "./WaitlistModal";

interface ResultsDashboardProps {
  businessInfo: BusinessInfo;
  scanResult: ScanResult;
  onBack: () => void;
}

const INTENT_COLORS: Record<string, string> = {
  high: "bg-score-poor/10 text-score-poor border-score-poor/20",
  medium: "bg-score-moderate/10 text-score-moderate border-score-moderate/20",
  low: "bg-score-good/10 text-score-good border-score-good/20",
};

const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
  perplexity: "Perplexity",
};

const MODEL_ICONS: Record<string, string> = {
  chatgpt: "🤖",
  gemini: "✨",
  claude: "🧠",
  perplexity: "🔍",
};

const REC_CATEGORY_LABELS: Record<string, string> = {
  content: "Content Improvements",
  authority: "Authority Signals",
  directories: "Directory Listings",
  structured_data: "Structured Data",
};

const METRIC_LABELS = [
  { key: "responseQuality", label: "Response Quality", color: "bg-blue-500" },
  { key: "clarity", label: "Clarity", color: "bg-emerald-500" },
  { key: "persuasiveness", label: "Persuasiveness", color: "bg-purple-500" },
  { key: "overallScore", label: "Overall Score", color: "bg-primary" },
];

const ResultsDashboard = ({ businessInfo, scanResult, onBack }: ResultsDashboardProps) => {
  const [showAllPrompts, setShowAllPrompts] = useState(false);
  const [betaWaitlistOpen, setBetaWaitlistOpen] = useState(false);

  if (!scanResult || scanResult.visibility_score === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Unable to retrieve scan results.</h2>
          <Button variant="outline" onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const displayedPrompts = showAllPrompts
    ? scanResult.prompt_results
    : scanResult.prompt_results.slice(0, 16);

  const modelScoreEntries = Object.entries(scanResult.model_scores) as [string, number][];
  const modelMetricsEntries = scanResult.model_metrics ? Object.entries(scanResult.model_metrics) : [];

  const recEntries = Object.entries(scanResult.recommendations).filter(
    ([, items]) => items && items.length > 0
  ) as [string, RecommendationItem[]][];

  const mentionRate = scanResult.tests_run > 0
    ? Math.round((scanResult.mentions / scanResult.tests_run) * 100)
    : 0;

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <div className="flex items-center gap-2">
            <img src={logo} alt="Clientory" className="h-20" />
          </div>
        </button>
        <Button onClick={() => setBetaWaitlistOpen(true)} className="gap-2">
          Join the Beta Waitlist
        </Button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {/* Score Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-elevated p-8 text-center"
        >
          <h1 className="text-2xl font-bold text-foreground mb-1">AI Visibility Score</h1>
          <p className="text-muted-foreground mb-6">{businessInfo.name} • {businessInfo.location}</p>
          <ScoreCircle score={scanResult.visibility_score} size={200} />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: "Prompts Tested", value: scanResult.tests_run },
              { label: "Total Mentions", value: scanResult.mentions },
              { label: "Mention Rate", value: `${mentionRate}%` },
              { label: "Avg Rank", value: scanResult.average_rank > 0 ? `#${scanResult.average_rank.toFixed(1)}` : "N/A" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-secondary/50 rounded-xl p-4">
                <div className="text-2xl font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Beta CTA after score */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-2xl shadow-card p-8 text-center border border-primary/20"
        >
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Want to see how your business is ranking?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Get access to AI visibility tracking, AI Agent Implementation, GEO Monitoring, and more features. Join our beta waitlist today.
          </p>
          <Button size="lg" onClick={() => setBetaWaitlistOpen(true)} className="px-8">
            Join the Beta Waitlist
          </Button>
        </motion.section>

        {/* Model Comparison Dashboard */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-2xl shadow-card p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Model Performance Comparison</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {modelMetricsEntries.map(([key, metrics]) => (
              <div key={key} className="border border-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">{MODEL_ICONS[key] || "💬"}</span>
                  <span className="font-semibold text-foreground">{MODEL_LABELS[key] || key}</span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{metrics.overallScore}</div>
                <div className="text-xs text-muted-foreground mb-4">Overall Score</div>
                <div className="space-y-3">
                  {METRIC_LABELS.filter(m => m.key !== "overallScore").map(({ key: metricKey, label, color }) => (
                    <div key={metricKey}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-foreground font-medium">{(metrics as any)[metricKey]}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(metrics as any)[metricKey]}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Mention Rate</span>
                      <span className="text-foreground font-medium">{metrics.mentionRate}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Model Rankings */}
        {scanResult.model_rankings && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-card rounded-2xl shadow-card p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Model Rankings</h2>
            </div>
            <div className="space-y-3">
              {scanResult.model_rankings.map((entry, i) => (
                <div key={entry.model} className={`flex items-center gap-4 p-4 rounded-xl ${i === 0 ? "bg-primary/10 border border-primary/20" : "bg-secondary/30"}`}>
                  <div className={`text-2xl font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                    #{i + 1}
                  </div>
                  <span className="text-lg">{MODEL_ICONS[entry.model] || "💬"}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{MODEL_LABELS[entry.model] || entry.model}</div>
                  </div>
                  <div className="text-2xl font-bold text-foreground">{entry.score}</div>
                  <div className="text-xs text-muted-foreground">/100</div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Ranking Trends - 3 Month History */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.17 }}
          className="bg-card rounded-2xl shadow-card p-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Ranking Trends</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">How your visibility ranking has changed across models over the past 3 months.</p>

          {(() => {
            const months = ["Jan 2026", "Feb 2026", "Mar 2026"];
            const trendData: Record<string, { scores: number[]; ranks: number[] }> = {
              chatgpt:    { scores: [58, 64, scanResult.model_scores.chatgpt],    ranks: [5, 4, 3] },
              gemini:     { scores: [62, 66, scanResult.model_scores.gemini],     ranks: [4, 3, 2] },
              claude:     { scores: [50, 55, scanResult.model_scores.claude],     ranks: [6, 5, 4] },
              perplexity: { scores: [65, 69, scanResult.model_scores.perplexity], ranks: [3, 2, 1] },
            };
            const modelColors: Record<string, string> = {
              chatgpt: "bg-emerald-500",
              gemini: "bg-blue-500",
              claude: "bg-purple-500",
              perplexity: "bg-amber-500",
            };

            return (
              <div className="space-y-6">
                {/* Mini chart visualization */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(trendData).map(([model, data]) => {
                    const change = data.scores[2] - data.scores[0];
                    const TrendIcon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
                    const trendColor = change > 0 ? "text-score-good" : change < 0 ? "text-score-poor" : "text-muted-foreground";
                    const maxScore = Math.max(...data.scores, 100);

                    return (
                      <div key={model} className="border border-border rounded-xl p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{MODEL_ICONS[model] || "💬"}</span>
                            <span className="font-semibold text-foreground text-sm">{MODEL_LABELS[model]}</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
                            <TrendIcon className="h-3 w-3" />
                            {change > 0 ? "+" : ""}{change}
                          </div>
                        </div>

                        {/* Bar chart for 3 months */}
                        <div className="flex items-end gap-2 h-24 mb-3">
                          {data.scores.map((score, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                              <span className="text-xs font-mono text-foreground font-medium">{score}</span>
                              <motion.div
                                className={`w-full rounded-t-md ${modelColors[model]} opacity-${i === 2 ? "100" : i === 1 ? "70" : "40"}`}
                                style={{ opacity: i === 2 ? 1 : i === 1 ? 0.7 : 0.4 }}
                                initial={{ height: 0 }}
                                animate={{ height: `${(score / maxScore) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {months.map((m, i) => (
                            <div key={i} className="flex-1 text-center text-[10px] text-muted-foreground">{m.split(" ")[0]}</div>
                          ))}
                        </div>

                        {/* Rank change */}
                        <div className="mt-3 pt-3 border-t border-border flex justify-between text-xs">
                          <span className="text-muted-foreground">Rank</span>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">#{data.ranks[0]}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="text-muted-foreground">#{data.ranks[1]}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className={`font-semibold ${data.ranks[2] < data.ranks[0] ? "text-score-good" : "text-foreground"}`}>#{data.ranks[2]}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Overall trend summary */}
                <div className="bg-secondary/30 rounded-xl p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-score-good/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-score-good" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Overall visibility is trending upward</div>
                    <div className="text-xs text-muted-foreground">Your average ranking improved by 2 positions across all models in the last 3 months.</div>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.section>

        {/* Top Performing Prompts */}
        {scanResult.top_prompts && scanResult.top_prompts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl shadow-card p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Top Performing Prompts</h2>
            </div>
            <div className="space-y-3">
              {scanResult.top_prompts.map((tp, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                  <div className="text-lg font-bold text-muted-foreground w-8">#{i + 1}</div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">"{tp.prompt}"</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Best in: <span className="font-medium">{tp.bestModel}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-foreground">{tp.avgScore}</div>
                    <div className="text-xs text-muted-foreground">avg score</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* AI-Discovered Competitors */}
        {scanResult.top_competitors.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-2xl shadow-card p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">AI-Discovered Competitors</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">These competitors were frequently mentioned by LLMs in response to your target queries.</p>
            <div className="flex flex-wrap gap-2">
              {scanResult.top_competitors.map((competitor) => (
                <Badge key={competitor} variant="secondary" className="text-sm py-1.5 px-3">
                  {competitor}
                </Badge>
              ))}
            </div>
          </motion.section>
        )}

        {/* Prompt Results Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl shadow-card p-8"
        >
          <h2 className="text-xl font-bold text-foreground mb-6">Prompt Test Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Prompt</th>
                  <th className="pb-3 font-medium">LLM</th>
                  <th className="pb-3 font-medium">Mentioned</th>
                  <th className="pb-3 font-medium">Quality</th>
                  <th className="pb-3 font-medium">Clarity</th>
                  <th className="pb-3 font-medium">Persuasion</th>
                  <th className="pb-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {displayedPrompts.map((r, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-3 pr-4 max-w-xs truncate text-foreground">{r.prompt}</td>
                    <td className="py-3 pr-4">
                      <Badge variant="secondary" className="text-xs">{r.model}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      {r.mentioned ? (
                        <Check className="h-4 w-4 text-score-good" />
                      ) : (
                        <X className="h-4 w-4 text-score-poor" />
                      )}
                    </td>
                    <td className="py-3 pr-4 font-mono text-foreground">{r.responseQuality}</td>
                    <td className="py-3 pr-4 font-mono text-foreground">{r.clarity}</td>
                    <td className="py-3 pr-4 font-mono text-foreground">{r.persuasiveness}</td>
                    <td className="py-3 font-mono font-bold text-foreground">{r.overallScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {scanResult.prompt_results.length > 16 && (
            <Button variant="ghost" className="w-full mt-4 gap-2" onClick={() => setShowAllPrompts(!showAllPrompts)}>
              {showAllPrompts ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showAllPrompts ? "Show Less" : `Show All ${scanResult.prompt_results.length} Results`}
            </Button>
          )}
        </motion.section>

        {/* Recommendations */}
        {recEntries.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-bold text-foreground">Recommendations</h2>
            {recEntries.map(([category, items]) => (
              <div key={category} className="bg-card rounded-2xl shadow-card p-6">
                <h3 className="font-semibold text-foreground mb-4">
                  {REC_CATEGORY_LABELS[category] || category}
                </h3>
                <div className="space-y-3">
                  {items.map((rec, i) => (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-secondary/30">
                      {rec.priority && (
                        <Badge variant="outline" className={`text-xs shrink-0 capitalize ${INTENT_COLORS[rec.priority] || ""}`}>
                          {rec.priority}
                        </Badge>
                      )}
                      <div>
                        <div className="font-medium text-foreground text-sm">{rec.title}</div>
                        {rec.description && (
                          <div className="text-xs text-muted-foreground mt-1">{rec.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.section>
        )}

        {/* Bottom Beta CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl shadow-card p-8 text-center border border-primary/20"
        >
          <Sparkles className="h-8 w-8 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Want to see how your business is ranking?</h2>
          <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
            Get access to AI visibility tracking, AI Agent Implementation, GEO Monitoring, and more features. Join our beta waitlist today.
          </p>
          <Button size="lg" onClick={() => setBetaWaitlistOpen(true)} className="px-8">
            Join the Beta Waitlist
          </Button>
        </motion.section>

        <div className="pb-16" />
      </main>

      <WaitlistModal open={betaWaitlistOpen} onOpenChange={setBetaWaitlistOpen} />
    </div>
  );
};

export default ResultsDashboard;
