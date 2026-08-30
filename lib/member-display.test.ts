import assert from "node:assert/strict";
import test from "node:test";
import { formatIdentityDetails } from "./member-display.ts";

test("identity details omit empty fields without stray separators", () => {
  assert.deepEqual(
    formatIdentityDetails({ name: "", mobile: "  ", sponsor: "Ate Marites" }),
    ["sponsor Ate Marites"],
  );
});

test("identity details preserve the populated display order", () => {
  assert.deepEqual(
    formatIdentityDetails({
      name: "Najee",
      mobile: "0917 000 0000",
      sponsor: "Ate Marites",
    }),
    ["Najee", "0917 000 0000", "sponsor Ate Marites"],
  );
});
