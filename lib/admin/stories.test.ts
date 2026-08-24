import assert from "node:assert/strict";
import test from "node:test";
import { MOCK_STORIES } from "./mock-stories.ts";
import { filterStories, storyBlurb, storyStatusLabel } from "./stories.ts";
import { parseStoryDirectoryQuery } from "../schemas/stories.ts";

test("story queue defaults to pending", () => {
  assert.deepEqual(parseStoryDirectoryQuery({}), { q: "", filter: "pending" });
});

test("pending filter hides approved and flagged rows", () => {
  const pending = filterStories(MOCK_STORIES, "", "pending");
  assert.ok(pending.every((row) => row.status === "pending"));
  assert.equal(pending.length, 2);
});

test("search matches member and outcome copy", () => {
  const hits = filterStories(MOCK_STORIES, "digestion", "all");
  assert.equal(hits.length, 1);
  assert.equal(hits[0]?.memberName, "Aling Puring");
  assert.match(storyBlurb(hits[0]!), /sister/);
  assert.equal(storyStatusLabel("flagged"), "Flagged");
});
