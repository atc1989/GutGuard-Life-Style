"use server";

import { BASE_STEPS } from "@/lib/mock/seed";
import {
  orderStatusSchema,
  recoverOrderSchema,
  type OrderStatus,
} from "@/lib/schemas/order";
import {
  moderateStoriesSchema,
  storyStatusSchema,
  type StoryStatus,
} from "@/lib/schemas/story-moderate";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AdminGate =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; userId: string }
  | { ok: false; error: string };

export async function requireAdmin(): Promise<AdminGate> {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in required." };
  }

  const { data: isAdmin, error } = await supabase.rpc("lifestyle_is_admin");
  if (error || !isAdmin) {
    return { ok: false, error: "Admin access required." };
  }

  return { ok: true, supabase, userId: user.id };
}

export type AdminUserRow = {
  id: string;
  name: string;
  mobile: string;
  phase: string;
  claimed: boolean;
  created_at: string;
  baseComplete: boolean;
};

export async function listAdminUsers(input?: {
  q?: string;
  claimed?: "all" | "yes" | "no";
  base?: "all" | "done" | "open";
}): Promise<{ ok: true; rows: AdminUserRow[] } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  let query = gate.supabase
    .from("profiles")
    .select("id, name, mobile, phase, claimed, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const q = input?.q?.trim();
  if (q) {
    query = query.or(`name.ilike.%${q}%,mobile.ilike.%${q}%`);
  }
  if (input?.claimed === "yes") query = query.eq("claimed", true);
  if (input?.claimed === "no") query = query.eq("claimed", false);

  const { data, error } = await query;
  if (error) return { ok: false, error: "Could not load members. Try again." };

  const rows: AdminUserRow[] = [];
  for (const profile of data ?? []) {
    const { data: baseComplete } = await gate.supabase.rpc(
      "lifestyle_base_complete",
      { p_user: profile.id },
    );
    const done = Boolean(baseComplete);
    if (input?.base === "done" && !done) continue;
    if (input?.base === "open" && done) continue;
    rows.push({
      id: profile.id,
      name: profile.name,
      mobile: profile.mobile,
      phase: profile.phase,
      claimed: profile.claimed,
      created_at: profile.created_at,
      baseComplete: done,
    });
  }

  return { ok: true, rows };
}

export type AdminUserDetail = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  phase: string;
  claimed: boolean;
  points: number;
  pending: number;
  banked: number;
  daysLeft: number;
  capsulesPerDay: number;
  created_at: string;
  baseSteps: { index: number; title: string; done: boolean }[];
  baseComplete: boolean;
};

export async function getAdminUserDetail(
  id: string,
): Promise<{ ok: true; user: AdminUserDetail } | { ok: false; error: string }> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  const { data: profile, error } = await gate.supabase
    .from("profiles")
    .select(
      "id, name, mobile, email, phase, claimed, points, pending, banked, days_left, capsules_per_day, created_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) {
    return { ok: false, error: "Member not found." };
  }

  const { data: progress } = await gate.supabase
    .from("base_progress")
    .select("step_index, done")
    .eq("user_id", id);

  const byIndex = new Map(
    (progress ?? []).map((row) => [row.step_index, Boolean(row.done)]),
  );
  const { data: baseComplete } = await gate.supabase.rpc(
    "lifestyle_base_complete",
    { p_user: id },
  );

  return {
    ok: true,
    user: {
      id: profile.id,
      name: profile.name,
      mobile: profile.mobile,
      email: profile.email,
      phase: profile.phase,
      claimed: profile.claimed,
      points: profile.points,
      pending: profile.pending,
      banked: profile.banked,
      daysLeft: profile.days_left,
      capsulesPerDay: profile.capsules_per_day,
      created_at: profile.created_at,
      baseComplete: Boolean(baseComplete),
      baseSteps: BASE_STEPS.map((step, index) => ({
        index,
        title: step.title,
        done: byIndex.get(index) ?? false,
      })),
    },
  };
}

export type AdminOrderRow = {
  id: string;
  userId: string;
  memberName: string;
  memberMobile: string;
  qty: number;
  amountPesos: number;
  status: OrderStatus;
  daysLeft: number;
  capsulesPerDay: number;
  mayaPaymentId: string | null;
  lastError: string | null;
  reconciledAt: string | null;
  reconciledBy: string | null;
  createdAt: string;
};

export async function listAdminOrders(input?: {
  status?: OrderStatus | "all";
}): Promise<
  | {
      ok: true;
      rows: AdminOrderRow[];
      counts: Record<OrderStatus, number>;
      webhookDown: boolean;
      lastWebhookError: string | null;
    }
  | { ok: false; error: string }
> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  let query = gate.supabase
    .from("orders")
    .select(
      "id, user_id, qty, amount_pesos, status, maya_payment_id, last_error, reconciled_at, reconciled_by, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const status = input?.status ?? "all";
  if (status !== "all") {
    const parsed = orderStatusSchema.safeParse(status);
    if (!parsed.success) return { ok: false, error: "Invalid status filter." };
    query = query.eq("status", parsed.data);
  }

  const { data, error } = await query;
  if (error) return { ok: false, error: "Could not load orders. Try again." };

  const userIds = [...new Set((data ?? []).map((row) => row.user_id))];
  const profiles = new Map<
    string,
    { name: string; mobile: string; days_left: number; capsules_per_day: number }
  >();
  if (userIds.length) {
    const { data: profileRows } = await gate.supabase
      .from("profiles")
      .select("id, name, mobile, days_left, capsules_per_day")
      .in("id", userIds);
    for (const profile of profileRows ?? []) {
      profiles.set(profile.id, profile);
    }
  }

  const counts: Record<OrderStatus, number> = {
    pending: 0,
    reconciled: 0,
    failed: 0,
    cancelled: 0,
  };
  const { data: allStatuses } = await gate.supabase.from("orders").select("status");
  for (const row of allStatuses ?? []) {
    const key = orderStatusSchema.safeParse(row.status);
    if (key.success) counts[key.data] += 1;
  }

  const { data: webhookRows } = await gate.supabase
    .from("webhook_events")
    .select("ok, error, created_at")
    .eq("provider", "maya")
    .order("created_at", { ascending: false })
    .limit(20);

  const recentFails = (webhookRows ?? []).filter((row) => !row.ok);
  const webhookDown = recentFails.length >= 3;
  const lastWebhookError = recentFails[0]?.error ?? null;

  return {
    ok: true,
    counts,
    webhookDown,
    lastWebhookError,
    rows: (data ?? []).map((row) => {
      const profile = profiles.get(row.user_id);
      return {
        id: row.id,
        userId: row.user_id,
        memberName: profile?.name ?? "Member",
        memberMobile: profile?.mobile ?? "—",
        qty: row.qty,
        amountPesos: row.amount_pesos,
        status: orderStatusSchema.parse(row.status),
        daysLeft: profile?.days_left ?? 0,
        capsulesPerDay: profile?.capsules_per_day ?? 2,
        mayaPaymentId: row.maya_payment_id,
        lastError: row.last_error,
        reconciledAt: row.reconciled_at,
        reconciledBy: row.reconciled_by,
        createdAt: row.created_at,
      };
    }),
  };
}

export async function recoverFailedOrder(input: unknown) {
  const parsed = recoverOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid order." };

  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false as const, error: gate.error };

  const { data: order, error: loadError } = await gate.supabase
    .from("orders")
    .select("id, status, amount_pesos")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (loadError || !order) {
    return { ok: false as const, error: "Order not found." };
  }
  if (order.status !== "failed") {
    return { ok: false as const, error: "Only failed orders can be recovered." };
  }

  const { error } = await gate.supabase
    .from("orders")
    .update({
      status: "reconciled",
      reconciled_at: new Date().toISOString(),
      reconciled_by: gate.userId,
      last_error: null,
      updated_at: new Date().toISOString(),
      notes: `Recovered by admin · ₱${order.amount_pesos}`,
    })
    .eq("id", order.id);

  if (error) return { ok: false as const, error: "Could not recover order." };
  return { ok: true as const };
}

export type AdminStoryRow = {
  id: string;
  userId: string;
  memberName: string;
  about: string;
  relationship: string | null;
  days: string;
  capsules: string;
  outcomes: string[];
  status: StoryStatus;
  createdAt: string;
  rejectReason: string | null;
};

export async function listAdminStories(input?: {
  status?: StoryStatus | "all";
}): Promise<
  | { ok: true; rows: AdminStoryRow[]; counts: Record<StoryStatus, number> }
  | { ok: false; error: string }
> {
  const gate = await requireAdmin();
  if (!gate.ok) return { ok: false, error: gate.error };

  let query = gate.supabase
    .from("stories")
    .select(
      "id, user_id, about, relationship, days, capsules, outcomes, status, created_at, reject_reason",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const status = input?.status ?? "pending";
  if (status !== "all") {
    const parsed = storyStatusSchema.safeParse(status);
    if (!parsed.success) return { ok: false, error: "Invalid status filter." };
    query = query.eq("status", parsed.data);
  }

  const { data, error } = await query;
  if (error) return { ok: false, error: "Could not load stories. Try again." };

  const userIds = [...new Set((data ?? []).map((row) => row.user_id))];
  const names = new Map<string, string>();
  if (userIds.length) {
    const { data: profileRows } = await gate.supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);
    for (const profile of profileRows ?? []) {
      names.set(profile.id, profile.name);
    }
  }

  const counts: Record<StoryStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  const { data: allStatuses } = await gate.supabase.from("stories").select("status");
  for (const row of allStatuses ?? []) {
    const key = storyStatusSchema.safeParse(row.status);
    if (key.success) counts[key.data] += 1;
  }

  return {
    ok: true,
    counts,
    rows: (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      memberName: names.get(row.user_id) ?? "Member",
      about: row.about,
      relationship: row.relationship,
      days: row.days,
      capsules: row.capsules,
      outcomes: row.outcomes ?? [],
      status: storyStatusSchema.parse(row.status ?? "pending"),
      createdAt: row.created_at,
      rejectReason: row.reject_reason,
    })),
  };
}

export async function moderateStories(input: unknown) {
  const parsed = moderateStoriesSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Select at least one story.",
      count: 0,
      failedIds: [] as string[],
    };
  }

  if (parsed.data.action === "reject" && !parsed.data.reason?.trim()) {
    return {
      ok: false as const,
      error: "Add a short reject reason.",
      count: 0,
      failedIds: parsed.data.ids,
    };
  }

  const gate = await requireAdmin();
  if (!gate.ok) {
    return {
      ok: false as const,
      error: gate.error,
      count: 0,
      failedIds: parsed.data.ids,
    };
  }

  const nextStatus = parsed.data.action === "approve" ? "approved" : "rejected";
  const { data, error } = await gate.supabase
    .from("stories")
    .update({
      status: nextStatus,
      reviewed_at: new Date().toISOString(),
      reviewed_by: gate.userId,
      reject_reason:
        parsed.data.action === "reject" ? parsed.data.reason?.trim() : null,
    })
    .in("id", parsed.data.ids)
    .select("id");

  if (error) {
    return {
      ok: false as const,
      error: "Could not moderate stories.",
      count: 0,
      failedIds: parsed.data.ids,
    };
  }

  const updated = new Set((data ?? []).map((row) => row.id));
  const failedIds = parsed.data.ids.filter((id) => !updated.has(id));
  return {
    ok: true as const,
    count: updated.size,
    failedIds,
    action: parsed.data.action,
  };
}

export async function listFeedStories(): Promise<
  | {
      ok: true;
      community: {
        id: string;
        name: string;
        about: string;
        outcomes: string[];
        days: string;
      }[];
      mine: {
        id: string;
        status: StoryStatus;
        about: string;
        outcomes: string[];
      }[];
    }
  | { ok: false; error: string }
> {
  if (!isSupabaseConfigured()) {
    return { ok: true, community: [], mine: [] };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: approved, error } = await supabase
    .from("stories")
    .select("id, user_id, about, outcomes, days, status")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(40);

  if (error) return { ok: false, error: "Could not load stories." };

  const userIds = [...new Set((approved ?? []).map((row) => row.user_id))];
  const names = new Map<string, string>();
  if (userIds.length) {
    const { data: profileRows } = await supabase
      .from("profiles")
      .select("id, name")
      .in("id", userIds);
    for (const profile of profileRows ?? []) {
      names.set(profile.id, profile.name);
    }
  }

  let mine: {
    id: string;
    status: StoryStatus;
    about: string;
    outcomes: string[];
  }[] = [];

  if (user) {
    const { data: own } = await supabase
      .from("stories")
      .select("id, about, outcomes, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    mine = (own ?? []).map((row) => ({
      id: row.id,
      about: row.about,
      outcomes: row.outcomes ?? [],
      status: storyStatusSchema.parse(row.status ?? "pending"),
    }));
  }

  return {
    ok: true,
    mine,
    community: (approved ?? []).map((row) => ({
      id: row.id,
      name: names.get(row.user_id) ?? "Member",
      about: row.about,
      outcomes: row.outcomes ?? [],
      days: row.days,
    })),
  };
}
