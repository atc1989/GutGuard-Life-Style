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

test("register takes 09…, 63… and +63…, and nothing else", () => {
  const register = (mobile: string) =>
    authRegisterSchema.safeParse({
      name: "Ana Cruz",
      mobile,
      email: "ana@example.com",
      password: "Gutguard1",
    });

  // A bare 63 has no trunk 0 to replace — normalizing it by slicing one
  // character off the front would produce +6339171234567.
  for (const typed of ["09171234567", "639171234567", "+639171234567"]) {
    const parsed = register(typed);
    assert.equal(parsed.success, true, typed);
    if (parsed.success) assert.equal(parsed.data.mobile, "+639171234567", typed);
  }

  // PH only, and still PH only.
  for (const typed of ["+14155550123", "9171234567", "0917123456", "+6391712345678"]) {
    assert.equal(register(typed).success, false, typed);
  }
});

test("auth sign-in takes a username or an email, plus a password", () => {
  const missing = authSignInSchema.safeParse({ identifier: "ana@example.com" });
  assert.equal(missing.success, false);

  const byEmail = authSignInSchema.safeParse({
    identifier: "ana@example.com",
    password: "Gutguard1",
  });
  assert.equal(byEmail.success, true);

  // A OneGrinders username is not an email and must still pass.
  const byUsername = authSignInSchema.safeParse({
    identifier: "anacruz",
    password: "Gutguard1",
  });
  assert.equal(byUsername.success, true);

  const blank = authSignInSchema.safeParse({ identifier: "  ", password: "x" });
  assert.equal(blank.success, false);
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
