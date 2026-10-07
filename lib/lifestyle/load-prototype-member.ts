import "server-only";

import { isFrameworkControlFlow } from "@/lib/one-account";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * What the approved member page (components/prototype/LifestyleMember.jsx) reads.
 * Plain JSON only: dates are ISO strings, the page turns them into Date objects.
 * Read with the member's own session (RLS), never the service role.
 */
export type LiveMember = {
  name: string;
  mobile: string;
  cardNo: string;
  sponsor: string;
  team: string;
  points: number;
  stage: "card" | "ordered" | "trial" | "member" | "base" | "builder";
  trialStartedOn: string | null;
  plan: null | {
    goal: "keep" | "better" | "full";
    freq: "monthly" | "quarterly";
    status: "active" | "paused" | "cancelled";
    start: string;
    skips: number;
    pausedUntil: string | null;
  };
  /** null = the recommended dose for the goal */
  dose: null | { morning: number; lunch: number; dreams: number };
  guardian: boolean;
  /**
   * Count capsules and trial nights from this date (ISO): the trial start, or the start of the
   * current refill cycle. Older days still show on the calendar and in the streak.
   */
  countSince: string | null;
  /** dose_logs, keyed the way the page keys days: "YYYY-M-D" (no zero padding) */
  log: Record<string, { morning?: boolean; lunch?: boolean; dreams?: boolean; proof?: boolean }>;
};

type ProfileRow = {
  name: string | null;
  mobile: string | null;
  card_no: string | null;
  sponsor: string | null;
  team: string | null;
  points: number | null;
  lifestyle_stage: LiveMember["stage"] | null;
  trial_started_on: string | null;
  plan_goal: "keep" | "better" | "full" | null;
  plan_cadence: "monthly" | "quarterly" | null;
  plan_status: "active" | "paused" | "cancelled" | null;
  plan_started_on: string | null;
  plan_skips: number | null;
  plan_paused_until: string | null;
  dose_morning: number | null;
  dose_midday: number | null;
  dose_dreams: number | null;
  guardian_at: string | null;
};

type DoseRow = { log_date: string; morning: boolean; midday: boolean; dreams: boolean; proof_path: string | null };

const dayKey = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  return `${y}-${m}-${d}`;
};

/** Returns null when Supabase is not configured (local mock mode). */
export async function loadPrototypeMember(): Promise<LiveMember | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const since = new Date(Date.now() - 120 * 864e5).toISOString().slice(0, 10);
    const [{ data: p }, { data: logs }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "name, mobile, card_no, sponsor, team, points, lifestyle_stage, trial_started_on, plan_goal, plan_cadence, plan_status, plan_started_on, plan_skips, plan_paused_until, dose_morning, dose_midday, dose_dreams, guardian_at",
        )
        .eq("id", user.id)
        .maybeSingle<ProfileRow>(),
      supabase
        .from("dose_logs")
        .select("log_date, morning, midday, dreams, proof_path")
        .eq("user_id", user.id)
        .gte("log_date", since)
        .returns<DoseRow[]>(),
    ]);

    const log: LiveMember["log"] = {};
    for (const row of logs ?? []) {
      log[dayKey(row.log_date)] = { morning: row.morning, lunch: row.midday, dreams: row.dreams, proof: Boolean(row.proof_path) };
    }

    const countSince =
      (p?.lifestyle_stage === "trial" || p?.lifestyle_stage === "ordered") && p.trial_started_on
        ? p.trial_started_on
        : p?.plan_started_on
          ? currentCycleStart(p.plan_started_on, p.plan_cadence === "quarterly" ? 3 : 1, p.plan_skips ?? 0)
          : null;

    const hasDose = p && (p.dose_morning !== null || p.dose_midday !== null || p.dose_dreams !== null);
    return {
      name: p?.name ?? "",
      mobile: p?.mobile ?? "",
      cardNo: p?.card_no ?? "",
      sponsor: p?.sponsor ?? "",
      team: p?.team ?? "",
      points: p?.points ?? 0,
      stage: p?.lifestyle_stage ?? "card",
      trialStartedOn: p?.trial_started_on ?? null,
      plan:
        p?.plan_goal && p.plan_started_on
          ? {
              goal: p.plan_goal,
              freq: p.plan_cadence ?? "monthly",
              status: p.plan_status ?? "active",
              start: p.plan_started_on,
              skips: p.plan_skips ?? 0,
              pausedUntil: p.plan_paused_until,
            }
          : null,
      dose: hasDose ? { morning: p!.dose_morning ?? 0, lunch: p!.dose_midday ?? 0, dreams: p!.dose_dreams ?? 0 } : null,
      guardian: Boolean(p?.guardian_at),
      countSince,
      log,
    };
  } catch (error) {
    if (isFrameworkControlFlow(error)) throw error;
    console.warn("[lifestyle] prototype member read skipped", error instanceof Error ? error.message : String(error));
    return null;
  }
}

/** Start of the refill cycle that contains today (calendar months, skips push it forward). */
function currentCycleStart(startIso: string, months: number, skips: number): string {
  const [y, m, d] = startIso.split("-").map(Number);
  const today = new Date();
  let k = 0;
  let at = new Date(y, m - 1, d);
  for (;;) {
    const next = new Date(y, m - 1 + months * (k + 1 + skips), 1);
    next.setDate(Math.min(d, new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()));
    if (next > today) break;
    at = next;
    k += 1;
  }
  return `${at.getFullYear()}-${String(at.getMonth() + 1).padStart(2, "0")}-${String(at.getDate()).padStart(2, "0")}`;
}
