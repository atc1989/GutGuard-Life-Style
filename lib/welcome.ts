import { cookies } from "next/headers";
import { WELCOME_SEEN_COOKIE } from "@/lib/cookies";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function readWelcomeSeen(): Promise<boolean> {
  const store = await cookies();
  if (store.get(WELCOME_SEEN_COOKIE)?.value === "1") return true;

  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("profiles")
      .select("welcome_seen")
      .eq("id", user.id)
      .maybeSingle();
    return Boolean(data?.welcome_seen);
  } catch {
    return false;
  }
}
