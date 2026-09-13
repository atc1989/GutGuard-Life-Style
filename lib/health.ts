import {
  DOSE_SLOTS,
  type DoseLog,
  type HealthSetupId,
  type MockSession,
} from "./mock/seed.ts";

export const DAY_TEN_TARGET = 10;
export const JOURNEY_DAYS = 90;

export function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(now = new Date()) {
  return dayKey(now);
}

export function lastDayKeys(count: number, now = new Date()) {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    days.push(dayKey(date));
  }
  return days;
}

export function takenSlotCount(entry: DoseLog[string] | undefined) {
  if (!entry) return 0;
  return DOSE_SLOTS.filter((slot) => entry[slot.id]).length;
}

export function completedDoseDays(log: DoseLog, capsulesPerDay: number) {
  return Object.values(log).filter(
    (entry) => takenSlotCount(entry) >= capsulesPerDay,
  ).length;
}

export type DayDoseState =
  | "complete"
  | "partial"
  | "missed"
  | "today"
  | "future"
  | "open";

export function dayDoseState(
  log: DoseLog,
  day: string,
  capsulesPerDay: number,
  today = todayKey(),
): DayDoseState {
  const taken = takenSlotCount(log[day]);
  if (day > today) return "future";
  if (day === today) {
    if (taken >= capsulesPerDay) return "complete";
    if (taken > 0) return "partial";
    return "today";
  }
  if (taken >= capsulesPerDay) return "complete";
  if (taken > 0) return "partial";
  const started = Object.values(log).some((entry) => takenSlotCount(entry) > 0);
  return started ? "missed" : "open";
}

export function dayDoseLabel(state: DayDoseState) {
  switch (state) {
    case "complete":
      return "Complete";
    case "partial":
      return "Partial";
    case "missed":
      return "Missed";
    case "today":
      return "Today";
    case "future":
      return "Future";
    default:
      return "Not started";
  }
}

export function setupComplete(session: Pick<MockSession, "healthSetup">) {
  return (
    session.healthSetup.doses &&
    session.healthSetup.contact &&
    session.healthSetup.community
  );
}

export function healthSetupSteps(session: MockSession) {
  return [
    {
      id: "doses" as const satisfies HealthSetupId,
      title: "Daily doses",
      when: "Setup",
      detail: session.healthSetup.doses
        ? `${session.capsulesPerDay} capsules a day. The new count applies from tomorrow.`
        : "Set how many capsules you take, then log today when you are ready.",
      done: session.healthSetup.doses,
    },
    {
      id: "contact" as const satisfies HealthSetupId,
      title: "How we may contact you",
      when: "Setup",
      detail: session.healthSetup.contact
        ? contactChannelCopy(session.contactChannel)
        : "Choose a channel your sponsor may use for refill and check-in.",
      done: session.healthSetup.contact,
    },
    {
      id: "community" as const satisfies HealthSetupId,
      title: "Community destination",
      when: "Setup",
      detail: session.healthSetup.community
        ? communityCopy(session.communityDestination)
        : "Pick where you want gathering notes and stories.",
      done: session.healthSetup.community,
    },
  ];
}

export function contactChannelCopy(
  channel: MockSession["contactChannel"],
) {
  if (channel === "telegram") return "Telegram messages, when you have joined.";
  if (channel === "sms") return "SMS to the number on your card.";
  return "In-app reminders only.";
}

export function communityCopy(
  destination: MockSession["communityDestination"],
) {
  if (destination === "telegram") return "Telegram community.";
  if (destination === "facebook") return "Facebook community.";
  return "Upcoming Ginhawa evenings and the story feed.";
}

export function firstIncompleteSetup(session: MockSession): HealthSetupId | null {
  if (!session.healthSetup.doses) return "doses";
  if (!session.healthSetup.contact) return "contact";
  if (!session.healthSetup.community) return "community";
  return null;
}

export type GuidanceTone = "info" | "care" | "note";

export function dailyGuidance(
  session: MockSession,
  today = todayKey(),
): { tone: GuidanceTone; title: string; body: string } {
  const taken = takenSlotCount(session.doseLog[today]);
  const completed = completedDoseDays(session.doseLog, session.capsulesPerDay);

  if (taken === 0) {
    return {
      tone: "care",
      title: "Take care",
      body: "If you feel worse than usual, pause and talk to your sponsor or a clinician. Gutguard is a food supplement — this page does not diagnose or treat.",
    };
  }
  if (taken < session.capsulesPerDay) {
    return {
      tone: "note",
      title: "Worth knowing",
      body: `${taken} of ${session.capsulesPerDay} doses logged today. Common discomfort is not always harmless — use your escalation route if something feels wrong.`,
    };
  }
  if (completed < DAY_TEN_TARGET) {
    return {
      tone: "info",
      title: "Tip",
      body: `${completed} completed dose-days so far. Day ten is a check-in with your sponsor, not a promised health result.`,
    };
  }
  return {
    tone: "info",
    title: "Tip",
    body: "Today’s doses are logged. Settings, Health, and your card stay open after the first ten days.",
  };
}

export function dayTenCopy(completed: number) {
  if (completed >= DAY_TEN_TARGET) {
    return {
      done: true as const,
      title: "First ten dose-days logged",
      body: "Your sponsor can now walk the first check-in. This is not a medical outcome. Next: keep today’s doses, then share a story only if you want to.",
    };
  }
  return {
    done: false as const,
    title: `${completed} of ${DAY_TEN_TARGET} completed dose-days`,
    body: "Progress counts days you actually logged, not calendar time. Completing ten unlocks a sponsor check-in — not a health claim.",
  };
}
