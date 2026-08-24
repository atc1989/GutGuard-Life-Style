"use client";

import { startTransition, useActionState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  initialRegisterState,
  registerMember,
} from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import {
  PASSWORD_HINT,
  authRegisterSchema,
  type AuthRegisterValues,
} from "@/lib/schemas/auth";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(
    registerMember,
    initialRegisterState,
  );
  const form = useForm<AuthRegisterValues>({
    resolver: zodResolver(authRegisterSchema),
    defaultValues: { name: "", mobile: "", password: "" },
    shouldFocusError: true,
  });

  const setError = form.setError;
  useEffect(() => {
    const entries = Object.entries(state.fieldErrors) as Array<
      [keyof AuthRegisterValues, string | undefined]
    >;
    for (const [field, message] of entries) {
      if (message) setError(field, { type: "server", message });
    }
  }, [state.fieldErrors, setError]);

  return (
    <main className="gg-funnel gg-funnel--editorial">
      <div className="gg-split gg-split--form">
        <div>
          <p className="gg-eyebrow">Sign up</p>
          <h1 className="gg-display gg-hero__title">
            Enter your <em>name</em>
          </h1>
          <p className="gg-lede gg-hero__lede">
            Name, mobile, and a password. Nothing to pay to start. We keep your
            session in a cookie.
          </p>
        </div>
        <Card variant="editorial">
          <form
            className="gg-stack"
            noValidate
            action={formAction}
            onSubmit={form.handleSubmit((values) => {
              const data = new FormData();
              data.set("name", values.name);
              data.set("mobile", values.mobile);
              data.set("password", values.password);
              startTransition(() => {
                formAction(data);
              });
            })}
          >
            <div className="gg-live" aria-live="polite" aria-atomic="true">
              {state.error ? (
                <p className="gg-field__error">{state.error}</p>
              ) : pending ? (
                <p className="gg-vh">Creating your card</p>
              ) : null}
            </div>
            <FormField
              variant="ruled"
              label="Your name"
              placeholder="Your name here"
              autoComplete="name"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
            <FormField
              variant="ruled"
              label="Mobile number"
              placeholder="09xx xxx xxxx"
              inputMode="tel"
              autoComplete="tel"
              hint="Philippine mobile: 09… or +639…"
              {...form.register("mobile")}
              error={form.formState.errors.mobile?.message}
            />
            <FormField
              variant="ruled"
              label="Password"
              type="password"
              autoComplete="new-password"
              hint={PASSWORD_HINT}
              {...form.register("password")}
              error={form.formState.errors.password?.message}
            />
            <Button
              type="submit"
              variant="editorial"
              block
              loading={pending}
            >
              Get your card
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
