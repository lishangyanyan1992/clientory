import { useState, useRef, useCallback, useEffect } from "react";
import { useAdminStatus } from "@/hooks/use-admin-status";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createBusiness,
  generatePromptSet,
  sendOtp,
  verifyOtp,
  submitPassword,
  suggestCompetitors,
  login,
} from "@workspace/api-client-react";
import type { CreateBusinessBody } from "@workspace/api-client-react";
import {
  Loader2,
  Mail,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
  Check,
  Sparkles,
  ChevronRight,
  MapPin,
  Briefcase,
  Users,
  Trophy,
  Star,
  Bot,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const GEO_SCOPES = [
  { value: "local", label: "Local", sub: "Single city / metro" },
  { value: "regional", label: "Regional", sub: "Multi-city, 1–2 states" },
  { value: "multi_state", label: "Multi-state", sub: "3+ states" },
  { value: "national", label: "National", sub: "Across the US" },
];

const CLIENT_STAGES_BUSINESS = [
  { value: "small_business", label: "Small businesses (1–50 employees)" },
  { value: "mid_size_business", label: "Mid-size businesses (51–500 employees)" },
  { value: "venture_backed_startup", label: "Venture-backed startups" },
  { value: "nonprofit", label: "Nonprofits" },
  { value: "higher_education", label: "Universities / higher education" },
  { value: "healthcare_provider", label: "Healthcare providers" },
];

const DECISION_MAKERS_BUSINESS = [
  { value: "business_owner", label: "Founder / business owner" },
  { value: "hr_manager", label: "HR / People Ops" },
  { value: "general_counsel", label: "General Counsel" },
  { value: "talent_acquisition", label: "Talent acquisition lead" },
  { value: "global_mobility", label: "Global mobility manager" },
  { value: "cfo_controller", label: "COO / CFO" },
];

const PRACTICE_AREAS_OPTIONS = [
  "Family-Based Immigration", "Marriage Green Cards", "Employment-Based Immigration",
  "Business Immigration", "Naturalization & Citizenship", "Removal Defense",
  "Asylum", "Adjustment of Status", "Consular Processing", "Waivers",
  "Investor & Entrepreneur Visas", "Extraordinary Ability & NIW", "Humanitarian Relief",
  "I-9 & Compliance", "Global Mobility", "Appeals & Motions",
];

const LEGAL_SERVICES_OPTIONS = [
  "Marriage green card filing", "Adjustment of status", "Naturalization applications",
  "Consular processing", "H-1B petitions", "PERM labor certification",
  "L-1 visa petitions", "O-1 visa petitions", "TN visa applications",
  "E-2 investor visa strategy", "EB-1A petitions", "EB-2 NIW petitions",
  "Removal defense hearings", "Asylum applications", "Waivers of inadmissibility",
  "RFE / NOID responses", "Employer I-9 compliance", "Global mobility strategy",
];

const SPECIALTIES_OPTIONS = [
  "Extraordinary ability cases", "National Interest Waivers", "Startup founder visas",
  "H-1B cap cases", "Consular interview preparation", "Waivers after unlawful presence",
  "Cancellation of removal", "VAWA petitions", "U visas",
  "Complex family sponsorship", "Site visit preparedness", "Cross-border hiring",
];

const B2C_INDUSTRIES_OPTIONS = [
  "Technology", "Healthcare", "Real estate", "Construction", "Retail",
  "Hospitality & food service", "Finance & banking", "Education",
  "Transportation & logistics", "Manufacturing", "Agriculture", "Nonprofits",
];

const B2B_INDUSTRIES_OPTIONS = [
  "Technology / SaaS", "Healthcare & medical", "Higher education", "Manufacturing",
  "Hospitality", "Construction & contractors", "Finance & banking", "Retail & e-commerce",
  "Biotech / life sciences", "Logistics", "Professional services", "Nonprofits",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const STEP_LABELS = [
  "Sign in", "Identity", "Locations", "Families / Individuals", "Employers",
  "Partners", "Competitors", "Authority", "Confirm",
];

const TOTAL_STEPS = 9;
const STORAGE_KEY = "firmIntakeData";
const STORAGE_STEP_KEY = "firmIntakeStep";
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationRow {
  city: string;
  state: string;
  isHQ: boolean;
}

interface PartnerRow {
  name: string;
  title: string;
  trackIndependently: boolean;
}

interface CompetitorRow {
  name: string;
  location: string;
}

interface RankingRow {
  source: string;
  category: string;
  year: string;
}

interface FirmIntakeData {
  firmType: string;
  legalName: string;
  brandName: string;
  yearFounded: string;
  website: string;
  locations: LocationRow[];
  geographicScope: string;
  servesIndividuals: boolean | null;
  individualServices: string[];
  individualDeliverables: string[];
  individualSpecialties: string[];
  servesBusiness: boolean | null;
  businessServices: string[];
  businessDeliverables: string[];
  businessSpecialties: string[];
  industriesServed: string[];
  clientStages: string[];
  decisionMakers: string[];
  partners: PartnerRow[];
  directCompetitors: CompetitorRow[];
  rankings: RankingRow[];
  directoryListings: string[];
  publications: string[];
  topGSCQueries: string[];
  email: string;
}

const DEFAULT_DATA: FirmIntakeData = {
  firmType: "law",
  legalName: "",
  brandName: "",
  yearFounded: "",
  website: "",
  locations: [{ city: "", state: "", isHQ: true }],
  geographicScope: "",
  servesIndividuals: null,
  individualServices: [],
  individualDeliverables: [],
  individualSpecialties: [],
  servesBusiness: null,
  businessServices: [],
  businessDeliverables: [],
  businessSpecialties: [],
  industriesServed: [],
  clientStages: [],
  decisionMakers: [],
  partners: [],
  directCompetitors: [],
  rankings: [],
  directoryListings: [],
  publications: [],
  topGSCQueries: [],
  email: "",
};

const DEMO_FIRM: FirmIntakeData = {
  firmType: "law",
  legalName: "Klasko Immigration Law Partners, LLP",
  brandName: "Klasko Immigration",
  yearFounded: "2004",
  website: "https://www.klaskolaw.com",
  locations: [
    { city: "Philadelphia", state: "PA", isHQ: true },
    { city: "New York", state: "NY", isHQ: false },
    { city: "Washington", state: "DC", isHQ: false },
  ],
  geographicScope: "national",
  servesIndividuals: true,
  individualServices: ["EB-1 Immigration", "EB-5 Immigration", "Extraordinary Ability & NIW", "Investor & Entrepreneur Visas"],
  individualDeliverables: ["EB-1A petitions", "EB-2 NIW petitions", "Adjustment of status", "Consular processing", "E-2 investor visa strategy"],
  individualSpecialties: ["Extraordinary ability cases", "National Interest Waivers", "Startup founder visas"],
  servesBusiness: true,
  businessServices: ["Business Immigration", "Employment-Based Immigration", "I-9 & Compliance", "Global Mobility"],
  businessDeliverables: ["H-1B petitions", "PERM labor certification", "L-1 visa petitions", "Employer I-9 compliance", "Global mobility strategy", "RFE / NOID responses"],
  businessSpecialties: ["H-1B cap cases", "Site visit preparedness", "Cross-border hiring"],
  industriesServed: ["Technology / SaaS", "Healthcare & medical", "Higher education", "Biotech / life sciences", "Finance & banking"],
  clientStages: ["small_business", "mid_size_business", "venture_backed_startup", "higher_education", "healthcare_provider"],
  decisionMakers: ["general_counsel", "hr_manager", "global_mobility", "talent_acquisition"],
  partners: [
    { name: "H. Ronald Klasko", title: "Chairman", trackIndependently: true },
    { name: "William Stock", title: "Managing Partner", trackIndependently: true },
    { name: "Elise Fialkowski", title: "Partner", trackIndependently: false },
  ],
  directCompetitors: [
    { name: "Fragomen, Del Rey, Bernsen & Loewy", location: "New York, NY" },
    { name: "Berry Appleman & Leiden", location: "San Francisco, CA" },
    { name: "Ogletree Deakins", location: "Washington, DC" },
  ],
  rankings: [
    { source: "Chambers USA", category: "Immigration: Business", year: "2025" },
    { source: "Best Lawyers in America", category: "Immigration Law", year: "2026" },
    { source: "Chambers Global", category: "Immigration: Business", year: "2026" },
  ],
  directoryListings: ["AILA Lawyer Directory", "Martindale-Hubbell", "Chambers USA", "Avvo"],
  publications: ["Law360", "AILA", "The Legal 500"],
  topGSCQueries: [
    "eb-1 extraordinary ability lawyer philadelphia",
    "eb-5 investor visa attorney",
    "h1b petition law firm philadelphia",
    "immigration lawyer for startups",
    "i-9 compliance attorney",
  ],
  email: "",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TagInput({
  label,
  values,
  onChange,
  placeholder,
  required,
  hint,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
}) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
      setInput("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-blue-600 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-100 font-medium"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="text-blue-400 hover:text-blue-600 leading-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectableTagInput({
  label,
  values,
  onChange,
  placeholder,
  required,
  hint,
  suggestions,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  required?: boolean;
  hint?: string;
  suggestions?: string[];
}) {
  const [input, setInput] = useState("");

  const add = (val: string) => {
    const trimmed = val.trim();
    if (trimmed && !values.includes(trimmed)) onChange([...values, trimmed]);
  };

  const addFromInput = () => {
    add(input);
    setInput("");
  };

  const remaining = (suggestions ?? []).filter((s) => !values.includes(s));

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-blue-600 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pb-1">
          {remaining.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 text-xs hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addFromInput(); }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
        />
        <button
          type="button"
          onClick={addFromInput}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-100 font-medium"
            >
              {v}
              <button
                type="button"
                onClick={() => onChange(values.filter((x) => x !== v))}
                className="text-blue-400 hover:text-blue-600 leading-none"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function CheckboxGroup({
  label,
  options,
  values,
  onChange,
  required,
}: {
  label: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
}) {
  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-blue-600 ml-1">*</span>}
      </label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm text-left transition-all ${
              values.includes(opt.value)
                ? "bg-blue-50 border-blue-400 text-blue-800 font-medium"
                : "bg-white border-slate-200 text-slate-700 hover:border-blue-300"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                values.includes(opt.value) ? "bg-blue-600 border-blue-600" : "border-slate-300"
              }`}
            >
              {values.includes(opt.value) && <Check className="w-3 h-3 text-white" />}
            </span>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ScanForm() {
  const navigate = useNavigate();
  const initialEmailToken = (() => {
    try {
      return localStorage.getItem("emailToken");
    } catch {
      return null;
    }
  })();
  const [emailToken, setEmailToken] = useState<string | null>(initialEmailToken);
  const [step, setStep] = useState<number>(() => {
    try {
      const s = localStorage.getItem(STORAGE_STEP_KEY);
      const saved = s ? Math.min(parseInt(s, 10), TOTAL_STEPS) : 1;
      return initialEmailToken ? saved : 1;
    } catch {
      return 1;
    }
  });

  const [formData, setFormData] = useState<FirmIntakeData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...DEFAULT_DATA, ...JSON.parse(saved), firmType: "law" } : DEFAULT_DATA;
    } catch {
      return DEFAULT_DATA;
    }
  });

  const [authMode, setAuthMode] = useState<"login" | "otp">("login");
  const [loginPassword, setLoginPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [suggestingCompetitors, setSuggestingCompetitors] = useState(false);
  const [freeReportUsed, setFreeReportUsed] = useState(false);
  const { isAdmin } = useAdminStatus(emailToken);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const [tagInputs, setTagInputs] = useState<Record<string, string>>({});

  // Persist to localStorage whenever step or formData changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      localStorage.setItem(STORAGE_STEP_KEY, String(step));
    } catch {
      // Ignore storage errors
    }
  }, [formData, step]);

  const update = useCallback((patch: Partial<FirmIntakeData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    if (!emailToken && step > 1) {
      setStep(1);
    }
  }, [emailToken, step]);

  // ─── Turnstile ─────────────────────────────────────────────────────────────
  const renderTurnstile = useCallback(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;
    const win = window as unknown as Record<string, unknown>;
    if (win.turnstile) {
      const ts = win.turnstile as { render: (el: HTMLElement, opts: Record<string, unknown>) => void };
      turnstileRef.current.innerHTML = "";
      ts.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "invisible",
        callback: (token: string) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(null),
      });
    }
  }, []);

  useEffect(() => {
    if (step !== 1) return;
    if (!TURNSTILE_SITE_KEY) return;
    const win = window as unknown as Record<string, unknown>;
    if (win.turnstile) { renderTurnstile(); return; }
    const existing = document.querySelector('script[src*="turnstile"]');
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => renderTurnstile();
    document.head.appendChild(script);
  }, [step, renderTurnstile]);

  // ─── Password login handler ────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!formData.email || !loginPassword) {
      setError("Please enter your email and password.");
      return;
    }
    setLoggingIn(true);
    setError(null);
    try {
      const result = await login({ email: formData.email, password: loginPassword });
      setEmailToken(result.emailToken);
      localStorage.setItem("emailToken", result.emailToken);
      setLoginPassword("");
      setStep(2);
    } catch (err) {
      const errObj = err as { status?: number; data?: { error?: string; code?: string } };
      if (errObj.data?.code === "NO_PASSWORD" || errObj.status === 401) {
        const msg = errObj.data?.error ?? "Incorrect email or password.";
        if (errObj.data?.code === "NO_PASSWORD") {
          setAuthMode("otp");
          setError(msg + " Switching to one-time code sign-in.");
        } else {
          setError(msg);
        }
      } else {
        setError(err instanceof Error ? err.message : "Login failed. Please try again.");
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // ─── OTP handlers ──────────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!formData.email) { setError("Please enter your email address."); return; }
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError("Please wait for the security check to complete.");
      return;
    }
    setSendingOtp(true);
    setError(null);
    try {
      await sendOtp({ email: formData.email, turnstileToken: turnstileToken || "" });
      setOtpSent(true);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setVerifyingOtp(true);
    setError(null);
    try {
      const result = await verifyOtp({ email: formData.email, code: otpCode });
      setVerifiedToken(result.verifiedToken);
      setHasPassword(result.hasPassword);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid or expired code.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSubmitPassword = async () => {
    if (!verifiedToken) return;
    if (!hasPassword && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmittingPassword(true);
    setError(null);
    try {
      const result = await submitPassword({ verifiedToken, password });
      setEmailToken(result.emailToken);
      localStorage.setItem("emailToken", result.emailToken);
      setVerifiedToken(null);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect password.");
    } finally {
      setSubmittingPassword(false);
    }
  };

  // ─── Suggest competitors ───────────────────────────────────────────────────
  const handleSuggestCompetitors = async () => {
    const hq = formData.locations.find((l) => l.isHQ) || formData.locations[0];
    if (!hq?.city || !hq?.state) {
      setError("Add your HQ location first (city + state).");
      return;
    }
    setSuggestingCompetitors(true);
    setError(null);
    try {
      const result = await suggestCompetitors({
        firmType: formData.firmType,
        city: hq.city,
        state: hq.state,
        primaryServices: [...formData.individualServices, ...formData.businessServices],
      });
      const existing = formData.directCompetitors.map((c) => c.name.toLowerCase());
      const newOnes = result.suggestions
        .filter((s) => !existing.includes(s.name.toLowerCase()))
        .map((s) => ({ name: s.name, location: s.location || "" }));
      update({ directCompetitors: [...formData.directCompetitors, ...newOnes] });
    } catch {
      setError("Could not suggest competitors — try again.");
    } finally {
      setSuggestingCompetitors(false);
    }
  };

  // ─── Final submission ──────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const token = emailToken;
    if (!token) { setStep(1); return; }

    setSubmitting(true);
    setError(null);

    try {
      const hq = formData.locations.find((l) => l.isHQ) || formData.locations[0];
      const canonicalLocation = hq ? `${hq.city}, ${hq.state}` : "";

      const derivedClientType = formData.servesIndividuals && formData.servesBusiness ? "both" :
        formData.servesIndividuals ? "b2c" : "b2b";
      const allPrimaryServices = [...formData.individualServices, ...formData.businessServices];
      const allDeliverables = [...formData.individualDeliverables, ...formData.businessDeliverables];
      const allSpecialties = [...formData.individualSpecialties, ...formData.businessSpecialties];

      const payload = {
        name: formData.legalName,
        businessType: "law",
        location: canonicalLocation,
        legalName: formData.legalName,
        brandName: formData.brandName || null,
        firmType: "law",
        yearFounded: formData.yearFounded ? parseInt(formData.yearFounded, 10) : null,
        website: formData.website || null,
        partners: formData.partners.length > 0 ? formData.partners : null,
        locations: formData.locations,
        geographicScope: formData.geographicScope || null,
        primaryServices: allPrimaryServices.length > 0 ? allPrimaryServices : null,
        deliverables: allDeliverables.length > 0 ? allDeliverables : null,
        specialties: allSpecialties.length > 0 ? allSpecialties : null,
        clientType: derivedClientType,
        individualServices: formData.individualServices.length > 0 ? formData.individualServices : null,
        individualDeliverables: formData.individualDeliverables.length > 0 ? formData.individualDeliverables : null,
        individualSpecialties: formData.individualSpecialties.length > 0 ? formData.individualSpecialties : null,
        businessServices: formData.businessServices.length > 0 ? formData.businessServices : null,
        businessDeliverables: formData.businessDeliverables.length > 0 ? formData.businessDeliverables : null,
        businessSpecialties: formData.businessSpecialties.length > 0 ? formData.businessSpecialties : null,
        industriesServed: formData.industriesServed.length > 0 ? formData.industriesServed : null,
        clientStages: formData.clientStages.length > 0 ? formData.clientStages : null,
        decisionMakers: formData.decisionMakers.length > 0 ? formData.decisionMakers : null,
        directCompetitors:
          formData.directCompetitors.length > 0
            ? formData.directCompetitors.map((c) => ({ name: c.name, location: c.location || undefined }))
            : null,
        rankings:
          formData.rankings.length > 0
            ? formData.rankings
                .filter((r) => r.source && r.category && r.year)
                .map((r) => ({ source: r.source, category: r.category, year: parseInt(r.year, 10) }))
            : null,
        topGSCQueries: formData.topGSCQueries.length > 0 ? formData.topGSCQueries : null,
      } as unknown as CreateBusinessBody;

      const business = await createBusiness(payload, { headers: { "x-email-token": token } });
      const promptSet = await generatePromptSet(business.id, { headers: { "x-email-token": token } });

      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_STEP_KEY);

      navigate(`/firm/${business.id}/prompts`, { state: { business, promptSet } });
    } catch (err) {
      const errObj = err as { status?: number; data?: { error?: string; entitlementCode?: string } };
      if (errObj.status === 401) {
        setEmailToken(null);
        localStorage.removeItem("emailToken");
        setStep(1);
        setOtpSent(false);
        setOtpCode("");
        setLoginPassword("");
        setAuthMode("login");
        setError("Session expired. Please sign in again.");
      } else if (errObj.status === 402) {
        setFreeReportUsed(true);
      } else {
        setError(
          errObj.data?.error || (err instanceof Error ? err.message : "Failed to create firm profile."),
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Step validation ───────────────────────────────────────────────────────
  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!emailToken;
      case 2: return formData.legalName.trim().length >= 2;
      case 3: return (
        formData.locations.length > 0 &&
        formData.locations.every((l) => l.city.trim() && l.state) &&
        !!formData.geographicScope
      );
      case 4: return formData.servesIndividuals !== null && (
        !formData.servesIndividuals ||
        (formData.individualServices.length >= 1 && formData.individualDeliverables.length >= 1)
      );
      case 5: return formData.servesBusiness !== null &&
        (formData.servesIndividuals === true || formData.servesBusiness === true) &&
        (!formData.servesBusiness || (
          formData.businessServices.length >= 1 &&
          formData.industriesServed.length >= 1 &&
          formData.clientStages.length >= 1 &&
          formData.decisionMakers.length >= 1
        ));
      case 6: return true;
      case 7: return true;
      case 8: return true;
      case 9: return true;
      default: return true;
    }
  };

  const goNext = () => {
    setError(null);
    if (step === 1 && !emailToken) {
      setError("Please sign in before continuing.");
      return;
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  // ─── Step renderers ────────────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⚖️</span>
          <h2 className="text-xl font-bold text-slate-900">Tell us about your immigration law firm</h2>
        </div>
        <p className="text-slate-500 text-sm">We'll use this to generate AI search prompts tailored to your immigration practice.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Legal name <span className="text-blue-600">*</span>
          </label>
          <input
            value={formData.legalName}
            onChange={(e) => update({ legalName: e.target.value })}
            placeholder="Smith & Associates LLP"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Brand / trade name <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            value={formData.brandName}
            onChange={(e) => update({ brandName: e.target.value })}
            placeholder="If different from legal name"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Year founded <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            value={formData.yearFounded}
            onChange={(e) => update({ yearFounded: e.target.value })}
            placeholder="e.g. 2018"
            min="1800"
            max={new Date().getFullYear()}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800">
            Website <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            value={formData.website}
            onChange={(e) => update({ website: e.target.value })}
            placeholder="https://smithassociates.com"
            className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Where are your offices?</h2>
        <p className="text-slate-500 text-sm">Add each office location. Mark your headquarters.</p>
      </div>
      <div className="space-y-3">
        {formData.locations.map((loc, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                Office {idx + 1}
                {loc.isHQ && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                    HQ
                  </span>
                )}
              </span>
              {formData.locations.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    update({ locations: formData.locations.filter((_, i) => i !== idx) })
                  }
                  className="text-slate-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">City *</label>
                <input
                  value={loc.city}
                  onChange={(e) =>
                    update({
                      locations: formData.locations.map((l, i) =>
                        i === idx ? { ...l, city: e.target.value } : l,
                      ),
                    })
                  }
                  placeholder="Austin"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">State *</label>
                <select
                  value={loc.state}
                  onChange={(e) =>
                    update({
                      locations: formData.locations.map((l, i) =>
                        i === idx ? { ...l, state: e.target.value } : l,
                      ),
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-end pb-0.5">
                <button
                  type="button"
                  onClick={() =>
                    update({
                      locations: formData.locations.map((l, i) => ({
                        ...l,
                        isHQ: i === idx,
                      })),
                    })
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all ${
                    loc.isHQ
                      ? "bg-blue-50 border-blue-400 text-blue-700 font-medium"
                      : "border-slate-200 text-slate-600 hover:border-blue-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      loc.isHQ ? "border-blue-600 bg-blue-600" : "border-slate-300"
                    }`}
                  >
                    {loc.isHQ && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  Set as HQ
                </button>
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              locations: [
                ...formData.locations,
                { city: "", state: "", isHQ: false },
              ],
            })
          }
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
        >
          <Plus className="w-4 h-4" /> Add another office
        </button>
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-800 mb-3 block">
          Geographic reach <span className="text-blue-600">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {GEO_SCOPES.map((scope) => (
            <button
              key={scope.value}
              type="button"
              onClick={() => update({ geographicScope: scope.value })}
              className={`px-4 py-3 rounded-xl border-2 text-left transition-all ${
                formData.geographicScope === scope.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-200 bg-white hover:border-blue-300"
              }`}
            >
              <p className="text-sm font-semibold text-slate-800">{scope.label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{scope.sub}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Do you serve individuals and families?</h2>
        <p className="text-slate-500 text-sm">
          People and families seeking immigration help for themselves or loved ones, rather than through an employer sponsor.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([
          { value: true, label: "Yes", sub: "I handle family and individual immigration matters" },
          { value: false, label: "No", sub: "Employer-sponsored matters only" },
        ] as { value: boolean; label: string; sub: string }[]).map(({ value, label, sub }) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => update({ servesIndividuals: value })}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.servesIndividuals === value
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-slate-200 text-slate-700 hover:border-blue-300"
            }`}
          >
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
          </button>
        ))}
      </div>

      {formData.servesIndividuals === true && (
        <>
          <SelectableTagInput
            label="Practice areas for individuals and families"
            required
            values={formData.individualServices}
            onChange={(v) => update({ individualServices: v })}
            placeholder="Add a custom immigration focus..."
            hint="Your main practice areas when serving families and individual immigration clients (3–6 items recommended)"
            suggestions={PRACTICE_AREAS_OPTIONS}
          />
          <SelectableTagInput
            label="Specific immigration services for individuals and families"
            required
            values={formData.individualDeliverables}
            onChange={(v) => update({ individualDeliverables: v })}
            placeholder="Add a custom immigration service..."
            hint="The specific immigration services you deliver to individuals and families. Be precise — these feed directly into your AI prompts."
            suggestions={LEGAL_SERVICES_OPTIONS}
          />
          {formData.individualDeliverables.some((d) => d.split(" ").length <= 2) && (
            <div className="flex gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
              <span className="text-amber-500 shrink-0 mt-0.5">💡</span>
              <span>
                Some services look generic (1–2 words). Consider being more specific — e.g.{" "}
                <em>"marriage green card filing"</em> instead of <em>"green cards"</em>. More specific
                services generate higher-quality prompts.
              </span>
            </div>
          )}
          <SelectableTagInput
            label="Notable specialties for individuals and families"
            values={formData.individualSpecialties}
            onChange={(v) => update({ individualSpecialties: v })}
            placeholder="Add a custom immigration specialty..."
            hint="Optional — niche areas that set you apart when serving families and individual clients."
            suggestions={SPECIALTIES_OPTIONS}
          />
        </>
      )}

      {formData.servesIndividuals === false && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm">
          <span className="text-lg leading-none mt-0.5">→</span>
          <div>
            <p className="font-semibold">Got it — move on to employer-sponsored matters.</p>
            <p className="text-slate-500 mt-0.5">You can set up your employer and business client details in the next step.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Do you handle employer-sponsored immigration matters?</h2>
        <p className="text-slate-500 text-sm">
          Companies and organizations hiring you for work visas, sponsorship, compliance, or global mobility.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {([
          { value: true, label: "Yes", sub: "I represent employers and sponsors" },
          { value: false, label: "No", sub: "Individuals and families only" },
        ] as { value: boolean; label: string; sub: string }[]).map(({ value, label, sub }) => (
          <button
            key={String(value)}
            type="button"
            onClick={() =>
              update({
                servesBusiness: value,
                ...(value === false
                  ? { industriesServed: [], clientStages: [], decisionMakers: [], businessServices: [], businessDeliverables: [], businessSpecialties: [] }
                  : {}),
              })
            }
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              formData.servesBusiness === value
                ? "bg-blue-50 border-blue-500 text-blue-700"
                : "border-slate-200 text-slate-700 hover:border-blue-300"
            }`}
          >
            <div className="font-semibold text-sm">{label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
          </button>
        ))}
      </div>

      {formData.servesBusiness === false && !formData.servesIndividuals && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <p>Please indicate that you serve at least one type of immigration client — families / individuals, employers, or both.</p>
        </div>
      )}

      {formData.servesBusiness === false && formData.servesIndividuals && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm">
          <span className="text-xl leading-none mt-0.5">✓</span>
          <div>
            <p className="font-semibold">Got it — family and individual immigration only.</p>
            <p className="text-blue-600 mt-0.5">We'll generate 10 prompts tailored to people searching for personal immigration help.</p>
          </div>
        </div>
      )}

      {formData.servesBusiness === true && (
        <>
          <SelectableTagInput
            label="Practice areas for employers"
            required
            values={formData.businessServices}
            onChange={(v) => update({ businessServices: v })}
            placeholder="Add a custom immigration focus..."
            hint="Your main practice areas when representing employers and sponsors (3–6 items recommended)"
            suggestions={PRACTICE_AREAS_OPTIONS}
          />
          <SelectableTagInput
            label="Specific immigration services for employers"
            required
            values={formData.businessDeliverables}
            onChange={(v) => update({ businessDeliverables: v })}
            placeholder="Add a custom immigration service..."
            hint="The specific immigration services you deliver to employers. Be precise — these feed directly into your AI prompts."
            suggestions={LEGAL_SERVICES_OPTIONS}
          />
          <SelectableTagInput
            label="Notable specialties for employers"
            values={formData.businessSpecialties}
            onChange={(v) => update({ businessSpecialties: v })}
            placeholder="Add a custom immigration specialty..."
            hint="Optional — niche areas that set you apart when serving employer clients."
            suggestions={SPECIALTIES_OPTIONS}
          />
          <SelectableTagInput
            label="Industries your employer clients are in"
            required
            values={formData.industriesServed}
            onChange={(v) => update({ industriesServed: v })}
            placeholder="Add a custom industry..."
            hint="The sectors where your employer clients operate"
            suggestions={B2B_INDUSTRIES_OPTIONS}
          />
          <CheckboxGroup
            label="Employer client sizes"
            required
            options={CLIENT_STAGES_BUSINESS}
            values={formData.clientStages}
            onChange={(v) => update({ clientStages: v })}
          />
          <CheckboxGroup
            label="Decision makers you work with"
            required
            options={DECISION_MAKERS_BUSINESS}
            values={formData.decisionMakers}
            onChange={(v) => update({ decisionMakers: v })}
          />
        </>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-slate-900">Partners & principals</h2>
          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full font-medium">
            Optional
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Add named partners or principals. Enable "track independently" to monitor each person's AI
          visibility alongside the firm.
        </p>
      </div>
      <div className="space-y-3">
        {formData.partners.map((partner, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" /> Partner {idx + 1}
              </span>
              <button
                type="button"
                onClick={() =>
                  update({ partners: formData.partners.filter((_, i) => i !== idx) })
                }
                className="text-slate-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Full name</label>
                <input
                  value={partner.name}
                  onChange={(e) =>
                    update({
                      partners: formData.partners.map((p, i) =>
                        i === idx ? { ...p, name: e.target.value } : p,
                      ),
                    })
                  }
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Title</label>
                <input
                  value={partner.title}
                  onChange={(e) =>
                    update({
                      partners: formData.partners.map((p, i) =>
                        i === idx ? { ...p, title: e.target.value } : p,
                      ),
                    })
                  }
                  placeholder="Managing Partner"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                update({
                  partners: formData.partners.map((p, i) =>
                    i === idx ? { ...p, trackIndependently: !p.trackIndependently } : p,
                  ),
                })
              }
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-all ${
                partner.trackIndependently
                  ? "bg-blue-50 border-blue-400 text-blue-700 font-medium"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              <span
                className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                  partner.trackIndependently ? "bg-blue-600 border-blue-600" : "border-slate-300"
                }`}
              >
                {partner.trackIndependently && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              Track this person's AI visibility independently
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({
              partners: [...formData.partners, { name: "", title: "", trackIndependently: false }],
            })
          }
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
        >
          <Plus className="w-4 h-4" /> Add a partner
        </button>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-slate-900">Direct competitors</h2>
          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full font-medium">
            Optional
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Saved for future visibility comparison. We never share this data.
        </p>
      </div>
      <div className="space-y-3">
        {formData.directCompetitors.map((comp, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input
                value={comp.name}
                onChange={(e) =>
                  update({
                    directCompetitors: formData.directCompetitors.map((c, i) =>
                      i === idx ? { ...c, name: e.target.value } : c,
                    ),
                  })
                }
                placeholder="Firm name"
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
              <input
                value={comp.location}
                onChange={(e) =>
                  update({
                    directCompetitors: formData.directCompetitors.map((c, i) =>
                      i === idx ? { ...c, location: e.target.value } : c,
                    ),
                  })
                }
                placeholder="City, State (optional)"
                className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                update({ directCompetitors: formData.directCompetitors.filter((_, i) => i !== idx) })
              }
              className="text-slate-400 hover:text-red-500 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() =>
              update({
                directCompetitors: [...formData.directCompetitors, { name: "", location: "" }],
              })
            }
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-2"
          >
            <Plus className="w-4 h-4" /> Add manually
          </button>
          <button
            type="button"
            onClick={handleSuggestCompetitors}
            disabled={suggestingCompetitors || !formData.firmType}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 font-medium disabled:opacity-50"
          >
            {suggestingCompetitors ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bot className="w-4 h-4" />
            )}
            Suggest with AI
          </button>
        </div>
      </div>
    </div>
  );

  const renderStep7 = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-slate-900">Authority signals</h2>
          <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-500 rounded-full font-medium">
            Optional
          </span>
        </div>
        <p className="text-slate-500 text-sm">
          Recognition and rankings that establish credibility in AI training data.
        </p>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" /> Rankings & awards
        </label>
        {formData.rankings.map((ranking, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={ranking.source}
              onChange={(e) =>
                update({
                  rankings: formData.rankings.map((r, i) =>
                    i === idx ? { ...r, source: e.target.value } : r,
                  ),
                })
              }
              placeholder="Source (e.g. Chambers USA)"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
            />
            <input
              value={ranking.category}
              onChange={(e) =>
                update({
                  rankings: formData.rankings.map((r, i) =>
                    i === idx ? { ...r, category: e.target.value } : r,
                  ),
                })
              }
              placeholder="Category"
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
            />
            <input
              value={ranking.year}
              onChange={(e) =>
                update({
                  rankings: formData.rankings.map((r, i) =>
                    i === idx ? { ...r, year: e.target.value } : r,
                  ),
                })
              }
              placeholder="Year"
              className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 bg-white"
            />
            <button
              type="button"
              onClick={() =>
                update({ rankings: formData.rankings.filter((_, i) => i !== idx) })
              }
              className="text-slate-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            update({ rankings: [...formData.rankings, { source: "", category: "", year: "" }] })
          }
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium py-1"
        >
          <Plus className="w-4 h-4" /> Add ranking
        </button>
      </div>
      <TagInput
        label="Directory listings"
        values={formData.directoryListings}
        onChange={(v) => update({ directoryListings: v })}
        placeholder="e.g. Avvo, Martindale-Hubbell, Chambers USA..."
        hint="Where your firm has a verified or featured immigration profile"
      />
      <TagInput
        label="Notable publications / media mentions"
        values={formData.publications}
        onChange={(v) => update({ publications: v })}
        placeholder="e.g. Forbes, Law360, The American Lawyer..."
      />
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" /> Top Google Search Console queries
          <span className="text-slate-400 font-normal text-xs">(optional)</span>
        </label>
        <p className="text-xs text-slate-500">
          Paste the actual search queries that bring traffic to your site. These generate the most
          accurate prompts.
        </p>
        <textarea
          value={formData.topGSCQueries.join("\n")}
          onChange={(e) =>
            update({ topGSCQueries: e.target.value.split("\n").filter((q) => q.trim()) })
          }
          placeholder={"marriage green card lawyer chicago\nh1b visa lawyer for startups dallas\nbest naturalization attorney chicago\n..."}
          rows={4}
          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-white resize-none font-mono"
        />
      </div>
    </div>
  );

  const renderAuthStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Sign in to start your scan</h2>
        <p className="text-slate-500 text-sm">
          Verify your email first. Once you're signed in, you can begin the immigration firm intake.
        </p>
      </div>

      {emailToken ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800">
          <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Signed in</p>
            <p className="text-xs text-green-600 mt-0.5">
              Continuing as <span className="font-medium">{formData.email || "verified user"}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmailToken(null);
              localStorage.removeItem("emailToken");
              setOtpSent(false);
              setOtpCode("");
              setVerifiedToken(null);
              setPassword("");
              setConfirmPassword("");
              setLoginPassword("");
              setAuthMode("login");
              setTurnstileToken(null);
            }}
            className="ml-auto text-xs text-green-600 hover:underline"
          >
            Use different email
          </button>
        </div>
      ) : verifiedToken ? (
        /* ── Password step ── */
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
            <p className="text-sm">
              Email verified — <strong>{formData.email}</strong>
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              {hasPassword ? "Enter your password" : "Create a password"}
              <span className="text-blue-600 ml-1">*</span>
            </label>
            {!hasPassword && (
              <p className="text-xs text-slate-500">Must be at least 8 characters.</p>
            )}
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => { if (e.key === "Enter" && (hasPassword || confirmPassword === password)) handleSubmitPassword(); }}
            />
          </div>
          {!hasPassword && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                Confirm password <span className="text-blue-600">*</span>
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => { if (e.key === "Enter" && confirmPassword === password) handleSubmitPassword(); }}
              />
            </div>
          )}
          <Button
            onClick={handleSubmitPassword}
            disabled={
              submittingPassword ||
              password.length < 8 ||
              (!hasPassword && password !== confirmPassword)
            }
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {submittingPassword ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {hasPassword ? "Signing in..." : "Creating account..."}</>
            ) : (
              <><ShieldCheck className="w-4 h-4 mr-2" /> {hasPassword ? "Sign in" : "Create account"}</>
            )}
          </Button>
          <button
            type="button"
            onClick={() => { setVerifiedToken(null); setOtpSent(false); setOtpCode(""); setPassword(""); setConfirmPassword(""); }}
            className="text-sm text-slate-500 hover:underline block mx-auto"
          >
            Start over
          </button>
        </div>
      ) : authMode === "login" ? (
        /* ── Password login (default) ── */
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              Email address <span className="text-blue-600">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="you@example.com"
              onKeyDown={(e) => { if (e.key === "Enter") document.getElementById("login-password-input")?.focus(); }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              Password <span className="text-blue-600">*</span>
            </label>
            <Input
              id="login-password-input"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => { if (e.key === "Enter" && formData.email && loginPassword) handleLogin(); }}
            />
          </div>
          <Button
            onClick={handleLogin}
            disabled={loggingIn || !formData.email || !loginPassword}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loggingIn ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...</>
            ) : (
              <><ShieldCheck className="w-4 h-4 mr-2" /> Sign in</>
            )}
          </Button>
          <p className="text-center text-sm text-slate-500">
            New here or forgot your password?{" "}
            <button
              type="button"
              onClick={() => { setAuthMode("otp"); setOtpSent(false); setOtpCode(""); setError(null); }}
              className="text-blue-600 hover:underline font-medium"
            >
              Use a one-time email code
            </button>
          </p>
        </div>
      ) : (
        /* ── OTP flow ── */
        <>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              Email address <span className="text-blue-600">*</span>
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => update({ email: e.target.value })}
              placeholder="you@example.com"
              disabled={otpSent}
            />
          </div>

          {!otpSent ? (
            <>
              <Button
                onClick={handleSendOtp}
                disabled={sendingOtp || !formData.email}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {sendingOtp ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending code...</>
                ) : (
                  <><Mail className="w-4 h-4 mr-2" /> Send verification code</>
                )}
              </Button>
              <p className="text-center text-sm text-slate-500">
                Already have a password?{" "}
                <button
                  type="button"
                  onClick={() => { setAuthMode("login"); setError(null); }}
                  className="text-blue-600 hover:underline font-medium"
                >
                  Sign in instead
                </button>
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm">
                  Code sent to <strong>{formData.email}</strong>
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800">Enter 6-digit code</label>
                <Input
                  ref={otpInputRef}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  inputMode="numeric"
                  onKeyDown={(e) => { if (e.key === "Enter" && otpCode.length === 6) handleVerifyOtp(); }}
                />
              </div>
              <Button
                onClick={handleVerifyOtp}
                disabled={otpCode.length !== 6 || verifyingOtp}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {verifyingOtp ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying...</>
                ) : (
                  <><ShieldCheck className="w-4 h-4 mr-2" /> Verify email</>
                )}
              </Button>
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtpCode(""); }}
                className="text-sm text-blue-600 hover:underline block mx-auto"
              >
                Use a different email
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="text-sm text-slate-500 hover:underline block mx-auto"
              >
                {sendingOtp ? "Sending..." : "Didn't receive it? Resend code"}
              </button>
            </div>
          )}
        </>
      )}
      <div ref={turnstileRef} />
    </div>
  );

  const renderStep9 = () => {
    const hq = formData.locations.find((l) => l.isHQ) || formData.locations[0];
    const firmTypeLabel = "Law Firm";

    return (
      <div className="space-y-6">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-7 h-7 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Ready to generate your prompts?</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            We'll create{" "}
            <strong className="text-slate-700">
              {formData.servesIndividuals && formData.servesBusiness ? "up to 20" : "10"} locked search prompts
            </strong>{" "}
            tailored to <strong className="text-slate-700">{formData.legalName}</strong> using a combinatorial engine
            {formData.servesIndividuals && formData.servesBusiness ? " — 10 for families / individuals and 10 for employers" : ""}.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Profile summary</p>
          </div>
          <div className="divide-y divide-slate-100">
            {[
              {
                icon: <Briefcase className="w-4 h-4 text-slate-400" />,
                label: "Firm",
                value: `${formData.legalName}${formData.brandName ? ` (${formData.brandName})` : ""} — ${firmTypeLabel}`,
              },
              {
                icon: <MapPin className="w-4 h-4 text-slate-400" />,
                label: "HQ",
                value: hq ? `${hq.city}, ${hq.state}` : "—",
              },
              {
                icon: <ChevronRight className="w-4 h-4 text-slate-400" />,
                label: "Practice areas",
                value: (() => {
                  const all = [...formData.individualServices, ...formData.businessServices];
                  return all.length > 0
                    ? all.slice(0, 3).join(", ") + (all.length > 3 ? ` +${all.length - 3} more` : "")
                    : "—";
                })(),
              },
              {
                icon: <Users className="w-4 h-4 text-slate-400" />,
                label: "Client types",
                value: [
                  formData.servesIndividuals ? "Families / Individuals" : null,
                  formData.servesBusiness ? "Employers" : null,
                ].filter(Boolean).join(" & ") || "—",
              },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 px-4 py-3">
                <span className="mt-0.5">{icon}</span>
                <span className="text-xs font-semibold text-slate-500 w-16 shrink-0 mt-0.5">
                  {label}
                </span>
                <span className="text-sm text-slate-700">{value || "—"}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-xs text-blue-700 leading-relaxed">
            <strong>Once generated, your prompts are locked</strong> — they represent a snapshot of
            your firm profile and are used consistently across AI scanning sessions. You can regenerate
            if you update your profile later.
          </p>
        </div>

        {freeReportUsed ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
            <p className="text-sm font-semibold text-amber-900">You've used your 1 free report</p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Every account gets one free AI visibility report. To create additional immigration firm profiles
              and run ongoing scans, you'll need a subscription.
            </p>
            <Button
              onClick={() => navigate("/pricing")}
              size="lg"
              className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6"
            >
              See subscription plans <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 text-base py-6"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating prompts...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" /> Generate 10 Prompts
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  const stepRenderers = [
    renderAuthStep,
    renderStep1,
    renderStep2,
    renderStep3,
    renderStep4,
    renderStep5,
    renderStep6,
    renderStep7,
    renderStep9,
  ];

  const currentRenderer = stepRenderers[step - 1];
  const isLastStep = step === TOTAL_STEPS;
  const isOptionalStep = step >= 6 && step <= 8;
  const showNextButton = !isLastStep && step !== 1;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-600">
                Step {step} of {TOTAL_STEPS} — {STEP_LABELS[step - 1]}
              </p>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const filled = { ...DEMO_FIRM, email: formData.email };
                      setFormData(filled);
                      try {
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(filled));
                      } catch { /* ignore */ }
                      setStep(2);
                    }}
                    className="text-xs text-amber-600 hover:text-amber-700 font-medium underline underline-offset-2"
                  >
                    Fill with demo data
                  </button>
                )}
                <p className="text-xs text-slate-400">{Math.round((step / TOTAL_STEPS) * 100)}% complete</p>
              </div>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
            <div className="flex gap-1 mt-2">
              {STEP_LABELS.map((label, idx) => (
                <div
                  key={label}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    idx + 1 < step
                      ? "bg-blue-600"
                      : idx + 1 === step
                      ? "bg-blue-400"
                      : "bg-slate-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-slate-100 overflow-hidden">
            <div className="px-6 py-6 md:px-8 md:py-7">{currentRenderer?.()}</div>

            {/* Error */}
            {error && (
              <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="px-6 pb-6 md:px-8 md:pb-8 flex items-center gap-3">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={goBack}
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              )}
              {showNextButton && (
                <Button
                  onClick={goNext}
                  disabled={!canProceed()}
                  className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isOptionalStep ? "Skip or continue" : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              {step === 1 && emailToken && (
                <Button
                  onClick={goNext}
                  className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Save hint */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Your progress is saved automatically in this browser.
          </p>
        </div>
      </div>
    </Layout>
  );
}
