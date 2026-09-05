import assert from "node:assert/strict";
import test from "node:test";

import {
  allowedOrigins,
  DEFAULT_LANDING,
  ORIGIN_ENV_KEYS,
  resolveReturnTo,
  trustedReturnTo,
} from "./return-to.ts";

const HUB = "https://app.gutguard.test";
const ACADEMY = "https://academy.gutguard.test";
const GEMA = "https://events.gutguard.test";
const ALLOWED = [HUB, ACADEMY, GEMA];

test("the allow-list is built from the three apps' site URLs", () => {
  const origins = allowedOrigins({
    NEXT_PUBLIC_SITE_URL: HUB,
    NEXT_PUBLIC_ACADEMY_URL: `${ACADEMY}/`,
    NEXT_PUBLIC_GEMA_URL: `  ${GEMA}/login  `,
  });
  // Paths, trailing slashes and stray whitespace all reduce to the origin.
  assert.deepEqual(origins.sort(), [...ALLOWED].sort());
});

test("a missing or unparseable origin narrows the allow-list, never widens it", () => {
  assert.deepEqual(allowedOrigins({ NEXT_PUBLIC_SITE_URL: HUB }), [HUB]);
  assert.deepEqual(allowedOrigins({ NEXT_PUBLIC_SITE_URL: "not a url" }), []);
  assert.deepEqual(allowedOrigins({ NEXT_PUBLIC_SITE_URL: "" }), []);
  assert.deepEqual(allowedOrigins({}), []);
});

test("a non-http scheme in configuration is not a redirect target", () => {
  assert.deepEqual(allowedOrigins({ NEXT_PUBLIC_SITE_URL: "javascript:alert(1)" }), []);
  assert.deepEqual(allowedOrigins({ NEXT_PUBLIC_SITE_URL: "ftp://files.gutguard.test" }), []);
});

test("ORIGIN_ENV_KEYS names every app the hub can return a member to", () => {
  // The .env.example and the owner's Vercel settings are written from this
  // list. Adding a spoke without adding its key here silently disables it.
  assert.deepEqual([...ORIGIN_ENV_KEYS], [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_ACADEMY_URL",
    "NEXT_PUBLIC_GEMA_URL",
  ]);
});

test("each allowed origin is returned, path and query preserved", () => {
  assert.equal(resolveReturnTo(`${ACADEMY}/academy`, ALLOWED), `${ACADEMY}/academy`);
  assert.equal(resolveReturnTo(`${GEMA}/events?ref=abc`, ALLOWED), `${GEMA}/events?ref=abc`);
  assert.equal(resolveReturnTo(HUB, ALLOWED), `${HUB}/`);
});

test("a look-alike host falls back — this is why the check is exact", () => {
  // Every one of these passes a startsWith, endsWith or naive regex on the
  // host. None of them is ours.
  for (const hostile of [
    "https://academy.gutguard.test.attacker.example/academy",
    "https://attacker.example/academy.gutguard.test",
    "https://academy-gutguard.test/academy",
    "https://academy.gutguard.test.evil",
    "https://xn--academy.gutguard.test",
  ]) {
    assert.equal(resolveReturnTo(hostile, ALLOWED), DEFAULT_LANDING, hostile);
  }
});

test("a javascript: URL falls back", () => {
  assert.equal(resolveReturnTo("javascript:alert(document.cookie)", ALLOWED), DEFAULT_LANDING);
  assert.equal(resolveReturnTo("JavaScript:alert(1)", ALLOWED), DEFAULT_LANDING);
  assert.equal(resolveReturnTo("data:text/html,<script>1</script>", ALLOWED), DEFAULT_LANDING);
});

test("embedded credentials fall back, even on an allowed host", () => {
  assert.equal(resolveReturnTo(`https://evil.example@academy.gutguard.test/`, ALLOWED), DEFAULT_LANDING);
  assert.equal(resolveReturnTo(`https://user:pass@academy.gutguard.test/`, ALLOWED), DEFAULT_LANDING);
});

test("a protocol-relative URL falls back", () => {
  assert.equal(resolveReturnTo("//attacker.example", ALLOWED), DEFAULT_LANDING);
  assert.equal(resolveReturnTo("//academy.gutguard.test", ALLOWED), DEFAULT_LANDING);
});

test("a bare path falls back — only absolute allow-listed URLs are honoured", () => {
  assert.equal(resolveReturnTo("/academy", ALLOWED), DEFAULT_LANDING);
  assert.equal(resolveReturnTo("academy", ALLOWED), DEFAULT_LANDING);
});

test("nothing, blank and non-strings fall back", () => {
  assert.equal(resolveReturnTo(null, ALLOWED), DEFAULT_LANDING);
  assert.equal(resolveReturnTo(undefined, ALLOWED), DEFAULT_LANDING);
  assert.equal(resolveReturnTo("   ", ALLOWED), DEFAULT_LANDING);
  assert.equal(resolveReturnTo(42 as unknown as string, ALLOWED), DEFAULT_LANDING);
});

test("an empty allow-list sends everyone to the door card", () => {
  // A deployment with no origins configured must not honour any returnTo.
  assert.equal(resolveReturnTo(`${ACADEMY}/academy`, []), DEFAULT_LANDING);
});

test("a scheme downgrade to the same host falls back", () => {
  // http://academy… is a different origin from https://academy…, and being
  // sent to the plaintext one right after a password is a downgrade.
  assert.equal(resolveReturnTo("http://academy.gutguard.test/academy", ALLOWED), DEFAULT_LANDING);
});

test("a port that is not the allowed one falls back", () => {
  assert.equal(resolveReturnTo("https://academy.gutguard.test:8443/", ALLOWED), DEFAULT_LANDING);
});

test("trustedReturnTo reports nothing rather than a default", () => {
  // The confirm step resumes a member at their phase; it must be able to tell
  // "no trusted target" apart from "the door card", which is a real answer.
  assert.equal(trustedReturnTo(`${ACADEMY}/academy`, ALLOWED), `${ACADEMY}/academy`);
  assert.equal(trustedReturnTo("https://attacker.example/", ALLOWED), null);
  assert.equal(trustedReturnTo("/card", ALLOWED), null);
  assert.equal(trustedReturnTo(null, ALLOWED), null);
});

test("resolveReturnTo is trustedReturnTo with the door card behind it", () => {
  for (const raw of [`${GEMA}/events`, "https://attacker.example/", "//evil", null, ""]) {
    assert.equal(
      resolveReturnTo(raw, ALLOWED),
      trustedReturnTo(raw, ALLOWED) ?? DEFAULT_LANDING,
    );
  }
});
