"use server";

import { cookies } from "next/headers";
import { persistProfile } from "@/lib/actions/member";
import { WELCOME_SEEN_COOKIE } from "@/lib/cookies";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const YEAR = 60 * 60 * 24 * 365;

export async function markWelcomeSeen() {
  const store = await cookies();
  store.set(WELCOME_SEEN_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: YEAR,
  });

  if (isSupabaseConfigured()) {
    await persistProfile({ welcomeSeen: true });
  }
}
