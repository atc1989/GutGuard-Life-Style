import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeWebhook,
  signalFromPaymentStatus,
  toCentavos,
} from "./envelope.ts";
import { decideReconciliation, nextOrderStatus, pesosLabel } from "./reconcile.ts";

test("Maya success and failure statuses map to signals", () => {
  assert.equal(signalFromPaymentStatus("PAYMENT_SUCCESS"), "success");
  assert.equal(signalFromPaymentStatus("AUTHORIZED", true), "success");
  assert.equal(signalFromPaymentStatus("PAYMENT_FAILED"), "failure");
  assert.equal(signalFromPaymentStatus("PAYMENT_EXPIRED"), "failure");
  assert.equal(signalFromPaymentStatus("AUTHORIZED"), "pending");
});

test("amounts from Maya pesos and bank centavos normalize", () => {
  assert.equal(toCentavos("4500.00"), 450000);
  assert.equal(toCentavos(4500), 450000);
  assert.equal(toCentavos(450000), 450000);
});

test("normalizeWebhook reads Checkout and bank envelopes", () => {
  const maya = normalizeWebhook({
    id: "pay-maya-1",
    paymentStatus: "PAYMENT_SUCCESS",
    requestReferenceNumber: "GG-1",
    totalAmount: { value: "4500.00", currency: "PHP" },
  });
  assert.equal(maya?.signal, "success");
  assert.equal(maya?.amountCentavos, 450000);
  assert.equal(maya?.reference, "GG-1");

  const bank = normalizeWebhook(
    {
      id: "bank-9",
      provider: "bank",
      status: "PAYMENT_FAILED",
      reference: "GG-2",
      amount: 4500,
    },
    "maya",
  );
  assert.equal(bank?.provider, "bank");
  assert.equal(bank?.signal, "failure");
});

test("reconciliation never downgrades a reconciled order", () => {
  assert.equal(nextOrderStatus("reconciled", "failure"), "reconciled");
  assert.equal(nextOrderStatus("failed", "success"), "reconciled");
  assert.equal(nextOrderStatus("pending", "pending"), "pending");
});

test("amount mismatch on a paid webhook marks failed, not reconciled", () => {
  const decision = decideReconciliation({
    current: "pending",
    signal: "success",
    expectedCentavos: 450000,
    incomingCentavos: 900000,
  });
  assert.equal(decision.nextStatus, "failed");
  assert.match(decision.reason ?? "", /Amount/);
});

test("matching success reconciles and pesosLabel is operator-readable", () => {
  const decision = decideReconciliation({
    current: "pending",
    signal: "success",
    expectedCentavos: 450000,
    incomingCentavos: 450000,
  });
  assert.equal(decision.nextStatus, "reconciled");
  assert.equal(decision.reason, null);
  assert.equal(pesosLabel(450000), "₱4,500.00");
});
