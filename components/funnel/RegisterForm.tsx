"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import {
  confirmEmailCode,
  resendEmailCode,
  signIn,
  signUp,
  type AuthActionResult,
} from "@/lib/actions/auth";
import { AuthCard } from "@/components/funnel/AuthCard";
import styles from "@/components/funnel/AuthLayout.module.css";
import { LifestyleCardPrototype } from "@/components/lifestyle/LifestyleCardPrototype";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import {
  authRegisterSchema,
  authSignInSchema,
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  type AuthRegisterValues,
  type AuthSignInValues,
} from "@/lib/schemas/auth";
import {
  EMAIL_CODE_HINT,
  EMAIL_CODE_LENGTH,
  normalizeEmailCode,
} from "@/lib/one-account/client";
import { getEventBySlug } from "@/lib/events";
import { decideReservation } from "@/lib/reservations";
import { persistReservation } from "@/lib/actions/member";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createNewMemberSession, resumeRoute } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";

function AuthShell({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lede: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className={styles.shell}>
      <div className={styles.grid}>
        <div className={styles.left}>
          <LifestyleCardPrototype enableTilt={false} />
          <div className={styles.intro}>
            <p className="gg-eyebrow">{eyebrow}</p>
            <h1 className="gg-display">{title}</h1>
            <p className="gg-lede">{lede}</p>
          </div>
        </div>
        <div className={styles.formCol}>{children}</div>
      </div>
    </main>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const event = getEventBySlug(searchParams.get("event") ?? "");
  const waitlist = searchParams.get("intent") === "waitlist";
  const eventResume = event
    ? `/events/${event.slug}/confirmed${waitlist ? "?intent=waitlist" : ""}`
    : null;
  const { session, update } = useSession();
  const { push } = useToast();
  const [mode, setMode] = useState<"register" | "signin">("register");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Set when Staging says the address exists but was never confirmed. Holding
  // the email here is what lets the code step call verifyOtp.
  const [confirmEmail, setConfirmEmail] = useState("");
  const [code, setCode] = useState("");

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
    const decision = event ? decideReservation(event.slug, session.reservations) : null;
    const reservations =
      event && decision?.ok
        ? { ...session.reservations, [event.slug]: decision.kind }
        : session.reservations;
    update(
      createNewMemberSession({
        name: values.name,
        mobile: values.mobile,
        email: values.email,
        phase: "invited",
        reservations,
      }),
    );
    if (event && isSupabaseConfigured()) {
      void persistReservation(event.slug);
    }
    router.push(eventResume ?? "/card");
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
      if (result.needsConfirm) {
        const typed = signInForm.getValues("identifier").trim();
        if (typed.includes("@")) setConfirmEmail(typed);
      }
      return;
    }
    if (result.mode === "mock") {
      await mockFinish();
      return;
    }
    // Staging emails a 6-digit code rather than a link, so the card step is a
    // code box here instead of "go and check your inbox for a link".
    setConfirmEmail(registerForm.getValues("email").trim());
    setFormError(null);
    push({
      tone: "success",
      title: "Confirm your email",
      body: "Enter the 6-digit code we sent to open your card.",
    });
  }

  async function submitCode() {
    setFormError(null);
    setLoading(true);
    try {
      const result = await confirmEmailCode({ email: confirmEmail, code });
      if (!result) return;
      if (result.ok && result.mode === "mock") {
        router.push(eventResume ?? resumeRoute(session.phase));
        return;
      }
      if (!result.ok) setFormError(result.error);
    } finally {
      setLoading(false);
    }
  }

  async function requestNewCode() {
    setFormError(null);
    setLoading(true);
    try {
      const result = await resendEmailCode({ email: confirmEmail });
      if (!result) return;
      if (result.ok) {
        push({ tone: "success", title: "Code sent", body: result.message ?? "" });
      } else {
        setFormError(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  if (confirmEmail) {
    return (
      <AuthShell
        eyebrow="Confirm"
        title={
          <>
            Check your <em>email</em>
          </>
        }
        lede={
          <>
            We sent a {EMAIL_CODE_LENGTH}-digit code to {confirmEmail}. {EMAIL_CODE_HINT}
            {event ? ` Then we will return you to ${event.title} on ${event.dateLabel}.` : ""}
          </>
        }
      >
        <AuthCard>
          {formError ? (
            <Alert tone="error" className="gg-alert--auth">
              {formError}
            </Alert>
          ) : null}
          <form
            className="gg-stack"
            noValidate
            aria-busy={loading || undefined}
            onSubmit={(event) => {
              event.preventDefault();
              void submitCode();
            }}
          >
            <FormField
              variant="boxed"
              label="Confirmation code"
              placeholder="000000"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={EMAIL_CODE_LENGTH}
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(normalizeEmailCode(event.target.value))}
              controlClassName="gg-field__control--otp"
            />
            <Button
              type="submit"
              variant="commerce"
              block
              loading={loading}
              disabled={code.length !== EMAIL_CODE_LENGTH}
            >
              Confirm and open my card
            </Button>
            <Button type="button" variant="ghost" block onClick={() => void requestNewCode()}>
              Send a new code
            </Button>
            <Button
              type="button"
              variant="ghost"
              block
              onClick={() => {
                setConfirmEmail("");
                setCode("");
                setFormError(null);
              }}
            >
              Back
            </Button>
          </form>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow={event ? event.title : mode === "register" ? "Sign up" : "Sign in"}
      title={
        mode === "register" ? (
          <>
            Enter your <em>name</em>
          </>
        ) : (
          <>
            Welcome <em>back</em>
          </>
        )
      }
      lede={
        event
          ? `${event.dateLabel}. We need a name and a password so we can hold your seat and open your card. ${
              waitlist ? "This evening is full — this is a waitlist request." : ""
            }`
          : mode === "register"
            ? "Name, mobile, email, and a password. Your session is a cookie when Supabase is connected."
            : "Your Gutguard username or email, and your password. Same card, same door."
      }
    >
      <AuthCard>
        {formError ? (
          <Alert tone="error" className="gg-alert--auth">
            {formError}
          </Alert>
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
              variant="boxed"
              label="Your name"
              placeholder="Your name here"
              autoComplete="name"
              {...registerForm.register("name")}
              error={registerForm.formState.errors.name?.message}
            />
            <FormField
              variant="boxed"
              label="Mobile number"
              placeholder="09xx xxx xxxx"
              inputMode="tel"
              autoComplete="tel"
              {...registerForm.register("mobile")}
              error={registerForm.formState.errors.mobile?.message}
            />
            <FormField
              variant="boxed"
              label="Email"
              placeholder="you@email.com"
              type="email"
              autoComplete="email"
              {...registerForm.register("email")}
              error={registerForm.formState.errors.email?.message}
            />
            <FormField
              variant="boxed"
              label="Password"
              type="password"
              autoComplete="new-password"
              minLength={PASSWORD_MIN_LENGTH}
              spellCheck={false}
              hint={PASSWORD_HINT}
              {...registerForm.register("password")}
              error={registerForm.formState.errors.password?.message}
            />
            <Button type="submit" variant="commerce" block loading={loading}>
              Get your card
            </Button>
            <Button type="button" variant="ghost" block onClick={() => switchMode("signin")}>
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
                  if (event) {
                    const decision = decideReservation(event.slug, session.reservations);
                    if (decision.ok) {
                      update({
                        reservations: {
                          ...session.reservations,
                          [event.slug]: decision.kind,
                        },
                      });
                    }
                    if (isSupabaseConfigured()) void persistReservation(event.slug);
                  }
                  router.push(eventResume ?? resumeRoute(session.phase));
                });
              } finally {
                setLoading(false);
              }
            })}
          >
            <FormField
              variant="boxed"
              label="Username or email"
              placeholder="yourname or you@email.com"
              type="text"
              autoComplete="username"
              spellCheck={false}
              {...signInForm.register("identifier")}
              error={signInForm.formState.errors.identifier?.message}
            />
            <FormField
              variant="boxed"
              label="Password"
              type="password"
              autoComplete="current-password"
              spellCheck={false}
              {...signInForm.register("password")}
              error={signInForm.formState.errors.password?.message}
            />
            <Button type="submit" variant="commerce" block loading={loading}>
              Sign in
            </Button>
            <Button type="button" variant="ghost" block onClick={() => switchMode("register")}>
              Need a card? Register
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthShell>
  );
}
