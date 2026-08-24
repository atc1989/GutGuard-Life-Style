import { z } from "zod";

export const PASSWORD_HINT =
  "At least 8 characters, with an uppercase letter, a lowercase letter, and a number.";

export const phMobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(09\d{9}|\+639\d{9})$/, "Enter a valid PH mobile (09… or +639…)"),
  );

/** Normalize a validated PH mobile number to E.164 (`+639…`). */
export function toE164Phone(mobile: string) {
  const compact = mobile.replace(/[\s()-]/g, "");
  if (compact.startsWith("+63")) return compact;
  return `+63${compact.slice(1)}`;
}

/** Auth identity for email/password when the booth only collects mobile. */
export function authEmailFromMobile(mobile: string): string {
  return `${toE164Phone(mobile).replace(/^\+/, "")}@members.gutguard.ph`;
}

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/\d/, "Include a number");

export const authRegisterSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(80, "Name is too long"),
  mobile: phMobile,
  password: passwordSchema,
});

export type AuthRegisterValues = z.input<typeof authRegisterSchema>;
export type AuthRegisterParsed = z.output<typeof authRegisterSchema>;
export type AuthRegisterField = keyof AuthRegisterValues;
