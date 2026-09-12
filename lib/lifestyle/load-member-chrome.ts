import "server-only";

import { isFrameworkControlFlow } from "@/lib/one-account";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  EMPTY_MEMBER_CHROME,
  metadataNameFromAuth,
  resolveMemberChrome,
  type MemberChrome,
  type MemberChromeProfile,
} from "@/lib/lifestyle/member-chrome";

/**
 * Change 9 — user-scoped read of the signed-in member's own `public.profiles`
 * row. No `userId` argument: the id comes from `auth.getUser()` only, so a
 * query string cannot point this at someone else. Never the service role.
 *
 * Returns `null` when Supabase is off so the mock session can still drive
 * local UI. When Supabase is on, always returns a chrome snapshot (empty on
 * failure) so leftover `localStorage` cannot win.
 */
export async function loadMemberChrome(): Promise<MemberChrome | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return EMPTY_MEMBER_CHROME;

    const { data, error } = await supabase
      .from("profiles")
      .select("name, mobile, sponsor, card_no")
      .eq("id", user.id)
      .maybeSingle<MemberChromeProfile>();

    if (error) {
      console.warn("[lifestyle] member chrome read skipped", {
        code: error.code,
        message: error.message,
      });
      return resolveMemberChrome({
        profile: null,
        metadataName: metadataNameFromAuth(user),
      });
    }

    return resolveMemberChrome({
      profile: data,
      metadataName: metadataNameFromAuth(user),
    });
  } catch (error) {
    if (isFrameworkControlFlow(error)) throw error;
    console.warn("[lifestyle] member chrome read skipped", {
      message: error instanceof Error ? error.message : String(error),
    });
    return EMPTY_MEMBER_CHROME;
  }
}
