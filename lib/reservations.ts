import {
  canJoinWaitlist,
  canReserveEvent,
  getEventBySlug,
  type EventStatus,
} from "./events.ts";

export type ReservationKind = "reserved" | "waitlist";

export type ReservationMap = Record<string, ReservationKind>;

export function reservationKindForStatus(status: EventStatus): ReservationKind | null {
  if (canReserveEvent(status)) return "reserved";
  if (canJoinWaitlist(status)) return "waitlist";
  return null;
}

export function decideReservation(
  slug: string,
  existing: ReservationMap,
):
  | { ok: true; kind: ReservationKind; notice: "confirmed" | "waitlist" | "exists" }
  | { ok: false; error: string } {
  const event = getEventBySlug(slug);
  if (!event) return { ok: false, error: "That evening is not on the list." };

  const current = existing[slug];
  if (current) {
    return { ok: true, kind: current, notice: current === "waitlist" ? "waitlist" : "exists" };
  }

  const kind = reservationKindForStatus(event.status);
  if (!kind) {
    return { ok: false, error: "This evening is not taking new names." };
  }

  return {
    ok: true,
    kind,
    notice: kind === "waitlist" ? "waitlist" : "confirmed",
  };
}
