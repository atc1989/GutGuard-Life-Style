import assert from "node:assert/strict";
import test from "node:test";
import {
  canJoinWaitlist,
  canReserveEvent,
  displayInviterName,
  eventReserveHref,
  getEventBySlug,
  parseReservationNotice,
} from "./events.ts";

test("only open and nearly-full events accept a reservation", () => {
  assert.equal(canReserveEvent("available"), true);
  assert.equal(canReserveEvent("nearly_full"), true);
  assert.equal(canReserveEvent("waitlist"), false);
  assert.equal(canReserveEvent("closed"), false);
  assert.equal(canReserveEvent("past"), false);
  assert.equal(canReserveEvent("cancelled"), false);
  assert.equal(canReserveEvent("postponed"), false);
});

test("waitlist is a separate action from reserve", () => {
  assert.equal(canJoinWaitlist("waitlist"), true);
  assert.equal(canJoinWaitlist("available"), false);
});

test("reserve keeps the event slug for the register handoff", () => {
  assert.equal(
    eventReserveHref("ginhawa-gensan-october"),
    "/register?event=ginhawa-gensan-october&intent=reserve",
  );
});

test("event slugs resolve and unknown slugs do not", () => {
  assert.equal(getEventBySlug("ginhawa-gensan-october")?.status, "available");
  assert.equal(getEventBySlug("missing"), undefined);
});

test("reservation notices are an allow-list", () => {
  assert.equal(parseReservationNotice("confirmed"), "confirmed");
  assert.equal(parseReservationNotice("waitlist"), "waitlist");
  assert.equal(parseReservationNotice("nope"), null);
});

test("inviter attribution hides ids and contact details", () => {
  assert.equal(displayInviterName("Marites"), "Marites");
  assert.equal(displayInviterName("user@email.com"), null);
  assert.equal(displayInviterName("09175550100"), null);
  assert.equal(displayInviterName(""), null);
});
