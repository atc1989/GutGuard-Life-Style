import { z } from "zod";

export const storyStatusSchema = z.enum(["pending", "approved", "rejected"]);

export type StoryStatus = z.infer<typeof storyStatusSchema>;

export const moderateStoriesSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
  action: z.enum(["approve", "reject"]),
  reason: z.string().trim().max(280).optional(),
});

export type ModerateStoriesInput = z.infer<typeof moderateStoriesSchema>;
