import { z } from "zod";

export const ORDER_FILTERS = ["all", "pending", "reconciled", "failed"] as const;
export type OrderFilter = (typeof ORDER_FILTERS)[number];

export const orderDirectoryQuerySchema = z.object({
  q: z.string().trim().max(80).default(""),
  filter: z.enum(ORDER_FILTERS).default("all"),
});

export type OrderDirectoryQuery = z.output<typeof orderDirectoryQuerySchema>;

export function parseOrderDirectoryQuery(input: {
  q?: string | string[];
  filter?: string | string[];
}): OrderDirectoryQuery {
  const parsed = orderDirectoryQuerySchema.safeParse({
    q: Array.isArray(input.q) ? input.q[0] : input.q ?? "",
    filter:
      (Array.isArray(input.filter) ? input.filter[0] : input.filter) || "all",
  });
  return parsed.success ? parsed.data : { q: "", filter: "all" };
}

export const queueOrderSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(6),
});
