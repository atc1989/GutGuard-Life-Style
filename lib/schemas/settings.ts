import { z } from "zod";
// Relative and extensioned, like the other modules `npm test` loads directly:
// the `@/` alias is a bundler feature and bare node cannot resolve it.
import { authRegisterSchema, phMobileSchema } from "./auth.ts";

export const settingsSchema = z.object({
  notifications: z.boolean(),
  capsulesPerDay: z.number().int().min(2).max(3),
});

export type SettingsValues = z.infer<typeof settingsSchema>;

/**
 * Change 5 — the name and mobile a member can edit after registering.
 *
 * Both required, on the owner's call: a member cannot save a name and leave the
 * mobile blank, which is the same bar register sets. The rules are register's
 * own, reused rather than restated, so the two forms cannot drift into
 * disagreeing about what a name or a PH number is.
 */
export const profileSchema = z.object({
  name: authRegisterSchema.shape.name,
  mobile: phMobileSchema,
});

export type ProfileValues = z.input<typeof profileSchema>;
