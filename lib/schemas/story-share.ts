import { z } from "zod";

export const STORY_STEPS = ["Who", "Change", "Record", "Review", "Sign"] as const;

export const storyShareSchema = z
  .object({
    about: z.enum(["self", "other"]),
    relationship: z.string().trim().max(80).optional(),
    days: z.string().trim().min(1, "Add how many days"),
    capsules: z.string().trim().min(1, "Add capsules per day"),
    outcomes: z.array(z.string()).min(1, "Tap all that apply"),
    statement: z.string().trim().max(280).optional(),
    evidenceName: z.string().trim().max(160).optional(),
    consentUpload: z.boolean(),
    consentPublic: z
      .boolean()
      .refine((value) => value, "Confirm public-use consent"),
    consentTruth: z
      .boolean()
      .refine((value) => value, "Confirm this story is truthful"),
    consentSupplement: z
      .boolean()
      .refine(
        (value) => value,
        "Confirm you understand Gutguard is a food supplement",
      ),
    signature: z.string().trim().min(2, "Type your full name"),
  })
  .superRefine((value, ctx) => {
    if (value.about === "other" && !value.relationship?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["relationship"],
        message: "Add your relationship",
      });
    }
    if (value.evidenceName && !value.consentUpload) {
      ctx.addIssue({
        code: "custom",
        path: ["consentUpload"],
        message: "Confirm upload consent before attaching evidence",
      });
    }
  });

export type StoryShareValues = z.input<typeof storyShareSchema>;

export const STORY_STEP_FIELDS: Array<Array<keyof StoryShareValues>> = [
  ["about", "relationship"],
  ["outcomes", "statement"],
  ["days", "capsules", "evidenceName", "consentUpload"],
  [],
  [
    "consentPublic",
    "consentTruth",
    "consentSupplement",
    "signature",
  ],
];

export function emptyStoryDraft(capsulesPerDay: number): StoryShareValues {
  return {
    about: "self",
    relationship: "",
    days: "",
    capsules: String(capsulesPerDay),
    outcomes: [],
    statement: "",
    evidenceName: "",
    consentUpload: false,
    consentPublic: false,
    consentTruth: false,
    consentSupplement: false,
    signature: "",
  };
}

export function namesMatch(typed: string, memberName: string) {
  const a = typed.trim().toLowerCase();
  const b = memberName.trim().toLowerCase();
  if (!b) return a.length >= 2;
  return a === b;
}

export function firstInvalidField(
  errors: Partial<Record<string, unknown>>,
  fields: Array<keyof StoryShareValues>,
) {
  return fields.find((field) => errors[field]);
}
