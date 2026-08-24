"use server";

import { MOCK_MEMBERS } from "@/lib/admin/mock-members";
import { requireAdmin } from "@/lib/admin/guard";
import {
  filterMembers,
  toMemberRow,
  type MemberDirectoryResult,
  type MemberRow,
} from "@/lib/admin/search";
import {
  parseMemberDirectoryQuery,
  type MemberDirectoryQuery,
} from "@/lib/schemas/admin";
import { createAdminClient, isServiceRoleConfigured } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const DIRECTORY_CAP = 500;

type ProfileListRow = {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  card_no: string;
  phase: string;
  claimed: boolean;
  role: string;
  created_at: string;
};

type BaseProgressRow = {
  user_id: string;
  step_index: number;
  done: boolean;
};

function previewDirectory(query: MemberDirectoryQuery): MemberDirectoryResult {
  const rows = filterMembers(MOCK_MEMBERS, query.q, query.filter);
  return {
    rows,
    matched: rows.length,
    total: MOCK_MEMBERS.length,
    source: "preview",
    query: query.q,
    filter: query.filter,
  };
}

function mergeBaseCounts(
  profiles: ProfileListRow[],
  progress: BaseProgressRow[],
): MemberRow[] {
  const doneByUser = new Map<string, number>();
  for (const row of progress) {
    if (!row.done) continue;
    doneByUser.set(row.user_id, (doneByUser.get(row.user_id) ?? 0) + 1);
  }
  return profiles.map((profile) =>
    toMemberRow({
      ...profile,
      baseDone: doneByUser.get(profile.id) ?? 0,
    }),
  );
}

/**
 * Lists members for `/admin/users`. Service-role client lives only in this
 * `"use server"` module — never imported from Client Components.
 */
export async function loadMemberDirectory(input: {
  q?: string | string[];
  filter?: string | string[];
}): Promise<MemberDirectoryResult> {
  const query = parseMemberDirectoryQuery(input);
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return previewDirectory(query);
  }

  if (!isServiceRoleConfigured()) {
    return {
      rows: [],
      matched: 0,
      total: 0,
      source: "live",
      query: query.q,
      filter: query.filter,
      error:
        "The member directory needs a server-only service role key. Nothing was loaded.",
    };
  }

  try {
    const admin = createAdminClient();
    const { data: profiles, error: profileError } = await admin
      .from("profiles")
      .select("id, name, mobile, email, card_no, phase, claimed, role, created_at")
      .order("created_at", { ascending: false })
      .limit(DIRECTORY_CAP);

    if (profileError) {
      return {
        rows: [],
        matched: 0,
        total: 0,
        source: "live",
        query: query.q,
        filter: query.filter,
        error: "The member directory could not be loaded. Try again in a moment.",
      };
    }

    const ids = (profiles ?? []).map((row) => row.id);
    let progress: BaseProgressRow[] = [];
    if (ids.length > 0) {
      const { data: baseRows, error: baseError } = await admin
        .from("base_progress")
        .select("user_id, step_index, done")
        .in("user_id", ids);
      if (baseError) {
        return {
          rows: [],
          matched: 0,
          total: 0,
          source: "live",
          query: query.q,
          filter: query.filter,
          error: "BASE progress could not be loaded. Try again in a moment.",
        };
      }
      progress = baseRows ?? [];
    }

    const allRows = mergeBaseCounts(profiles ?? [], progress);
    const rows = filterMembers(allRows, query.q, query.filter);
    return {
      rows,
      matched: rows.length,
      total: allRows.length,
      source: "live",
      query: query.q,
      filter: query.filter,
    };
  } catch {
    return {
      rows: [],
      matched: 0,
      total: 0,
      source: "live",
      query: query.q,
      filter: query.filter,
      error: "The member directory could not be loaded. Try again in a moment.",
    };
  }
}
