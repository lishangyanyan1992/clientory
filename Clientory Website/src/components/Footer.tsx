import logoFull from "@/assets/logo-full.png";

const Footer = () => {
  return (
    <footer className="border-t border-border py-10">
      <div className="container px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <img
          src={logoFull}
          alt="Clientory — GEO monitoring platform for professional service firms"
          className="h-20 opacity-80"
          loading="lazy"
        />
        <div className="flex items-center gap-6">
          <a href="/blog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a>
          <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
          <a href="/geo-for-professional-services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">GEO Guide</a>
        </div>
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Clientory. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
