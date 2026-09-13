import assert from "node:assert/strict";
import test from "node:test";
import { createNewMemberSession } from "./mock/seed.ts";
import {
  completedDoseDays,
  dailyGuidance,
  dayDoseState,
  dayTenCopy,
  firstIncompleteSetup,
  setupComplete,
} from "./health.ts";

test("completed dose-days count logged days, not elapsed time", () => {
  const log = {
    "2026-09-01": { morning: true, midday: true },
    "2026-09-02": { morning: true },
    "2026-09-03": { morning: true, midday: true, dreams: true },
  };
  assert.equal(completedDoseDays(log, 2), 2);
});

test("past empty days are open until the first logged day", () => {
  assert.equal(dayDoseState({}, "2026-09-01", 2, "2026-09-10"), "open");
  assert.equal(
    dayDoseState(
      { "2026-09-08": { morning: true, midday: true } },
      "2026-09-01",
      2,
      "2026-09-10",
    ),
    "missed",
  );
});

test("setup stays incomplete until all three rows are done", () => {
  const session = createNewMemberSession();
  assert.equal(setupComplete(session), false);
  assert.equal(firstIncompleteSetup(session), "doses");
  session.healthSetup.doses = true;
  session.healthSetup.contact = true;
  session.healthSetup.community = true;
  assert.equal(setupComplete(session), true);
  assert.equal(firstIncompleteSetup(session), null);
});

test("day ten uses completed dose-days, not a countdown", () => {
  const early = dayTenCopy(4);
  assert.equal(early.done, false);
  assert.match(early.title, /4 of 10/);
  const done = dayTenCopy(10);
  assert.equal(done.done, true);
  assert.match(done.body, /not a medical outcome/i);
});

test("unlogged today uses the stronger take-care guidance", () => {
  const session = createNewMemberSession({
    capsulesPerDay: 2,
    doseLog: {},
  });
  const guidance = dailyGuidance(session, "2026-09-13");
  assert.equal(guidance.tone, "care");
  assert.match(guidance.body, /food supplement/);
});
