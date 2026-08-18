"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FormField } from "@/components/ui/FormField";
import { registerSchema, type RegisterValues } from "@/lib/schemas/register";
import { useSession } from "@/lib/session";

export function RegisterForm() {
  const router = useRouter();
  const { update, setPhase } = useSession();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", mobile: "" },
  });

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
            onSubmit={form.handleSubmit((values) => {
              const parsed = registerSchema.parse(values);
              update({
                name: parsed.name,
                mobile: parsed.mobile,
                phase: "invited",
              });
              setPhase("invited");
              router.push("/card");
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
            <Button type="submit" variant="editorial" block>
              Get your card
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
