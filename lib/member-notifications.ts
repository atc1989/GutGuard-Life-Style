import {
  hasSupply,
  type MockSession,
  type NotificationPermissionState,
  type OverlayId,
} from "./mock/seed.ts";
import { completedDoseDays, DAY_TEN_TARGET } from "./health.ts";
import { buildRoster } from "./team.ts";

export type MemberNotice = {
  id: string;
  title: string;
  body: string;
  at: string;
  href?: string;
  overlay?: Exclude<OverlayId, null>;
};

export type { NotificationPermissionState };

function startOfToday(now = new Date()) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date;
}

function hoursAgo(hours: number, now = new Date()) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number, now = new Date()) {
  const date = new Date(now);
  date.setDate(now.getDate() - days);
  date.setHours(9, 0, 0, 0);
  return date.toISOString();
}

export function memberNotifications(
  session: MockSession,
  now = new Date(),
): MemberNotice[] {
  const items: MemberNotice[] = [];
  const firstInvite = session.invites[0];
  if (firstInvite) {
    items.push({
      id: "invite-first",
      title: `${firstInvite.name} registered`,
      body: "Open My Team when you want to follow up. Nothing was sent for you.",
      at: hoursAgo(3, now),
      href: "/app/team",
    });
  }
  if (hasSupply(session.daysLeft) && session.daysLeft <= 10) {
    items.push({
      id: "supply-low",
      title: `${session.daysLeft} days of Gutguard left`,
      body: session.notificationPrefs.refill
        ? `${session.sponsor || "Your sponsor"} can plan a refill with you.`
        : "Refill reminders are muted. Supply still shows on My Health.",
      at: hoursAgo(6, now),
      href: "/app/health",
    });
  }
  const completed = completedDoseDays(session.doseLog, session.capsulesPerDay);
  if (completed > 0 && completed < DAY_TEN_TARGET) {
    items.push({
      id: "dose-pace",
      title: `${completed} completed dose-days`,
      body: "Counted from logged days, not elapsed time.",
      at: hoursAgo(1, now),
      href: "/app/health",
    });
  }
  const teamUnlocked = session.baseDone.every(Boolean);
  const attention = teamUnlocked
    ? buildRoster(session).find((member) => member.attentionReason)
    : undefined;
  if (attention) {
    items.push({
      id: `team-${attention.id}`,
      title: `${attention.name} needs a follow-up`,
      body: attention.attentionReason ?? "Open the roster.",
      at: daysAgo(1, now),
      href: "/app/team",
    });
  }
  return items;
}

export function unreadNotifications(
  session: MockSession,
  now = new Date(),
) {
  return memberNotifications(session, now).filter(
    (item) => !session.notificationReads[item.id],
  );
}

export function groupNotifications(items: MemberNotice[], now = new Date()) {
  const start = startOfToday(now).getTime();
  const today: MemberNotice[] = [];
  const earlier: MemberNotice[] = [];
  for (const item of items) {
    if (new Date(item.at).getTime() >= start) today.push(item);
    else earlier.push(item);
  }
  return { today, earlier };
}

export function permissionCopy(state: NotificationPermissionState) {
  switch (state) {
    case "allowed":
      return "Allowed in this browser.";
    case "blocked":
      return "Blocked in this browser. Use the site settings to change it.";
    case "unsupported":
      return "This browser cannot ask for alerts. In-app notices still work.";
    default:
      return "Not asked yet.";
  }
}

export function readBrowserPermission(): NotificationPermissionState {
  if (typeof Notification === "undefined") return "unsupported";
  if (Notification.permission === "granted") return "allowed";
  if (Notification.permission === "denied") return "blocked";
  return "not_asked";
}

export async function requestBrowserNotifications(): Promise<NotificationPermissionState> {
  if (typeof Notification === "undefined") return "unsupported";
  const result = await Notification.requestPermission();
  if (result === "granted") return "allowed";
  if (result === "denied") return "blocked";
  return "not_asked";
}
