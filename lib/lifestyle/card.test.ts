import assert from "node:assert/strict";
import test from "node:test";

import { CARD_NUMBER } from "../mock/seed.ts";
import {
  cardMintPatch,
  formatCardNumber,
  isCardless,
  LEGACY_CARD_NUMBER,
  mintCardNumber,
  normalizeCardNumber,
} from "./card.ts";

const ANA = "11111111-1111-4111-8111-111111111111";
const JUN = "22222222-2222-4222-8222-222222222222";

test("the seed placeholder is the legacy number this file re-mints", () => {
  // If someone changes the mock constant, the "one card number for everyone"
  // row stops being recognised as cardless. Fail here instead of silently.
  assert.equal(CARD_NUMBER, LEGACY_CARD_NUMBER);
});

test("a card number is 16 house-prefixed digits in groups of four", () => {
  const card = mintCardNumber(ANA);
  assert.match(card, /^0240( \d{4}){3}$/);
  assert.equal(card.replace(/ /g, "").length, 16);
  assert.equal(formatCardNumber("0240557890123456"), "0240 5578 9012 3456");
});

test("minting is idempotent per member and distinct between members", () => {
  assert.equal(mintCardNumber(ANA), mintCardNumber(ANA));
  assert.notEqual(mintCardNumber(ANA), mintCardNumber(JUN));
  assert.notEqual(mintCardNumber(ANA), mintCardNumber(ANA, 1));
});

test("no two members out of ten thousand share a card number", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 10_000; i += 1) {
    seen.add(mintCardNumber(`33333333-3333-4333-8333-${String(i).padStart(12, "0")}`));
  }
  assert.equal(seen.size, 10_000);
});

test("the placeholder every member used to get counts as no card", () => {
  assert.equal(isCardless(null), true);
  assert.equal(isCardless({}), true);
  assert.equal(isCardless({ card_no: null }), true);
  assert.equal(isCardless({ card_no: "   " }), true);
  assert.equal(isCardless({ card_no: LEGACY_CARD_NUMBER }), true);
  assert.equal(isCardless({ card_no: " 0240  5578 9012 3456 " }), true);
  assert.equal(isCardless({ card_no: mintCardNumber(ANA) }), false);
  assert.equal(normalizeCardNumber(" 0240  1111 " ), "0240 1111");
});

test("a first card starts at phase invited with nothing earned", () => {
  const patch = cardMintPatch({ userId: ANA, row: { full_name: "Ana Reyes" } });
  assert.equal(patch.phase, "invited");
  assert.equal(patch.claimed, false);
  assert.equal(patch.points, 0);
  assert.equal(patch.pending, 0);
  assert.equal(patch.banked, 0);
  assert.equal(patch.days_left, -1);
  assert.equal(patch.card_no, mintCardNumber(ANA));
});

test("a guild member's card is built from their guild name — no register form", () => {
  // What a OneGrinders member's person row looks like: full_name from the
  // guild, no Lifestyle `name` because they never filled the form (D13).
  const patch = cardMintPatch({ userId: ANA, row: { name: null, full_name: "TEST_MANCERA" } });
  assert.equal(patch.name, "TEST_MANCERA");
});

test("a name or mobile already on the row is never overwritten", () => {
  const patch = cardMintPatch({
    userId: ANA,
    row: { name: "Ana Reyes", mobile: "09990000101" },
    name: "Someone Else",
    mobile: "09991111111",
  });
  assert.equal(patch.name, "Ana Reyes");
  assert.equal(patch.mobile, "09990000101");
});

test("the register form supplies name and mobile when the row has neither", () => {
  const patch = cardMintPatch({
    userId: ANA,
    row: null,
    name: "Ana Reyes",
    mobile: "09990000101",
  });
  assert.equal(patch.name, "Ana Reyes");
  assert.equal(patch.mobile, "09990000101");
});

test("a mint never writes a role, an account status, or a sponsor", () => {
  const patch = cardMintPatch({ userId: ANA, row: null, name: "Ana" });
  for (const column of ["role", "account_status", "sponsor", "team", "id"]) {
    assert.equal(column in patch, false, `${column} must not be written by a card mint`);
  }
});
