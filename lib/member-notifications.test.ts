import assert from "node:assert/strict";
import test from "node:test";
import { createDefaultSession, createNewMemberSession } from "./mock/seed.ts";
import {
  groupNotifications,
  memberNotifications,
  permissionCopy,
  unreadNotifications,
} from "./member-notifications.ts";

test("default member sees supply notices; team follow-up waits for BASE", () => {
  const now = new Date("2026-09-13T15:00:00");
  const notices = memberNotifications(createDefaultSession(), now);
  assert.ok(notices.some((item) => item.id === "supply-low"));
  assert.equal(
    notices.some((item) => item.id.startsWith("team-")),
    false,
  );
  const unlocked = memberNotifications(
    createDefaultSession({
      baseDone: [true, true, true, true, true],
    }),
    now,
  );
  assert.ok(unlocked.some((item) => item.id.startsWith("team-")));
});

test("read state removes a notice from the unread badge", () => {
  const now = new Date("2026-09-13T15:00:00");
  const session = createDefaultSession({
    notificationReads: { "supply-low": true },
  });
  const unread = unreadNotifications(session, now);
  assert.equal(
    unread.some((item) => item.id === "supply-low"),
    false,
  );
});

test("groups notices into Today and Earlier", () => {
  const now = new Date("2026-09-13T15:00:00");
  const grouped = groupNotifications(
    memberNotifications(
      createDefaultSession({
        baseDone: [true, true, true, true, true],
      }),
      now,
    ),
    now,
  );
  assert.ok(grouped.today.length >= 1);
  assert.ok(grouped.earlier.some((item) => item.id.startsWith("team-")));
});

test("permission copy covers every browser state", () => {
  assert.match(permissionCopy("not_asked"), /Not asked/);
  assert.match(permissionCopy("allowed"), /Allowed/);
  assert.match(permissionCopy("blocked"), /Blocked/);
  assert.match(permissionCopy("unsupported"), /cannot ask/);
});

test("a member without invites or supply does not invent notices", () => {
  const notices = memberNotifications(createNewMemberSession());
  assert.equal(notices.length, 0);
});
