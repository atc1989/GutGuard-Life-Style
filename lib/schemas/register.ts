import { z } from "zod";
import { phMobile } from "@/lib/schemas/auth";

export { toE164Phone } from "@/lib/schemas/auth";

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
