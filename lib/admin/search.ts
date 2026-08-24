import type { MemberFilter } from "@/lib/schemas/admin";
import { parseMemberRole, type MemberRole } from "@/lib/admin/roles";

export const BASE_STEP_TOTAL = 5;

export type MemberRow = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  cardNo: string;
  phase: string;
  claimed: boolean;
  role: MemberRole;
  registeredAt: string | null;
  baseDone: number;
  baseTotal: number;
  gemaUnlocked: boolean;
};

export type MemberDirectorySource = "live" | "preview";

export type MemberDirectoryResult = {
  rows: MemberRow[];
  matched: number;
  total: number;
  source: MemberDirectorySource;
  query: string;
  filter: MemberFilter;
  error?: string;
};

const SEARCHABLE: Array<keyof Pick<MemberRow, "name" | "mobile" | "email" | "cardNo">> =
  ["name", "mobile", "email", "cardNo"];

export function normalizeSearch(query: string): string {
  return query.trim().toLowerCase().replace(/\s+/g, " ");
}

export function rowMatchesQuery(row: MemberRow, query: string): boolean {
  const needle = normalizeSearch(query);
  if (!needle) return true;
  const compactNeedle = needle.replace(/\s+/g, "");
  return SEARCHABLE.some((key) => {
    const value = row[key];
    if (!value) return false;
    const haystack = value.toLowerCase();
    return haystack.includes(needle) || haystack.replace(/\s+/g, "").includes(compactNeedle);
  });
}

export function rowMatchesFilter(row: MemberRow, filter: MemberFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "invited":
      return !row.claimed || row.phase === "invited";
    case "claimed":
      return row.claimed;
    case "active":
      return row.phase === "member";
    case "base":
      return row.baseDone >= row.baseTotal;
    case "gema":
      return row.gemaUnlocked;
    case "admin":
      return row.role === "admin";
    default:
      return true;
  }
}

export function filterMembers(
  rows: MemberRow[],
  query: string,
  filter: MemberFilter,
): MemberRow[] {
  return rows.filter(
    (row) => rowMatchesQuery(row, query) && rowMatchesFilter(row, filter),
  );
}

export function registrationLabel(phase: string, claimed: boolean): string {
  if (phase === "member") return "Active member";
  if (phase === "nearly") return "Nearly free";
  if (claimed) return "Card claimed";
  if (phase === "invited") return "Registered";
  if (phase === "register") return "Booth started";
  return phase ? phase.replace(/_/g, " ") : "Unknown";
}

export function gemaLabel(unlocked: boolean): string {
  return unlocked ? "Open" : "Locked";
}

export function formatRegisteredAt(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toISOString().slice(0, 10);
}

export function toMemberRow(input: {
  id: unknown;
  name: unknown;
  mobile: unknown;
  email?: unknown;
  card_no?: unknown;
  cardNo?: unknown;
  phase?: unknown;
  claimed?: unknown;
  role?: unknown;
  created_at?: unknown;
  registeredAt?: unknown;
  baseDone?: unknown;
}): MemberRow {
  const baseDone =
    typeof input.baseDone === "number" && Number.isFinite(input.baseDone)
      ? Math.max(0, Math.min(BASE_STEP_TOTAL, Math.trunc(input.baseDone)))
      : 0;
  return {
    id: typeof input.id === "string" ? input.id : "",
    name: typeof input.name === "string" && input.name.trim() ? input.name : "Unnamed",
    mobile: typeof input.mobile === "string" ? input.mobile : "—",
    email: typeof input.email === "string" && input.email ? input.email : null,
    cardNo:
      (typeof input.cardNo === "string" && input.cardNo) ||
      (typeof input.card_no === "string" && input.card_no) ||
      "—",
    phase: typeof input.phase === "string" && input.phase ? input.phase : "invited",
    claimed: Boolean(input.claimed),
    role: parseMemberRole(input.role),
    registeredAt:
      (typeof input.registeredAt === "string" && input.registeredAt) ||
      (typeof input.created_at === "string" && input.created_at) ||
      null,
    baseDone,
    baseTotal: BASE_STEP_TOTAL,
    gemaUnlocked: baseDone >= BASE_STEP_TOTAL,
  };
}
