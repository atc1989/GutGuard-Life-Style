"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { persistStory } from "@/lib/actions/member";
import { OUTCOMES } from "@/lib/mock/seed";
import { storyShareSchema, type StoryShareValues } from "@/lib/schemas/story-share";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { FormField } from "@/components/ui/FormField";

const STEPS = ["Who", "Change", "Record", "Sign"] as const;

export function StoryShare({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { session } = useSession();
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const form = useForm<StoryShareValues>({
    resolver: zodResolver(storyShareSchema),
    defaultValues: {
      about: "self",
      days: "10",
      capsules: String(session.capsulesPerDay),
      outcomes: [],
      consentTruth: false,
      consentSupplement: false,
    },
  });
  const outcomes = useWatch({ control: form.control, name: "outcomes" }) ?? [];
  const about = useWatch({ control: form.control, name: "about" });
  const consentTruth = useWatch({ control: form.control, name: "consentTruth" });
  const consentSupplement = useWatch({
    control: form.control,
    name: "consentSupplement",
  });

  async function submit() {
    const valid = await form.trigger();
    if (!valid) return;
    setLoading(true);
    const values = form.getValues();
    if (isSupabaseConfigured()) {
      const result = await persistStory({
        about: values.about,
        relationship: values.relationship,
        days: values.days,
        capsules: values.capsules,
        outcomes: values.outcomes,
      });
      if (!result.ok) {
        push({ tone: "error", title: "Could not save", body: result.error });
        setLoading(false);
        return;
      }
    }
    push({
      tone: "success",
      title: "Signed",
      body: "Posted to the community page.",
    });
    setLoading(false);
    setStep(0);
    onClose();
  }

  return (
    <Drawer
      title="Stories of Hope"
      open={open}
      onClose={() => {
        setStep(0);
        onClose();
      }}
      footer={
        <div className="gg-row" style={{ width: "100%" }}>
          {step > 0 ? (
            <Button variant="secondary" onClick={() => setStep((n) => n - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button variant="commerce" onClick={() => setStep((n) => n + 1)}>
              Next
            </Button>
          ) : (
            <Button variant="commerce" loading={loading} onClick={() => void submit()}>
              Sign & share
            </Button>
          )}
        </div>
      }
    >
      <p className="gg-eyebrow">
        Step {step + 1} of {STEPS.length} · {STEPS[step]}
      </p>
      <form className="gg-stack" style={{ marginTop: 16 }}>
        {step === 0 ? (
          <>
            <p className="gg-lede">Para kanino ang kwento?</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(["self", "other"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="gg-badge"
                  style={{
                    cursor: "pointer",
                    borderColor: about === value ? "var(--gg-blue)" : undefined,
                    color: about === value ? "var(--gg-blue)" : undefined,
                  }}
                  onClick={() => form.setValue("about", value)}
                >
                  {value === "self" ? "Aking karanasan" : "Story about someone"}
                </button>
              ))}
            </div>
            {about === "other" ? (
              <FormField
                label="Your relationship"
                placeholder="e.g. my child, my father"
                {...form.register("relationship")}
              />
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className="gg-eyebrow">Before starting Gutguard · After taking Gutguard</p>
            <p className="gg-help">Tap all that apply</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {OUTCOMES.map((outcome) => {
                const selected = outcomes.includes(outcome);
                return (
                  <button
                    key={outcome}
                    type="button"
                    className="gg-badge"
                    style={{
                      cursor: "pointer",
                      borderColor: selected ? "var(--gg-blue)" : undefined,
                      color: selected ? "var(--gg-blue)" : undefined,
                    }}
                    onClick={() => {
                      const current = form.getValues("outcomes");
                      form.setValue(
                        "outcomes",
                        selected
                          ? current.filter((item) => item !== outcome)
                          : [...current, outcome],
                        { shouldValidate: true },
                      );
                    }}
                  >
                    {outcome}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <FormField
              label="Days taking Gutguard"
              {...form.register("days")}
              error={form.formState.errors.days?.message}
            />
            <FormField
              label="Capsules per day"
              {...form.register("capsules")}
              error={form.formState.errors.capsules?.message}
            />
            <p className="gg-help">
              Pre-filled from the record — adjust if the story is about someone else.
            </p>
          </>
        ) : null}

        {step === 3 ? (
          <>
            <label className="gg-help" style={{ display: "flex", gap: 10 }}>
              <input
                type="checkbox"
                checked={Boolean(consentTruth)}
                onChange={(event) =>
                  form.setValue("consentTruth", event.target.checked, {
                    shouldValidate: true,
                  })
                }
                style={{ width: 19, height: 19, accentColor: "#0608A9" }}
              />
              This story is truthful and shared voluntarily.
            </label>
            <label className="gg-help" style={{ display: "flex", gap: 10 }}>
              <input
                type="checkbox"
                checked={Boolean(consentSupplement)}
                onChange={(event) =>
                  form.setValue("consentSupplement", event.target.checked, {
                    shouldValidate: true,
                  })
                }
                style={{ width: 19, height: 19, accentColor: "#0608A9" }}
              />
              I understand Gutguard is a food supplement with no approved therapeutic claims — results vary.
            </label>
          </>
        ) : null}
      </form>
    </Drawer>
  );
}
