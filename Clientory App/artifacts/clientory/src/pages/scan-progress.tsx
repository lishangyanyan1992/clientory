import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout";
import { useScanStream } from "@/hooks/use-scan-stream";
import { Bot, CheckCircle2, Loader2, Sparkles } from "lucide-react";

export default function ScanProgress() {
  const params = useParams<{ id: string }>();
  const scanId = params.id ?? "";
  const navigate = useNavigate();
  const { logs, isComplete } = useScanStream(scanId || undefined);

  useEffect(() => {
    if (isComplete && scanId) {
      const timer = setTimeout(() => {
        navigate(`/scan/${scanId}/results`);
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isComplete, scanId, navigate]);

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center mb-12">
          <div className="relative inline-flex mb-8">
            {isComplete ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 className="w-12 h-12 text-success" />
              </motion.div>
            ) : (
              <>
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping blur-xl"></div>
                <div className="relative w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-full flex items-center justify-center shadow-2xl shadow-primary/40">
                  <Bot className="w-12 h-12 text-white animate-pulse" />
                </div>
              </>
            )}
          </div>
          
          <h1 className="text-3xl font-bold mb-4">
            {isComplete ? "Scan Complete!" : "Running AI Visibility Scan"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isComplete 
              ? "Generating your personalized visibility report..." 
              : "We're asking top AI assistants about your immigration firm. This takes about 30-60 seconds."}
          </p>
        </div>

        <div className="w-full bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-border/50 max-h-[300px] overflow-hidden flex flex-col relative">
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white dark:from-slate-900 to-transparent z-10"></div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 pt-4 pb-12 flex flex-col-reverse relative">
            <AnimatePresence>
              {logs.slice().reverse().map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                >
                  <div className="mt-0.5">
                    {log.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : log.provider ? (
                      <Bot className="w-5 h-5 text-primary" />
                    ) : (
                      <Sparkles className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {log.content || (log.provider ? `Testing ${log.provider}...` : "Processing...")}
                    </p>
                    {log.prompt && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">"{log.prompt}"</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {logs.length === 0 && !isComplete && (
              <div className="flex items-center gap-3 p-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm">Initializing engines...</span>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-slate-900 to-transparent z-10 pointer-events-none"></div>
        </div>
      </div>
    </Layout>
  );
}
