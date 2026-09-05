import assert from "node:assert/strict";
import test from "node:test";

import { spokeLinks, spokeOrigins } from "./app-links.ts";

const GEMA = "https://gema.gutguard.ph";
const ACADEMY = "https://academy.gutguard.ph";

test("both spokes appear, in nav order, when both are configured", () => {
  const links = spokeLinks(spokeOrigins({ gema: GEMA, academy: ACADEMY }));
  assert.deepEqual(
    links.map((link) => [link.key, link.label, link.href]),
    [
      ["gema", "Events", GEMA],
      ["academy", "Academy", ACADEMY],
    ],
  );
});

test("an unconfigured spoke is omitted, never rendered dead", () => {
  // This is the state before the owner's DNS lands. A nav item that goes
  // nowhere is worse than one that is absent.
  assert.deepEqual(spokeLinks(spokeOrigins({ gema: GEMA })).map((l) => l.key), ["gema"]);
  assert.deepEqual(spokeLinks(spokeOrigins({})), []);
});

test("a path or trailing slash reduces to the origin", () => {
  const links = spokeLinks(spokeOrigins({ gema: `${GEMA}/events/`, academy: `${ACADEMY}/` }));
  assert.deepEqual(links.map((link) => link.href), [GEMA, ACADEMY]);
});

test("a value that is not an http(s) URL is dropped rather than linked", () => {
  for (const bad of ["", "   ", "gema.gutguard.ph", "javascript:alert(1)", "not a url"]) {
    assert.deepEqual(spokeOrigins({ gema: bad }).gema, null, bad);
  }
});

test("Events is not called GEMA — the sidebar already has a GEMA drawer", () => {
  // Renaming either one without the other puts two GEMAs in one sidebar.
  const labels = spokeLinks(spokeOrigins({ gema: GEMA, academy: ACADEMY })).map((l) => l.label);
  assert.deepEqual(labels, ["Events", "Academy"]);
  assert.ok(!labels.includes("GEMA"));
});
