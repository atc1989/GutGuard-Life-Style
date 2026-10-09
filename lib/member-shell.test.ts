import assert from "node:assert/strict";
import test from "node:test";
import {
  MEMBER_SECTIONS,
  isMemberSectionActive,
  memberShellPresentation,
  nextMenuIndex,
} from "./member-shell.ts";

test("member section routes remain the three canonical destinations", () => {
  assert.deepEqual(
    MEMBER_SECTIONS.map(({ href }) => href),
    ["/app/health", "/app/team", "/app/story"],
  );
});

test("active section follows the displayed route, including nested routes", () => {
  assert.equal(isMemberSectionActive("/app/team", "/app/team"), true);
  assert.equal(isMemberSectionActive("/app/team/member-1", "/app/team"), true);
  assert.equal(isMemberSectionActive("/app/story", "/app/team"), false);
});

test("the canonical 900px shell breakpoint shows exactly one order CTA location", () => {
  assert.deepEqual(memberShellPresentation(899), {
    sidebar: false,
    sectionControl: true,
    orderBottomBar: true,
  });
  assert.deepEqual(memberShellPresentation(900), {
    sidebar: true,
    sectionControl: false,
    orderBottomBar: false,
  });
});

test("menu arrow navigation wraps and handles an unfocused menu", () => {
  assert.equal(nextMenuIndex(0, -1, 3), 2);
  assert.equal(nextMenuIndex(2, 1, 3), 0);
  assert.equal(nextMenuIndex(-1, 1, 3), 0);
  assert.equal(nextMenuIndex(-1, -1, 3), 2);
  assert.equal(nextMenuIndex(0, 1, 0), -1);
});
