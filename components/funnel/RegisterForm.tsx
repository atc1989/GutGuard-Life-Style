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
import { AuthCard } from "@/components/funnel/AuthCard";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { LifestyleCardPrototype } from "@/components/lifestyle/LifestyleCardPrototype";
import styles from "./AuthLayout.module.css";
import {
  authRegisterSchema,
  authSignInSchema,
  PASSWORD_HINT,
  PASSWORD_MIN_LENGTH,
  type AuthRegisterValues,
  type AuthSignInValues,
} from "@/lib/schemas/auth";
import {
  GUILD_PROMPT,
  GUILD_PROMPT_ACTION,
  GUILD_PROMPT_HELP,
  looksLikeGuildUsername,
} from "@/lib/lifestyle/guild-identifier";
import {
  EMAIL_CODE_HINT,
  EMAIL_CODE_LENGTH,
  normalizeEmailCode,
} from "@/lib/one-account/client";
import { createNewMemberSession, resumeRoute } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";

/**
 * `returnTo` is already checked against the origin allow-list by the page
 * (Change 4c). It rides along with each submit so the server action can honour
 * it after the redirect it owns — including the 6-digit confirm step, which is
 * where a Staging register actually finishes.
 */
export function RegisterForm({ returnTo }: { returnTo?: string }) {
  const router = useRouter();
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

  // Change 4c / D13: a OneGrinders member never registers — the guild username
  // is the account. Held in state rather than `registerForm.watch()`, which the
  // React Compiler cannot analyse and which would skip compiling this whole
  // component; the field's own onChange feeds it, so the prompt still appears
  // as they type.
  const [guildMember, setGuildMember] = useState(false);

  // Registered once so the guild check can sit in front of the form's own
  // onChange without replacing it.
  const emailField = registerForm.register("email");

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
    // Coming back to register, the prompt has to reflect the field as it now
    // stands — a stale `true` would accuse a valid address of being a username.
    setGuildMember(looksLikeGuildUsername(registerForm.getValues("email")));
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
      const result = await confirmEmailCode({ email: confirmEmail, code, returnTo });
      if (!result) return;
      if (result.ok && result.mode === "mock") {
        router.push(resumeRoute(session.phase));
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
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.grid}>
            <div className={styles.aside}>
              <LifestyleCardPrototype interactive={false} />
              <div className={styles.asideCopy}>
                <p className="gg-eyebrow">Confirm</p>
                <h1 className={`gg-display ${styles.title}`}>
                  Check your <em>email</em>
                </h1>
                <p className={`gg-lede ${styles.lede}`}>
                  We sent a {EMAIL_CODE_LENGTH}-digit code to {confirmEmail}.{" "}
                  {EMAIL_CODE_HINT}
                </p>
              </div>
            </div>
            <AuthCard>
              {formError ? (
                <p className="gg-alert gg-alert--error" role="alert" aria-live="polite">
                  {formError}
                </p>
              ) : null}
              <form
                className={styles.form}
                noValidate
                aria-busy={loading || undefined}
                onSubmit={(event) => {
                  event.preventDefault();
                  void submitCode();
                }}
              >
                <FormField
                  className={styles.codeField}
                  label="Confirmation code"
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={EMAIL_CODE_LENGTH}
                  spellCheck={false}
                  value={code}
                  onChange={(event) => setCode(normalizeEmailCode(event.target.value))}
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
                <Button
                  type="button"
                  variant="ghost"
                  block
                  onClick={() => void requestNewCode()}
                >
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
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.grid}>
          <div className={styles.aside}>
            <LifestyleCardPrototype interactive={false} />
            <div className={styles.asideCopy}>
              <p className="gg-eyebrow">{mode === "register" ? "Sign up" : "Sign in"}</p>
              <h1 className={`gg-display ${styles.title}`}>
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
              <p className={`gg-lede ${styles.lede}`}>
                {mode === "register"
                  ? "Name, mobile, email, and a password. Your session is a cookie when Supabase is connected."
                  : "Your Gutguard username or email, and your password. Same card, same door."}
              </p>
            </div>
          </div>
          <AuthCard>
            {formError ? (
              <p className="gg-alert gg-alert--error" role="alert" aria-live="polite">
                {formError}
              </p>
            ) : null}
            {mode === "register" ? (
              <form
                className={styles.form}
                noValidate
                aria-busy={loading || undefined}
                onSubmit={registerForm.handleSubmit(async (values) => {
                  setFormError(null);
                  setLoading(true);
                  try {
                    const result = await signUp({ ...values, returnTo });
                    if (!result) return;
                    await handleAuthResult(result, () => finishRegister(values));
                  } finally {
                    setLoading(false);
                  }
                })}
              >
                <FormField
                  label="Your name"
                  placeholder="Your name here"
                  autoComplete="name"
                  {...registerForm.register("name")}
                  error={registerForm.formState.errors.name?.message}
                />
                <FormField
                  label="Mobile number"
                  placeholder="09xx xxx xxxx"
                  inputMode="tel"
                  autoComplete="tel"
                  {...registerForm.register("mobile")}
                  error={registerForm.formState.errors.mobile?.message}
                />
                <FormField
                  label="Email"
                  placeholder="you@email.com"
                  type="email"
                  autoComplete="email"
                  {...emailField}
                  onChange={(event) => {
                    setGuildMember(looksLikeGuildUsername(event.target.value));
                    return emailField.onChange(event);
                  }}
                  error={registerForm.formState.errors.email?.message}
                />
                <FormField
                  label="Password"
                  type="password"
                  autoComplete="new-password"
                  minLength={PASSWORD_MIN_LENGTH}
                  spellCheck={false}
                  hint={PASSWORD_HINT}
                  {...registerForm.register("password")}
                  error={registerForm.formState.errors.password?.message}
                />
                {guildMember ? (
                  <div className={`gg-alert ${styles.guild}`} role="status" aria-live="polite">
                    <strong>{GUILD_PROMPT}</strong>
                    <p className="gg-help">{GUILD_PROMPT_HELP}</p>
                    <Button
                      type="button"
                      variant="secondary"
                      block
                      onClick={() => switchMode("signin")}
                    >
                      {GUILD_PROMPT_ACTION}
                    </Button>
                  </div>
                ) : null}
                <Button type="submit" variant="commerce" block loading={loading}>
                  Get your card
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  block
                  onClick={() => switchMode("signin")}
                >
                  Already have a card, or a OneGrinders username? Sign in
                </Button>
              </form>
            ) : (
              <form
                className={styles.form}
                noValidate
                aria-busy={loading || undefined}
                onSubmit={signInForm.handleSubmit(async (values) => {
                  setFormError(null);
                  setLoading(true);
                  try {
                    const result = await signIn({ ...values, returnTo });
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
                  label="Username or email"
                  placeholder="yourname or you@email.com"
                  type="text"
                  autoComplete="username"
                  spellCheck={false}
                  {...signInForm.register("identifier")}
                  error={signInForm.formState.errors.identifier?.message}
                />
                <FormField
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
          </AuthCard>
        </div>
      </div>
    </main>
  );
}
