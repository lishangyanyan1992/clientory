import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { BusinessInfo, ScanResult, ScanProgress, generateDemoResult, LLM_NAMES, generatePrompts } from "@/lib/scan-engine";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ScanningProgress from "./ScanningProgress";
import WizardStepOne from "./wizard/WizardStepOne";
import WizardStepTwo from "./wizard/WizardStepTwo";
import WizardStepThree from "./wizard/WizardStepThree";

export interface ScanFormData {
  business_name: string;
  website: string;
  company_type: string;
  location: string;
  services: string[];
  target_clients: string[];
  problems_solved: string[];
  industry_focus: string[];
  positioning: string;
  competitors: string[];
  keywords: string[];
  paid_keywords: string[];
}

const DEMO_FORM: ScanFormData = {
  business_name: "Madison Legal Group",
  website: "madisonlegalgroup.com",
  company_type: "law_firm",
  location: "Madison, Wisconsin",
  services: ["Business law", "Contracts", "Litigation"],
  target_clients: ["Small Businesses", "Startups", "Corporations"],
  problems_solved: ["Contract disputes", "Business formation", "Commercial litigation"],
  industry_focus: ["Technology startups", "Real estate", "Healthcare"],
  positioning: "experienced",
  competitors: ["Boardman & Clark LLP", "Stafford Rosenbaum LLP"],
  keywords: ["business lawyer Madison", "contract attorney Wisconsin"],
  paid_keywords: ["Madison business attorney"],
};

interface ScanWizardProps {
  onComplete: (info: BusinessInfo, result: ScanResult) => void;
  onBack: () => void;
}

type WizardStep = "step1" | "step2" | "step3" | "scanning";

function formDataToBusinessInfo(form: ScanFormData): BusinessInfo {
  return {
    name: form.business_name,
    website: form.website,
    companyType: form.company_type,
    location: form.location,
    services: form.services,
    targetClients: form.target_clients.join(", "),
    industries: form.industry_focus.join(", "),
  };
}

const TOTAL_TESTS = 200; // 50 prompts × 4 models
const SCAN_DURATION_MS = 8000; // 8 seconds for demo

const ScanWizard = ({ onComplete, onBack }: ScanWizardProps) => {
  const [step, setStep] = useState<WizardStep>("step1");
  const [scanProgress, setScanProgress] = useState<ScanProgress | null>(null);
  const [form, setForm] = useState<ScanFormData>(DEMO_FORM);

  const updateForm = (partial: Partial<ScanFormData>) => setForm((prev) => ({ ...prev, ...partial }));

  const canProceedStep1 = form.business_name && form.website && form.company_type && form.location;
  const canProceedStep2 = form.services.length > 0;

  const aiResultRef = useRef<ScanResult | null>(null);
  const aiErrorRef = useRef<boolean>(false);

  const handleScan = useCallback(() => {
    setStep("scanning");
    const businessInfo = formDataToBusinessInfo(form);
    const prompts = generatePrompts(businessInfo, 50);
    const startTime = Date.now();
    const completedTests: ScanProgress["completedTests"] = [];
    aiResultRef.current = null;
    aiErrorRef.current = false;

    // Fire off AI scan in parallel with the progress animation
    supabase.functions
      .invoke("ai-visibility-scan", { body: { businessInfo } })
      .then(({ data, error }) => {
        if (error || !data || data.error) {
          console.warn("AI scan failed, will use demo fallback:", error || data?.error);
          aiErrorRef.current = true;
        } else {
          // Ensure the AI result has all required fields for the dashboard
          aiResultRef.current = {
            visibility_score: data.visibility_score ?? 0,
            model_scores: data.model_scores ?? { chatgpt: 0, gemini: 0, claude: 0, perplexity: 0 },
            model_metrics: data.model_metrics ?? {},
            tests_run: data.tests_run ?? 200,
            mentions: data.mentions ?? 0,
            average_rank: data.average_rank ?? 0,
            top_competitors: data.top_competitors ?? [],
            prompt_results: (data.prompt_results ?? []).map((r: any) => ({
              prompt: r.prompt ?? "",
              intent: r.intent ?? "medium",
              model: r.model ?? "ChatGPT",
              mentioned: r.mentioned ?? false,
              rank: r.rank ?? null,
              responseQuality: r.responseQuality ?? 0,
              clarity: r.clarity ?? 0,
              persuasiveness: r.persuasiveness ?? 0,
              overallScore: r.overallScore ?? 0,
            })),
            recommendations: {
              content: data.recommendations?.content ?? [],
              authority: data.recommendations?.authority ?? [],
              directories: data.recommendations?.directories ?? [],
              structured_data: data.recommendations?.structured_data ?? [],
            },
            top_prompts: data.top_prompts ?? [],
            model_rankings: data.model_rankings ?? [],
          };
        }
      })
      .catch((err) => {
        console.warn("AI scan network error, will use demo fallback:", err);
        aiErrorRef.current = true;
      });

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / SCAN_DURATION_MS);
      const testsCompleted = Math.min(TOTAL_TESTS, Math.floor(progress * TOTAL_TESTS));

      while (completedTests.length < testsCompleted) {
        const testIndex = completedTests.length;
        const promptIndex = Math.floor(testIndex / LLM_NAMES.length) % prompts.length;
        const modelIndex = testIndex % LLM_NAMES.length;
        completedTests.push({
          prompt: prompts[promptIndex],
          llm: LLM_NAMES[modelIndex],
          mentioned: Math.random() < 0.5,
        });
      }

      const phase: ScanProgress["phase"] =
        progress < 0.05 ? "generating" :
        progress < 0.1 ? "preparing" :
        progress < 0.9 ? "testing" :
        progress < 1 ? "analyzing" :
        "complete";

      const currentLLM = phase === "testing"
        ? LLM_NAMES[Math.floor((progress * 100 - 10) / 20) % LLM_NAMES.length]
        : undefined;

      setScanProgress({
        phase,
        currentLLM,
        promptsCompleted: testsCompleted,
        totalPrompts: TOTAL_TESTS,
        completedTests: [...completedTests],
      });

      if (progress >= 1) {
        clearInterval(interval);
        setScanProgress({
          phase: "complete",
          promptsCompleted: TOTAL_TESTS,
          totalPrompts: TOTAL_TESTS,
          completedTests: [...completedTests],
        });

        // Wait a bit then check if AI result arrived; fall back to demo if not
        setTimeout(() => {
          if (aiResultRef.current) {
            onComplete(businessInfo, aiResultRef.current);
          } else {
            if (aiErrorRef.current) {
              toast.info("Using simulated demo data");
            }
            const result = generateDemoResult(businessInfo);
            onComplete(businessInfo, result);
          }
        }, 1500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [form, onComplete]);

  if (step === "scanning" && scanProgress) {
    return <ScanningProgress progress={scanProgress} businessName={form.business_name} />;
  }

  const stepNumber = step === "step1" ? 1 : step === "step2" ? 2 : 3;

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <div className="flex items-center gap-2">
            <img src={logo} alt="Clientory" className="h-20" />
          </div>
        </button>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-8 rounded-full transition-colors ${
                s <= stepNumber ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <AnimatePresence mode="wait">
          {step === "step1" && (
            <WizardStepOne
              key="step1"
              form={form}
              updateForm={updateForm}
              canProceed={!!canProceedStep1}
              onNext={() => setStep("step2")}
            />
          )}
          {step === "step2" && (
            <WizardStepTwo
              key="step2"
              form={form}
              updateForm={updateForm}
              canProceed={canProceedStep2}
              onNext={() => setStep("step3")}
              onBack={() => setStep("step1")}
            />
          )}
          {step === "step3" && (
            <WizardStepThree
              key="step3"
              form={form}
              updateForm={updateForm}
              onBack={() => setStep("step2")}
              onScan={handleScan}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ScanWizard;
