import { hasSupply, type MockSession } from "@/lib/mock/seed";

export function memberNotifications(session: MockSession) {
  return [
    session.invites[0] ? `${session.invites[0].name} registered` : null,
    hasSupply(session.daysLeft) && session.daysLeft <= 10
      ? `${session.daysLeft} days of Gutguard left`
      : null,
  ].filter((item): item is string => Boolean(item));
}
