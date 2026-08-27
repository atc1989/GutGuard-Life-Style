import {
  THROTTLE_MAX_FAILURES,
  THROTTLE_WINDOW_MINUTES,
} from "@/lib/one-account/login-engine";
import { createGemaAdminClient, hasGemaAdminEnv } from "@/lib/supabase/gema-admin";

/**
 * Throttle + username lookup against GEMA tables.
 * Missing service role or login_attempts must never block email sign-in.
 */
export async function isSharedLoginThrottled(identifier: string): Promise<boolean> {
  if (!hasGemaAdminEnv()) return false;
  try {
    const since = new Date(Date.now() - THROTTLE_WINDOW_MINUTES * 60_000).toISOString();
    const { count, error } = await createGemaAdminClient()
      .from("login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("username", identifier)
      .gte("created_at", since);
    return !error && (count ?? 0) >= THROTTLE_MAX_FAILURES;
  } catch {
    return false;
  }
}

export async function recordSharedLoginFailure(identifier: string): Promise<void> {
  if (!hasGemaAdminEnv()) return;
  try {
    await createGemaAdminClient()
      .from("login_attempts")
      .insert({ username: identifier, created_at: new Date().toISOString() });
  } catch {
    // Throttle is best-effort.
  }
}

export async function lookupEmailByUsername(username: string): Promise<string | null> {
  if (!hasGemaAdminEnv()) return null;
  try {
    const admin = createGemaAdminClient();
    const { data: member } = await admin
      .from("members")
      .select("profile_id")
      .eq("username", username)
      .maybeSingle<{ profile_id: string }>();
    if (!member?.profile_id) return null;
    const { data } = await admin.auth.admin.getUserById(member.profile_id);
    return data.user?.email ?? null;
  } catch {
    return null;
  }
}
