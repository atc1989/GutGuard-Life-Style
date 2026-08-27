import assert from "node:assert/strict";
import test from "node:test";
import {
  isEmailUnconfirmedMessage,
  normalizeEmailCode,
} from "./email-code.ts";

test("email codes keep digits and drop spaces", () => {
  assert.equal(normalizeEmailCode("9 5 8 8 8 9"), "958889");
  assert.equal(normalizeEmailCode("958889"), "958889");
  assert.equal(normalizeEmailCode(" 12-34 56 "), "123456");
});

test("unconfirmed Auth errors are detected", () => {
  assert.equal(isEmailUnconfirmedMessage("Email not confirmed"), true);
  assert.equal(isEmailUnconfirmedMessage("email_not_confirmed"), true);
  assert.equal(isEmailUnconfirmedMessage("Invalid login credentials"), false);
});
