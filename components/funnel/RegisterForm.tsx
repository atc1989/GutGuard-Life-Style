"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  confirmEmailCode,
  resendEmailCode,
  signIn,
  signUp,
  type AuthActionResult,
} from "@/lib/actions/auth";
import { EMAIL_CODE_COPY, EMAIL_CODE_HINT } from "@/lib/auth/email-code";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import {
  authConfirmSchema,
  authRegisterSchema,
  authSignInSchema,
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  type AuthConfirmValues,
  type AuthRegisterValues,
  type AuthSignInValues,
} from "@/lib/schemas/auth";
import { createNewMemberSession, resumeRoute } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";

type Mode = "register" | "signin" | "confirm";

export function RegisterForm() {
  const router = useRouter();
  const { session, update } = useSession();
  const { push } = useToast();
  const [mode, setMode] = useState<Mode>("register");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const registerForm = useForm<AuthRegisterValues>({
    resolver: zodResolver(authRegisterSchema),
    defaultValues: { name: "", mobile: "", email: "", password: "" },
  });
  const signInForm = useForm<AuthSignInValues>({
    resolver: zodResolver(authSignInSchema),
    defaultValues: { identifier: "", password: "" },
  });
  const confirmForm = useForm<AuthConfirmValues>({
    resolver: zodResolver(authConfirmSchema),
    defaultValues: { email: "", code: "" },
  });

  function currentEmail() {
    if (mode === "register") return registerForm.getValues("email");
    if (mode === "signin") {
      const identifier = signInForm.getValues("identifier");
      return identifier.includes("@") ? identifier : "";
    }
    return confirmForm.getValues("email");
  }

  function switchMode(next: Exclude<Mode, "confirm">) {
    const email = currentEmail();
    setFormError(null);
    setMode(next);
    if (next === "signin") {
      if (email) signInForm.setValue("identifier", email);
    } else registerForm.setValue("email", email);
  }

  function goConfirm(email: string) {
    setMode("confirm");
    confirmForm.reset({ email, code: "" });
    setFormError(EMAIL_CODE_COPY);
    push({
      tone: "success",
      title: "Enter your code",
      body: EMAIL_CODE_HINT,
    });
  }

  async function finishRegister(values: { name: string; mobile: string; email: string }) {
    update(
      createNewMemberSession({
        name: values.name,
        mobile: values.mobile,
        email: values.email,
        phase: "invited",
      }),
    );
    router.push("/card");
  }

  function applyFieldErrors(fieldErrors?: Record<string, string>) {
    if (!fieldErrors) return;
    if (mode === "register") {
      for (const [key, message] of Object.entries(fieldErrors)) {
        if (key === "name" || key === "mobile" || key === "email" || key === "password") {
          registerForm.setError(key, { type: "server", message });
        }
      }
      return;
    }
    if (mode === "confirm") {
      for (const [key, message] of Object.entries(fieldErrors)) {
        if (key === "email" || key === "code") {
          confirmForm.setError(key, { type: "server", message });
        }
      }
      return;
    }
    for (const [key, message] of Object.entries(fieldErrors)) {
      if (key === "identifier" || key === "email" || key === "password") {
        if (key === "email") {
          signInForm.setError("identifier", { type: "server", message });
        } else {
          signInForm.setError(key, { type: "server", message });
        }
      }
    }
  }

  async function handleAuthResult(
    result: AuthActionResult,
    mockFinish: () => Promise<void>,
    email: string,
  ) {
    if (!result.ok) {
      if (result.needsConfirm) {
        goConfirm(email);
        setFormError(result.error);
        applyFieldErrors(result.fieldErrors);
        return;
      }
      setFormError(result.error);
      applyFieldErrors(result.fieldErrors);
      return;
    }
    if (result.mode === "mock") {
      await mockFinish();
      return;
    }
    goConfirm(email);
  }

  const heading =
    mode === "register" ? (
      <>
        Enter your <em>name</em>
      </>
    ) : mode === "confirm" ? (
      <>
        Confirm your <em>email</em>
      </>
    ) : (
      <>
        Welcome <em>back</em>
      </>
    );

  const lede =
    mode === "register"
      ? "Name, mobile, email, and a password. Your session is a cookie when connected."
      : mode === "confirm"
        ? EMAIL_CODE_HINT
        : "Username or email, and your password. Same Gutguard account on every app.";

  return (
    <main className="gg-funnel gg-funnel--editorial">
      <div className="gg-split gg-split--form">
        <div>
          <p className="gg-eyebrow">
            {mode === "register" ? "Sign up" : mode === "confirm" ? "Confirm" : "Sign in"}
          </p>
          <h1 className="gg-display" style={{ marginTop: 12 }}>
            {heading}
          </h1>
          <p className="gg-lede" style={{ marginTop: 14 }}>
            {lede}
          </p>
        </div>
        <Card variant="editorial" className="gg-stack">
          {formError ? (
            <p className="gg-field__error" role="alert" aria-live="polite">
              {formError}
            </p>
          ) : null}
          {mode === "register" ? (
            <form
              className="gg-stack"
              noValidate
              aria-busy={loading || undefined}
              onSubmit={registerForm.handleSubmit(async (values) => {
                setFormError(null);
                setLoading(true);
                try {
                  const result = await signUp(values);
                  if (!result) return;
                  await handleAuthResult(result, () => finishRegister(values), values.email);
                } finally {
                  setLoading(false);
                }
              })}
            >
              <FormField
                variant="ruled"
                label="Your name"
                placeholder="Your name here"
                autoComplete="name"
                {...registerForm.register("name")}
                error={registerForm.formState.errors.name?.message}
              />
              <FormField
                variant="ruled"
                label="Mobile number"
                placeholder="09xx xxx xxxx"
                inputMode="tel"
                autoComplete="tel"
                {...registerForm.register("mobile")}
                error={registerForm.formState.errors.mobile?.message}
              />
              <FormField
                variant="ruled"
                label="Email"
                placeholder="you@email.com"
                type="email"
                autoComplete="email"
                {...registerForm.register("email")}
                error={registerForm.formState.errors.email?.message}
              />
              <FormField
                variant="ruled"
                label="Password"
                type="password"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                spellCheck={false}
                hint={PASSWORD_HINT}
                {...registerForm.register("password")}
                error={registerForm.formState.errors.password?.message}
              />
              <Button type="submit" variant="editorial" block loading={loading}>
                Get your card
              </Button>
              <Button
                type="button"
                variant="ghost"
                block
                onClick={() => switchMode("signin")}
              >
                Already have a card? Sign in
              </Button>
            </form>
          ) : mode === "confirm" ? (
            <form
              className="gg-stack"
              noValidate
              aria-busy={loading || undefined}
              onSubmit={confirmForm.handleSubmit(async (values) => {
                setFormError(null);
                setLoading(true);
                try {
                  const result = await confirmEmailCode(values);
                  if (!result) return;
                  await handleAuthResult(result, async () => undefined, values.email);
                } finally {
                  setLoading(false);
                }
              })}
            >
              <FormField
                variant="ruled"
                label="Email"
                type="email"
                autoComplete="email"
                readOnly
                {...confirmForm.register("email")}
                error={confirmForm.formState.errors.email?.message}
              />
              <FormField
                variant="ruled"
                label="Email code"
                placeholder="6-digit code"
                inputMode="numeric"
                autoComplete="one-time-code"
                spellCheck={false}
                hint="Paste the number even if it has spaces."
                {...confirmForm.register("code")}
                error={confirmForm.formState.errors.code?.message}
              />
              <Button type="submit" variant="editorial" block loading={loading}>
                Confirm email
              </Button>
              <Button
                type="button"
                variant="ghost"
                block
                disabled={loading}
                onClick={async () => {
                  setFormError(null);
                  setLoading(true);
                  try {
                    const result = await resendEmailCode({
                      email: confirmForm.getValues("email"),
                    });
                    if (!result.ok) {
                      setFormError(result.error);
                      return;
                    }
                    push({
                      tone: "success",
                      title: "Code sent",
                      body: "Check your inbox for a new 6-digit code.",
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Send a new code
              </Button>
              <Button
                type="button"
                variant="ghost"
                block
                onClick={() => switchMode("signin")}
              >
                Already confirmed? Sign in
              </Button>
            </form>
          ) : (
            <form
              className="gg-stack"
              noValidate
              aria-busy={loading || undefined}
              onSubmit={signInForm.handleSubmit(async (values) => {
                setFormError(null);
                setLoading(true);
                try {
                  const result = await signIn(values);
                  if (!result) return;
                  await handleAuthResult(result, async () => {
                    router.push(resumeRoute(session.phase));
                  }, values.identifier.includes("@") ? values.identifier : "");
                } finally {
                  setLoading(false);
                }
              })}
            >
              <FormField
                variant="ruled"
                label="Username or email"
                placeholder="johndoe or you@email.com"
                type="text"
                autoComplete="username"
                {...signInForm.register("identifier")}
                error={signInForm.formState.errors.identifier?.message}
              />
              <FormField
                variant="ruled"
                label="Password"
                type="password"
                autoComplete="current-password"
                spellCheck={false}
                {...signInForm.register("password")}
                error={signInForm.formState.errors.password?.message}
              />
              <Button type="submit" variant="editorial" block loading={loading}>
                Sign in
              </Button>
              <Button
                type="button"
                variant="ghost"
                block
                onClick={() => switchMode("register")}
              >
                Need a card? Register
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
