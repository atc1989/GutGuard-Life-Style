import { looksLikeEmail, normalizeIdentifier } from "../one-account/client.ts";

/**
 * Change 4c (D13) — "A OneGrinders member never registers at all. The guild
 * username *is* the account."
 *
 * The register form asks for an email. A guild member who types their username
 * there is not making a mistake about the form; they are telling us who they
 * are with the only credential they have. The form's job is to notice and send
 * them to sign-in, not to reject them.
 *
 * This cannot create a second account, and that is enforced twice over:
 * `authRegisterSchema` refuses anything without an `@`, so a username can
 * never reach `signUp` — there is a test asserting exactly that, because the
 * guard matters more than the prompt.
 */

/** Anything without an `@` is a OneGrinders username (`04 - UX`, one field two credentials). */
export function looksLikeGuildUsername(value: string | null | undefined): boolean {
  if (typeof value !== "string") return false;
  const trimmed = normalizeIdentifier(value);
  // Too short to be a deliberate identifier — someone mid-keystroke on an
  // email should not be told they are in the wrong place.
  if (trimmed.length < 3) return false;
  if (looksLikeEmail(trimmed)) return false;
  // A half-typed address is still an address being typed.
  if (trimmed.endsWith(".") || trimmed.includes(" ")) return false;
  return true;
}

/** The prompt, kept beside the rule it belongs to so the two change together. */
export const GUILD_PROMPT = "Already a OneGrinders member?";
export const GUILD_PROMPT_HELP =
  "Your guild username is your Gutguard account. Sign in with it — you do not need to register.";
export const GUILD_PROMPT_ACTION = "Sign in with my username";
