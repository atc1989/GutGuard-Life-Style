"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { ensureLifestyleCard } from "@/lib/lifestyle/ensure-card";
import { resumeRoute } from "@/lib/mock/seed";
import { createLoginEngine, EMAIL_CODE_RESENT } from "@/lib/one-account";
import {
  authConfirmSchema,
  authRegisterSchema,
  authSignInSchema,
  duplicateIdentityResult,
} from "@/lib/schemas/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { ok: true; mode: "mock" | "confirm"; message?: string }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string>;
      /** Staging emails a 6-digit code; the form offers that step. */
      needsConfirm?: boolean;
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
  if (lower.includes("not confirmed")) {
    return "Confirm your email, then sign in.";
  }
  return "Could not complete that just now. Try again.";
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
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name, mobile } },
  });
  if (error) return { ok: false, error: calmAuthError(error.message) };
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return duplicateIdentityResult(true, false)!;
  }
  if (!data.session || !data.user) {
    return { ok: true, mode: "confirm" };
  }

  // Change 4: the person row and the card are two things. `ensureLifestyleCard`
  // writes the person first, then fills the card half of it with a card number
  // of this member's own — the register form no longer hands every member the
  // same placeholder from `lib/mock/seed.ts`.
  const card = await ensureLifestyleCard({
    userId: data.user.id,
    name,
    mobile,
    email,
  });
  if (!card.ok) {
    if (card.reason === "duplicate") {
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
      error: "Your account was created, but your card could not be saved. Try signing in.",
    };
  }

  redirect("/card");
}

/**
 * Sign-in behaviour is the shared One Account engine (Change 2), so the same
 * Gutguard credentials open Lifestyle, GEMA, and Academy. Lifestyle keeps only
 * its own landing: the door card until it is claimed, then the member app.
 */
const loginEngine = createLoginEngine({
  getSessionClient: createClient,
  runAfterResponse: after,
});

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

  const outcome = await loginEngine.signIn(parsed.data);
  if (!outcome.ok) {
    // The engine's copy is the same on every origin — do not re-word it here.
    return { ok: false, error: outcome.error, needsConfirm: outcome.needsEmailConfirm };
  }

  // Change 4: a guild member signing in here for the first time has no card
  // yet. Build one from the name the guild already knows, so they land on the
  // door card without ever meeting the register form (D13).
  let phase = "invited";
  if (outcome.userId) {
    await ensureLifestyleCard({ userId: outcome.userId, email: outcome.email });
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("phase")
      .eq("id", outcome.userId)
      .maybeSingle();
    if (typeof profile?.phase === "string") phase = profile.phase;
  }

  redirect(resumeRoute(phase));
}

function loginRedirectTo() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  return origin ? `${origin}/register` : undefined;
}

/** Staging emails a 6-digit code instead of a confirmation link. */
export async function confirmEmailCode(input: unknown): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true, mode: "mock" };
  }

  const parsed = authConfirmSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Enter the 6-digit code from your email.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
      needsConfirm: true,
    };
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
      error: "That code did not work. Ask for a new one.",
      needsConfirm: true,
    };
  }

  // The code step is where a Staging register actually finishes, so this is the
  // first authenticated visit for anyone who confirmed by code.
  await ensureLifestyleCard({ userId: data.user.id, email: data.user.email ?? null });

  const { data: profile } = await supabase
    .from("profiles")
    .select("phase")
    .eq("id", data.user.id)
    .maybeSingle();

  redirect(resumeRoute(typeof profile?.phase === "string" ? profile.phase : "invited"));
}

export async function resendEmailCode(input: unknown): Promise<AuthActionResult> {
  if (!isSupabaseConfigured()) {
    return { ok: true, mode: "mock" };
  }

  const parsed = authConfirmSchema.pick({ email: true }).safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Enter a valid email.", needsConfirm: true };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: loginRedirectTo() },
  });
  if (error) {
    return { ok: false, error: "Could not send a new code just now.", needsConfirm: true };
  }

  return { ok: true, mode: "confirm", message: EMAIL_CODE_RESENT };
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
