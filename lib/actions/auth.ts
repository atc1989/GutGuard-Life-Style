"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { z } from "zod";
import { CARD_NUMBER, resumeRoute } from "@/lib/mock/seed";
import { createLoginEngine } from "@/lib/one-account";
import {
  authRegisterSchema,
  authSignInSchema,
  duplicateIdentityResult,
} from "@/lib/schemas/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type AuthActionResult =
  | { ok: true; mode: "mock" | "confirm" }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

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

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    name,
    mobile,
    email,
    card_no: CARD_NUMBER,
    phase: "invited",
    claimed: false,
    points: 0,
    pending: 0,
    banked: 0,
    days_left: -1,
  });
  if (profileError) {
    if (profileError.code === "23505") {
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
      error: "Your card was created, but the profile could not be saved. Try signing in.",
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
    return { ok: false, error: outcome.error };
  }

  // A guild member signing in here for the first time has no Lifestyle row yet.
  // That is Change 4, not this one: land them on the door card, do not mint one.
  let phase = "invited";
  if (outcome.userId) {
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

export async function signOut() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
