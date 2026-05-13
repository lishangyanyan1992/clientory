import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles, Zap } from "lucide-react";
import logo from "@/assets/logo.png";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScanProgress, LLM_NAMES } from "@/lib/scan-engine";

interface ScanningProgressProps {
  progress: ScanProgress;
  businessName: string;
}

const phaseMessages: Record<ScanProgress["phase"], string> = {
  generating: "Generating 50 search prompts...",
  preparing: "Preparing AI visibility tests...",
  testing: "Testing prompts across LLMs...",
  analyzing: "Analyzing results...",
  complete: "Your AI visibility scan is complete.",
};

const getLLMIcon = (llm: string) => {
  switch (llm) {
    case "ChatGPT": return "🤖";
    case "Gemini": return "✨";
    case "Claude": return "🧠";
    case "Perplexity": return "🔍";
    default: return "💬";
  }
};

const getLLMColor = (llm: string) => {
  switch (llm) {
    case "ChatGPT": return "text-green-400";
    case "Gemini": return "text-blue-400";
    case "Claude": return "text-purple-400";
    case "Perplexity": return "text-orange-400";
    default: return "text-muted-foreground";
  }
};

const ScanningProgress = ({ progress, businessName }: ScanningProgressProps) => {
  const activityRef = useRef<HTMLDivElement>(null);
  const percentComplete = Math.round((progress.promptsCompleted / progress.totalPrompts) * 100);

  useEffect(() => {
    if (activityRef.current) {
      activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }
  }, [progress.completedTests.length]);

  const getStatusMessage = () => {
    if (progress.phase === "testing" && progress.currentLLM) {
      return `Testing prompts in ${progress.currentLLM}...`;
    }
    return phaseMessages[progress.phase];
  };

  const llmProgress = LLM_NAMES.map((llm) => {
    const llmTests = progress.completedTests.filter((t) => t.llm === llm);
    const total = progress.totalPrompts / LLM_NAMES.length;
    return {
      name: llm,
      completed: llmTests.length,
      total,
      percentage: Math.round((llmTests.length / total) * 100),
    };
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <nav className="flex items-center justify-center px-6 py-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Clientory" className="h-20" />
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-border" />
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              {progress.phase === "complete" ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-8 w-8 text-primary" />
                </motion.div>
              ) : (
                <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">Running AI Visibility Scan</h2>
            <p className="text-muted-foreground">
              Testing <span className="text-foreground font-medium">{businessName}</span> across ChatGPT, Gemini, Claude, and Perplexity
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-xl p-6 mb-6"
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">{getStatusMessage()}</span>
                <span className="text-sm font-bold text-primary">{percentComplete}%</span>
              </div>
              <Progress value={percentComplete} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {progress.promptsCompleted} of {progress.totalPrompts} tests completed
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {llmProgress.map((llm) => (
                <div key={llm.name} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-sm">{getLLMIcon(llm.name)}</span>
                    <span className={`text-xs font-medium ${getLLMColor(llm.name)}`}>{llm.name}</span>
                  </div>
                  <Progress value={llm.percentage} className="h-2 mb-1" />
                  <span className="text-xs text-muted-foreground">{llm.completed}/{llm.total}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Live Activity</span>
            </div>
            <ScrollArea className="h-48">
              <div ref={activityRef} className="p-4 space-y-2">
                <AnimatePresence mode="popLayout">
                  {progress.completedTests.slice(-20).map((test, index) => (
                    <motion.div
                      key={`${test.prompt}-${test.llm}-${index}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">
                        <span className={`font-medium ${getLLMColor(test.llm)}`}>
                          {getLLMIcon(test.llm)} {test.llm}
                        </span>
                        {" tested: "}
                        <span className="text-foreground/80">
                          "{test.prompt.length > 40 ? test.prompt.slice(0, 40) + "..." : test.prompt}"
                        </span>
                        {test.mentioned && <span className="text-green-400 ml-1">✓ Mentioned</span>}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {progress.completedTests.length === 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Initializing scan...
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>

          <AnimatePresence>
            {progress.phase === "complete" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center mt-6">
                <p className="text-lg font-medium text-primary">✓ Your AI visibility scan is complete.</p>
                <p className="text-sm text-muted-foreground mt-1">Loading your results...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default ScanningProgress;
