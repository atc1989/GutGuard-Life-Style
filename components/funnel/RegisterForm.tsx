"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn, signUp, type AuthActionResult } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import {
  authRegisterSchema,
  authSignInSchema,
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  type AuthRegisterValues,
  type AuthSignInValues,
} from "@/lib/schemas/auth";
import { createNewMemberSession, resumeRoute } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";

export function RegisterForm() {
  const router = useRouter();
  const { session, update } = useSession();
  const { push } = useToast();
  const [mode, setMode] = useState<"register" | "signin">("register");
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

  function switchMode(next: "register" | "signin") {
    // Carry what they already typed across the toggle. Sign-in also takes a
    // OneGrinders username, so only an email can travel back to register.
    setFormError(null);
    setMode(next);
    if (next === "signin") {
      signInForm.setValue("identifier", registerForm.getValues("email"));
      return;
    }
    const identifier = signInForm.getValues("identifier");
    if (identifier.includes("@")) registerForm.setValue("email", identifier);
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
    for (const [key, message] of Object.entries(fieldErrors)) {
      if (key === "identifier" || key === "password") {
        signInForm.setError(key, { type: "server", message });
      }
    }
  }

  async function handleAuthResult(
    result: AuthActionResult,
    mockFinish: () => Promise<void>,
  ) {
    if (!result.ok) {
      setFormError(result.error);
      applyFieldErrors(result.fieldErrors);
      return;
    }
    if (result.mode === "mock") {
      await mockFinish();
      return;
    }
    switchMode("signin");
    setFormError("Check your email to confirm your card, then sign in.");
    push({
      tone: "success",
      title: "Confirm your email",
      body: "Open the link we sent, then sign in with your password.",
    });
  }

  return (
    <main className="gg-funnel gg-funnel--editorial">
      <div className="gg-split gg-split--form">
        <div>
          <p className="gg-eyebrow">{mode === "register" ? "Sign up" : "Sign in"}</p>
          <h1 className="gg-display" style={{ marginTop: 12 }}>
            {mode === "register" ? (
              <>
                Enter your <em>name</em>
              </>
            ) : (
              <>
                Welcome <em>back</em>
              </>
            )}
          </h1>
          <p className="gg-lede" style={{ marginTop: 14 }}>
            {mode === "register"
              ? "Name, mobile, email, and a password. Your session is a cookie when Supabase is connected."
              : "Your Gutguard username or email, and your password. Same card, same door."}
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
                  await handleAuthResult(result, () => finishRegister(values));
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
                  });
                } finally {
                  setLoading(false);
                }
              })}
            >
              <FormField
                variant="ruled"
                label="Username or email"
                placeholder="yourname or you@email.com"
                type="text"
                autoComplete="username"
                spellCheck={false}
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
