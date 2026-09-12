/**
 * Change 4c — where a member lands after registering on the hub.
 *
 * D13 puts account creation on Lifestyle only, so a member who starts on
 * Academy or GEMA is sent here and has to be sent back. `?returnTo=` is how,
 * and it sits on an authentication flow: get it wrong and anyone can hand out
 * a Gutguard-branded page that bounces a member to their origin the moment
 * the password is typed.
 *
 * So the rule is an **exact origin allow-list**, and nothing else. Not
 * `startsWith`, not `endsWith`, not a regex on the host — `gutguard.ph.attacker.com`
 * passes all three. Anything not on the list falls back silently; a member
 * never sees a redirect error, they just land where they always did.
 *
 * ## The hub is not on its own allow-list — 2026-09-12
 *
 * It used to be, and that cost a member a 404 in the middle of registering.
 * Academy's Production `NEXT_PUBLIC_SITE_URL` came out of the domain cutover
 * holding the **hub's** origin, so its "Create account" link asked to be
 * returned to `https://lifestyle.gutguard.ph/academy`. The allow-list checks
 * the origin and nothing else, that origin was the hub's own, so the check
 * passed — and Lifestyle has no `/academy` route. Hard 404, straight after the
 * confirm code, which is exactly the "member never sees a redirect error"
 * promise above.
 *
 * A `returnTo` naming the hub can never be worth honouring: the hub already
 * knows where its own members land (`DEFAULT_LANDING`, or the phase the
 * confirm step resumes them at), and the only paths a spoke could ask for are
 * paths the hub does not serve. So the hub's origin is kept off the list, and
 * removed again if a spoke variable is misconfigured to it.
 */

/** Where a member lands with no `returnTo`, or one that is not trusted. */
export const DEFAULT_LANDING = "/card";

type EnvLike = Record<string, string | undefined>;

/**
 * The env vars naming the **spokes** — the only apps a member can be returned
 * to. Lifestyle's own `NEXT_PUBLIC_SITE_URL` is deliberately absent; it is read
 * as `HUB_ENV_KEY` below, to exclude rather than to allow. A missing one
 * narrows the allow-list rather than widening it — the safe direction to fail.
 */
export const ORIGIN_ENV_KEYS = [
  "NEXT_PUBLIC_ACADEMY_URL",
  "NEXT_PUBLIC_GEMA_URL",
] as const;

/**
 * The hub itself. Read only so its origin can be taken back out of the list —
 * see the 2026-09-12 note above. Lifestyle still uses this variable for its
 * own links and its confirm-code email redirect; this is not that.
 */
export const HUB_ENV_KEY = "NEXT_PUBLIC_SITE_URL";

/**
 * Parse a configured value down to a bare origin, or drop it. A value that is
 * not a URL, or is not http/https, is configuration noise and must not become
 * a redirect target.
 */
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

/** The origins a member may be returned to, from configuration. */
export function allowedOrigins(env: EnvLike = process.env): string[] {
  const origins = new Set<string>();
  for (const key of ORIGIN_ENV_KEYS) {
    const origin = toOrigin(env[key]);
    if (origin) origins.add(origin);
  }
  // Leaving the hub off `ORIGIN_ENV_KEYS` is not enough on its own: the way
  // this broke in production was a *spoke* variable holding the hub's origin.
  // Take it out however it got in.
  const hub = toOrigin(env[HUB_ENV_KEY]);
  if (hub) origins.delete(hub);
  return [...origins];
}

/**
 * The trusted landing for a `?returnTo=` value, or `null` when there is none
 * to trust — so a caller can fall back to whatever it would have done anyway.
 *
 * Only an absolute http(s) URL on an allow-listed origin is honoured. A bare
 * path, a protocol-relative `//host`, a `javascript:` URL and an embedded-
 * credentials URL all fall back — the first two because they are ambiguous,
 * the last two because they are attacks.
 */
export function trustedReturnTo(
  raw: string | null | undefined,
  allowed: Iterable<string> = allowedOrigins(),
): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    // No base: a bare path and `//evil.com` both throw here, on purpose.
    url = new URL(trimmed);
  } catch {
    return null;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  // `https://evil.com@academy.example` reads as the allowed host to a human
  // and to `URL.origin`, but not to every client in between. Refuse both halves.
  if (url.username || url.password) return null;

  const permitted = new Set(allowed);
  if (!permitted.has(url.origin)) return null;

  return url.toString();
}

/**
 * `trustedReturnTo` with the hub's own landing as the fallback. Callers that
 * already have a better default of their own — the confirm step resumes a
 * member at their phase — use `trustedReturnTo` and keep it.
 */
export function resolveReturnTo(
  raw: string | null | undefined,
  allowed: Iterable<string> = allowedOrigins(),
): string {
  return trustedReturnTo(raw, allowed) ?? DEFAULT_LANDING;
}
