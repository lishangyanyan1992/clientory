const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || "";
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

interface TurnstileResult {
  success: boolean;
  errorCodes: string[];
}

export function isTurnstileConfigured(): boolean {
  return !!TURNSTILE_SECRET_KEY;
}

export async function verifyTurnstile(token: string, remoteIp?: string): Promise<TurnstileResult> {
  if (!TURNSTILE_SECRET_KEY) {
    return { success: true, errorCodes: [] };
  }

  const body: Record<string, string> = {
    secret: TURNSTILE_SECRET_KEY,
    response: token,
  };
  if (remoteIp) body.remoteip = remoteIp;

  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body),
  });

  const data = (await res.json()) as { success: boolean; "error-codes"?: string[] };
  return {
    success: data.success,
    errorCodes: data["error-codes"] ?? [],
  };
}
