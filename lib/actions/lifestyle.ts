"use server";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/* Saves for the approved member page (Addendum 05). Member session only (RLS). */

async function requireUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

const capsules = z.number().int().min(0).max(4);
const doseSchema = z
  .object({ morning: capsules, lunch: capsules, dreams: capsules })
  .refine((d) => d.morning + d.lunch + d.dreams >= 1, "At least 1 capsule a day")
  .nullable();

/** Settings → Your doses. null puts the member back on the recommended dose. */
export async function saveMyDose(input: unknown) {
  const parsed = doseSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Check your doses." };
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const d = parsed.data;
  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      dose_morning: d ? d.morning : null,
      dose_midday: d ? d.lunch : null,
      dose_dreams: d ? d.dreams : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ctx.user.id);
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

/** Night 5 Taps: the 5-Night Watch is complete. The database checks the 5 nights itself. */
export async function markGutGuardian() {
  const ctx = await requireUser();
  if (!ctx) return { ok: true as const, skipped: true };
  const { data, error } = await ctx.supabase.rpc("lifestyle_mark_guardian");
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, earned: data === true };
}

const requestSchema = z.object({
  kind: z.enum(["skip", "pause", "resume", "cancel", "goal", "plan", "payment", "redeem"]),
  detail: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
});

/**
 * Plan changes and reward redemptions from the member page. Saved as a request for Gutguard
 * to confirm (member_requests); the plan itself changes only on the server side.
 */
export async function requestChange(input: unknown) {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Check your request." };
  if (!isSupabaseConfigured()) return { ok: true as const, skipped: true };
  const ctx = await requireUser();
  // An expired log-in must not show "Request sent".
  if (!ctx) return { ok: false as const, error: "Please log in again." };
  const { count } = await ctx.supabase
    .from("member_requests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", ctx.user.id)
    .eq("status", "pending");
  if ((count ?? 0) >= 10) return { ok: false as const, error: "You have requests waiting. Gutguard will confirm them first." };
  const { error } = await ctx.supabase.from("member_requests").insert({
    user_id: ctx.user.id,
    kind: parsed.data.kind,
    detail: parsed.data.detail,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}
