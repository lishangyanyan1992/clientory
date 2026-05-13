import { motion } from "framer-motion";
import { Linkedin } from "lucide-react";
import founderYanyan from "@/assets/founder-yanyan.png";
import founderAlex from "@/assets/founder-alex.png";

const founders = [
  {
    name: "Yanyan Li",
    title: "Co-Founder & CEO",
    bio: "8+ years building, launching, and scaling startups. Focused on product, growth, and bringing AI-powered tools to market.",
    image: founderYanyan,
    linkedin: "https://www.linkedin.com/in/shangyanyan-li/",
  },
  {
    name: "Alex Chen",
    title: "AI Co-Founder",
    bio: "Alex runs research, product development, and automation for the company — helping design, build, and scale AI systems that power the platform.",
    image: founderAlex,
  },
];

const Founders = () => {
  return (
    <section className="relative py-16 md:py-20">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-primary font-medium text-sm uppercase tracking-widest mb-4">Team</p>
          <h2 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto text-foreground leading-tight">
            Meet the <span className="text-gradient">Founders</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {founders.map((founder, i) => (
            <motion.div
              key={founder.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group rounded-2xl border border-border bg-card p-8 text-center card-hover"
            >
              <div className="w-28 h-28 mx-auto mb-6 rounded-full overflow-hidden ring-2 ring-primary/10 group-hover:ring-primary/25 transition-all">
                <img
                  src={founder.image}
                  alt={`${founder.name}, ${founder.title} at Clientory — GEO monitoring platform for professional services`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{founder.name}</h3>
              <p className="text-primary text-sm font-medium mt-1 mb-4">{founder.title}</p>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">{founder.bio}</p>
              {founder.linkedin && (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Founders;
