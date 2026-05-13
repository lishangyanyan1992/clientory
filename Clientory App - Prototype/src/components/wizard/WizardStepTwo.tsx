import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScanFormData } from "@/components/ScanWizard";

interface Props {
  form: ScanFormData;
  updateForm: (partial: Partial<ScanFormData>) => void;
  canProceed: boolean;
  onNext: () => void;
  onBack: () => void;
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

const WizardStepTwo = ({ form, canProceed, onNext, onBack }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-lg"
    >
      <h2 className="text-2xl font-bold text-foreground mb-1">Business Services</h2>
      <p className="text-muted-foreground mb-8">Pre-filled for the demo. Click next to continue.</p>

      <div className="space-y-6">
        <ReadOnlyTags label="Primary Services" tags={form.services} />
        <ReadOnlyTags label="Target Clients" tags={form.target_clients} />
        <ReadOnlyTags label="Key Problems Solved" tags={form.problems_solved} />
        {form.industry_focus.length > 0 && (
          <ReadOnlyTags label="Industry Focus" tags={form.industry_focus} />
        )}
      </div>

      <div className="flex gap-3 mt-8">
        <Button variant="outline" size="lg" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button className="flex-1 gap-2" size="lg" onClick={onNext}>
          Next Step
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default WizardStepTwo;
