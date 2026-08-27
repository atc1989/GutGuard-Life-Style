"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import {
  EMAIL_CODE_COPY,
  isEmailUnconfirmedMessage,
  siteOrigin,
} from "@/lib/auth/email-code";
import { CARD_NUMBER, resumeRoute } from "@/lib/mock/seed";
import {
  authConfirmSchema,
  authRegisterSchema,
  authSignInSchema,
  duplicateIdentityResult,
} from "@/lib/schemas/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { ok: true; mode: "mock" | "confirm" }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string>;
      needsConfirm?: boolean;
    };

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

function fieldErrorsFromZod(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

function calmAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("already") && lower.includes("register")) {
    return "This email already has a card. Sign in instead.";
  }
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email or password does not match.";
  }
  if (isEmailUnconfirmedMessage(message)) {
    return EMAIL_CODE_COPY;
  }
  if (lower.includes("expired") || lower.includes("otp")) {
    return "That code is expired or wrong. Request a new one.";
  }
  return "Could not complete that just now. Try again.";
}

function metadataString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function lifestyleProfileRow(user: AuthUser, fallback?: { name?: string; mobile?: string; email?: string }) {
  return {
    id: user.id,
    name: fallback?.name || metadataString(user.user_metadata, "name"),
    mobile: fallback?.mobile || metadataString(user.user_metadata, "mobile"),
    email: fallback?.email || user.email || "",
    card_no: CARD_NUMBER,
    phase: "invited",
    claimed: false,
    points: 0,
    pending: 0,
    banked: 0,
    days_left: -1,
  };
}

async function ensureLifestyleProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: AuthUser,
  fallback?: { name?: string; mobile?: string; email?: string },
): Promise<AuthActionResult | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id, phase")
    .eq("id", user.id)
    .maybeSingle();
  if (existing?.id) return null;

  const { error } = await supabase.from("profiles").upsert(lifestyleProfileRow(user, fallback));
  if (!error) return null;
  if (error.code === "23505") {
    return {
      ok: false,
      error: "This email or mobile already has a card. Sign in instead.",
      fieldErrors: {
        email: "This email already has a card. Sign in instead.",
        mobile: "This mobile number already has a card. Sign in instead.",
      },
    };
  }
  return {
    ok: false,
    error: "Your email is confirmed, but the card could not be saved. Sign in again.",
  };
}

type TakenRow = { email_taken?: boolean; mobile_taken?: boolean };

function parseTaken(data: unknown): TakenRow | null {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") return null;
  return row as TakenRow;
}

async function existingIdentity(email: string, mobile: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("lifestyle_identity_taken", {
    p_email: email,
    p_mobile: mobile,
  });
  if (error) return null;
  const row = parseTaken(data);
  if (!row) return null;
  return duplicateIdentityResult(Boolean(row.email_taken), Boolean(row.mobile_taken));
}

function signupRedirectTo() {
  const origin = siteOrigin();
  return origin ? `${origin}/register` : undefined;
}

export async function signUp(input: unknown): Promise<AuthActionResult> {
  const parsed = authRegisterSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, mode: "mock" };
  }

  const { name, mobile, email, password } = parsed.data;
  const taken = await existingIdentity(email, mobile);
  if (taken) return taken;

  const supabase = await createClient();
  const emailRedirectTo = signupRedirectTo();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, mobile },
      ...(emailRedirectTo ? { emailRedirectTo } : {}),
    },
  });
  if (error) return { ok: false, error: calmAuthError(error.message) };
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return duplicateIdentityResult(true, false)!;
  }
  if (!data.session || !data.user) {
    return { ok: true, mode: "confirm" };
  }

  const profileError = await ensureLifestyleProfile(supabase, data.user, {
    name,
    mobile,
    email,
  });
  if (profileError) return profileError;

  redirect("/card");
}

export async function confirmEmailCode(input: unknown): Promise<AuthActionResult> {
  const parsed = authConfirmSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Enter the 6-digit code from your email.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      needsConfirm: true,
    };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, mode: "mock" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: parsed.data.email,
    token: parsed.data.code,
    type: "signup",
  });
  if (error || !data.user) {
    return {
      ok: false,
      error: calmAuthError(error?.message ?? "That code did not work."),
      needsConfirm: true,
    };
  }

  const profileError = await ensureLifestyleProfile(supabase, data.user);
  if (profileError) return profileError;

  redirect("/card");
}

export async function resendEmailCode(input: unknown): Promise<AuthActionResult> {
  const parsed = authConfirmSchema.pick({ email: true }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email." };
  }
  if (!isSupabaseConfigured()) {
    return { ok: true, mode: "mock" };
  }

  const supabase = await createClient();
  const emailRedirectTo = signupRedirectTo();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}),
  });
  if (error) return { ok: false, error: calmAuthError(error.message), needsConfirm: true };
  return { ok: true, mode: "confirm" };
}

export async function signIn(input: unknown): Promise<AuthActionResult> {
  const parsed = authSignInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, mode: "mock" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user) {
    const message = error?.message ?? "Invalid credentials";
    return {
      ok: false,
      error: calmAuthError(message),
      needsConfirm: isEmailUnconfirmedMessage(message),
    };
  }

  const profileError = await ensureLifestyleProfile(supabase, data.user);
  if (profileError) return profileError;

  const { data: profile } = await supabase
    .from("profiles")
    .select("phase")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(resumeRoute(typeof profile?.phase === "string" ? profile.phase : "invited"));
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
