import assert from "node:assert/strict";
import test from "node:test";
import { firstOrderEarned } from "./points.ts";

test("first-order peso value caps at 4500", () => {
  assert.equal(firstOrderEarned(100, 500), 1500);
  assert.equal(firstOrderEarned(500, 500), 4500);
  assert.equal(firstOrderEarned(0, 0), 0);
});
