import assert from "node:assert/strict";
import test from "node:test";
import { profileSchema } from "./settings.ts";

test("Settings takes a name and a PH mobile, and normalizes the mobile", () => {
  for (const typed of ["09171234567", "639171234567", "+639171234567", "0917 123 4567"]) {
    const parsed = profileSchema.safeParse({ name: "Ana Cruz", mobile: typed });
    assert.equal(parsed.success, true, typed);
    if (parsed.success) assert.equal(parsed.data.mobile, "+639171234567");
  }
});

test("Settings will not save without a mobile, and will not take a foreign one", () => {
  // The owner's call: mobile is required here, not only at register.
  assert.equal(profileSchema.safeParse({ name: "Ana Cruz", mobile: "" }).success, false);
  assert.equal(profileSchema.safeParse({ name: "Ana Cruz" }).success, false);
  assert.equal(
    profileSchema.safeParse({ name: "Ana Cruz", mobile: "+14155550123" }).success,
    false,
  );
  assert.equal(profileSchema.safeParse({ name: "A", mobile: "09171234567" }).success, false);
});
