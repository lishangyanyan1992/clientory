import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import ScanForm from "@/pages/scan-form";
import FirmPrompts from "@/pages/firm-prompts";
import ScanProgress from "@/pages/scan-progress";
import ScanResults from "@/pages/scan-results";
import Pricing from "@/pages/pricing";
import BillingSettings from "@/pages/billing-settings";
import About from "@/pages/about";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import GeoGuide from "@/pages/geo-guide";
import CompareOtterly from "@/pages/compare-otterly";
import ComparePeec from "@/pages/compare-peec";
import CompareSemrush from "@/pages/compare-semrush";
import CompareManualTesting from "@/pages/compare-manual-testing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/geo-for-professional-services" element={<GeoGuide />} />
              <Route path="/clientory-vs-otterly" element={<CompareOtterly />} />
              <Route path="/clientory-vs-peec" element={<ComparePeec />} />
              <Route path="/clientory-vs-semrush-ai" element={<CompareSemrush />} />
              <Route path="/clientory-vs-manual-testing" element={<CompareManualTesting />} />
              <Route path="/scan" element={<ScanForm />} />
              <Route path="/firm/:id/prompts" element={<FirmPrompts />} />
              <Route path="/scan/:id/progress" element={<ScanProgress />} />
              <Route path="/scan/:id/results" element={<ScanResults />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/settings/billing" element={<BillingSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
