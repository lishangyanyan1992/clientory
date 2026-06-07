import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import founderYanyan from "@/assets/founder-yanyan.png";

const founders = [
  {
    name: "Yanyan Li",
    title: "Founder & CEO",
    bio: "8+ years building, launching, and scaling startups. Focused on product, growth, and bringing AI-powered tools to market for small and mid-sized law firms.",
    image: founderYanyan,
    linkedin: "https://www.linkedin.com/in/shangyanyan-li/",
  },
];

export default function Founders() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-label">Team</p>
          <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-5xl">
            Meet the <span className="text-gradient">Founder</span>
          </h2>
        </motion.div>

        <div className="mx-auto grid max-w-xl gap-8">
          {founders.map((founder, i) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group rounded-2xl border border-border bg-card p-8 text-center card-hover"
            >
              <div className="mx-auto mb-6 h-28 w-28 overflow-hidden rounded-full ring-2 ring-primary/10 transition-all group-hover:ring-primary/25">
                <img
                  src={founder.image}
                  alt={`${founder.name}, ${founder.title} at Clientory`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{founder.name}</h3>
              <p className="mb-4 mt-1 text-sm font-medium text-label">{founder.title}</p>
              <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{founder.bio}</p>
              <a
                href={founder.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
