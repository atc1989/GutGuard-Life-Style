"use server";

import { otpSchema, registerSchema } from "@/lib/schemas/register";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { CARD_NUMBER } from "@/lib/mock/seed";

export async function sendRegisterOtp(input: unknown) {
  const parsed = registerSchema.parse(input);
  if (!isSupabaseConfigured()) {
    return { ok: true as const, mode: "mock" as const };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.email,
    options: {
      shouldCreateUser: true,
      data: { name: parsed.name, mobile: parsed.mobile },
    },
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const, mode: "otp" as const };
}

export async function verifyRegisterOtp(input: unknown) {
  const parsed = otpSchema.parse(input);
  if (!isSupabaseConfigured()) {
    return { ok: true as const, mode: "mock" as const };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.email,
    token: parsed.token,
    type: "email",
  });
  if (error || !data.user) {
    return { ok: false as const, error: error?.message ?? "Invalid code" };
  }

  const meta = data.user.user_metadata ?? {};
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    name: String(meta.name ?? "Member"),
    mobile: String(meta.mobile ?? ""),
    email: parsed.email,
    card_no: CARD_NUMBER,
    phase: "invited",
    claimed: false,
  });
  if (profileError) return { ok: false as const, error: profileError.message };
  return { ok: true as const, mode: "otp" as const };
}
