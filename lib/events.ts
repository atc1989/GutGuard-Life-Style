export const EVENT_STATUSES = [
  "available",
  "nearly_full",
  "waitlist",
  "closed",
  "past",
  "cancelled",
  "postponed",
] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export type GinhawaEvent = {
  slug: string;
  title: string;
  purpose: string;
  lede: string;
  dateLabel: string;
  timeLabel: string;
  venue: string;
  city: string;
  mapQuery: string;
  cost: string;
  availability: string;
  seatsLabel: string;
  status: EventStatus;
  giftActive: boolean;
  outcomes: readonly [string, string, string];
  nextSlug?: string;
  notice?: string;
};

export const GINHAWA_EVENTS: readonly GinhawaEvent[] = [
  {
    slug: "ginhawa-gensan-october",
    title: "Ginhawa evening in General Santos",
    purpose: "A free community gathering about rest, mood, and the gut–brain conversation.",
    lede: "Come as a guest. Hear the offer, meet the people, and decide after. Nothing to pay to sit with us.",
    dateLabel: "Saturday, 4 October 2026",
    timeLabel: "6:00 PM – 8:00 PM",
    venue: "GenSan Product Center",
    city: "General Santos City",
    mapQuery: "GenSan Product Center, General Santos City",
    cost: "Free to attend",
    availability: "Seats open",
    seatsLabel: "Open seats",
    status: "available",
    giftActive: true,
    outcomes: [
      "What a Gutguard Lifestyle card is — and what it is not.",
      "How points toward a first order actually work.",
      "What happens at the door, with no pressure to sell.",
    ],
  },
  {
    slug: "ginhawa-davao-october",
    title: "Ginhawa evening in Davao",
    purpose: "A free community gathering about rest, mood, and the gut–brain conversation.",
    lede: "A quieter room this month. Seats are limited by the hall, not by a marketing countdown.",
    dateLabel: "Tuesday, 7 October 2026",
    timeLabel: "5:30 PM – 7:30 PM",
    venue: "Davao Product Center",
    city: "Davao City",
    mapQuery: "Davao Product Center, Davao City",
    cost: "Free to attend",
    availability: "Nearly full",
    seatsLabel: "Few seats left",
    status: "nearly_full",
    giftActive: true,
    outcomes: [
      "What a Gutguard Lifestyle card is — and what it is not.",
      "How points toward a first order actually work.",
      "What happens at the door, with no pressure to sell.",
    ],
  },
  {
    slug: "ginhawa-koronadal-october",
    title: "Ginhawa evening in Koronadal",
    purpose: "A free community gathering about rest, mood, and the gut–brain conversation.",
    lede: "This hall is full. You can join the waitlist if a seat opens.",
    dateLabel: "Thursday, 9 October 2026",
    timeLabel: "6:00 PM – 8:00 PM",
    venue: "Koronadal Product Center",
    city: "Koronadal",
    mapQuery: "Koronadal Product Center, South Cotabato",
    cost: "Free to attend",
    availability: "Full — waitlist open",
    seatsLabel: "Waitlist",
    status: "waitlist",
    giftActive: false,
    outcomes: [
      "What a Gutguard Lifestyle card is — and what it is not.",
      "How points toward a first order actually work.",
      "What happens at the door, with no pressure to sell.",
    ],
    nextSlug: "ginhawa-gensan-october",
  },
  {
    slug: "ginhawa-bula-closed",
    title: "House gathering in Bula",
    purpose: "A smaller house session. Registration for this date is closed.",
    lede: "This gathering is no longer taking new names. See the next open evening.",
    dateLabel: "Wednesday, 23 September 2026",
    timeLabel: "4:00 PM – 6:00 PM",
    venue: "Purok 4, Bula",
    city: "General Santos City",
    mapQuery: "Bula, General Santos City",
    cost: "Free to attend",
    availability: "Registration closed",
    seatsLabel: "Closed",
    status: "closed",
    giftActive: false,
    outcomes: [
      "What a Gutguard Lifestyle card is — and what it is not.",
      "How points toward a first order actually work.",
      "What happens at the door, with no pressure to sell.",
    ],
    nextSlug: "ginhawa-gensan-october",
  },
  {
    slug: "ginhawa-july-past",
    title: "Ginhawa evening in July",
    purpose: "This gathering has already happened.",
    lede: "Thank you to everyone who came. The next open evening is listed below.",
    dateLabel: "Saturday, 12 July 2026",
    timeLabel: "6:00 PM – 8:00 PM",
    venue: "GenSan Product Center",
    city: "General Santos City",
    mapQuery: "GenSan Product Center, General Santos City",
    cost: "Free to attend",
    availability: "Past event",
    seatsLabel: "Past",
    status: "past",
    giftActive: false,
    outcomes: [
      "What a Gutguard Lifestyle card is — and what it is not.",
      "How points toward a first order actually work.",
      "What happens at the door, with no pressure to sell.",
    ],
    nextSlug: "ginhawa-gensan-october",
  },
  {
    slug: "ginhawa-cancelled",
    title: "Ginhawa evening — cancelled",
    purpose: "This date will not run.",
    lede: "This gathering is cancelled. Please use the replacement evening if you still want to come.",
    dateLabel: "Friday, 18 September 2026",
    timeLabel: "7:00 PM – 9:00 PM",
    venue: "La Herencia Hall",
    city: "General Santos City",
    mapQuery: "La Herencia Hall, General Santos City",
    cost: "Free to attend",
    availability: "Cancelled",
    seatsLabel: "Cancelled",
    status: "cancelled",
    giftActive: false,
    outcomes: [
      "What a Gutguard Lifestyle card is — and what it is not.",
      "How points toward a first order actually work.",
      "What happens at the door, with no pressure to sell.",
    ],
    notice: "Cancelled by the host. No seat is held for this date.",
    nextSlug: "ginhawa-gensan-october",
  },
  {
    slug: "ginhawa-postponed",
    title: "Ginhawa evening — postponed",
    purpose: "This date moved.",
    lede: "This gathering is postponed. The replacement evening is the next open Ginhawa in General Santos.",
    dateLabel: "Sunday, 20 September 2026",
    timeLabel: "3:00 PM – 5:00 PM",
    venue: "Robinsons GenSan",
    city: "General Santos City",
    mapQuery: "Robinsons Place General Santos",
    cost: "Free to attend",
    availability: "Postponed",
    seatsLabel: "Postponed",
    status: "postponed",
    giftActive: false,
    outcomes: [
      "What a Gutguard Lifestyle card is — and what it is not.",
      "How points toward a first order actually work.",
      "What happens at the door, with no pressure to sell.",
    ],
    notice: "Postponed. Use the replacement evening to reserve.",
    nextSlug: "ginhawa-gensan-october",
  },
] as const;

export const EVENT_STATUS_LABEL: Record<EventStatus, string> = {
  available: "Open",
  nearly_full: "Nearly full",
  waitlist: "Waitlist",
  closed: "Closed",
  past: "Past",
  cancelled: "Cancelled",
  postponed: "Postponed",
};

export function getEventBySlug(slug: string): GinhawaEvent | undefined {
  return GINHAWA_EVENTS.find((event) => event.slug === slug);
}

export function listPublicEvents(): GinhawaEvent[] {
  return [...GINHAWA_EVENTS];
}

export function canReserveEvent(status: EventStatus): boolean {
  return status === "available" || status === "nearly_full";
}

export function canJoinWaitlist(status: EventStatus): boolean {
  return status === "waitlist";
}

export function eventReserveHref(slug: string, intent: "reserve" | "waitlist" = "reserve") {
  const params = new URLSearchParams({ event: slug, intent });
  return `/register?${params.toString()}`;
}

export type ReservationNotice = "confirmed" | "exists" | "error" | "waitlist";

export function parseReservationNotice(value: string | undefined): ReservationNotice | null {
  if (
    value === "confirmed" ||
    value === "exists" ||
    value === "error" ||
    value === "waitlist"
  ) {
    return value;
  }
  return null;
}

export function eventMapHref(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function displayInviterName(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const name = raw.trim();
  if (!name || name.length > 40) return null;
  if (/[/@:]/.test(name) || /\d{5,}/.test(name)) return null;
  return name;
}
