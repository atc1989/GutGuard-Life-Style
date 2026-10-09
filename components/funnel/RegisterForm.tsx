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
import { AuthPanel, FunnelPage } from "@/components/funnel/AuthPanel";
import { FunnelTopBar } from "@/components/funnel/FunnelTopBar";
import { MemberCard } from "@/components/lifestyle/MemberCard";
import { StepProgress } from "@/components/lifestyle/StepProgress";
import { Button } from "@/components/ui/Button";
import { CodeInput } from "@/components/ui/CodeInput";
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

/** Sign-up steps as the app runs them: details → email code → the card. */
const SIGNUP_STEPS = ["Card", "Code", "Start"];

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
  // The card preview mirrors the name and mobile as they are typed. Same
  // pattern as the guild prompt: state fed from each field's onChange.
  const nameField = registerForm.register("name");
  const mobileField = registerForm.register("mobile");
  const [previewName, setPreviewName] = useState("");
  const [previewMobile, setPreviewMobile] = useState("");

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
      <>
        <FunnelTopBar signIn={false} />
        <FunnelPage narrow>
          <StepProgress steps={SIGNUP_STEPS} current={2} />
          <div className="gg-auth-single">
            <h1 className="gg-auth-single__title">
              Check your <em>email</em>
            </h1>
            <p className="gg-auth-single__lede">
              We sent a {EMAIL_CODE_LENGTH}-digit code to <b>{confirmEmail}</b>.{" "}
              {EMAIL_CODE_HINT}
            </p>
            {formError ? (
              <p className="gg-alert gg-alert--error" role="alert" aria-live="polite">
                {formError}
              </p>
            ) : null}
            <form
              className="gg-panel gg-form"
              noValidate
              aria-busy={loading || undefined}
              onSubmit={(event) => {
                event.preventDefault();
                void submitCode();
              }}
            >
              <CodeInput
                label="Confirmation code"
                length={EMAIL_CODE_LENGTH}
                value={code}
                onChange={(event) => setCode(normalizeEmailCode(event.target.value))}
              />
              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={code.length !== EMAIL_CODE_LENGTH}
              >
                Confirm and open my card
              </Button>
              <div className="gg-form__links">
                <Button type="button" variant="link" onClick={() => void requestNewCode()}>
                  Send a new code
                </Button>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setConfirmEmail("");
                    setCode("");
                    setFormError(null);
                  }}
                >
                  Back
                </Button>
              </div>
            </form>
          </div>
        </FunnelPage>
      </>
    );
  }

  const errorAlert = formError ? (
    <p className="gg-alert gg-alert--error" role="alert" aria-live="polite">
      {formError}
    </p>
  ) : null;

  if (mode === "signin") {
    return (
      <>
        <FunnelTopBar signIn={false} />
        <FunnelPage narrow>
          <div className="gg-auth-single">
            <h1 className="gg-auth-single__title">
              Welcome <em>back</em>
            </h1>
            <p className="gg-auth-single__lede">
              Your Gutguard username or email, and your password. Same card, same door.
            </p>
            {errorAlert}
            <form
              className="gg-panel gg-form"
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
                variant="lifestyle"
                label="Username or email"
                placeholder="yourname or you@email.com"
                type="text"
                autoComplete="username"
                spellCheck={false}
                {...signInForm.register("identifier")}
                error={signInForm.formState.errors.identifier?.message}
              />
              <FormField
                variant="lifestyle"
                label="Password"
                type="password"
                autoComplete="current-password"
                spellCheck={false}
                {...signInForm.register("password")}
                error={signInForm.formState.errors.password?.message}
              />
              <Button type="submit" size="lg" loading={loading}>
                Sign in
              </Button>
              <Button type="button" variant="link" onClick={() => switchMode("register")}>
                Need a card? Register
              </Button>
            </form>
          </div>
        </FunnelPage>
      </>
    );
  }

  return (
    <>
      <FunnelTopBar signIn={false} />
      <FunnelPage>
        <StepProgress steps={SIGNUP_STEPS} current={1} />
        <AuthPanel
          sticky="card"
          intro="Name, mobile, email, and a password. Your session is a cookie when Supabase is connected."
          title="Your details"
          titleId="gg-details-label"
          card={
            <MemberCard
              placeholder={!previewName.trim()}
              rank="Lifestyle member"
              name={previewName.trim() || "Your name here"}
              number={previewMobile.trim() || "09xx xxx xxxx"}
              points={0}
              corner={
                <>
                  Free
                  <br />
                  No payment to start
                </>
              }
            />
          }
        >
          <h1 className="gg-vh">Sign up — enter your name</h1>
          {errorAlert}
          <form
            className="gg-panel gg-form"
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
              variant="lifestyle"
              label="Your name"
              placeholder="Your name here"
              autoComplete="name"
              {...nameField}
              onChange={(event) => {
                setPreviewName(event.target.value);
                return nameField.onChange(event);
              }}
              error={registerForm.formState.errors.name?.message}
            />
            <FormField
              variant="lifestyle"
              label="Mobile number"
              placeholder="09xx xxx xxxx"
              inputMode="tel"
              autoComplete="tel"
              {...mobileField}
              onChange={(event) => {
                setPreviewMobile(event.target.value);
                return mobileField.onChange(event);
              }}
              error={registerForm.formState.errors.mobile?.message}
            />
            <FormField
              variant="lifestyle"
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
              variant="lifestyle"
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
              <div className="gg-alert gg-form__guild" role="status" aria-live="polite">
                <strong>{GUILD_PROMPT}</strong>
                <p className="gg-help">{GUILD_PROMPT_HELP}</p>
                <Button
                  type="button"
                  variant="outline"
                  block
                  onClick={() => switchMode("signin")}
                >
                  {GUILD_PROMPT_ACTION}
                </Button>
              </div>
            ) : null}
            <Button type="submit" size="lg" loading={loading}>
              Get your card
            </Button>
          </form>
          <p className="gg-cta-note">
            <b>Free.</b> No payment to start.
          </p>
          <Button type="button" variant="link" onClick={() => switchMode("signin")}>
            Already have a card, or a OneGrinders username? Sign in
          </Button>
        </AuthPanel>
      </FunnelPage>
    </>
  );
}
