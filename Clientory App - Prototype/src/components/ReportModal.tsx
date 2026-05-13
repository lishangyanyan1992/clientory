import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Check } from "lucide-react";
import { BusinessInfo, ScanResult } from "@/lib/scan-engine";
import { toast } from "sonner";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessInfo: BusinessInfo;
  scanResult: ScanResult;
}

const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT",
  gemini: "Gemini",
  claude: "Claude",
  perplexity: "Perplexity",
};

const ReportModal = ({ open, onOpenChange, businessInfo, scanResult }: ReportModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name || !email) return;

    const mentionRate = scanResult.tests_run > 0
      ? Math.round((scanResult.mentions / scanResult.tests_run) * 100)
      : 0;

    let report = `CLIENTORY - AI VISIBILITY REPORT\n${"=".repeat(40)}\n\n`;
    report += `Business: ${businessInfo.name}\nWebsite: ${businessInfo.website}\nLocation: ${businessInfo.location}\n`;
    report += `Type: ${businessInfo.companyType}\nServices: ${businessInfo.services.join(", ")}\n\n`;
    report += `VISIBILITY SCORE: ${scanResult.visibility_score}/100\n`;
    report += `Tests Run: ${scanResult.tests_run}\n`;
    report += `Total Mentions: ${scanResult.mentions}\n`;
    report += `Mention Rate: ${mentionRate}%\n`;
    report += `Average Rank: ${scanResult.average_rank > 0 ? `#${scanResult.average_rank.toFixed(1)}` : "N/A"}\n\n`;

    report += `MODEL BREAKDOWN\n${"-".repeat(30)}\n`;
    Object.entries(scanResult.model_scores).forEach(([key, score]) => {
      report += `${MODEL_LABELS[key] || key}: ${score}/100\n`;
    });

    if (scanResult.model_metrics) {
      report += `\nDETAILED MODEL METRICS\n${"-".repeat(30)}\n`;
      Object.entries(scanResult.model_metrics).forEach(([key, metrics]) => {
        report += `\n${MODEL_LABELS[key] || key}:\n`;
        report += `  Response Quality: ${metrics.responseQuality}/100\n`;
        report += `  Clarity: ${metrics.clarity}/100\n`;
        report += `  Persuasiveness: ${metrics.persuasiveness}/100\n`;
        report += `  Overall Score: ${metrics.overallScore}/100\n`;
        report += `  Mention Rate: ${metrics.mentionRate}%\n`;
      });
    }

    if (scanResult.model_rankings) {
      report += `\nMODEL RANKINGS\n${"-".repeat(30)}\n`;
      scanResult.model_rankings.forEach((entry, i) => {
        report += `#${i + 1} ${MODEL_LABELS[entry.model] || entry.model}: ${entry.score}/100\n`;
      });
    }

    if (scanResult.top_prompts && scanResult.top_prompts.length > 0) {
      report += `\nTOP PERFORMING PROMPTS\n${"-".repeat(30)}\n`;
      scanResult.top_prompts.forEach((tp, i) => {
        report += `#${i + 1} "${tp.prompt}" (avg: ${tp.avgScore}, best: ${tp.bestModel})\n`;
      });
    }

    if (scanResult.top_competitors.length > 0) {
      report += `\nTOP COMPETITORS\n${"-".repeat(30)}\n`;
      scanResult.top_competitors.forEach((c) => { report += `• ${c}\n`; });
    }

    report += `\nRECOMMENDATIONS\n${"-".repeat(30)}\n`;
    Object.entries(scanResult.recommendations).forEach(([category, items]) => {
      if (items && items.length > 0) {
        report += `\n${category.toUpperCase().replace(/_/g, " ")}:\n`;
        items.forEach((r) => {
          report += `  ${r.priority ? `[${r.priority.toUpperCase()}] ` : ""}${r.title}\n`;
          if (r.description) report += `  ${r.description}\n`;
          report += "\n";
        });
      }
    });

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${businessInfo.name.replace(/\s+/g, "_")}_AI_Visibility_Report.txt`;
    a.click();
    URL.revokeObjectURL(url);

    setSubmitted(true);
    toast.success("Report downloaded!");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setSubmitted(false); setName(""); setEmail(""); } }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{submitted ? "Report Downloaded!" : "Download Your Report"}</DialogTitle>
          <DialogDescription>
            {submitted ? "Check your downloads folder for the full report." : "Enter your details to download the full AI visibility report."}
          </DialogDescription>
        </DialogHeader>
        {submitted ? (
          <div className="flex flex-col items-center py-6">
            <div className="h-12 w-12 rounded-full bg-score-good/10 flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-score-good" />
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="mt-1.5" />
            </div>
            <Button className="w-full gap-2" disabled={!name || !email} onClick={handleSubmit}>
              <Download className="h-4 w-4" />
              Download Report
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
