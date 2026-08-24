import "server-only";

import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  normalizeWebhook,
  redactWebhook,
  type PaymentProvider,
} from "@/lib/payments/envelope";
import { decideReconciliation } from "@/lib/payments/reconcile";
import {
  clientIp,
  ipAllowed,
  parseAllowlist,
  sha256Hex,
  verifyWebhookSignature,
} from "@/lib/payments/signature";

export type WebhookResult = {
  status: number;
  body: {
    ok: boolean;
    duplicate?: boolean;
    matched?: boolean;
    error?: string;
  };
};

function headerSignature(headers: Headers): string | null {
  return (
    headers.get("paymaya-signature") ||
    headers.get("maya-signature") ||
    headers.get("x-webhook-signature") ||
    headers.get("x-payments-signature")
  );
}

function providerFromRequest(
  headers: Headers,
  bodyProvider: PaymentProvider | undefined,
): PaymentProvider {
  const header = headers.get("x-payment-provider")?.toLowerCase();
  if (header === "bank" || header === "maya") return header;
  return bodyProvider ?? "maya";
}

function authenticate(rawBody: string, headers: Headers): WebhookResult | null {
  const secret = process.env.PAYMENTS_WEBHOOK_SECRET;
  const allowlist = parseAllowlist(process.env.PAYMENTS_WEBHOOK_IPS);
  const production = process.env.NODE_ENV === "production";

  if (secret) {
    const ok = verifyWebhookSignature({
      rawBody,
      header: headerSignature(headers),
      secret,
    });
    if (!ok) {
      return { status: 401, body: { ok: false, error: "Invalid signature." } };
    }
  }

  if (allowlist.length > 0 && !ipAllowed(clientIp(headers), allowlist)) {
    return { status: 401, body: { ok: false, error: "Unknown source." } };
  }

  if (production && !secret && allowlist.length === 0) {
    return {
      status: 503,
      body: { ok: false, error: "Webhook is not configured." },
    };
  }

  if (!secret && allowlist.length === 0 && process.env.PAYMENTS_WEBHOOK_ALLOW_INSECURE !== "1") {
    return {
      status: 503,
      body: { ok: false, error: "Webhook is not configured." },
    };
  }

  return null;
}

/**
 * Maya Checkout or bank POSTs here. Secrets never leave the server.
 * Idempotent on (provider, event id). Returns 2xx only after the inbox row is stored
 * so Maya/bank retries stay safe.
 */
export async function processPaymentWebhook(
  rawBody: string,
  headers: Headers,
): Promise<WebhookResult> {
  const denied = authenticate(rawBody, headers);
  if (denied) return denied;

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { ok: false, error: "Invalid JSON." } };
  }

  const headerProvider = providerFromRequest(headers, undefined);
  const event = normalizeWebhook(json, headerProvider);
  if (!event) {
    return { status: 400, body: { ok: false, error: "Unrecognized payload." } };
  }

  if (!isSupabaseConfigured() || !isServiceRoleConfigured()) {
    return {
      status: 503,
      body: { ok: false, error: "Order store is not available." },
    };
  }

  const admin = createAdminClient();
  const digest = sha256Hex(rawBody);
  const redacted = redactWebhook(event);

  const { data: existing } = await admin
    .from("payment_events")
    .select("id")
    .eq("provider", event.provider)
    .eq("provider_event_id", event.eventId)
    .maybeSingle();

  if (existing) {
    return { status: 200, body: { ok: true, duplicate: true } };
  }

  if (!event.reference) {
    await admin.from("payment_events").insert({
      provider: event.provider,
      provider_event_id: event.eventId,
      payload_digest: digest,
      redacted,
      signature_ok: true,
      matched: false,
      note: "Webhook had no request reference.",
    });
    return { status: 200, body: { ok: true, matched: false } };
  }

  const { data: order } = await admin
    .from("orders")
    .select("id, status, amount_centavos")
    .eq("reference", event.reference)
    .maybeSingle();

  if (!order) {
    await admin.from("payment_events").insert({
      provider: event.provider,
      provider_event_id: event.eventId,
      payload_digest: digest,
      redacted,
      signature_ok: true,
      matched: false,
      note: "No queued order for this reference.",
    });
    return { status: 200, body: { ok: true, matched: false } };
  }

  const current =
    order.status === "reconciled" || order.status === "failed"
      ? order.status
      : "pending";
  const decision = decideReconciliation({
    current,
    signal: event.signal,
    expectedCentavos: Number(order.amount_centavos),
    incomingCentavos: event.amountCentavos,
  });

  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status: decision.nextStatus,
    provider: event.provider,
    provider_event_id: event.eventId,
    failure_reason: decision.reason,
    updated_at: now,
  };
  if (decision.nextStatus === "reconciled") {
    patch.reconciled_at = now;
    patch.failure_reason = null;
  }

  const { error: updateError } = await admin
    .from("orders")
    .update(patch)
    .eq("id", order.id);

  if (updateError) {
    return { status: 500, body: { ok: false, error: "Could not reconcile." } };
  }

  const { error: insertError } = await admin.from("payment_events").insert({
    provider: event.provider,
    provider_event_id: event.eventId,
    order_id: order.id,
    payload_digest: digest,
    redacted,
    signature_ok: true,
    matched: true,
    note: decision.reason,
  });

  if (insertError) {
    return { status: 500, body: { ok: false, error: "Could not record event." } };
  }

  return { status: 200, body: { ok: true, matched: true } };
}
