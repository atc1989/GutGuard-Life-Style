"use server";

import { redirect } from "next/navigation";
import { authRegisterSchema } from "@/lib/schemas/auth";
import { toE164Phone } from "@/lib/schemas/register";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = {
  error: string;
  fieldErrors?: {
    name?: string;
    mobile?: string;
    password?: string;
  };
};

function memberEmailFromMobile(mobile: string) {
  return `${mobile.replace(/\D/g, "")}@members.gutguard.local`;
}

function registerErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered")) {
    return "This mobile number is already registered.";
  }
  if (normalized.includes("password")) {
    return "Choose a stronger password and try again.";
  }
  return "We could not create your card. Please try again.";
}

export async function register(
  _prevState: RegisterState | null,
  formData: FormData,
): Promise<RegisterState | null> {
  const parsed = authRegisterSchema.safeParse({
    name: formData.get("name"),
    mobile: formData.get("mobile"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return {
      error: "Please check your details and try again.",
      fieldErrors: {
        name: fieldErrors.name?.[0],
        mobile: fieldErrors.mobile?.[0],
        password: fieldErrors.password?.[0],
      },
    };
  }

  const mobile = toE164Phone(parsed.data.mobile);
  const email = memberEmailFromMobile(mobile);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password: parsed.data.password,
    options: {
      data: {
        name: parsed.data.name,
        mobile,
      },
    },
  });

  if (error) {
    return { error: registerErrorMessage(error.message) };
  }

  if (!data.user?.identities?.length) {
    return { error: "This mobile number is already registered." };
  }

  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: parsed.data.password,
    });
    if (signInError) {
      return { error: registerErrorMessage(signInError.message) };
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "We could not start your session. Please try again." };
  }

  redirect("/card");
}
