"use server";

import { requireAdmin } from "@/lib/admin/guard";
import { MOCK_STORIES } from "@/lib/admin/mock-stories";
import {
  filterStories,
  type StoryDirectoryResult,
  type StoryRow,
  type StoryStatus,
} from "@/lib/admin/stories";
import {
  moderateStoriesSchema,
  parseStoryDirectoryQuery,
} from "@/lib/schemas/stories";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const CAP = 500;

type StoryListRow = {
  id: string;
  user_id: string;
  about: string;
  relationship: string | null;
  days: string;
  capsules: string;
  outcomes: string[] | null;
  status: string;
  created_at: string;
};

function asStoryRow(
  row: StoryListRow,
  profile: { name?: string; mobile?: string } | undefined,
): StoryRow {
  const status: StoryStatus =
    row.status === "approved" || row.status === "flagged" ? row.status : "pending";
  return {
    id: row.id,
    userId: row.user_id,
    memberName: profile?.name || "Unnamed",
    mobile: profile?.mobile || "—",
    about: row.about,
    relationship: row.relationship,
    days: row.days,
    capsules: row.capsules,
    outcomes: Array.isArray(row.outcomes) ? row.outcomes.map(String) : [],
    status,
    createdAt: row.created_at,
  };
}

export async function loadStoryDirectory(input: {
  q?: string | string[];
  filter?: string | string[];
}): Promise<StoryDirectoryResult> {
  const query = parseStoryDirectoryQuery(input);
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    const rows = filterStories(MOCK_STORIES, query.q, query.filter);
    return {
      rows,
      matched: rows.length,
      total: MOCK_STORIES.length,
      pendingCount: MOCK_STORIES.filter((row) => row.status === "pending").length,
      source: "preview",
      query: query.q,
      filter: query.filter,
    };
  }

  if (!isServiceRoleConfigured()) {
    return {
      rows: [],
      matched: 0,
      total: 0,
      pendingCount: 0,
      source: "live",
      query: query.q,
      filter: query.filter,
      error: "The story queue needs a server-only service role key.",
    };
  }

  try {
    const admin = createAdminClient();
    const { data: stories, error } = await admin
      .from("stories")
      .select("id, user_id, about, relationship, days, capsules, outcomes, status, created_at, author_name")
      .order("created_at", { ascending: false })
      .limit(CAP);

    if (error) {
      return {
        rows: [],
        matched: 0,
        total: 0,
        pendingCount: 0,
        source: "live",
        query: query.q,
        filter: query.filter,
        error: "Stories could not be loaded. Try again in a moment.",
      };
    }

    const ids = [...new Set((stories ?? []).map((row) => row.user_id))];
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

    const allRows = (stories ?? []).map((row) => asStoryRow(row, profiles.get(row.user_id)));
    const rows = filterStories(allRows, query.q, query.filter);
    return {
      rows,
      matched: rows.length,
      total: allRows.length,
      pendingCount: allRows.filter((row) => row.status === "pending").length,
      source: "live",
      query: query.q,
      filter: query.filter,
    };
  } catch {
    return {
      rows: [],
      matched: 0,
      total: 0,
      pendingCount: 0,
      source: "live",
      query: query.q,
      filter: query.filter,
      error: "Stories could not be loaded. Try again in a moment.",
    };
  }
}

export async function moderateStories(input: unknown) {
  const parsed = moderateStoriesSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Select one or more stories first." };
  }
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return {
      ok: true as const,
      preview: true,
      count: parsed.data.ids.length,
      action: parsed.data.action,
    };
  }

  if (!isServiceRoleConfigured()) {
    return { ok: false as const, error: "Moderation needs a server-only service role key." };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("stories")
    .update({
      status: parsed.data.action,
      moderated_at: new Date().toISOString(),
    })
    .in("id", parsed.data.ids);

  if (error) return { ok: false as const, error: "Could not update those stories." };
  return {
    ok: true as const,
    preview: false,
    count: parsed.data.ids.length,
    action: parsed.data.action,
  };
}
