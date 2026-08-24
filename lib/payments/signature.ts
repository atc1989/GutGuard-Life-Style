import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function hmacHex(secret: string, message: string): string {
  return createHmac("sha256", secret).update(message, "utf8").digest("hex");
}

function equalHex(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** Parse `t=timestamp,v1=hex` or `sha256=hex` or a bare hex digest. */
export function extractSignature(header: string | null): {
  timestamp?: string;
  digest: string;
} | null {
  if (!header) return null;
  const trimmed = header.trim();
  if (!trimmed) return null;

  if (trimmed.includes("=") && trimmed.includes(",")) {
    const parts = Object.fromEntries(
      trimmed.split(",").map((chunk) => {
        const idx = chunk.indexOf("=");
        return [chunk.slice(0, idx).trim(), chunk.slice(idx + 1).trim()];
      }),
    );
    const digest = parts.v1 || parts.sha256 || parts.signature;
    if (!digest) return null;
    return { timestamp: parts.t, digest };
  }

  if (trimmed.startsWith("sha256=")) {
    return { digest: trimmed.slice("sha256=".length) };
  }

  return { digest: trimmed };
}

export function verifyWebhookSignature(input: {
  rawBody: string;
  header: string | null;
  secret: string;
}): boolean {
  const parsed = extractSignature(input.header);
  if (!parsed) return false;
  const message = parsed.timestamp
    ? `${parsed.timestamp}.${input.rawBody}`
    : input.rawBody;
  const expected = hmacHex(input.secret, message);
  return equalHex(expected.toLowerCase(), parsed.digest.toLowerCase());
}

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || null;
}

export function ipAllowed(ip: string | null, allowlist: string[]): boolean {
  if (allowlist.length === 0) return true;
  if (!ip) return false;
  return allowlist.includes(ip);
}

export function parseAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}
