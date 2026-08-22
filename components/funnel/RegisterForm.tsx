"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { sendRegisterOtp, verifyRegisterOtp } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { registerSchema, type RegisterValues } from "@/lib/schemas/register";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/lib/toast";

export function RegisterForm() {
  const router = useRouter();
  const { update, setPhase } = useSession();
  const { push } = useToast();
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", mobile: "", email: "" },
  });

  async function finish(values: { name: string; mobile: string; email: string }) {
    update({
      name: values.name,
      mobile: values.mobile,
      email: values.email,
      phase: "invited",
    });
    setPhase("invited");
    router.push("/card");
  }

  return (
    <main className="gg-funnel gg-funnel--editorial">
      <div className="gg-split gg-split--form">
        <div>
          <p className="gg-eyebrow">Sign up</p>
          <h1 className="gg-display" style={{ marginTop: 12 }}>
            Enter your <em>name</em>
          </h1>
          <p className="gg-lede" style={{ marginTop: 14 }}>
            Name, mobile, and email. No password. When Supabase is connected, we send a one-time code.
          </p>
        </div>
        <Card variant="editorial">
          {step === "form" ? (
            <form
              className="gg-stack"
              onSubmit={form.handleSubmit(async (values) => {
                const parsed = registerSchema.parse(values);
                setLoading(true);
                const result = await sendRegisterOtp(parsed);
                setLoading(false);
                if (!result.ok) {
                  push({ tone: "error", title: "Could not send code", body: result.error });
                  return;
                }
                update({
                  name: parsed.name,
                  mobile: parsed.mobile,
                  email: parsed.email,
                });
                if (!isSupabaseConfigured() || result.mode === "mock") {
                  await finish(parsed);
                  return;
                }
                setStep("otp");
                push({
                  tone: "success",
                  title: "Code sent",
                  body: `Check ${parsed.email}`,
                });
              })}
            >
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
              <FormField
                variant="ruled"
                label="Email"
                placeholder="you@email.com"
                type="email"
                autoComplete="email"
                {...form.register("email")}
                error={form.formState.errors.email?.message}
              />
              <Button type="submit" variant="editorial" block loading={loading}>
                Get your card
              </Button>
            </form>
          ) : (
            <form
              className="gg-stack"
              onSubmit={async (event) => {
                event.preventDefault();
                setLoading(true);
                const email = form.getValues("email");
                const result = await verifyRegisterOtp({ email, token: otp });
                setLoading(false);
                if (!result.ok) {
                  push({ tone: "error", title: "Invalid code", body: result.error });
                  return;
                }
                await finish({
                  name: form.getValues("name"),
                  mobile: form.getValues("mobile"),
                  email,
                });
              }}
            >
              <FormField
                variant="ruled"
                label="One-time code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <Button type="submit" variant="editorial" block loading={loading}>
                Verify and continue
              </Button>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
