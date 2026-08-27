import assert from "node:assert/strict";
import test from "node:test";
import {
  createGuestSession,
  parseLifestyleSession,
  shouldPersistMockSession,
} from "./mock/seed.ts";

test("configured env never treats localStorage as a member", () => {
  const leftover = JSON.stringify({
    name: "Mock Maria",
    cardNo: "GG-0000",
    phase: "member",
    claimed: true,
  });
  const session = parseLifestyleSession(leftover, true);
  assert.equal(session.name, "");
  assert.equal(session.cardNo, "");
  assert.equal(session.phase, "landing");
  assert.equal(session.claimed, false);
  assert.equal(shouldPersistMockSession(true), false);
});

test("empty env still uses the mock member for UI work", () => {
  const session = parseLifestyleSession(null, false);
  assert.equal(session.phase, "landing");
  assert.ok(session.cardNo.length > 0);
  assert.equal(shouldPersistMockSession(false), true);
});

test("guest session is not a door card", () => {
  const guest = createGuestSession();
  assert.equal(guest.cardNo, "");
  assert.equal(guest.sponsor, "");
  assert.equal(guest.phase, "landing");
});
