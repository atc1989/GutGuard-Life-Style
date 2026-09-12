import assert from "node:assert/strict";
import test from "node:test";

import { LEGACY_CARD_NUMBER } from "./card.ts";
import {
  EMPTY_MEMBER_CHROME,
  memberChromeForUi,
  metadataNameFromAuth,
  resolveMemberChrome,
} from "./member-chrome.ts";
import { CARD_NUMBER } from "../mock/seed.ts";
import { parseLifestyleSession } from "../mock/seed.ts";

test("T-911 profile name wins over Auth metadata", () => {
  const chrome = resolveMemberChrome({
    profile: {
      name: "Najee",
      mobile: "+639171234567",
      sponsor: "Ate Marites",
      card_no: "0240 1234 5678 9012",
    },
    metadataName: "Other",
  });
  assert.equal(chrome.name, "Najee");
  assert.equal(chrome.displayName, "Najee");
  assert.equal(chrome.sponsor, "Ate Marites");
  assert.equal(chrome.cardNo, "0240 1234 5678 9012");
  assert.equal(chrome.mobile, "+639171234567");
});

test("T-912 empty profile name falls back to metadata, then Member", () => {
  const fromMetadata = resolveMemberChrome({
    profile: { name: "  ", card_no: "0240 1111 2222 3333" },
    metadataName: "Guild Name",
  });
  assert.equal(fromMetadata.displayName, "Guild Name");

  const unnamed = resolveMemberChrome({
    profile: { name: null, card_no: null },
    metadataName: null,
  });
  assert.equal(unnamed.name, "");
  assert.equal(unnamed.displayName, "Member");
  assert.deepEqual(unnamed, { ...EMPTY_MEMBER_CHROME });
});

test("T-913 legacy placeholder is not a QR seed", () => {
  const chrome = resolveMemberChrome({
    profile: { name: "Ana", card_no: LEGACY_CARD_NUMBER },
  });
  assert.equal(chrome.cardNo, "");
  assert.equal(chrome.displayName, "Ana");
});

test("a missing card is empty, not a generated number", () => {
  const chrome = resolveMemberChrome({
    profile: { name: "Ana", card_no: "" },
  });
  assert.equal(chrome.cardNo, "");
});

test("Auth metadata matches /card: name then full_name", () => {
  assert.equal(
    metadataNameFromAuth({ user_metadata: { name: "Register Name", full_name: "Guild" } }),
    "Register Name",
  );
  assert.equal(
    metadataNameFromAuth({ user_metadata: { full_name: "Guild Name" } }),
    "Guild Name",
  );
  assert.equal(metadataNameFromAuth({ user_metadata: { name: 12 } }), null);
});

test("T-910 leftover mock session cannot override server chrome", () => {
  const leftover = parseLifestyleSession(
    JSON.stringify({
      name: "Mock Maria",
      cardNo: "GG-0000",
      phase: "member",
      claimed: true,
    }),
    true,
  );
  const chrome = resolveMemberChrome({
    profile: { name: "Row Name", card_no: "0240 9999 8888 7777", sponsor: "Kuya" },
  });
  const ui = memberChromeForUi(chrome, leftover);
  assert.equal(ui.displayName, "Row Name");
  assert.equal(ui.cardNo, "0240 9999 8888 7777");
  assert.equal(ui.sponsor, "Kuya");
  assert.notEqual(ui.displayName, "Mock Maria");
});

test("T-921 mock env keeps the demo session when chrome is null", () => {
  const mock = parseLifestyleSession(null, false);
  const ui = memberChromeForUi(null, mock);
  assert.equal(ui.cardNo, CARD_NUMBER);
  assert.equal(ui.sponsor, "Ate Marites");

  const named = memberChromeForUi(null, { ...mock, name: "Maria Santos" });
  assert.equal(named.displayName, "Maria Santos");
});
