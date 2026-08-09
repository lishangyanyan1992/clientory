import { Link, useLocation } from "react-router-dom";
import { Github } from "lucide-react";
import logoFull from "@/assets/logo-v4d-small.png";

const Footer = () => {
  const { pathname } = useLocation();
  const isScanFlow = pathname.startsWith("/scan");

  return (
    <footer className="border-t border-border py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-6 lg:flex-row">
        <Link to="/">
          <img
            src={logoFull}
            alt="Clientory — AI visibility for immigration law firms"
            width="384"
            height="216"
            className="h-24 w-auto opacity-90"
            loading="lazy"
          />
        </Link>

        {!isScanFlow && (
          <>
            <div className="flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-3">
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/geo-for-professional-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Law Firm GEO Guide</Link>
              <Link to="/clientory-vs-otterly" className="text-sm text-muted-foreground hover:text-foreground transition-colors">vs. Otterly</Link>
              <Link to="/clientory-vs-peec" className="text-sm text-muted-foreground hover:text-foreground transition-colors">vs. Peec</Link>
              <Link to="/clientory-vs-semrush-ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">vs. Semrush</Link>
              <Link to="/clientory-vs-manual-testing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">vs. Manual Testing</Link>
              <a
                href="https://github.com/lishangyanyan1992/clientory-ai-visibility-skill"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                Open-source Agent Skill
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Clientory. All rights reserved.
            </p>
          </>
        )}
      </div>
    </footer>
  );
};

export default Footer;
