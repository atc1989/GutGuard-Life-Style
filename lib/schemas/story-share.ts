import { z } from "zod";

export const storyShareSchema = z.object({
  about: z.enum(["self", "other"]),
  relationship: z.string().trim().max(80).optional(),
  days: z.string().trim().min(1, "Add how many days"),
  capsules: z.string().trim().min(1, "Add capsules per day"),
  outcomes: z.array(z.string()).min(1, "Tap all that apply"),
  consentTruth: z
    .boolean()
    .refine((value) => value, "Confirm this story is truthful"),
  consentSupplement: z
    .boolean()
    .refine(
      (value) => value,
      "Confirm you understand Gutguard is a food supplement",
    ),
});

export type StoryShareValues = z.input<typeof storyShareSchema>;
