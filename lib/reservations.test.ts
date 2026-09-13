import assert from "node:assert/strict";
import test from "node:test";
import { decideReservation } from "./reservations.ts";

test("an open evening can be reserved once", () => {
  const first = decideReservation("ginhawa-gensan-october", {});
  assert.equal(first.ok, true);
  if (first.ok) {
    assert.equal(first.kind, "reserved");
    assert.equal(first.notice, "confirmed");
  }
});

test("a second reserve on the same evening is exists, not a new seat", () => {
  const again = decideReservation("ginhawa-gensan-october", {
    "ginhawa-gensan-october": "reserved",
  });
  assert.equal(again.ok, true);
  if (again.ok) assert.equal(again.notice, "exists");
});

test("full evenings go to waitlist", () => {
  const result = decideReservation("ginhawa-koronadal-october", {});
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.kind, "waitlist");
    assert.equal(result.notice, "waitlist");
  }
});

test("closed and past evenings cannot be reserved", () => {
  assert.equal(decideReservation("ginhawa-bula-closed", {}).ok, false);
  assert.equal(decideReservation("ginhawa-july-past", {}).ok, false);
  assert.equal(decideReservation("ginhawa-cancelled", {}).ok, false);
});
