import assert from "node:assert/strict";
import test from "node:test";
import {
  authEmailFromMobile,
  authRegisterSchema,
  toE164Phone,
} from "./auth.ts";

test("accepts PH mobiles in 09 and +639 form and normalizes to E.164", () => {
  const local = authRegisterSchema.parse({
    name: "Maria Santos",
    mobile: "0917 555 0100",
    password: "Gutguard1",
  });
  assert.equal(local.mobile, "09175550100");
  assert.equal(toE164Phone(local.mobile), "+639175550100");

  const intl = authRegisterSchema.parse({
    name: "Maria Santos",
    mobile: "+639175550100",
    password: "Gutguard1",
  });
  assert.equal(intl.mobile, "+639175550100");
  assert.equal(toE164Phone(intl.mobile), "+639175550100");
});

test("rejects a weak password and a non-PH mobile", () => {
  const weak = authRegisterSchema.safeParse({
    name: "Maria Santos",
    mobile: "09175550100",
    password: "password",
  });
  assert.equal(weak.success, false);

  const short = authRegisterSchema.safeParse({
    name: "Maria Santos",
    mobile: "09175550100",
    password: "Gg1",
  });
  assert.equal(short.success, false);

  const badMobile = authRegisterSchema.safeParse({
    name: "Maria Santos",
    mobile: "555-0100",
    password: "Gutguard1",
  });
  assert.equal(badMobile.success, false);
});

test("derives a stable Auth email from the mobile number", () => {
  assert.equal(
    authEmailFromMobile("09175550100"),
    "639175550100@members.gutguard.ph",
  );
});
