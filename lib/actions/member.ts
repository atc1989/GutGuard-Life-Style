"use server";

import { BASE_STEPS, FIRST_ORDER_PESOS, type DoseSlotId, type FunnelPhase, type InviteStage } from "@/lib/mock/seed";
import { queueOrderSchema } from "@/lib/schemas/order";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

export async function claimCard() {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      claimed: true,
      phase: "claimed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.user.id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function persistProfile(patch: {
  name?: string;
  mobile?: string;
  email?: string;
  phase?: FunnelPhase;
  claimed?: boolean;
  points?: number;
  pending?: number;
  banked?: number;
  daysLeft?: number;
  capsulesPerDay?: number;
  telegram?: boolean;
  facebook?: boolean;
  notifications?: boolean;
  welcomeSeen?: boolean;
}) {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.mobile !== undefined) row.mobile = patch.mobile;
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.phase !== undefined) row.phase = patch.phase;
  if (patch.claimed !== undefined) row.claimed = patch.claimed;
  if (patch.points !== undefined) row.points = patch.points;
  if (patch.pending !== undefined) row.pending = patch.pending;
  if (patch.banked !== undefined) row.banked = patch.banked;
  if (patch.daysLeft !== undefined) row.days_left = patch.daysLeft;
  if (patch.capsulesPerDay !== undefined) row.capsules_per_day = patch.capsulesPerDay;
  if (patch.telegram !== undefined) row.telegram = patch.telegram;
  if (patch.facebook !== undefined) row.facebook = patch.facebook;
  if (patch.notifications !== undefined) row.notifications = patch.notifications;
  if (patch.welcomeSeen !== undefined) row.welcome_seen = patch.welcomeSeen;
  const { error } = await ctx.supabase
    .from("profiles")
    .update(row)
    .eq("id", ctx.user.id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function persistInvite(name: string, handle: string, stage: InviteStage) {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const { data: unlocked, error: unlockError } = await ctx.supabase.rpc(
    "lifestyle_base_complete",
  );
  if (unlockError) return { ok: false as const, error: unlockError.message };
  if (!unlocked) {
    return {
      ok: false as const,
      error: "Finish BASE Activation before inviting friends.",
    };
  }
  const { error } = await ctx.supabase.from("invites").insert({
    user_id: ctx.user.id,
    name,
    handle,
    stage,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function persistDose(logDate: string, slot: DoseSlotId, value: boolean) {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const { error } = await ctx.supabase.from("dose_logs").upsert(
    {
      user_id: ctx.user.id,
      log_date: logDate,
      [slot]: value,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function persistDoseProof(logDate: string, path: string) {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const { error } = await ctx.supabase.from("dose_logs").upsert(
    {
      user_id: ctx.user.id,
      log_date: logDate,
      proof_path: path,
    },
    { onConflict: "user_id,log_date" },
  );
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function persistBaseStep(index: number, done: boolean) {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  if (index < 0 || index >= BASE_STEPS.length) {
    return { ok: false as const, error: "Invalid BASE step" };
  }
  const { error } = await ctx.supabase.from("base_progress").upsert({
    user_id: ctx.user.id,
    step_index: index,
    done,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function gemaUnlocked(): Promise<boolean> {
  const ctx = await requireUser();
  if (!ctx) return false;
  const { data, error } = await ctx.supabase.rpc("lifestyle_base_complete");
  if (error) return false;
  return Boolean(data);
}

export async function persistPointEvent(input: {
  kind: string;
  amount: number;
  pending: boolean;
  label: string;
}) {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const { error } = await ctx.supabase.from("point_events").insert({
    user_id: ctx.user.id,
    ...input,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function persistStory(input: {
  about: string;
  relationship?: string;
  days: string;
  capsules: string;
  outcomes: string[];
}) {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const { error } = await ctx.supabase.from("stories").insert({
    user_id: ctx.user.id,
    status: "pending",
    ...input,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function queueMemberOrder(input: unknown) {
  const parsed = queueOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid order quantity." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: true as const, skipped: true as const };
  }

  const ctx = await requireUser();
  if (!ctx) return { ok: false as const, error: "Sign in required." };

  const { error } = await ctx.supabase.from("orders").insert({
    user_id: ctx.user.id,
    qty: parsed.data.qty,
    amount_pesos: parsed.data.amountPesos || FIRST_ORDER_PESOS * parsed.data.qty,
    status: "pending",
  });

  if (error) return { ok: false as const, error: "Could not queue order." };
  return { ok: true as const };
}

export async function uploadDoseProof(logDate: string, formData: FormData) {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true, path: "" };
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, error: "No file" };
  }
  const path = `${ctx.user.id}/${logDate}-${file.name}`;
  const { error } = await ctx.supabase.storage.from("dose-proofs").upload(path, file, {
    upsert: true,
  });
  if (error) return { ok: false as const, error: error.message };
  await persistDoseProof(logDate, path);
  return { ok: true as const, path };
}
