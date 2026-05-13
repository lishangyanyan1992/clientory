import { motion } from "framer-motion";
import {
  Building2,
  MessageSquare,
  Bot,
  BarChart3,
  TrendingUp,
  ArrowRight,
  ArrowDown,
  Briefcase,
  Users,
  Target,
  Wrench,
  Sparkles,
  Check,
  X,
  FileText,
  Globe,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";

const intentColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  high: "bg-accent/10 text-accent border-accent/20",
};

const StepConnector = ({ vertical = false }: { vertical?: boolean }) => (
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
          <ArrowDown className="w-4 h-4 text-primary/40" />
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
          <ArrowRight className="w-4 h-4 text-primary/40" />
        </motion.div>
      </div>
    )}
  </motion.div>
);

const StepCard = ({
  step,
  icon: Icon,
  title,
  children,
  delay = 0,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="relative rounded-2xl border border-border bg-card p-6 card-hover flex-1 min-w-0"
  >
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <span className="text-[11px] font-medium text-primary uppercase tracking-widest">
          Step {step}
        </span>
        <h3 className="text-lg font-semibold text-foreground leading-tight">{title}</h3>
      </div>
    </div>
    {children}
  </motion.div>
);

// Animated score component
const AnimatedScore = () => {
  const [score, setScore] = useState(34);

  useEffect(() => {
    const steps = [34, 48, 62, 71, 78];
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
      className="text-4xl font-bold text-gradient tabular-nums"
    >
      {score}
      <span className="text-lg text-muted-foreground font-normal">/100</span>
    </motion.div>
  );
};

// Animated trend line
const TrendLine = () => {
  const points = [
    { x: 0, y: 70 },
    { x: 20, y: 60 },
    { x: 40, y: 50 },
    { x: 60, y: 35 },
    { x: 80, y: 28 },
    { x: 100, y: 15 },
  ];

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg viewBox="0 0 100 80" className="w-full h-16 mt-3">
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
};

// Flowing dots animation
const FlowingDots = () => (
  <div className="flex items-center gap-1 my-1">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-primary/40"
        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          delay: i * 0.25,
        }}
      />
    ))}
  </div>
);

const aiModels = [
  { name: "ChatGPT", color: "bg-emerald-500" },
  { name: "Claude", color: "bg-orange-400" },
  { name: "Gemini", color: "bg-blue-500" },
  { name: "Perplexity", color: "bg-violet-500" },
  { name: "Others", color: "bg-muted-foreground/50" },
];

const HowItWorks = () => {
  return (
    <section className="relative py-16 md:py-20 bg-muted/30 overflow-hidden">
      <div className="container relative px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">
            How It Works
          </p>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
            How <span className="text-gradient">Clientory</span> Works
          </h2>
        </motion.div>

        {/* Flow chart — stacked on mobile, pairs on tablet, all on large */}
        <div className="max-w-6xl mx-auto space-y-0">
          {/* Row 1: Steps 1-2 */}
          <div className="grid md:grid-cols-[1fr_auto_1fr] items-start gap-0">
            <StepCard step={1} icon={Building2} title="Business Profile" delay={0}>
              <p className="text-sm text-muted-foreground mb-4">
                Enter information about your business so Clientory understands your expertise.
              </p>
              <div className="space-y-2">
                {[
                  { icon: Briefcase, label: "Company expertise" },
                  { icon: Target, label: "Industry" },
                  { icon: Users, label: "Target customers" },
                  { icon: Wrench, label: "Services offered" },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <item.icon className="w-3.5 h-3.5 text-primary/60" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </StepCard>

            <div className="hidden md:flex items-center self-center">
              <StepConnector />
            </div>
            <div className="md:hidden flex justify-center">
              <StepConnector vertical />
            </div>

            <StepCard step={2} icon={MessageSquare} title="Prompt Generation" delay={0.15}>
              <p className="text-sm text-muted-foreground mb-4">
                Clientory generates 50 realistic prompts potential customers might ask AI.
              </p>
              <div className="space-y-2 mb-3">
                {[
                  { level: "high" as const, prompt: "Best marketing consultant for small businesses" },
                  { level: "medium" as const, prompt: "Top accounting firms for startups" },
                  { level: "low" as const, prompt: "Business lawyer for SaaS companies" },
                ].map((item) => (
                  <motion.div
                    key={item.prompt}
                    initial={{ opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${intentColors[item.level]}`}
                    >
                      {item.level}
                    </span>
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      "{item.prompt}"
                    </span>
                  </motion.div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/60 text-center">
                +47 more prompts generated
              </p>
            </StepCard>
          </div>

          {/* Connector down */}
          <div className="flex justify-center md:justify-end md:pr-[25%]">
            <StepConnector vertical />
          </div>

          {/* Row 2: Step 3 centered */}
          <div className="max-w-lg mx-auto">
            <StepCard step={3} icon={Bot} title="AI Model Testing" delay={0.3}>
              <p className="text-sm text-muted-foreground mb-4">
                Clientory runs all prompts across major AI models automatically.
              </p>
              <div className="flex items-center justify-center gap-3 mb-4">
                {aiModels.map((model, i) => (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 400 }}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full ${model.color}`} />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {model.name}
                    </span>
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

          {/* Connector down */}
          <div className="flex justify-center">
            <StepConnector vertical />
          </div>

          {/* Row 3: Steps 4-5 */}
          <div className="grid md:grid-cols-[1fr_auto_1fr] items-start gap-0">
            <StepCard step={4} icon={BarChart3} title="Visibility Analysis" delay={0.45}>
              <p className="text-sm text-muted-foreground mb-4">
                Analyze how your company appears in AI-generated responses.
              </p>
              <div className="space-y-2 mb-4">
                {[
                  { label: "Mentioned in response", found: true },
                  { label: "Ranking position: #3", found: true },
                  { label: "Frequency: 4 of 6 models", found: true },
                  { label: "Competitor gap identified", found: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    {item.found ? (
                      <Check className="w-3.5 h-3.5 text-accent" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-destructive/60" />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center pt-2 border-t border-border/50">
                <p className="text-[11px] text-muted-foreground mb-1">AI Visibility Score</p>
                <AnimatedScore />
              </div>
            </StepCard>

            <div className="hidden md:flex items-center self-center">
              <StepConnector />
            </div>
            <div className="md:hidden flex justify-center">
              <StepConnector vertical />
            </div>

            <StepCard step={5} icon={TrendingUp} title="Recommendations" delay={0.6}>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-powered recommendations and agents to boost your visibility.
              </p>
              <div className="space-y-2 mb-4">
                {[
                  { icon: FileText, label: "Improve company descriptions" },
                  { icon: Globe, label: "Optimize website content" },
                  { icon: Shield, label: "Strengthen authority signals" },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -6 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <item.icon className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <Sparkles className="w-3 h-3 text-primary/40 ml-auto" />
                  </motion.div>
                ))}
              </div>
              <div className="px-2">
                <p className="text-[11px] text-muted-foreground mb-1">Score improvement</p>
                <TrendLine />
              </div>
            </StepCard>
          </div>
        </div>

        {/* Bottom message */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-muted-foreground mt-16 text-sm"
        >
          Monitor your AI visibility and see improvements over time.
        </motion.p>
      </div>
    </section>
  );
};

export default HowItWorks;
