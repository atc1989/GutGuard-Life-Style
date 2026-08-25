import assert from "node:assert/strict";
import test from "node:test";
import {
  createNewMemberSession,
  hasSupply,
  refillCopy,
  resumeRoute,
} from "./seed.ts";

test("new member has no supply, no invites, and no refill scare", () => {
  const session = createNewMemberSession({ name: "Najeeb Mapantas" });
  assert.equal(session.points, 0);
  assert.equal(session.invites.length, 0);
  assert.equal(session.ledger.length, 0);
  assert.equal(hasSupply(session.daysLeft), false);
  assert.equal(refillCopy(session.daysLeft), null);
});

test("resume sends members home and everyone else to the door", () => {
  assert.equal(resumeRoute("member"), "/app/health");
  assert.equal(resumeRoute("nearly"), "/nearly");
  assert.equal(resumeRoute("claimed"), "/card?claimed=1");
  assert.equal(resumeRoute("invited"), "/card");
  assert.equal(resumeRoute("landing"), "/card");
});
