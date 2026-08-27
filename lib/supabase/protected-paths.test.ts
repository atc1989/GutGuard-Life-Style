import assert from "node:assert/strict";
import test from "node:test";
import {
  requiresLifestyleAuth,
  unauthenticatedLifestylePath,
} from "./protected-paths.ts";

test("cookie session is required for card, nearly-free, and the member shell", () => {
  assert.equal(requiresLifestyleAuth("/card"), true);
  assert.equal(requiresLifestyleAuth("/nearly"), true);
  assert.equal(requiresLifestyleAuth("/app/health"), true);
  assert.equal(requiresLifestyleAuth("/register"), false);
  assert.equal(requiresLifestyleAuth("/"), false);
});

test("unauthenticated member surfaces send people to register, not a mock card", () => {
  assert.equal(unauthenticatedLifestylePath("/card"), "/register");
  assert.equal(unauthenticatedLifestylePath("/nearly"), "/register");
  assert.equal(unauthenticatedLifestylePath("/app/health"), "/");
});
