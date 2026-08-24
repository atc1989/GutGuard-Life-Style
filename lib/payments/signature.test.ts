import assert from "node:assert/strict";
import test from "node:test";
import { createHmac } from "node:crypto";
import {
  extractSignature,
  ipAllowed,
  parseAllowlist,
  verifyWebhookSignature,
} from "./signature.ts";

test("extracts bare hex, sha256=, and t=,v1= signatures", () => {
  assert.deepEqual(extractSignature("abc123"), { digest: "abc123" });
  assert.deepEqual(extractSignature("sha256=deadbeef"), { digest: "deadbeef" });
  assert.deepEqual(extractSignature("t=99,v1=ff00"), {
    timestamp: "99",
    digest: "ff00",
  });
  assert.equal(extractSignature(""), null);
});

test("HMAC of the raw body is timing-safe and case-insensitive", () => {
  const secret = "webhook-secret";
  const body = '{"id":"pay-1","paymentStatus":"PAYMENT_SUCCESS"}';
  const digest = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  assert.equal(
    verifyWebhookSignature({ rawBody: body, header: digest, secret }),
    true,
  );
  assert.equal(
    verifyWebhookSignature({
      rawBody: body,
      header: `sha256=${digest.toUpperCase()}`,
      secret,
    }),
    true,
  );
  assert.equal(
    verifyWebhookSignature({ rawBody: body, header: digest, secret: "nope" }),
    false,
  );
});

test("timestamped v1 signature signs timestamp.body", () => {
  const secret = "webhook-secret";
  const body = '{"id":"pay-2"}';
  const digest = createHmac("sha256", secret)
    .update("1700000000." + body, "utf8")
    .digest("hex");
  assert.equal(
    verifyWebhookSignature({
      rawBody: body,
      header: `t=1700000000,v1=${digest}`,
      secret,
    }),
    true,
  );
});

test("IP allowlist is empty-open and exact-match otherwise", () => {
  assert.equal(ipAllowed("1.2.3.4", []), true);
  assert.equal(ipAllowed("18.138.50.235", parseAllowlist("18.138.50.235, 3.1.207.200")), true);
  assert.equal(ipAllowed("8.8.8.8", parseAllowlist("18.138.50.235")), false);
  assert.equal(ipAllowed(null, parseAllowlist("18.138.50.235")), false);
});
