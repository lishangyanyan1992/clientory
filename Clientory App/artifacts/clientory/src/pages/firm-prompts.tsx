import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { getPromptSet, createScan, listBusinesses, regeneratePromptSet } from "@workspace/api-client-react";
import type { PromptSet, Business } from "@workspace/api-client-react";
import {
  Lock,
  ArrowRight,
  Loader2,
  RefreshCw,
  Search,
  Target,
  Puzzle,
  Zap,
  User,
  ChevronLeft,
  Copy,
  Check,
  Users,
  Building2,
} from "lucide-react";

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ReactNode; description: string; color: string }
> = {
  BRAND_DIRECT: {
    label: "Brand Direct",
    icon: <Search className="w-4 h-4" />,
    description:
      "Tests whether AI assistants recognize and recommend your firm when someone searches for you by name.",
    color: "bg-violet-50 border-violet-200 text-violet-700",
  },
  CATEGORY_GEO: {
    label: "Category + Geography",
    icon: <Target className="w-4 h-4" />,
    description:
      "The most common way potential clients find law firms — combining the legal help they need with where they are.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  SPECIALTY_LONGTAIL: {
    label: "Specialty / Niche",
    icon: <Puzzle className="w-4 h-4" />,
    description:
      "Longer, more specific searches from prospects who know exactly what they need. Less competition, higher intent.",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  PROBLEM_SYMPTOM: {
    label: "Problem / Symptom",
    icon: <Zap className="w-4 h-4" />,
    description:
      "The first thing a potential client types when they realise they have a legal problem — before they know which practice area they need.",
    color: "bg-amber-50 border-amber-200 text-amber-700",
  },
  PERSONA_DRIVEN: {
    label: "Persona-Driven",
    icon: <User className="w-4 h-4" />,
    description:
      "Searches from a specific client type's perspective. Reveals whether AI associates your firm with the right clients.",
    color: "bg-rose-50 border-rose-200 text-rose-700",
  },
};

const CATEGORY_ORDER = [
  "BRAND_DIRECT",
  "CATEGORY_GEO",
  "SPECIALTY_LONGTAIL",
  "PROBLEM_SYMPTOM",
  "PERSONA_DRIVEN",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function groupPrompts(prompts: PromptSet["prompts"]) {
  const groups: Record<string, typeof prompts> = {};
  for (const p of prompts) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  }
  return groups;
}

type AudienceSection = {
  audience: "individual" | "business" | null;
  prompts: PromptSet["prompts"];
};

function splitByAudience(prompts: PromptSet["prompts"]): AudienceSection[] {
  const individual = prompts.filter((p) => p.audience === "individual");
  const business = prompts.filter((p) => p.audience === "business");
  const untagged = prompts.filter((p) => !p.audience);

  if (individual.length > 0 && business.length > 0) {
    return [
      { audience: "individual", prompts: individual },
      { audience: "business", prompts: business },
    ];
  }
  return [{ audience: null, prompts: prompts.length > 0 ? prompts : untagged }];
}

const AUDIENCE_META: Record<
  "individual" | "business",
  { label: string; count_label: string; icon: React.ReactNode; color: string; borderColor: string }
> = {
  individual: {
    label: "Individual Clients",
    count_label: "individual client prompts",
    icon: <Users className="w-4 h-4" />,
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
    borderColor: "border-indigo-200",
  },
  business: {
    label: "Business Clients",
    count_label: "business client prompts",
    icon: <Building2 className="w-4 h-4" />,
    color: "text-teal-700 bg-teal-50 border-teal-200",
    borderColor: "border-teal-200",
  },
};

function PromptCard({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group flex items-start gap-3 px-4 py-3.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
      <Lock className="w-3.5 h-3.5 text-slate-300 mt-0.5 shrink-0" />
      <p className="flex-1 text-sm text-slate-700 leading-relaxed">{text}</p>
      <button
        type="button"
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 shrink-0 text-slate-400 hover:text-slate-600 transition-all"
        title="Copy prompt"
      >
        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function FirmPrompts() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const routerLocation = useLocation();

  const stateData = routerLocation.state as
    | { business?: Business; promptSet?: PromptSet }
    | undefined;

  const [promptSet, setPromptSet] = useState<PromptSet | null>(stateData?.promptSet ?? null);
  const [business, setBusiness] = useState<Business | null>(stateData?.business ?? null);
  const [loading, setLoading] = useState(!stateData?.promptSet);
  const [error, setError] = useState<string | null>(null);
  const [startingTest, setStartingTest] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const emailToken = localStorage.getItem("emailToken");

  useEffect(() => {
    if (stateData?.promptSet && stateData?.business) return;
    if (!id || !emailToken) {
      setError("Session not found. Please complete the firm intake form first.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [ps, bl] = await Promise.all([
          getPromptSet(id, { headers: { "x-email-token": emailToken } }),
          listBusinesses({ headers: { "x-email-token": emailToken } }),
        ]);
        setPromptSet(ps);
        const found = bl.businesses.find((b) => String(b.id) === String(id));
        if (found) setBusiness(found);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load prompt set.",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id, emailToken, stateData]);

  const handleStartTesting = async () => {
    if (!id || !emailToken || !business) return;
    setStartingTest(true);
    setError(null);
    try {
      const businessName =
        (business as Business & { legalName?: string; brandName?: string }).legalName ||
        business.name;
      const businessType =
        (business as Business & { firmType?: string }).firmType || business.businessType;
      const location = business.location;

      const scan = await createScan(
        {
          businessId: id,
          businessName,
          businessType,
          location,
        },
        { headers: { "x-email-token": emailToken } },
      );

      if ("cached" in scan && scan.cached) {
        navigate(`/scan/${scan.id}/results`);
      } else {
        navigate(`/scan/${scan.id}/progress`);
      }
    } catch (err) {
      const errObj = err as { status?: number; data?: { error?: string; entitlementCode?: string } };
      if (errObj.status === 402) {
        setError("You've reached your scan limit. Upgrade your plan to run more scans.");
      } else {
        setError(errObj.data?.error || (err instanceof Error ? err.message : "Failed to start scan."));
      }
    } finally {
      setStartingTest(false);
    }
  };

  const handleRegenerate = async () => {
    if (!id || !emailToken) return;
    setRegenerating(true);
    setError(null);
    try {
      const newSet = await regeneratePromptSet(id, { headers: { "x-email-token": emailToken } });
      setPromptSet(newSet);
    } catch (err) {
      const errObj = err as { data?: { error?: string } };
      setError(errObj.data?.error || (err instanceof Error ? err.message : "Failed to regenerate."));
    } finally {
      setRegenerating(false);
    }
  };

  // Determine if profile has been updated since last generation
  const canRegenerate = (() => {
    if (!business || !promptSet) return false;
    const profileUpdatedAt = (business as Business & { profileUpdatedAt?: string }).profileUpdatedAt;
    if (!profileUpdatedAt) return false;
    return new Date(profileUpdatedAt) > new Date(promptSet.generatedAt);
  })();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (error && !promptSet) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => navigate("/scan")} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" /> Back to intake form
          </Button>
        </div>
      </Layout>
    );
  }

  if (!promptSet) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <p className="text-slate-600 mb-6">No prompt set found for this firm.</p>
          <Button onClick={() => navigate("/scan")} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" /> Build your firm profile
          </Button>
        </div>
      </Layout>
    );
  }

  const audienceSections = splitByAudience(promptSet.prompts);
  const isMultiAudience = audienceSections.length > 1;
  const totalPromptCount = promptSet.prompts.length;
  const firmDisplayName =
    (business as (Business & { brandName?: string; legalName?: string }) | null)?.brandName ||
    (business as (Business & { legalName?: string }) | null)?.legalName ||
    business?.name ||
    "Your Firm";

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate("/scan")}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
            >
              <ChevronLeft className="w-4 h-4" /> Update firm profile
            </button>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  {firmDisplayName}&rsquo;s AI Search Prompts
                </h1>
                <p className="text-slate-500 text-sm">
                  {totalPromptCount} locked prompt{totalPromptCount !== 1 ? "s" : ""}
                  {isMultiAudience ? " across 2 audience sections" : " across 5 categories"} · Generated{" "}
                  {new Date(promptSet.generatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {canRegenerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                    disabled={regenerating}
                    className="flex items-center gap-2 text-slate-600"
                  >
                    {regenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Regenerate
                  </Button>
                )}
                <Button
                  onClick={handleStartTesting}
                  disabled={startingTest}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {startingTest ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Starting...
                    </>
                  ) : (
                    <>
                      Run your firm's AI visibility scan <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Locked banner */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 mb-6 shadow-sm">
            <Lock className="w-4 h-4 text-slate-400 shrink-0" />
            <p className="text-sm text-slate-600">
              These {totalPromptCount} prompts are{" "}
              <strong className="text-slate-800">locked</strong> — they are used consistently
              across every scan so your results are comparable over time.{" "}
              {isMultiAudience && (
                <>Prompts are split into <strong className="text-slate-800">Individual Clients</strong> and <strong className="text-slate-800">Business Clients</strong> sections. </>
              )}
              Update your firm profile and regenerate to get a new set.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Prompt groups */}
          <div className="space-y-8">
            {audienceSections.map((section) => {
              const grouped = groupPrompts(section.prompts);
              const audMeta = section.audience ? AUDIENCE_META[section.audience] : null;

              return (
                <div key={section.audience ?? "untagged"}>
                  {/* Audience section header */}
                  {audMeta && (
                    <div className={`flex items-center gap-3 mb-4 pb-3 border-b-2 ${audMeta.borderColor}`}>
                      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border ${audMeta.color}`}>
                        {audMeta.icon}
                        {audMeta.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {section.prompts.length} {section.prompts.length !== 1 ? "prompts" : "prompt"}
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {CATEGORY_ORDER.map((category) => {
                      const categoryPrompts = grouped[category];
                      if (!categoryPrompts || categoryPrompts.length === 0) return null;
                      const meta = CATEGORY_META[category] ?? {
                        label: category,
                        icon: <Search className="w-4 h-4" />,
                        description: "",
                        color: "bg-slate-50 border-slate-200 text-slate-700",
                      };

                      return (
                        <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100">
                            <span className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold border ${meta.color}`}>
                              {meta.icon}
                              {meta.label}
                            </span>
                            <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg font-medium">
                              {categoryPrompts.length} prompt{categoryPrompts.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="px-5 pt-3 pb-2">
                            <p className="text-xs text-slate-500 leading-relaxed">{meta.description}</p>
                          </div>
                          <div className="px-5 pb-5 space-y-2.5">
                            {categoryPrompts.map((p) => (
                              <PromptCard key={p.id} text={p.text} />
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Catch-all for unexpected categories */}
                    {Object.entries(grouped)
                      .filter(([cat]) => !CATEGORY_ORDER.includes(cat))
                      .map(([category, prompts]) => (
                        <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="px-5 py-4 border-b border-slate-100">
                            <span className="text-xs font-semibold text-slate-600">{category}</span>
                          </div>
                          <div className="px-5 pb-5 pt-3 space-y-2.5">
                            {prompts.map((p) => (
                              <PromptCard key={p.id} text={p.text} />
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-center shadow-lg shadow-blue-200">
            <h2 className="text-lg font-bold mb-2">See how AI recommends your firm to potential clients</h2>
            <p className="text-blue-100 text-sm mb-5">
              We'll run all 10 prompts across ChatGPT, Claude, and Gemini and show you exactly
              where {firmDisplayName} appears in AI-generated legal referrals.
            </p>
            <Button
              onClick={handleStartTesting}
              disabled={startingTest}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8"
            >
              {startingTest ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting scan...
                </>
              ) : (
                <>
                  Run your firm's AI visibility scan <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {/* Substitution notes (developer info, collapsed) */}
          {promptSet.substitutionNotes && (
            <details className="mt-4">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                Generation notes
              </summary>
              <p className="text-xs text-slate-400 mt-2 px-2">{promptSet.substitutionNotes}</p>
            </details>
          )}
        </div>
      </div>
    </Layout>
  );
}
