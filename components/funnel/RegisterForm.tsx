"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { register } from "@/lib/actions/auth";
import { registerSchema, type RegisterValues } from "@/lib/schemas/register";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(register, null);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", mobile: "" },
  });
  const { setError } = form;

  useEffect(() => {
    if (state?.fieldErrors?.name) {
      setError("name", { type: "server", message: state.fieldErrors.name });
    }
    if (state?.fieldErrors?.mobile) {
      setError("mobile", {
        type: "server",
        message: state.fieldErrors.mobile,
      });
    }
  }, [setError, state]);

  return (
    <main className="gg-funnel gg-funnel--editorial">
      <div className="gg-split gg-split--form">
        <div>
          <p className="gg-eyebrow">Sign up</p>
          <h1 className="gg-display" style={{ marginTop: 12 }}>
            Enter your <em>name</em>
          </h1>
          <p className="gg-lede" style={{ marginTop: 14 }}>
            Your name and number — that’s it. Free, no payment, no password.
          </p>
        </div>
        <Card variant="editorial">
          <form
            className="gg-stack"
            noValidate
            action={formAction}
            onSubmit={form.handleSubmit((values) => {
              const payload = new FormData();
              payload.set("name", values.name);
              payload.set("mobile", values.mobile);
              startTransition(() => {
                formAction(payload);
              });
            })}
          >
            <div aria-live="polite">
              {state?.error ? <Alert tone="error">{state.error}</Alert> : null}
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
              {...form.register("mobile")}
              error={form.formState.errors.mobile?.message}
            />
            <Button
              type="submit"
              variant="editorial"
              block
              disabled={pending}
              aria-busy={pending}
            >
              {pending ? "Getting your card…" : "Get your card"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
