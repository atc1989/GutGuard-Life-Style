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
 */

/** Where a member lands with no `returnTo`, or one that is not trusted. */
export const DEFAULT_LANDING = "/card";

type EnvLike = Record<string, string | undefined>;

/**
 * The env vars naming the three apps. Lifestyle already has its own
 * `NEXT_PUBLIC_SITE_URL`; the spokes are new here, and a missing one narrows
 * the allow-list rather than widening it — the safe direction to fail.
 */
export const ORIGIN_ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_ACADEMY_URL",
  "NEXT_PUBLIC_GEMA_URL",
] as const;

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
