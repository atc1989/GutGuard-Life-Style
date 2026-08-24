"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CARD_NUMBER } from "@/lib/mock/seed";
import {
  DEV_MEMBER_COOKIE,
  encodeDevMember,
} from "@/lib/cookies";
import {
  authEmailFromMobile,
  authRegisterSchema,
  toE164Phone,
  type AuthRegisterField,
} from "@/lib/schemas/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { markWelcomeSeen } from "@/lib/actions/welcome";
import type { RegisterActionState } from "@/lib/register-state";

function fieldErrorsFromZod(
  error: z.ZodError,
): Partial<Record<AuthRegisterField, string>> {
  const fieldErrors: Partial<Record<AuthRegisterField, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (
      (key === "name" || key === "mobile" || key === "password") &&
      !fieldErrors[key]
    ) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

function mapAuthError(message: string): RegisterActionState {
  const lower = message.toLowerCase();
  if (
    lower.includes("already") ||
    lower.includes("registered") ||
    lower.includes("exists")
  ) {
    return {
      error: "That mobile is already on a card. Try a different number.",
      fieldErrors: {
        mobile: "That mobile is already on a card. Try a different number.",
      },
    };
  }
  if (lower.includes("password")) {
    return {
      error: "Choose a stronger password and try again.",
      fieldErrors: { password: "Choose a stronger password." },
    };
  }
  if (lower.includes("rate")) {
    return {
      error: "Please wait a moment and try again.",
      fieldErrors: {},
    };
  }
  return {
    error: "We could not create your card. Please try again.",
    fieldErrors: {},
  };
}

async function writeDevMember(name: string, mobile: string) {
  const store = await cookies();
  store.set(DEV_MEMBER_COOKIE, encodeDevMember({ name, mobile }), {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function registerMember(
  _prev: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const parsed = authRegisterSchema.safeParse({
    name: formData.get("name"),
    mobile: formData.get("mobile"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFromZod(parsed.error),
    };
  }

  const name = parsed.data.name;
  const e164 = toE164Phone(parsed.data.mobile);
  const password = parsed.data.password;

  if (!isSupabaseConfigured()) {
    await writeDevMember(name, e164);
    await markWelcomeSeen();
    redirect("/card");
  }

  const supabase = await createClient();
  const email = authEmailFromMobile(e164);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, mobile: e164 },
    },
  });

  if (error) return mapAuthError(error.message);
  if (!data.user) {
    return {
      error: "We could not create your card. Please try again.",
      fieldErrors: {},
    };
  }
  if (!data.session) {
    return {
      error:
        "Your card is waiting on confirmation. Please try again in a moment.",
      fieldErrors: {},
    };
  }

  await supabase.from("profiles").upsert({
    id: data.user.id,
    name,
    mobile: e164,
    email,
    card_no: CARD_NUMBER,
    phase: "invited",
    claimed: false,
    welcome_seen: true,
  });

  await markWelcomeSeen();
  redirect("/card");
}
