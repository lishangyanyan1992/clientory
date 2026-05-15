import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Target, Zap } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Home() {
  return (
    <Layout>
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden flex-1 flex flex-col justify-center">
        <div className="container max-w-6xl mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm border border-primary/20 shadow-sm backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Built for small law firms
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground">
              Are AI assistants recommending <span className="gradient-text">your law firm?</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Prospective clients are using ChatGPT, Claude, and Gemini to find attorneys — not just Google. Discover how visible your firm is to AI and get a clear action plan to improve your ranking.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link 
                to="/scan" 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
              >
                Scan Your Firm <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-[0.15] mix-blend-multiply dark:opacity-20 pointer-events-none">
           <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
              alt="Abstract background"
              className="w-full h-full object-cover"
           />
        </div>
      </section>

      <section className="py-24 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-y border-border/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Clientory Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">We mimic how a real client searches for legal help to give you an accurate picture of your AI visibility.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: "1. Prompt Generation",
                desc: "We generate 10 realistic prompts based on your practice areas, location, and specialties — e.g. 'Find me an employment lawyer in Austin for a wrongful termination case.'"
              },
              {
                icon: <Bot className="w-6 h-6" />,
                title: "2. Multi-Model Testing",
                desc: "We run those prompts through the top AI assistants — ChatGPT, Claude, and Gemini — to see which firms each one recommends and how often yours appears."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "3. Actionable Insights",
                desc: "You get a clear visibility score, mention tracking per AI model, and concrete steps your firm can take to be recommended more often."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                className="glass-panel rounded-3xl p-8 relative overflow-hidden group hover:border-primary/30 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
