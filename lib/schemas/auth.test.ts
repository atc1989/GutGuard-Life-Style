import assert from "node:assert/strict";
import test from "node:test";
import { authConfirmSchema, authRegisterSchema, authSignInSchema } from "./auth.ts";

test("auth register requires name, mobile, email, and a strong password", () => {
  const missingEmail = authRegisterSchema.safeParse({
    name: "Ana Cruz",
    mobile: "09171234567",
    password: "Gutguard1",
  });
  assert.equal(missingEmail.success, false);

  const weakPassword = authRegisterSchema.safeParse({
    name: "Ana Cruz",
    mobile: "09171234567",
    email: "ana@example.com",
    password: "short",
  });
  assert.equal(weakPassword.success, false);

  const ok = authRegisterSchema.safeParse({
    name: "Ana Cruz",
    mobile: "0917 123 4567",
    email: "ana@example.com",
    password: "Gutguard1",
  });
  assert.equal(ok.success, true);
  if (ok.success) assert.equal(ok.data.mobile, "+639171234567");
});

test("auth sign-in requires username or email and password", () => {
  const missing = authSignInSchema.safeParse({ identifier: "ana@example.com" });
  assert.equal(missing.success, false);

  const email = authSignInSchema.safeParse({
    identifier: "ana@example.com",
    password: "Gutguard1",
  });
  assert.equal(email.success, true);

  const username = authSignInSchema.safeParse({
    identifier: "johndoe",
    password: "x",
  });
  assert.equal(username.success, true);
});

test("auth confirm accepts a spaced 6-digit email code", () => {
  const ok = authConfirmSchema.safeParse({
    email: "ana@example.com",
    code: "9 5 8 8 8 9",
  });
  assert.equal(ok.success, true);
  if (ok.success) assert.equal(ok.data.code, "958889");

  const short = authConfirmSchema.safeParse({
    email: "ana@example.com",
    code: "123",
  });
  assert.equal(short.success, false);
});

test("duplicate identity names the taken field", async () => {
  const { duplicateIdentityResult, mobileAliases } = await import("./auth.ts");
  assert.deepEqual(mobileAliases("+639171234567"), [
    "+639171234567",
    "09171234567",
  ]);

  const emailOnly = duplicateIdentityResult(true, false);
  assert.equal(emailOnly?.ok, false);
  assert.equal(emailOnly?.fieldErrors.email?.includes("email"), true);
  assert.equal(emailOnly?.fieldErrors.mobile, undefined);

  const both = duplicateIdentityResult(true, true);
  assert.equal(both?.fieldErrors.email && both.fieldErrors.mobile !== undefined, true);

  assert.equal(duplicateIdentityResult(false, false), null);
});
