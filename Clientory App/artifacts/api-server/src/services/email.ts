import { Resend } from "resend";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }
    _resend = new Resend(key);
  }
  return _resend;
}

const EMAIL_FROM = process.env.EMAIL_FROM || "Clientory <onboarding@resend.dev>";

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const { data, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: "Your Clientory verification code",
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px;">Clientory</h1>
        <p style="font-size: 16px; color: #64748b; margin: 0 0 32px;">AI Visibility Scanner</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="font-size: 14px; color: #475569; margin: 0 0 16px;">Your verification code is:</p>
          <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #6c47ff; margin: 0 0 16px;">${code}</p>
          <p style="font-size: 13px; color: #94a3b8; margin: 0;">This code expires in 10 minutes.</p>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin: 24px 0 0; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
      </div>
    `,
  });
  if (error) {
    console.error("Resend OTP error:", JSON.stringify(error));
    throw new Error(`Email delivery failed: ${error.message}`);
  }
  console.log("OTP email sent:", data?.id, "to:", to, "from:", EMAIL_FROM);
}

export interface ProviderStat {
  name: string;
  mentions: number;
  total: number;
}

export interface PromptRow {
  text: string;
  openai: boolean;
  anthropic: boolean;
  gemini: boolean;
}

export interface AudienceSection {
  audience: "individual" | "business";
  providerStats: ProviderStat[];
  promptRows: PromptRow[];
}

interface AudienceScores {
  individual: number;
  business: number;
}

interface ReportEmailData {
  businessName: string;
  businessType: string;
  location: string;
  score: number;
  scanId: number;
  appBaseUrl: string;
  providerStats: ProviderStat[];
  recommendations: string[];
  audienceSections?: AudienceSection[];
  audienceScores?: AudienceScores;
}

function buildProviderTable(stats: ProviderStat[]): string {
  const rows = stats.map((p) => {
    const rate = p.total > 0 ? Math.round((p.mentions / p.total) * 100) : 0;
    return `<tr>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${p.name}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px;">${p.mentions} / ${p.total}</td>
      <td style="padding: 8px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600; font-size: 13px;">${rate}%</td>
    </tr>`;
  }).join("");

  return `
    <table style="width: 100%; font-size: 13px; color: #475569; border-collapse: collapse; margin-bottom: 16px;">
      <tr style="background: #f1f5f9;">
        <th style="padding: 8px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0; font-size: 12px;">Provider</th>
        <th style="padding: 8px 12px; text-align: center; font-weight: 600; border-bottom: 2px solid #e2e8f0; font-size: 12px;">Mentions</th>
        <th style="padding: 8px 12px; text-align: center; font-weight: 600; border-bottom: 2px solid #e2e8f0; font-size: 12px;">Rate</th>
      </tr>
      ${rows}
    </table>`;
}

function buildPromptTable(promptRows: PromptRow[]): string {
  if (promptRows.length === 0) return "";

  const rows = promptRows.map((p) => {
    const truncated = p.text.length > 90 ? p.text.slice(0, 87) + "…" : p.text;
    const check = (v: boolean) =>
      v
        ? `<span style="color: #22c55e; font-weight: 700;">✓</span>`
        : `<span style="color: #ef4444; font-weight: 700;">✗</span>`;
    return `<tr>
      <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #334155; max-width: 280px;">${truncated}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${check(p.openai)}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${check(p.anthropic)}</td>
      <td style="padding: 7px 10px; border-bottom: 1px solid #f1f5f9; text-align: center;">${check(p.gemini)}</td>
    </tr>`;
  }).join("");

  return `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr style="background: #f8fafc;">
        <th style="padding: 7px 10px; text-align: left; font-size: 11px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.04em;">Prompt</th>
        <th style="padding: 7px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">ChatGPT</th>
        <th style="padding: 7px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Claude</th>
        <th style="padding: 7px 10px; text-align: center; font-size: 11px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0;">Gemini</th>
      </tr>
      ${rows}
    </table>`;
}

const AUDIENCE_LABELS: Record<"individual" | "business", string> = {
  individual: "Individual Clients",
  business: "Business Clients",
};

const AUDIENCE_BADGE_COLORS: Record<"individual" | "business", string> = {
  individual: "#7c3aed",
  business: "#0ea5e9",
};

function buildAudienceSectionHtml(section: AudienceSection): string {
  const color = AUDIENCE_BADGE_COLORS[section.audience];
  const label = AUDIENCE_LABELS[section.audience];
  return `
    <div style="margin-bottom: 32px; background: #fafafa; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px;">
      <div style="margin-bottom: 14px;">
        <span style="display: inline-block; background: ${color}18; border: 1px solid ${color}44; border-radius: 6px; padding: 3px 10px;">
          <span style="font-size: 11px; font-weight: 700; color: ${color}; text-transform: uppercase; letter-spacing: 0.06em;">${label}</span>
        </span>
      </div>
      ${buildProviderTable(section.providerStats)}
      ${buildPromptTable(section.promptRows)}
    </div>`;
}

export async function sendReportEmail(to: string, data: ReportEmailData): Promise<void> {
  const { businessName, businessType, location, score, scanId, appBaseUrl, providerStats, recommendations, audienceSections, audienceScores } = data;
  const resultsUrl = `${appBaseUrl}/scan/${scanId}/results`;

  let scoreColor = "#ef4444";
  let scoreLabel = "Low";
  if (score >= 40) { scoreColor = "#f59e0b"; scoreLabel = "Moderate"; }
  if (score >= 70) { scoreColor = "#22c55e"; scoreLabel = "Good"; }

  const top3 = recommendations.slice(0, 3);
  const recItems = top3.map((r, i) =>
    `<tr><td style="padding: 8px 0; color: #475569; font-size: 14px;">${i + 1}. ${r}</td></tr>`
  ).join("");

  const hasAudienceSections = audienceSections && audienceSections.length > 1;
  const audienceBreakdownHtml = hasAudienceSections && audienceScores
    ? `<div style="margin-top: 14px; display: flex; justify-content: center; gap: 24px;">
        <div style="text-align: center;">
          <p style="font-size: 11px; font-weight: 600; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 4px;">Individual</p>
          <p style="font-size: 22px; font-weight: 700; color: #7c3aed; margin: 0;">${audienceScores.individual}%</p>
        </div>
        <div style="width: 1px; background: #e2e8f0; margin: 4px 0;"></div>
        <div style="text-align: center;">
          <p style="font-size: 11px; font-weight: 600; color: #0ea5e9; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 4px;">Business</p>
          <p style="font-size: 22px; font-weight: 700; color: #0ea5e9; margin: 0;">${audienceScores.business}%</p>
        </div>
      </div>`
    : "";

  let performanceSection: string;
  if (hasAudienceSections) {
    performanceSection = `
      <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 32px 0 12px;">Performance by AI</h2>
      ${audienceSections!.map(buildAudienceSectionHtml).join("")}`;
  } else {
    const rows = providerStats.map((p) => {
      const rate = p.total > 0 ? Math.round((p.mentions / p.total) * 100) : 0;
      return `<tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">${p.name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${p.mentions} / ${p.total}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 600;">${rate}%</td>
      </tr>`;
    }).join("");
    performanceSection = `
      <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 32px 0 12px;">Performance by AI</h2>
      <table style="width: 100%; font-size: 14px; color: #475569; border-collapse: collapse; margin-bottom: 24px;">
        <tr style="background: #f1f5f9;">
          <th style="padding: 10px 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Provider</th>
          <th style="padding: 10px 12px; text-align: center; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Mentions</th>
          <th style="padding: 10px 12px; text-align: center; font-weight: 600; border-bottom: 2px solid #e2e8f0;">Rate</th>
        </tr>
        ${rows}
      </table>`;
  }

  await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Your AI Visibility Report: ${businessName} — ${score}%`,
    html: `
      <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 24px;">
        <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px;">Clientory</h1>
        <p style="font-size: 16px; color: #64748b; margin: 0 0 32px;">AI Visibility Scanner</p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center; margin-bottom: 24px;">
          <p style="font-size: 14px; color: #475569; margin: 0 0 8px;">Your AI Visibility Score</p>
          <p style="font-size: 56px; font-weight: 700; color: ${scoreColor}; margin: 0;">${score}%</p>
          <p style="font-size: 14px; color: ${scoreColor}; font-weight: 600; margin: 4px 0 0;">${scoreLabel} Visibility</p>
          ${audienceBreakdownHtml}
        </div>

        <table style="width: 100%; font-size: 14px; color: #475569; margin-bottom: 24px;">
          <tr><td style="padding: 6px 0; font-weight: 600;">Law firm</td><td style="padding: 6px 0;">${businessName}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600;">Type</td><td style="padding: 6px 0;">${businessType}</td></tr>
          <tr><td style="padding: 6px 0; font-weight: 600;">Location</td><td style="padding: 6px 0;">${location}</td></tr>
        </table>

        ${performanceSection}

        ${top3.length > 0 ? `
        <h2 style="font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 32px 0 12px;">Top Recommendations</h2>
        <table style="width: 100%; margin-bottom: 24px;">
          ${recItems}
        </table>
        ` : ""}

        <div style="text-align: center;">
          <a href="${resultsUrl}" style="display: inline-block; background: #6c47ff; color: white; font-weight: 600; font-size: 15px; padding: 14px 32px; border-radius: 10px; text-decoration: none;">View Full Report</a>
        </div>

        <p style="font-size: 12px; color: #94a3b8; margin: 32px 0 0; text-align: center;">You received this because you ran a visibility scan on Clientory.</p>
      </div>
    `,
  });
}
