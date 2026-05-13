import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScanFormData } from "@/components/ScanWizard";

interface Props {
  form: ScanFormData;
  updateForm: (partial: Partial<ScanFormData>) => void;
  onBack: () => void;
  onScan: () => void;
}

const ReadOnlyTags = ({ label, tags }: { label: string; tags: string[] }) => (
  <div>
    <Label>{label}</Label>
    <div className="flex flex-wrap gap-2 mt-2">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">{tag}</Badge>
      ))}
    </div>
  </div>
);

const WizardStepThree = ({ form, onBack, onScan }: Props) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="w-full max-w-lg"
  >
    <h2 className="text-2xl font-bold text-foreground mb-1">Optional Information</h2>
    <p className="text-muted-foreground mb-8">Pre-filled for the demo. Click scan to begin.</p>

    <div className="space-y-6">
      {form.positioning && (
        <div>
          <Label>Firm Positioning</Label>
          <div className="mt-2">
            <Badge variant="secondary" className="text-sm py-1 px-3 capitalize">{form.positioning}</Badge>
          </div>
        </div>
      )}
      {form.competitors.length > 0 && <ReadOnlyTags label="Main Competitors" tags={form.competitors} />}
      {form.keywords.length > 0 && <ReadOnlyTags label="Common Keywords Clients Use" tags={form.keywords} />}
      {form.paid_keywords.length > 0 && <ReadOnlyTags label="Keywords You Are Buying" tags={form.paid_keywords} />}
    </div>

    <div className="flex gap-3 mt-8">
      <Button variant="outline" size="lg" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>
      <Button className="flex-1 gap-2" size="lg" onClick={onScan}>
        <Search className="h-4 w-4" />
        Run Free Visibility Test
      </Button>
    </div>
  </motion.div>
);

export default WizardStepThree;
