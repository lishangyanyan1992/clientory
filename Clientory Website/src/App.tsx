import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import GeoGuide from "./pages/GeoGuide";
import CompareOtterly from "./pages/CompareOtterly";
import ComparePeec from "./pages/ComparePeec";
import CompareSemrush from "./pages/CompareSemrush";
import CompareManualTesting from "./pages/CompareManualTesting";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/geo-for-professional-services" element={<GeoGuide />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/clientory-vs-otterly" element={<CompareOtterly />} />
            <Route path="/clientory-vs-peec" element={<ComparePeec />} />
            <Route path="/clientory-vs-semrush-ai" element={<CompareSemrush />} />
            <Route path="/clientory-vs-manual-testing" element={<CompareManualTesting />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
