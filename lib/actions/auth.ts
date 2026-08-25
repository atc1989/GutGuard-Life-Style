"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { CARD_NUMBER, resumeRoute } from "@/lib/mock/seed";
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
    return {
      ok: false,
      error: calmAuthError(error?.message ?? "Invalid credentials"),
    };
  }

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
