/** Staging Confirm signup emails a 6-digit code (GEMA partner template), not a link. */

export const EMAIL_CODE_LENGTH = 6;

export const EMAIL_CODE_COPY =
  "Enter the 6-digit code from your Gutguard email, then continue.";

export const EMAIL_CODE_HINT =
  "The message may say partner sign-in. Type that number here — not as your password.";

export function normalizeEmailCode(value: string) {
  return value.replace(/\D/g, "");
}

export function isEmailUnconfirmedMessage(message: string) {
  const lower = message.toLowerCase();
  return lower.includes("not confirmed") || lower.includes("email_not_confirmed");
}

export function siteOrigin() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}
