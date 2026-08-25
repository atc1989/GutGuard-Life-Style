import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_HINT =
  "At least 8 characters, with uppercase, lowercase, and a number.";

/** Normalize a validated PH mobile number to E.164 (`+639…`). */
export function toE164Phone(mobile: string) {
  const compact = mobile.replace(/[\s()-]/g, "");
  if (compact.startsWith("+63")) return compact;
  return `+63${compact.slice(1)}`;
}

const phMobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(09\d{9}|\+639\d{9})$/, "Enter a valid PH mobile number"),
  )
  .transform(toE164Phone);

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(72, "Password is too long")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number");

const emailSchema = z.string().trim().email("Enter a valid email");

export const authRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(80, "Name is too long"),
  mobile: phMobile,
  email: emailSchema,
  password: passwordSchema,
});

export const authSignInSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, "Enter your password")
    .max(72, "Password is too long"),
});

export type AuthRegisterValues = z.input<typeof authRegisterSchema>;
export type AuthRegisterParsed = z.output<typeof authRegisterSchema>;
export type AuthSignInValues = z.input<typeof authSignInSchema>;

export const EMAIL_TAKEN = "This email already has a card. Sign in instead.";
export const MOBILE_TAKEN =
  "This mobile number already has a card. Sign in instead.";
export const IDENTITY_TAKEN =
  "This email and mobile already have a card. Sign in instead.";

/** 09… and +63… forms so a stored local number still matches E.164 input. */
export function mobileAliases(mobile: string): string[] {
  const compact = mobile.replace(/[\s()-]/g, "");
  const aliases = new Set([compact]);
  if (compact.startsWith("+63") && compact.length === 13) {
    aliases.add(`0${compact.slice(3)}`);
  } else if (compact.startsWith("09") && compact.length === 11) {
    aliases.add(`+63${compact.slice(1)}`);
  }
  return [...aliases];
}

export function duplicateIdentityResult(
  emailTaken: boolean,
  mobileTaken: boolean,
): { ok: false; error: string; fieldErrors: Record<string, string> } | null {
  if (!emailTaken && !mobileTaken) return null;
  const fieldErrors: Record<string, string> = {};
  if (emailTaken) fieldErrors.email = EMAIL_TAKEN;
  if (mobileTaken) fieldErrors.mobile = MOBILE_TAKEN;
  return {
    ok: false,
    error: emailTaken && mobileTaken ? IDENTITY_TAKEN : emailTaken ? EMAIL_TAKEN : MOBILE_TAKEN,
    fieldErrors,
  };
}
