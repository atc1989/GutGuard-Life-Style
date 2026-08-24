import assert from "node:assert/strict";
import test from "node:test";
import { MOCK_MEMBERS } from "./mock-members.ts";
import {
  filterMembers,
  gemaLabel,
  registrationLabel,
  rowMatchesFilter,
} from "./search.ts";
import { parseMemberDirectoryQuery } from "../schemas/admin.ts";

test("parseMemberDirectoryQuery falls back instead of throwing", () => {
  assert.deepEqual(parseMemberDirectoryQuery({}), { q: "", filter: "all" });
  assert.deepEqual(parseMemberDirectoryQuery({ q: "  Maria  ", filter: "gema" }), {
    q: "Maria",
    filter: "gema",
  });
  assert.deepEqual(parseMemberDirectoryQuery({ filter: "not-a-filter" }), {
    q: "",
    filter: "all",
  });
});

test("search matches name, mobile, and card number", () => {
  const byName = filterMembers(MOCK_MEMBERS, "marites", "all");
  assert.equal(byName.length, 1);
  assert.equal(byName[0]?.name, "Ate Marites");

  const byMobile = filterMembers(MOCK_MEMBERS, "0917 555 0100", "all");
  assert.equal(byMobile.length, 1);
  assert.equal(byMobile[0]?.name, "Maria Santos");

  const byCard = filterMembers(MOCK_MEMBERS, "9012 3456", "all");
  assert.equal(byCard.length, 1);
});

test("filters isolate claimed, BASE complete, GEMA, and admin", () => {
  const claimed = filterMembers(MOCK_MEMBERS, "", "claimed");
  assert.ok(claimed.every((row) => row.claimed));

  const gema = filterMembers(MOCK_MEMBERS, "", "gema");
  assert.ok(gema.length >= 2);
  assert.ok(gema.every((row) => row.gemaUnlocked));

  const admins = filterMembers(MOCK_MEMBERS, "", "admin");
  assert.equal(admins.length, 1);
  assert.equal(admins[0]?.role, "admin");

  const base = filterMembers(MOCK_MEMBERS, "", "base");
  assert.ok(base.every((row) => row.baseDone === 5));
});

test("registration and GEMA labels stay operator-readable", () => {
  assert.equal(registrationLabel("member", true), "Active member");
  assert.equal(registrationLabel("invited", false), "Registered");
  assert.equal(registrationLabel("claimed", true), "Card claimed");
  assert.equal(gemaLabel(true), "Open");
  assert.equal(gemaLabel(false), "Locked");
  assert.equal(rowMatchesFilter(MOCK_MEMBERS[0]!, "admin"), true);
});
