import { z } from "zod";

export const MEMBER_FILTERS = [
  "all",
  "invited",
  "claimed",
  "active",
  "base",
  "gema",
  "admin",
] as const;

export type MemberFilter = (typeof MEMBER_FILTERS)[number];

export const memberDirectoryQuerySchema = z.object({
  q: z
    .string()
    .trim()
    .max(80, "Search is too long")
    .default(""),
  filter: z.enum(MEMBER_FILTERS).default("all"),
});

export type MemberDirectoryQuery = z.output<typeof memberDirectoryQuerySchema>;

export function parseMemberDirectoryQuery(input: {
  q?: string | string[];
  filter?: string | string[];
}): MemberDirectoryQuery {
  const raw = {
    q: Array.isArray(input.q) ? input.q[0] : input.q,
    filter: Array.isArray(input.filter) ? input.filter[0] : input.filter,
  };
  const parsed = memberDirectoryQuerySchema.safeParse({
    q: raw.q ?? "",
    filter: raw.filter && raw.filter.length > 0 ? raw.filter : "all",
  });
  if (!parsed.success) {
    return { q: "", filter: "all" };
  }
  return parsed.data;
}
