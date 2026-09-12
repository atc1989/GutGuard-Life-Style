import { memberDisplayName } from "../initials.ts";
import { isCardless, normalizeCardNumber } from "./card.ts";

/**
 * Change 9 — the identity the Lifestyle member shell shows.
 *
 * Pure: no database, no cookies. The server loader fetches the row; this
 * decides what the chrome may print. `/card` uses the same name order:
 * `public.profiles.name`, then Auth `user_metadata.name` / `full_name`,
 * then the display fallback `"Member"`.
 */
export type MemberChromeProfile = {
  name?: string | null;
  mobile?: string | null;
  sponsor?: string | null;
  card_no?: string | null;
};

export type MemberChromeInput = {
  profile?: MemberChromeProfile | null;
  metadataName?: string | null;
};

export type MemberChrome = {
  /** Raw resolved name before the `"Member"` display fallback. */
  name: string;
  displayName: string;
  mobile: string;
  sponsor: string;
  /** Minted card number, or `""` when cardless / legacy placeholder. */
  cardNo: string;
};

export const EMPTY_MEMBER_CHROME: MemberChrome = {
  name: "",
  displayName: "Member",
  mobile: "",
  sponsor: "",
  cardNo: "",
};

function firstFilled(...values: (string | null | undefined)[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function authMetadataName(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** Same fields `/card` reads from `user.user_metadata`. */
export function metadataNameFromAuth(user: {
  user_metadata?: Record<string, unknown> | null;
} | null | undefined): string | null {
  const metadata = user?.user_metadata;
  if (!metadata) return null;
  return authMetadataName(metadata.name) ?? authMetadataName(metadata.full_name);
}

export function resolveMemberChrome(input: MemberChromeInput = {}): MemberChrome {
  const profile = input.profile ?? null;
  const name = firstFilled(profile?.name, input.metadataName);
  const cardless = isCardless({ card_no: profile?.card_no ?? null });
  return {
    name,
    displayName: memberDisplayName(name),
    mobile: firstFilled(profile?.mobile),
    sponsor: firstFilled(profile?.sponsor),
    cardNo: cardless ? "" : normalizeCardNumber(profile?.card_no),
  };
}

/**
 * When Supabase is on, `chrome` is the server snapshot (never `localStorage`).
 * When it is off, `chrome` is `null` and the mock session remains the UI.
 */
export function memberChromeForUi(
  chrome: MemberChrome | null,
  session: {
    name: string;
    mobile: string;
    sponsor: string;
    cardNo: string;
  },
): MemberChrome {
  if (chrome) return chrome;
  return {
    name: session.name,
    displayName: memberDisplayName(session.name),
    mobile: session.mobile,
    sponsor: session.sponsor,
    cardNo: session.cardNo,
  };
}
