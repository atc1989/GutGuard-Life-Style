import { z } from "zod";

export const STORY_FILTERS = ["pending", "approved", "flagged", "all"] as const;
export type StoryFilter = (typeof STORY_FILTERS)[number];

export const STORY_ACTIONS = ["approved", "flagged"] as const;
export type StoryAction = (typeof STORY_ACTIONS)[number];

export const storyDirectoryQuerySchema = z.object({
  q: z.string().trim().max(80).default(""),
  filter: z.enum(STORY_FILTERS).default("pending"),
});

export type StoryDirectoryQuery = z.output<typeof storyDirectoryQuerySchema>;

export function parseStoryDirectoryQuery(input: {
  q?: string | string[];
  filter?: string | string[];
}): StoryDirectoryQuery {
  const parsed = storyDirectoryQuerySchema.safeParse({
    q: Array.isArray(input.q) ? input.q[0] : input.q ?? "",
    filter:
      (Array.isArray(input.filter) ? input.filter[0] : input.filter) || "pending",
  });
  return parsed.success ? parsed.data : { q: "", filter: "pending" };
}

export const moderateStoriesSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  action: z.enum(STORY_ACTIONS),
});
