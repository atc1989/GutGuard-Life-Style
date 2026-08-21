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
