import { cookies } from "next/headers";
import { CARD_NUMBER, STORIES, type DoseLog, type Invite, type LedgerEntry } from "@/lib/mock/seed";
import { DEV_MEMBER_COOKIE, decodeDevMember } from "@/lib/cookies";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type DoorCardData = {
  name: string;
  mobile: string;
  cardNo: string;
  claimed: boolean;
  mock: boolean;
};

export type HealthSnapshot = {
  name: string;
  daysLeft: number;
  capsulesPerDay: number;
  sponsor: string;
  points: number;
  pending: number;
  banked: number;
  doseLog: DoseLog;
  baseDone: boolean[];
  ledger: LedgerEntry[];
  mock: boolean;
};

async function requireUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { supabase, user };
}

export async function loadDoorCard(): Promise<DoorCardData | null> {
  const ctx = await requireUser();
  if (ctx) {
    const meta = ctx.user.user_metadata ?? {};
    const { data: profile } = await ctx.supabase
      .from("profiles")
      .select("name, mobile, card_no, claimed")
      .eq("id", ctx.user.id)
      .maybeSingle();
    const name =
      (typeof profile?.name === "string" && profile.name) ||
      (typeof meta.name === "string" && meta.name) ||
      "";
    if (!name) return null;
    return {
      name,
      mobile:
        (typeof profile?.mobile === "string" && profile.mobile) ||
        (typeof meta.mobile === "string" && meta.mobile) ||
        "",
      cardNo:
        (typeof profile?.card_no === "string" && profile.card_no) || CARD_NUMBER,
      claimed: Boolean(profile?.claimed),
      mock: false,
    };
  }

  const store = await cookies();
  const dev = decodeDevMember(store.get(DEV_MEMBER_COOKIE)?.value);
  if (!dev) return null;
  return {
    name: dev.name,
    mobile: dev.mobile,
    cardNo: dev.cardNo || CARD_NUMBER,
    claimed: Boolean(dev.claimed),
    mock: true,
  };
}

export async function loadBaseComplete(): Promise<boolean | null> {
  const ctx = await requireUser();
  if (!ctx) return null;
  const { data, error } = await ctx.supabase.rpc("lifestyle_base_complete");
  if (error) return false;
  return Boolean(data);
}

export async function loadHealthSnapshot(): Promise<HealthSnapshot | null> {
  const ctx = await requireUser();
  if (!ctx) return null;

  const [{ data: profile }, { data: doses }, { data: base }, { data: events }] =
    await Promise.all([
      ctx.supabase
        .from("profiles")
        .select("name, days_left, capsules_per_day, sponsor, points, pending, banked")
        .eq("id", ctx.user.id)
        .maybeSingle(),
      ctx.supabase
        .from("dose_logs")
        .select("log_date, morning, midday, dreams, proof_path")
        .eq("user_id", ctx.user.id),
      ctx.supabase
        .from("base_progress")
        .select("step_index, done")
        .eq("user_id", ctx.user.id),
      ctx.supabase
        .from("point_events")
        .select("id, kind, amount, pending, label")
        .eq("user_id", ctx.user.id)
        .order("created_at", { ascending: false }),
    ]);

  const doseLog: DoseLog = {};
  for (const row of doses ?? []) {
    doseLog[String(row.log_date)] = {
      morning: Boolean(row.morning),
      midday: Boolean(row.midday),
      dreams: Boolean(row.dreams),
      proof: row.proof_path ? String(row.proof_path) : undefined,
    };
  }

  const baseDone = [false, false, false, false, false];
  for (const row of base ?? []) {
    if (row.step_index >= 0 && row.step_index < 5) {
      baseDone[row.step_index] = Boolean(row.done);
    }
  }

  const ledger: LedgerEntry[] = (events ?? []).map((row) => ({
    id: String(row.id),
    kind: String(row.kind),
    amount: Number(row.amount),
    pending: Boolean(row.pending),
    label: String(row.label),
  }));

  return {
    name: String(profile?.name ?? ctx.user.user_metadata?.name ?? "Member"),
    daysLeft: Number(profile?.days_left ?? 10),
    capsulesPerDay: Number(profile?.capsules_per_day ?? 2),
    sponsor: String(profile?.sponsor ?? "Ate Marites"),
    points: Number(profile?.points ?? 0),
    pending: Number(profile?.pending ?? 0),
    banked: Number(profile?.banked ?? 0),
    doseLog,
    baseDone,
    ledger,
    mock: false,
  };
}

export async function loadInvites(): Promise<Invite[]> {
  const ctx = await requireUser();
  if (!ctx) return [];
  const { data } = await ctx.supabase
    .from("invites")
    .select("name, stage")
    .eq("user_id", ctx.user.id)
    .order("created_at", { ascending: false });
  return (data ?? []).map((row) => ({
    name: String(row.name),
    stage: row.stage as Invite["stage"],
  }));
}

export type FeedStory = {
  id: string;
  name: string;
  kicker: string;
  body: string;
  pending?: boolean;
};

export async function loadStoryFeed(): Promise<{
  published: FeedStory[];
  own: FeedStory[];
  mock: boolean;
}> {
  const ctx = await requireUser();
  if (!ctx) {
    return {
      published: STORIES.map((story) => ({
        id: story.id,
        name: story.name,
        kicker: story.place,
        body: story.quote,
      })),
      own: [],
      mock: true,
    };
  }

  const [{ data: published }, { data: own }] = await Promise.all([
    ctx.supabase
      .from("stories")
      .select("id, about, relationship, days, capsules, outcomes, author_name, status")
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    ctx.supabase
      .from("stories")
      .select("id, about, relationship, days, capsules, outcomes, status, created_at")
      .eq("user_id", ctx.user.id)
      .order("created_at", { ascending: false }),
  ]);

  function bodyFrom(row: {
    days: string;
    capsules: string;
    outcomes: string[] | null;
  }) {
    const outcomes = Array.isArray(row.outcomes) ? row.outcomes.join(", ") : "";
    return `${row.days} days · ${row.capsules} capsules a day${outcomes ? `. ${outcomes}.` : ""}`;
  }

  return {
    published: (published ?? []).map((row) => ({
      id: String(row.id),
      name: String(row.author_name || "Member"),
      kicker: row.about === "other" ? row.relationship || "Family story" : "Own story",
      body: bodyFrom(row),
    })),
    own: (own ?? []).map((row) => ({
      id: String(row.id),
      name: "You",
      kicker: row.status === "approved" ? "Approved" : row.status === "flagged" ? "Flagged" : "In review",
      body: bodyFrom(row),
      pending: row.status === "pending",
    })),
    mock: false,
  };
}
