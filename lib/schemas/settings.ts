import { z } from "zod";

export const settingsSchema = z.object({
  notifications: z.boolean(),
  capsulesPerDay: z.number().int().min(2).max(3),
});

export type SettingsValues = z.infer<typeof settingsSchema>;
