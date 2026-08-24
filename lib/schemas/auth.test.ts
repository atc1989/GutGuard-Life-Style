import assert from "node:assert/strict";
import test from "node:test";
import { authRegisterSchema, authSignInSchema } from "./auth.ts";

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

test("auth sign-in requires email and password", () => {
  const missing = authSignInSchema.safeParse({ email: "ana@example.com" });
  assert.equal(missing.success, false);

  const ok = authSignInSchema.safeParse({
    email: "ana@example.com",
    password: "Gutguard1",
  });
  assert.equal(ok.success, true);
});
