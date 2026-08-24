"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CARD_NUMBER } from "@/lib/mock/seed";
import {
  DEV_MEMBER_COOKIE,
  decodeDevMember,
  encodeDevMember,
} from "@/lib/cookies";
import { persistProfile } from "@/lib/actions/member";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

async function stampDevClaimed() {
  const store = await cookies();
  const current = decodeDevMember(store.get(DEV_MEMBER_COOKIE)?.value) ?? {
    name: "Member",
    mobile: "",
  };
  store.set(
    DEV_MEMBER_COOKIE,
    encodeDevMember({
      ...current,
      claimed: true,
      cardNo: current.cardNo || CARD_NUMBER,
    }),
    {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  );
}

export async function claimCard() {
  if (!isSupabaseConfigured()) {
    await stampDevClaimed();
    redirect("/card?claimed=1");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/register");

  const { error } = await supabase
    .from("profiles")
    .update({
      claimed: true,
      phase: "claimed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);
  if (error) {
    redirect("/card?claim=failed");
  }
  redirect("/card?claimed=1");
}

export async function enterMemberHub() {
  await persistProfile({ phase: "member" });
  redirect("/app/health");
}
