import assert from "node:assert/strict";
import test from "node:test";
import { memberDisplayName, memberInitials } from "./initials.ts";

test("initials use first and last name", () => {
  assert.equal(memberInitials("Maria Santos"), "MS");
  assert.equal(memberInitials("  najeeb  mapantas  "), "NM");
});

test("single names take two letters", () => {
  assert.equal(memberInitials("Maria"), "MA");
});

test("empty names fall back to Gutguard", () => {
  assert.equal(memberInitials(""), "GG");
  assert.equal(memberInitials("   "), "GG");
  assert.equal(memberDisplayName(""), "Member");
  assert.equal(memberDisplayName(" Maria "), "Maria");
});
