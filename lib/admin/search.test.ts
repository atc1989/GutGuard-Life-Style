import assert from "node:assert/strict";
import test from "node:test";
import { parseMemberDirectoryQuery } from "../schemas/admin.ts";
import {
  filterMembers,
  gemaLabel,
  registrationLabel,
  rowMatchesFilter,
  toMemberRow,
  type MemberRow,
} from "./search.ts";

function row(overrides: Parameters<typeof toMemberRow>[0]): MemberRow {
  return toMemberRow(overrides);
}

const roster: MemberRow[] = [
  row({
    id: "admin-1",
    name: "Ate Marites",
    mobile: "+639175550001",
    card_no: "0240 0001",
    phase: "member",
    claimed: true,
    role: "admin",
    baseDone: 5,
  }),
  row({
    id: "maria",
    name: "Maria Santos",
    mobile: "+639175550100",
    card_no: "0240 5578 9012 3456",
    phase: "member",
    claimed: true,
    role: "member",
    baseDone: 2,
  }),
  row({
    id: "nene",
    name: "Nene R.",
    mobile: "+639175550142",
    card_no: "0240 0142",
    phase: "invited",
    claimed: false,
    role: "member",
    baseDone: 0,
  }),
];

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
  const byName = filterMembers(roster, "marites", "all");
  assert.equal(byName.length, 1);
  assert.equal(byName[0]?.name, "Ate Marites");

  const byMobile = filterMembers(roster, "0917 555 0100", "all");
  assert.equal(byMobile.length, 1);
  assert.equal(byMobile[0]?.name, "Maria Santos");

  const byCard = filterMembers(roster, "9012 3456", "all");
  assert.equal(byCard.length, 1);
});

test("filters isolate claimed, BASE complete, GEMA, and admin", () => {
  const claimed = filterMembers(roster, "", "claimed");
  assert.ok(claimed.every((item) => item.claimed));

  const gema = filterMembers(roster, "", "gema");
  assert.equal(gema.length, 1);
  assert.equal(gema[0]?.name, "Ate Marites");

  const admins = filterMembers(roster, "", "admin");
  assert.equal(admins.length, 1);
  assert.equal(admins[0]?.role, "admin");

  const base = filterMembers(roster, "", "base");
  assert.ok(base.every((item) => item.baseDone === 5));
});

test("registration and GEMA labels stay operator-readable", () => {
  assert.equal(registrationLabel("member", true), "Active member");
  assert.equal(registrationLabel("invited", false), "Registered");
  assert.equal(registrationLabel("claimed", true), "Card claimed");
  assert.equal(gemaLabel(true), "Open");
  assert.equal(gemaLabel(false), "Locked");
  assert.equal(rowMatchesFilter(roster[0]!, "admin"), true);
});
