import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

function hashPayload(body: string) {
  return createHmac("sha256", "maya-payload").update(body).digest("hex");
}

function verifyMayaSignature(rawBody: string, header: string | null) {
  const secret = process.env.MAYA_WEBHOOK_SECRET;
  if (!secret) return { ok: false as const, error: "MAYA_WEBHOOK_SECRET is not set" };
  if (!header) return { ok: false as const, error: "Missing signature header" };

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = header.replace(/^sha256=/i, "").trim();
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false as const, error: "Invalid Maya signature" };
  }
  return { ok: true as const };
}

/**
 * Maya webhook — server only.
 * Send header `x-maya-signature: <hmac-sha256 hex of raw body>` using MAYA_WEBHOOK_SECRET.
 * Body JSON: { paymentId, checkoutId?, status: "PAYMENT_SUCCESS" | "PAYMENT_FAILED", orderId? }
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature =
    request.headers.get("x-maya-signature") ??
    request.headers.get("maya-signature");
  const verified = verifyMayaSignature(rawBody, signature);
  const payloadHash = hashPayload(rawBody);

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  if (!verified.ok) {
    await admin.from("webhook_events").insert({
      provider: "maya",
      payload_hash: payloadHash,
      ok: false,
      error: verified.error,
    });
    return NextResponse.json({ error: verified.error }, { status: 401 });
  }

  let body: {
    paymentId?: string;
    checkoutId?: string;
    status?: string;
    orderId?: string;
  };
  try {
    body = JSON.parse(rawBody) as typeof body;
  } catch {
    await admin.from("webhook_events").insert({
      provider: "maya",
      payload_hash: payloadHash,
      ok: false,
      error: "Invalid JSON",
    });
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const paymentId = body.paymentId?.trim();
  if (!paymentId) {
    await admin.from("webhook_events").insert({
      provider: "maya",
      payload_hash: payloadHash,
      ok: false,
      error: "Missing paymentId",
    });
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 });
  }

  const success =
    body.status === "PAYMENT_SUCCESS" || body.status === "SUCCESS";

  const { data: existing } = await admin
    .from("orders")
    .select("id, status")
    .eq("maya_payment_id", paymentId)
    .maybeSingle();

  if (existing?.status === "reconciled") {
    await admin.from("webhook_events").insert({
      provider: "maya",
      payload_hash: payloadHash,
      ok: true,
      maya_payment_id: paymentId,
      error: null,
    });
    return NextResponse.json({ ok: true, idempotent: true });
  }

  const orderId = existing?.id ?? body.orderId ?? null;
  if (!orderId) {
    await admin.from("webhook_events").insert({
      provider: "maya",
      payload_hash: payloadHash,
      ok: false,
      maya_payment_id: paymentId,
      error: "No matching order",
    });
    return NextResponse.json({ error: "No matching order" }, { status: 404 });
  }

  const { error: updateError } = await admin
    .from("orders")
    .update({
      maya_payment_id: paymentId,
      maya_checkout_id: body.checkoutId ?? null,
      status: success ? "reconciled" : "failed",
      reconciled_at: success ? new Date().toISOString() : null,
      last_error: success ? null : `Maya status ${body.status ?? "unknown"}`,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  await admin.from("webhook_events").insert({
    provider: "maya",
    payload_hash: payloadHash,
    ok: !updateError,
    maya_payment_id: paymentId,
    error: updateError?.message ?? null,
  });

  if (updateError) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
