import { z } from "zod";

export const orderStatusSchema = z.enum([
  "pending",
  "reconciled",
  "failed",
  "cancelled",
]);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const queueOrderSchema = z.object({
  qty: z.number().int().min(1).max(6),
  amountPesos: z.number().int().positive(),
});

export const recoverOrderSchema = z.object({
  orderId: z.string().uuid(),
});
