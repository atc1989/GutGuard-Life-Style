import assert from "node:assert/strict";
import test from "node:test";

import { cookieOptionsForRequestHost } from "./cookie-options.ts";

const shared = { domain: ".gutguard.ph" };

test("Gutguard hosts keep the shared parent-domain session", () => {
  assert.deepEqual(cookieOptionsForRequestHost(shared, "gutguard.ph"), shared);
  assert.deepEqual(
    cookieOptionsForRequestHost(shared, "lifestyle.gutguard.ph"),
    shared,
  );
  assert.deepEqual(
    cookieOptionsForRequestHost(shared, "Lifestyle.GutGuard.PH:443"),
    shared,
  );
  assert.deepEqual(
    cookieOptionsForRequestHost(shared, "lifestyle.gutguard.ph, proxy.internal"),
    shared,
  );
});

test("Vercel and unrelated hosts fall back to host-only cookies", () => {
  assert.equal(
    cookieOptionsForRequestHost(shared, "gut-guard-life-style-xxxx.vercel.app"),
    undefined,
  );
  assert.equal(
    cookieOptionsForRequestHost(shared, "gutguard.ph.evil.example"),
    undefined,
  );
});

test("an unconfigured shared domain remains off", () => {
  assert.equal(
    cookieOptionsForRequestHost(undefined, "lifestyle.gutguard.ph"),
    undefined,
  );
});
