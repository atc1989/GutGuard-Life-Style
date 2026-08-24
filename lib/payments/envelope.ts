import { z } from "zod";

export const PAYMENT_PROVIDERS = ["maya", "bank"] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export const ORDER_STATUSES = ["pending", "reconciled", "failed"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type PaymentSignal = "success" | "failure" | "pending";

const SUCCESS = new Set([
  "PAYMENT_SUCCESS",
  "CHECKOUT_SUCCESS",
  "PAID",
  "SUCCESS",
]);

const FAILURE = new Set([
  "PAYMENT_FAILED",
  "PAYMENT_EXPIRED",
  "PAYMENT_CANCELLED",
  "CHECKOUT_FAILED",
  "CHECKOUT_DROPOUT",
  "CHECKOUT_CANCELLED",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
]);

const pesoOrCentavos = z.union([z.string(), z.number()]);

export const webhookEnvelopeSchema = z
  .object({
    id: z.string().min(1).optional(),
    eventId: z.string().min(1).optional(),
    provider: z.enum(PAYMENT_PROVIDERS).optional(),
    paymentStatus: z.string().optional(),
    status: z.string().optional(),
    isPaid: z.boolean().optional(),
    requestReferenceNumber: z.string().optional(),
    reference: z.string().optional(),
    amount: pesoOrCentavos.optional(),
    currency: z.string().optional(),
    totalAmount: z
      .object({
        value: pesoOrCentavos.optional(),
        currency: z.string().optional(),
      })
      .optional(),
  })
  .passthrough();

export type WebhookEnvelope = z.output<typeof webhookEnvelopeSchema>;

export type NormalizedWebhook = {
  provider: PaymentProvider;
  eventId: string;
  reference: string | null;
  signal: PaymentSignal;
  amountCentavos: number | null;
  currency: string;
  paymentStatus: string;
};

export function signalFromPaymentStatus(
  status: string,
  isPaid?: boolean,
): PaymentSignal {
  const upper = status.trim().toUpperCase();
  if (isPaid === true || SUCCESS.has(upper)) return "success";
  if (FAILURE.has(upper)) return "failure";
  return "pending";
}

/** Maya sends pesos (`4500.00`). Integers ≥ 100_000 are treated as centavos. */
export function toCentavos(amount: unknown): number | null {
  if (typeof amount === "number" && Number.isFinite(amount)) {
    if (Number.isInteger(amount) && Math.abs(amount) >= 100_000) {
      return Math.trunc(amount);
    }
    return Math.round(amount * 100);
  }
  if (typeof amount === "string" && amount.trim()) {
    const parsed = Number(amount.replace(/,/g, ""));
    if (!Number.isFinite(parsed)) return null;
    if (!amount.includes(".") && Math.abs(parsed) >= 100_000) {
      return Math.trunc(parsed);
    }
    return Math.round(parsed * 100);
  }
  return null;
}

export function normalizeWebhook(
  input: unknown,
  fallbackProvider: PaymentProvider = "maya",
): NormalizedWebhook | null {
  const parsed = webhookEnvelopeSchema.safeParse(input);
  if (!parsed.success) return null;
  const data = parsed.data;
  const eventId = data.id || data.eventId;
  if (!eventId) return null;
  const paymentStatus = data.paymentStatus || data.status || "";
  const amount = data.totalAmount?.value ?? data.amount;
  return {
    provider: data.provider ?? fallbackProvider,
    eventId,
    reference: data.requestReferenceNumber || data.reference || null,
    signal: signalFromPaymentStatus(paymentStatus, data.isPaid),
    amountCentavos: toCentavos(amount),
    currency: data.totalAmount?.currency || data.currency || "PHP",
    paymentStatus: paymentStatus || (data.isPaid ? "PAYMENT_SUCCESS" : "UNKNOWN"),
  };
}

export function redactWebhook(input: NormalizedWebhook) {
  return {
    id: input.eventId,
    provider: input.provider,
    reference: input.reference,
    paymentStatus: input.paymentStatus,
    amountCentavos: input.amountCentavos,
    currency: input.currency,
    signal: input.signal,
  };
}
