import type { OrderFilter } from "../schemas/orders";
import type { OrderStatus, PaymentProvider } from "../payments/envelope";

export const BOTTLE_CENTAVOS = 450_000;

export type OrderRow = {
  id: string;
  userId: string;
  memberName: string;
  mobile: string;
  quantity: number;
  amountCentavos: number;
  currency: string;
  provider: PaymentProvider;
  status: OrderStatus;
  reference: string;
  providerEventId: string | null;
  failureReason: string | null;
  createdAt: string;
  reconciledAt: string | null;
};

export type UnmatchedEvent = {
  id: string;
  provider: PaymentProvider;
  providerEventId: string;
  note: string | null;
  processedAt: string;
};

export type OrderDirectoryResult = {
  rows: OrderRow[];
  unmatched: UnmatchedEvent[];
  matched: number;
  total: number;
  source: "live" | "preview";
  query: string;
  filter: OrderFilter;
  error?: string;
};

export function orderAmount(quantity: number): number {
  return quantity * BOTTLE_CENTAVOS;
}

export function makeOrderReference(userId: string, now = Date.now()): string {
  return `GG-${userId.replace(/-/g, "").slice(0, 8)}-${now}`;
}

export function statusLabel(status: OrderStatus): string {
  if (status === "reconciled") return "Reconciled";
  if (status === "failed") return "Failed";
  return "Pending";
}

export function providerLabel(provider: PaymentProvider): string {
  return provider === "bank" ? "Bank" : "Maya";
}

export function formatOrderAmount(row: OrderRow): string {
  return `₱${(row.amountCentavos / 100).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function haystack(row: OrderRow): string {
  return [row.memberName, row.mobile, row.reference, row.providerEventId ?? ""]
    .join(" ")
    .toLowerCase();
}

export function filterOrders(
  rows: OrderRow[],
  query: string,
  filter: OrderFilter,
): OrderRow[] {
  const needle = query.trim().toLowerCase();
  return rows.filter((row) => {
    if (filter !== "all" && row.status !== filter) return false;
    if (!needle) return true;
    return haystack(row).includes(needle);
  });
}
