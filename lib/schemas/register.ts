import { z } from "zod";

const phMobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(
    z
      .string()
      .regex(/^(09\d{9}|\+639\d{9})$/, "Enter a valid PH mobile number"),
  );

/** Normalize a validated PH mobile number to E.164 (`+639…`). */
export function toE164Phone(mobile: string): string {
  const compact = mobile.replace(/[\s()-]/g, "");
  if (compact.startsWith("+63")) return compact;
  return `+63${compact.slice(1)}`;
}

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "Name is too long"),
  mobile: phMobile,
  email: z.string().trim().email("Enter a valid email"),
});

export const otpSchema = z.object({
  email: z.string().trim().email(),
  token: z.string().trim().min(6, "Enter the 6-digit code").max(8),
});

export type RegisterValues = z.input<typeof registerSchema>;
export type RegisterParsed = z.output<typeof registerSchema>;
