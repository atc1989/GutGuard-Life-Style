/** Two-letter initials for the member avatar. Empty names fall back to GG. */
export function memberInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "GG";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1][0] ?? "";
  return `${first}${last}`.toUpperCase();
}

export function memberDisplayName(name: string): string {
  const trimmed = name.trim();
  return trimmed || "Member";
}
