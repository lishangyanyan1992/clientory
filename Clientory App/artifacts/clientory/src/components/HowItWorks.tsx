import { type ElementType, type ReactNode, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Check,
  FileText,
  Globe,
  MessageSquare,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wrench,
  X,
} from "lucide-react";

const intentColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-accent/10 text-accent border-accent/20",
};

function StepConnector({ vertical = false }: { vertical?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`flex items-center justify-center ${vertical ? "py-4" : "px-2"}`}
    >
      {vertical ? (
        <div className="relative flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: 32 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-px bg-gradient-to-b from-primary/40 to-primary/10"
          />
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <ArrowDown className="h-4 w-4 text-primary/40" />
          </motion.div>
        </div>
      ) : (
        <div className="relative flex items-center gap-1">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 32 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="h-px bg-gradient-to-r from-primary/40 to-primary/10"
          />
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <ArrowRight className="h-4 w-4 text-primary/40" />
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

function StepCard({
  step,
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  step: number;
  icon: ElementType;
  title: string;
  children: ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-6 card-hover"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/10 bg-primary/5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <span className="text-[11px] font-medium uppercase tracking-widest text-primary">
            Step {step}
          </span>
          <h3 className="text-lg font-semibold leading-tight text-foreground">{title}</h3>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function AnimatedScore() {
  const [score, setScore] = useState(34);

  useEffect(() => {
    const steps = [34, 48, 63, 75, 82];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setScore(steps[i]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      key={score}
      initial={{ scale: 0.95, opacity: 0.7 }}
      animate={{ scale: 1, opacity: 1 }}
      className="tabular-nums text-4xl font-bold text-gradient"
    >
      {score}
      <span className="text-lg font-normal text-muted-foreground">/100</span>
    </motion.div>
  );
}

function TrendLine() {
  const points = [
    { x: 0, y: 70 },
    { x: 20, y: 58 },
    { x: 40, y: 48 },
    { x: 60, y: 34 },
    { x: 80, y: 24 },
    { x: 100, y: 14 },
  ];

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg viewBox="0 0 100 80" className="mt-3 h-16 w-full">
      <motion.path
        d={pathD}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
      />
      <motion.path
        d={`${pathD} L 100 80 L 0 80 Z`}
        fill="hsl(var(--primary) / 0.06)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 1.2 }}
      />
    </svg>
  );
}

function FlowingDots() {
  return (
    <div className="my-1 flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-primary/40"
          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.25 }}
        />
      ))}
    </div>
  );
}

const aiModels = [
  { name: "ChatGPT", color: "bg-emerald-500" },
  { name: "Claude", color: "bg-orange-400" },
  { name: "Gemini", color: "bg-blue-500" },
  { name: "Perplexity", color: "bg-violet-500" },
  { name: "Copilot", color: "bg-slate-500" },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-muted/30 py-16 md:py-20">
      <div className="container relative mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary">
            How It Works
          </p>
          <h2 className="text-3xl font-bold leading-tight text-foreground md:text-5xl">
            How <span className="text-gradient">Clientory</span> works
          </h2>
        </motion.div>

        <div className="mx-auto max-w-6xl space-y-0">
          <div className="grid items-start gap-0 md:grid-cols-[1fr_auto_1fr]">
            <StepCard step={1} icon={Building2} title="Firm Profile" delay={0}>
              <p className="mb-4 text-sm text-muted-foreground">
                Enter the signals that shape how AI should understand your immigration practice.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Briefcase, label: "Practice focus and case types" },
                  { icon: Target, label: "Geography and office markets" },
                  { icon: Users, label: "Family and business client segments" },
                  { icon: Wrench, label: "Core services and attorney strengths" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
                  >
                    <item.icon className="h-3.5 w-3.5 text-primary/60" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </div>
                ))}
              </div>
            </StepCard>

            <div className="hidden self-center md:flex">
              <StepConnector />
            </div>
            <div className="flex justify-center md:hidden">
              <StepConnector vertical />
            </div>

            <StepCard step={2} icon={MessageSquare} title="Prompt Generation" delay={0.15}>
              <p className="mb-4 text-sm text-muted-foreground">
                Clientory generates realistic prompts that future immigration clients actually ask.
              </p>
              <div className="mb-3 space-y-2">
                {[
                  {
                    level: "high" as const,
                    prompt: "Best marriage green card lawyer in Chicago",
                  },
                  {
                    level: "medium" as const,
                    prompt: "Top H-1B lawyer for startups in Austin",
                  },
                  {
                    level: "low" as const,
                    prompt: "Naturalization attorney near Houston",
                  },
                ].map((item) => (
                  <div
                    key={item.prompt}
                    className="flex items-start gap-2 rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
                  >
                    <span
                      className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium ${intentColors[item.level]}`}
                    >
                      {item.level}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      "{item.prompt}"
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-center text-[11px] text-muted-foreground/60">
                +47 more prompts generated
              </p>
            </StepCard>
          </div>

          <div className="flex justify-center md:justify-end md:pr-[25%]">
            <StepConnector vertical />
          </div>

          <div className="mx-auto max-w-lg">
            <StepCard step={3} icon={Bot} title="AI Model Testing" delay={0.3}>
              <p className="mb-4 text-sm text-muted-foreground">
                Clientory runs every prompt across the major AI assistants automatically.
              </p>
              <div className="mb-4 flex items-center justify-center gap-3">
                {aiModels.map((model, i) => (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 400 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 bg-muted/50">
                      <div className={`h-3 w-3 rounded-full ${model.color}`} />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{model.name}</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60">
                <FlowingDots />
                <span>Testing prompts across models</span>
                <FlowingDots />
              </div>
            </StepCard>
          </div>

          <div className="flex justify-center">
            <StepConnector vertical />
          </div>

          <div className="grid items-start gap-0 md:grid-cols-[1fr_auto_1fr]">
            <StepCard step={4} icon={BarChart3} title="Visibility Analysis" delay={0.45}>
              <p className="mb-4 text-sm text-muted-foreground">
                Analyze whether your firm appears, how often, and where competitors outrank you.
              </p>
              <div className="mb-4 space-y-2">
                {[
                  { label: "Mentioned in response", found: true },
                  { label: "Ranking position: #3", found: true },
                  { label: "Frequency: 4 of 5 models", found: true },
                  { label: "Competitor gap identified", found: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
                  >
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    {item.found ? (
                      <Check className="h-3.5 w-3.5 text-accent" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-destructive/60" />
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-border/50 pt-2 text-center">
                <p className="mb-1 text-[11px] text-muted-foreground">AI Visibility Score</p>
                <AnimatedScore />
              </div>
            </StepCard>

            <div className="hidden self-center md:flex">
              <StepConnector />
            </div>
            <div className="flex justify-center md:hidden">
              <StepConnector vertical />
            </div>

            <StepCard step={5} icon={TrendingUp} title="Recommendations" delay={0.6}>
              <p className="mb-4 text-sm text-muted-foreground">
                Get practical next steps to improve authority, visibility, and accuracy across AI.
              </p>
              <div className="mb-4 space-y-2">
                {[
                  { icon: FileText, label: "Improve practice area descriptions" },
                  { icon: Globe, label: "Strengthen location and service pages" },
                  { icon: Shield, label: "Tighten directory and credibility signals" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-muted/50 px-3 py-2"
                  >
                    <item.icon className="h-3.5 w-3.5 text-accent" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <Sparkles className="ml-auto h-3 w-3 text-primary/40" />
                  </div>
                ))}
              </div>
              <div className="px-2">
                <p className="mb-1 text-[11px] text-muted-foreground">Score improvement</p>
                <TrendLine />
              </div>
            </StepCard>
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center text-sm text-muted-foreground"
        >
          Track how AI recommendations change over time as your firm improves its visibility.
        </motion.p>
      </div>
    </section>
  );
}
