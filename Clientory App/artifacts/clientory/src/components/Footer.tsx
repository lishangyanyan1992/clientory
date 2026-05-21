import { Link } from "react-router-dom";
import logoFull from "@/assets/logo-v4d.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <img src={logoFull} alt="Clientory — GEO monitoring platform for immigration law firms" className="h-10 opacity-90" loading="lazy" />
        <div className="flex items-center gap-6">
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/geo-for-professional-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GEO Guide</Link>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Clientory. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
