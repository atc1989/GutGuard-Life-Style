"use server";

import { requireAdmin } from "@/lib/admin/guard";
import { MOCK_ORDERS, MOCK_UNMATCHED } from "@/lib/admin/mock-orders";
import {
  filterOrders,
  makeOrderReference,
  orderAmount,
  type OrderDirectoryResult,
  type OrderRow,
  type UnmatchedEvent,
} from "@/lib/admin/orders";
import {
  parseOrderDirectoryQuery,
  queueOrderSchema,
} from "@/lib/schemas/orders";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { PaymentProvider } from "@/lib/payments/envelope";

const CAP = 500;

type OrderListRow = {
  id: string;
  user_id: string;
  quantity: number;
  amount_centavos: number;
  currency: string;
  provider: string;
  status: string;
  reference: string;
  provider_event_id: string | null;
  failure_reason: string | null;
  created_at: string;
  reconciled_at: string | null;
};

function asOrderRow(
  row: OrderListRow,
  profile: { name?: string; mobile?: string } | undefined,
): OrderRow {
  const status =
    row.status === "reconciled" || row.status === "failed" ? row.status : "pending";
  const provider: PaymentProvider = row.provider === "bank" ? "bank" : "maya";
  return {
    id: row.id,
    userId: row.user_id,
    memberName: profile?.name || "Unnamed",
    mobile: profile?.mobile || "—",
    quantity: row.quantity,
    amountCentavos: row.amount_centavos,
    currency: row.currency,
    provider,
    status,
    reference: row.reference,
    providerEventId: row.provider_event_id,
    failureReason: row.failure_reason,
    createdAt: row.created_at,
    reconciledAt: row.reconciled_at,
  };
}

export async function queueOrder(input: unknown) {
  const parsed = queueOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Choose 1 to 6 bottles." };
  }
  const quantity = parsed.data.quantity;
  const amountCentavos = orderAmount(quantity);

  if (!isSupabaseConfigured()) {
    return {
      ok: true as const,
      preview: true,
      reference: makeOrderReference("preview"),
      amountCentavos,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false as const, error: "Sign in to queue an order." };
  }

  const reference = makeOrderReference(user.id);
  const { error } = await supabase.from("orders").insert({
    user_id: user.id,
    quantity,
    amount_centavos: amountCentavos,
    currency: "PHP",
    provider: "maya",
    status: "pending",
    reference,
  });
  if (error) return { ok: false as const, error: "Could not queue that order." };
  return { ok: true as const, preview: false, reference, amountCentavos };
}

export async function loadOrderDirectory(input: {
  q?: string | string[];
  filter?: string | string[];
}): Promise<OrderDirectoryResult> {
  const query = parseOrderDirectoryQuery(input);
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    const rows = filterOrders(MOCK_ORDERS, query.q, query.filter);
    return {
      rows,
      unmatched: MOCK_UNMATCHED,
      matched: rows.length,
      total: MOCK_ORDERS.length,
      source: "preview",
      query: query.q,
      filter: query.filter,
    };
  }

  if (!isServiceRoleConfigured()) {
    return {
      rows: [],
      unmatched: [],
      matched: 0,
      total: 0,
      source: "live",
      query: query.q,
      filter: query.filter,
      error: "The order desk needs a server-only service role key.",
    };
  }

  try {
    const admin = createAdminClient();
    const { data: orders, error } = await admin
      .from("orders")
      .select(
        "id, user_id, quantity, amount_centavos, currency, provider, status, reference, provider_event_id, failure_reason, created_at, reconciled_at",
      )
      .order("created_at", { ascending: false })
      .limit(CAP);

    if (error) {
      return {
        rows: [],
        unmatched: [],
        matched: 0,
        total: 0,
        source: "live",
        query: query.q,
        filter: query.filter,
        error: "Orders could not be loaded. Try again in a moment.",
      };
    }

    const ids = [...new Set((orders ?? []).map((row) => row.user_id))];
    const profiles = new Map<string, { name?: string; mobile?: string }>();
    if (ids.length > 0) {
      const { data: people } = await admin
        .from("profiles")
        .select("id, name, mobile")
        .in("id", ids);
      for (const person of people ?? []) {
        profiles.set(person.id, { name: person.name, mobile: person.mobile });
      }
    }

    const allRows = (orders ?? []).map((row) => asOrderRow(row, profiles.get(row.user_id)));
    const rows = filterOrders(allRows, query.q, query.filter);

    const { data: events } = await admin
      .from("payment_events")
      .select("id, provider, provider_event_id, note, processed_at")
      .eq("matched", false)
      .order("processed_at", { ascending: false })
      .limit(20);

    const unmatched: UnmatchedEvent[] = (events ?? []).map((row) => ({
      id: row.id,
      provider: row.provider === "bank" ? "bank" : "maya",
      providerEventId: row.provider_event_id,
      note: row.note,
      processedAt: row.processed_at,
    }));

    return {
      rows,
      unmatched,
      matched: rows.length,
      total: allRows.length,
      source: "live",
      query: query.q,
      filter: query.filter,
    };
  } catch {
    return {
      rows: [],
      unmatched: [],
      matched: 0,
      total: 0,
      source: "live",
      query: query.q,
      filter: query.filter,
      error: "Orders could not be loaded. Try again in a moment.",
    };
  }
}
