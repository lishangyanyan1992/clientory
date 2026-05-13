import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoFull from "@/assets/logo-full.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/80 backdrop-blur-xl border-b border-border" : "bg-transparent"}`}>
      <div className="container px-6 flex items-center justify-between h-16">
        <a href="/" className="flex items-center">
          <img src={logoFull} alt="Clientory — GEO monitoring platform for professional service firms" className="h-20" loading="eager" />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
          <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
          <a href="/geo-for-professional-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GEO Guide</a>
          <a href="https://clientoryapp.lovable.app" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="rounded-full px-5">Try It Now</Button>
          </a>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3">
          <a href="/blog" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Blog</a>
          <a href="/about" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>About</a>
          <a href="/geo-for-professional-services" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>GEO Guide</a>
          <a href="https://clientoryapp.lovable.app" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="w-full rounded-full mt-2">Try It Now</Button>
          </a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
