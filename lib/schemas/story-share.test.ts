import assert from "node:assert/strict";
import test from "node:test";
import {
  emptyStoryDraft,
  firstInvalidField,
  namesMatch,
  storyShareSchema,
} from "./story-share.ts";

test("story draft is invalid until consents and a typed name", () => {
  const parsed = storyShareSchema.safeParse(emptyStoryDraft(2));
  assert.equal(parsed.success, false);
});

test("evidence stays private until upload consent is checked", () => {
  const parsed = storyShareSchema.safeParse({
    ...emptyStoryDraft(2),
    days: "10",
    outcomes: ["Better sleep"],
    evidenceName: "lab.jpg",
    consentUpload: false,
    consentPublic: true,
    consentTruth: true,
    consentSupplement: true,
    signature: "Maria Santos",
  });
  assert.equal(parsed.success, false);
});

test("a complete self story passes review", () => {
  const parsed = storyShareSchema.safeParse({
    ...emptyStoryDraft(2),
    days: "12",
    outcomes: ["Better sleep"],
    statement: "I sleep deeper.",
    consentPublic: true,
    consentTruth: true,
    consentSupplement: true,
    signature: "Maria Santos",
  });
  assert.equal(parsed.success, true);
});

test("typed name must match the card when a name exists", () => {
  assert.equal(namesMatch("Maria Santos", "Maria Santos"), true);
  assert.equal(namesMatch("maria", "Maria Santos"), false);
});

test("first invalid field follows the current step order", () => {
  assert.equal(
    firstInvalidField({ relationship: "Add your relationship" }, [
      "about",
      "relationship",
    ]),
    "relationship",
  );
});
