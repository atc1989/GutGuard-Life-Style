export const POINTS = {
  register: 5,
  firstAttend: 20,
  repeatAttend: 10,
  telegram: 10,
  facebook: 5,
} as const;

export const FIRST_ORDER_PESOS = 4500;
export const PESO_PER_POINT = 10;
export const CARD_NUMBER = "0240 5578 9012 3456";

export const TRUST_STATS = [
  ["6,000+", "members already"],
  ["20", "product centers nationwide"],
  ["8", "research institutions"],
  ["USAID", "funded"],
] as const;

export const LINKS = {
  site: "https://gutguard.ph",
  facebook: "https://facebook.com/gutguard",
  telegram: "https://t.me/gutguard",
} as const;

export const OUTCOMES = [
  "More energy",
  "Better sleep",
  "Better digestion",
  "Less discomfort",
  "Calmer / focused",
  "Better mood",
  "Better appetite",
  "More active",
  "Clearer skin",
] as const;

export const DOSE_SLOTS = [
  { id: "morning", label: "Morning Habit", note: "before meals · empty stomach" },
  { id: "midday", label: "Midday Boost", note: "after lunch" },
  { id: "dreams", label: "Sweet Dreams", note: "before bedtime" },
] as const;

export type DoseSlotId = (typeof DOSE_SLOTS)[number]["id"];

export const BASE_STEPS = [
  {
    id: "welcome",
    title: "Welcome Orientation",
    when: "Day 0–1",
    detail: "Attended as a guest · 12 Jul",
  },
  {
    id: "belief",
    title: "Product Belief Session",
    when: "Day 2–5",
    detail: "Attended as a guest · 19 Jul",
  },
  {
    id: "exposure",
    title: "Business Exposure",
    when: "Day 6–10",
    detail: "BOM — Thu 24, La Herencia Hall",
  },
  {
    id: "sale",
    title: "First Sale",
    when: "Day 11–17",
    detail: "One real customer, one real order",
  },
  {
    id: "duplication",
    title: "Duplication Initiation",
    when: "Day 18–21",
    detail: "Take one person through Event 1",
  },
] as const;

export const GEMA_RANKS = [
  {
    title: "Squad Leader",
    copy: "Lead a squad, run your own check-ins, carry the standard.",
  },
  {
    title: "Platoon Leader",
    copy: "Build leaders, not just members.",
  },
  {
    title: "Company Commander",
    copy: "Hold a region and the people in it.",
  },
] as const;

export const EVENTS = [
  {
    id: "e1",
    title: "Ginhawa Hub Muster",
    place: "GenSan Product Center",
    when: "Saturday, 6:00 PM",
  },
  {
    id: "e2",
    title: "Product Presentation",
    place: "Davao Product Center",
    when: "Tuesday 22, 5:30 PM",
  },
  {
    id: "e3",
    title: "House Party — Fam Windorski",
    place: "Purok 4, Bula",
    when: "Wednesday 23, 4:00 PM",
  },
  {
    id: "e4",
    title: "Ate Marites Gut Health Talk",
    place: "Robinsons GenSan",
    when: "Saturday 26, 3:00 PM",
  },
  {
    id: "e5",
    title: "Business Opportunity Meeting",
    place: "La Herencia Hall",
    when: "Thursday 24, 2:00 PM",
  },
  {
    id: "e6",
    title: "GEMA Builder Training",
    place: "La Herencia Hall",
    when: "Friday 25, 7:00 PM",
  },
] as const;

export const CONTACTS = [
  { id: "c1", name: "Nene R.", handle: "0917 555 0142", invited: true },
  { id: "c2", name: "Boy Tapang", handle: "0918 555 0199", invited: true },
  { id: "c3", name: "Aling Puring", handle: "0920 555 0177", invited: false },
  { id: "c4", name: "Kuya Ver", handle: "0916 555 0111", invited: false },
  { id: "c5", name: "Jomar L.", handle: "0922 555 0188", invited: false },
] as const;

export const STORIES = [
  {
    id: "s1",
    name: "Lola Remy",
    place: "Davao City",
    quote:
      "Mas magaan ang pakiramdam ko tuwing umaga, at nakakatulog na ako nang maayos.",
  },
  {
    id: "s2",
    name: "Ate Marites",
    place: "General Santos",
    quote: "Nakakalakad na ulit ako sa palengke nang hindi napapagod agad.",
  },
  {
    id: "s3",
    name: "Kuya Ver",
    place: "Koronadal",
    quote: "Mas maganda ang mood ko these days, and I sleep deeper.",
  },
  {
    id: "s4",
    name: "Aling Puring",
    place: "Gensan",
    quote: "Bumalik ang gana ko sa pagkain, at mas okay ang digestion.",
  },
  {
    id: "s5",
    name: "Nene R.",
    place: "Polomolok",
    quote: "Napansin ng mga kaibigan ko na mas fresh daw ang itsura ko.",
  },
  {
    id: "s6",
    name: "Jomar L.",
    place: "Davao City",
    quote: "Mas active at masaya ako ngayon kaysa dati.",
  },
] as const;

export const LANDING_FAQ = [
  {
    q: "What is Gutguard?",
    a: "Gutguard is a Filipino synbiotic — good bacteria plus the fibre that feeds them — made to support the gut side of the gut–brain connection.",
  },
  {
    q: "What is Gutguard Lifestyle Membership?",
    a: "A card and an invitation. Come to an event, see it for yourself, decide after. Nothing to pay to come.",
  },
  {
    q: "What do I get right now?",
    a: "A card and an invitation. Come to an event, see it for yourself, decide after. Nothing to pay to come.",
  },
  {
    q: "What do I get if I bring friends?",
    a: "Every friend who joins adds points to your card. Invite enough and your first order is free.",
  },
  {
    q: "What is a Gutguard Entrepreneur (Gentrep)?",
    a: "Becoming a Gentrep is a choice, not a requirement. Most members simply take the protocol. Selling is a separate choice, later, and only if you want it.",
  },
  {
    q: "Do I have to sell anything?",
    a: "No. Most members just take the product. Selling is a separate choice, later, and only if you want it.",
  },
] as const;

export const FUNNEL_STEPS = [
  {
    n: "01",
    title: "Get your card",
    copy: "Your name and number — that’s it. Free, no payment, no password.",
  },
  {
    n: "02",
    title: "Invite a friend",
    copy: "Every friend who joins adds points to your card.",
  },
  {
    n: "03",
    title: "Points pay for your Gutguard",
    copy: "Invite enough and your first order is free.",
  },
] as const;

export function refillCopy(daysLeft: number): { en: string; tl: string } | null {
  if (daysLeft <= 0) {
    return {
      en: "Last day of supply! Reorder today to keep your streak.",
      tl: "Huling araw na ng supply. Mag-reorder ngayon.",
    };
  }
  if (daysLeft <= 5) {
    return {
      en: "5 days left — reorder now so you don't miss a dose.",
      tl: "5 araw na lang — mag-reorder na para walang lagpas.",
    };
  }
  if (daysLeft <= 10) {
    return {
      en: "10 days of Gutguard left — time to plan your refill.",
      tl: "10 araw na lang ang Gutguard mo — mag-refill na para handa.",
    };
  }
  return null;
}

export type InviteStage = "registered" | "showed" | "bought";

export type Invite = {
  name: string;
  stage: InviteStage;
  at?: string;
};

export type DoseLog = Record<
  string,
  Partial<Record<DoseSlotId, boolean>> & { proof?: string }
>;

export type OverlayId =
  | "order"
  | "settings"
  | "base"
  | "gema"
  | "ggverse"
  | "share"
  | "qr"
  | "invite"
  | null;

export type LedgerEntry = {
  id: string;
  kind: string;
  amount: number;
  pending: boolean;
  label: string;
};

export type FunnelPhase =
  | "landing"
  | "landing2"
  | "register"
  | "invited"
  | "claimed"
  | "nearly"
  | "member";

export type MockSession = {
  name: string;
  mobile: string;
  email: string;
  sponsor: string;
  team: string;
  cardNo: string;
  phase: FunnelPhase;
  claimed: boolean;
  points: number;
  pending: number;
  banked: number;
  daysLeft: number;
  capsulesPerDay: number;
  doseLog: DoseLog;
  invites: Invite[];
  baseDone: boolean[];
  telegram: boolean;
  facebook: boolean;
  notifications: boolean;
  welcomeSeen: boolean;
  contactInvited: Record<string, boolean>;
  ledger: LedgerEntry[];
};

export function createDefaultSession(
  overrides: Partial<MockSession> = {},
): MockSession {
  return {
    name: "Maria Santos",
    mobile: "09175550100",
    email: "",
    sponsor: "Ate Marites",
    team: "GenSan",
    cardNo: CARD_NUMBER,
    phase: "landing",
    claimed: false,
    points: 125,
    pending: 5,
    banked: 500,
    daysLeft: 10,
    capsulesPerDay: 2,
    doseLog: {},
    invites: [
      { name: "Nene R.", stage: "bought" },
      { name: "Boy Tapang", stage: "showed" },
      { name: "Kuya Ver", stage: "showed" },
      { name: "Aling Puring", stage: "registered" },
    ],
    baseDone: [true, true, false, false, false],
    telegram: false,
    facebook: false,
    notifications: true,
    welcomeSeen: false,
    contactInvited: { c1: true, c2: true },
    ledger: [
      { id: "l1", kind: "bought", amount: 25, pending: false, label: "Nene R. bought" },
      { id: "l2", kind: "showed", amount: 25, pending: false, label: "Boy Tapang came to an event" },
      { id: "l3", kind: "registered", amount: 5, pending: true, label: "Aling Puring registered" },
    ],
    ...overrides,
  };
}

export const PHASE_ROUTES: Record<FunnelPhase, string> = {
  landing: "/",
  landing2: "/welcome",
  register: "/register",
  invited: "/card",
  claimed: "/card?claimed=1",
  nearly: "/nearly",
  member: "/app/health",
};
