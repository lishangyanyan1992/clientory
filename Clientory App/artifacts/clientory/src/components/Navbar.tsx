import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logoFull from "@/assets/logo-v4d.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  // Hide all nav links (and the mobile hamburger) during the scan funnel so
  // users stay focused. The logo remains as the only exit back to the homepage.
  const isScanFlow = pathname.startsWith("/scan");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/88 backdrop-blur-xl">
      <div className="container mx-auto flex h-28 items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <img
            src={logoFull}
            alt="Clientory — GEO monitoring platform for immigration law firms"
            className="h-24 w-auto"
            loading="eager"
          />
        </Link>

        {!isScanFlow && (
          <>
            <div className="hidden md:flex items-center gap-8">
              <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/geo-for-professional-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GEO Guide</Link>
              <Link to="/scan">
                <Button size="sm" className="rounded-full px-5 bg-primary text-primary-foreground hover:opacity-90">Try It Now</Button>
              </Link>
            </div>

            <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </>
        )}
      </div>

      {!isScanFlow && open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-6 py-4 space-y-3">
          <Link to="/blog" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Blog</Link>
          <Link to="/about" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>About</Link>
          <Link to="/pricing" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>Pricing</Link>
          <Link to="/geo-for-professional-services" className="block text-sm text-muted-foreground" onClick={() => setOpen(false)}>GEO Guide</Link>
          <Link to="/scan" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full rounded-full mt-2 bg-primary text-primary-foreground hover:opacity-90">Try It Now</Button>
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
