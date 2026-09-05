/**
 * Change 5 — the hub's links to its spokes.
 *
 * Lifestyle is home; Events (GEMA) and Academy are the other two apps. They are
 * separate origins, so these are real links, not routes. The origins come from
 * the same variables Change 4c's `returnTo` allow-list is built from, so there
 * is one answer in the codebase to "where is Academy" rather than two that can
 * disagree.
 *
 * A spoke with no configured origin is **omitted**, not rendered dead. A nav
 * item that goes nowhere is worse than one that is absent, and this is exactly
 * the state Lifestyle is in before the owner's DNS lands.
 *
 * `process.env.NEXT_PUBLIC_*` is read as a literal member expression because
 * Next inlines it only in that form — a lookup by key reads `undefined` in the
 * browser, and this component renders there.
 */

export type SpokeKey = "gema" | "academy";

export type SpokeLink = {
  key: SpokeKey;
  /** What it is called in the nav. "Events", not "GEMA" — see below. */
  label: string;
  /** One line for the mobile sheet, where there is room to say more. */
  hint: string;
  href: string;
};

/**
 * Label choice, recorded because it looks like an inconsistency: the sidebar
 * already has a **GEMA** entry, and it is a marketing drawer about ranks that
 * unlocks with BASE. That sells the opportunity. This link opens the events
 * app. Calling this one "Events" keeps the two apart; the board names it that
 * way too.
 */
const SPOKES: { key: SpokeKey; label: string; hint: string }[] = [
  { key: "gema", label: "Events", hint: "Ginhawa events and bookings" },
  { key: "academy", label: "Academy", hint: "Training and your rank" },
];

/** An origin, or null when it is unset or not a usable http(s) URL. */
function toOrigin(value: string | undefined | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function spokeOrigins(
  raw: Partial<Record<SpokeKey, string | undefined>> = {
    gema: process.env.NEXT_PUBLIC_GEMA_URL,
    academy: process.env.NEXT_PUBLIC_ACADEMY_URL,
  },
): Record<SpokeKey, string | null> {
  return {
    gema: toOrigin(raw.gema),
    academy: toOrigin(raw.academy),
  };
}

/** The spokes that are actually reachable, in nav order. */
export function spokeLinks(
  origins: Record<SpokeKey, string | null> = spokeOrigins(),
): SpokeLink[] {
  return SPOKES.flatMap((spoke) => {
    const href = origins[spoke.key];
    return href ? [{ ...spoke, href }] : [];
  });
}
