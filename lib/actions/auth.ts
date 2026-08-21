"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { registerSchema, toE164Phone } from "@/lib/schemas/register";
import { createClient } from "@/lib/supabase/server";

export type RegisterState = {
  error: string;
  fieldErrors?: {
    name?: string;
    mobile?: string;
  };
};

function registerErrorMessage(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes("already registered")) {
    return "This mobile number is already registered.";
  }
  if (normalized.includes("phone") && normalized.includes("invalid")) {
    return "Enter a valid PH mobile number.";
  }
  return "We could not create your card. Please try again.";
}

function phoneSignupUnsupported(message: string) {
  return /sms|phone provider|unsupported phone|phone signups? (are )?not enabled/i.test(
    message,
  );
}

function memberEmailFromMobile(mobile: string) {
  return `${mobile.replace(/\D/g, "")}@members.gutguard.local`;
}

export async function register(
  _prevState: RegisterState | null,
  formData: FormData,
): Promise<RegisterState | null> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    mobile: formData.get("mobile"),
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return {
      error: "Please check your name and mobile number.",
      fieldErrors: {
        name: fieldErrors.name?.[0],
        mobile: fieldErrors.mobile?.[0],
      },
    };
  }

  const mobile = toE164Phone(parsed.data.mobile);
  const password = randomBytes(32).toString("base64url");
  const supabase = await createClient();
  const metadata = {
    name: parsed.data.name,
    mobile,
  };

  let method: "phone" | "email" = "phone";
  let result = await supabase.auth.signUp({
    phone: mobile,
    password,
    options: { data: metadata },
  });

  if (result.error && phoneSignupUnsupported(result.error.message)) {
    method = "email";
    result = await supabase.auth.signUp({
      email: memberEmailFromMobile(mobile),
      password,
      options: { data: metadata },
    });
  }

  if (result.error) {
    return { error: registerErrorMessage(result.error.message) };
  }

  if (!result.data.user?.identities?.length) {
    return { error: "This mobile number is already registered." };
  }

  if (!result.data.session) {
    const identifier =
      method === "phone"
        ? { phone: mobile, password }
        : { email: memberEmailFromMobile(mobile), password };
    const { error: signInError } =
      await supabase.auth.signInWithPassword(identifier);
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
