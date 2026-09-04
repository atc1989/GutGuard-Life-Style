import { createHash } from "node:crypto";

/**
 * Change 4 — the card is minted on first visit, never at signup.
 *
 * This file is the decision half: what a card number is, whether a person has
 * one, and what a mint writes. `ensure-card.ts` does the database work.
 * Everything here is pure so it can be tested without a project.
 */

/** Every Gutguard card number opens with the house digits. */
export const CARD_PREFIX = "0240";

/**
 * The placeholder every member used to get. `lib/mock/seed.ts` exports it as
 * `CARD_NUMBER` and the register action wrote that same literal string onto
 * every row — one card number for the whole membership. A card that is not
 * distinct is not a card, so it is treated as no card at all and re-minted on
 * the next visit. `change4_lazy_product_rows.sql` clears it from the database.
 */
export const LEGACY_CARD_NUMBER = "0240 5578 9012 3456";

/** `0240557890123456` -> `0240 5578 9012 3456`. */
export function formatCardNumber(digits: string): string {
  return (digits.match(/.{1,4}/g) ?? []).join(" ");
}

export function normalizeCardNumber(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

/**
 * Derived from the member's own id, so a mint is idempotent: the same person
 * asked twice gets the same number, and a retried visit cannot hand out two
 * cards. `attempt` is the escape hatch for the unique index rejecting a
 * collision — it re-derives rather than counting upward, so two members racing
 * on the same attempt still diverge.
 */
export function mintCardNumber(userId: string, attempt = 0): string {
  const digest = createHash("sha256").update(`gutguard-card:${userId}:${attempt}`).digest("hex");
  // Three 32-bit slices rather than one big integer: `target` is ES2017 here,
  // where a BigInt literal does not compile.
  let body = "";
  for (let group = 0; group < 3; group += 1) {
    const slice = parseInt(digest.slice(group * 8, group * 8 + 8), 16);
    body += String(slice % 10_000).padStart(4, "0");
  }
  const minted = formatCardNumber(`${CARD_PREFIX}${body}`);
  // Vanishingly unlikely, and still not allowed to happen: the placeholder is
  // read as "no card", so a member holding it would be re-minted every visit.
  return minted === LEGACY_CARD_NUMBER ? mintCardNumber(userId, attempt + 1) : minted;
}

export type CardRow = {
  name?: string | null;
  full_name?: string | null;
  mobile?: string | null;
  phone?: string | null;
  email?: string | null;
  card_no?: string | null;
};

/** A person row with no card on it yet — the thing first visit fills in. */
export function isCardless(row: CardRow | null): boolean {
  if (!row) return true;
  const card = normalizeCardNumber(row.card_no);
  return card === "" || card === LEGACY_CARD_NUMBER;
}

function firstFilled(...values: (string | null | undefined)[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/**
 * The card a cardless person gets: their existing name, a new number, phase
 * `invited`, nothing earned yet.
 *
 * The progress columns are written explicitly rather than left to column
 * defaults, because the row already exists — Change 3 gave every Auth user a
 * person row — so nothing would apply a default. They are only ever written
 * behind a `card_no is null` guard, so this cannot reset a card that is
 * already in play.
 *
 * `name` and `mobile` are filled, never overwritten: a member who set them keeps
 * them, and a guild member gets their guild name (D13).
 */
export function cardMintPatch(input: {
  userId: string;
  row: CardRow | null;
  name?: string | null;
  mobile?: string | null;
  attempt?: number;
}): Record<string, unknown> {
  const row = input.row ?? {};
  const patch: Record<string, unknown> = {
    card_no: mintCardNumber(input.userId, input.attempt ?? 0),
    phase: "invited",
    claimed: false,
    points: 0,
    pending: 0,
    banked: 0,
    days_left: -1,
    updated_at: new Date().toISOString(),
  };

  const name = firstFilled(row.name, row.full_name, input.name);
  if (name) patch.name = name;

  const mobile = firstFilled(row.mobile, row.phone, input.mobile);
  if (mobile) patch.mobile = mobile;

  return patch;
}
