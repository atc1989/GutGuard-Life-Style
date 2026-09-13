import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultSession } from "./mock/seed.ts";
import {
  buildRoster,
  filterRoster,
  followUpDraft,
  shouldOfferRosterSearch,
} from "./team.ts";

test("needs-attention members lead the roster", () => {
  const roster = buildRoster(createDefaultSession());
  assert.ok(roster[0]?.attentionReason);
  assert.ok(roster.some((member) => member.status === "low_supply"));
});

test("filter chips isolate roster states", () => {
  const roster = buildRoster(createDefaultSession());
  const attention = filterRoster(roster, "attention");
  assert.ok(attention.length >= 2);
  assert.ok(attention.every((member) => member.attentionReason));
  assert.ok(filterRoster(roster, "invited").some((member) => member.id === "c3"));
});

test("follow-up draft names the reason and does not send", () => {
  const boy = buildRoster(createDefaultSession()).find((member) => member.id === "c2");
  assert.ok(boy);
  const draft = followUpDraft(boy);
  assert.match(draft.reason, /Low supply/);
  assert.match(draft.draft, /Boy Tapang/);
});

test("search stays hidden on a small roster", () => {
  assert.equal(shouldOfferRosterSearch(5), false);
  assert.equal(shouldOfferRosterSearch(8), true);
});
