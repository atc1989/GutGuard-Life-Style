import { z } from "zod";

const phMobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .pipe(
    z
      .string()
      .regex(
        /^(09\d{9}|\+639\d{9})$/,
        "Enter a valid PH mobile number",
      ),
  );

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name")
    .max(80, "Name is too long"),
  mobile: phMobile,
});

export type RegisterValues = z.input<typeof registerSchema>;
export type RegisterParsed = z.output<typeof registerSchema>;
