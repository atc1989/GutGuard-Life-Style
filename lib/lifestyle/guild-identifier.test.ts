import assert from "node:assert/strict";
import test from "node:test";

import { authRegisterSchema } from "../schemas/auth.ts";
import { looksLikeGuildUsername } from "./guild-identifier.ts";

test("a guild username is recognised", () => {
  for (const value of ["TEST_MANCERA", "demo.admin", "najee", "one_grinder_99"]) {
    assert.equal(looksLikeGuildUsername(value), true, value);
  }
});

test("an email is not a username, however it is cased or spaced", () => {
  for (const value of ["a@b.co", "  Someone@Example.COM  ", "x@y"]) {
    assert.equal(looksLikeGuildUsername(value), false, value);
  }
});

test("someone mid-keystroke is not told they are in the wrong place", () => {
  // The prompt appears while typing, so it must not fire on a partial address.
  for (const value of ["", "  ", "a", "ab", "some name", "someone.", "najee."]) {
    assert.equal(looksLikeGuildUsername(value), false, JSON.stringify(value));
  }
  assert.equal(looksLikeGuildUsername(null), false);
  assert.equal(looksLikeGuildUsername(undefined), false);
});

/**
 * The guard that matters more than the prompt. D13: a OneGrinders member never
 * registers. If the prompt is ignored, or a future edit removes it, the schema
 * still refuses — a username cannot reach `signUp` and cannot mint a second
 * Auth user for a person who already has one.
 */
test("a guild username can never register — the schema refuses it", () => {
  const parsed = authRegisterSchema.safeParse({
    name: "Test Mancera",
    mobile: "09171234567",
    email: "TEST_MANCERA",
    password: "Passw0rdd",
  });
  assert.equal(parsed.success, false);
  if (!parsed.success) {
    const onEmail = parsed.error.issues.some((issue) => issue.path[0] === "email");
    assert.equal(onEmail, true, "the refusal must be on the email field");
  }
});

test("a real email still registers, so the guard is not a wall", () => {
  const parsed = authRegisterSchema.safeParse({
    name: "Ana Cruz",
    mobile: "09171234567",
    email: "ana@example.com",
    password: "Passw0rdd",
  });
  assert.equal(parsed.success, true);
});
