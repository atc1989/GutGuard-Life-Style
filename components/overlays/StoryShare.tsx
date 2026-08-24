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
import { cx } from "@/lib/cx";

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
    if (!valid) {
      setStep(3);
      return;
    }
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
      title: "Sent for review",
      body: "An operator will approve it before it appears on My Story.",
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
        <div className="gg-row gg-share-footer">
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
      <form className="gg-stack gg-share-form" noValidate>
        {step === 0 ? (
          <>
            <p className="gg-lede">Para kanino ang kwento?</p>
            <div className="gg-chip-row">
              {(["self", "other"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={cx("gg-chip", about === value && "is-on")}
                  aria-pressed={about === value}
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
            <div className="gg-chip-row">
              {OUTCOMES.map((outcome) => {
                const selected = outcomes.includes(outcome);
                return (
                  <button
                    key={outcome}
                    type="button"
                    className={cx("gg-chip", selected && "is-on")}
                    aria-pressed={selected}
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
            {form.formState.errors.outcomes ? (
              <p className="gg-field__error" role="alert">
                {form.formState.errors.outcomes.message}
              </p>
            ) : null}
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
            <label className="gg-check">
              <input
                type="checkbox"
                checked={Boolean(consentTruth)}
                aria-invalid={Boolean(form.formState.errors.consentTruth) || undefined}
                aria-describedby="gg-consent-truth-error"
                onChange={(event) =>
                  form.setValue("consentTruth", event.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
              <span>This story is truthful and shared voluntarily.</span>
            </label>
            {form.formState.errors.consentTruth ? (
              <p className="gg-field__error" id="gg-consent-truth-error">
                {form.formState.errors.consentTruth.message}
              </p>
            ) : null}
            <label className="gg-check">
              <input
                type="checkbox"
                checked={Boolean(consentSupplement)}
                aria-invalid={
                  Boolean(form.formState.errors.consentSupplement) || undefined
                }
                aria-describedby="gg-consent-supplement-error"
                onChange={(event) =>
                  form.setValue("consentSupplement", event.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
              <span>
                I understand Gutguard is a food supplement with no approved
                therapeutic claims — results vary.
              </span>
            </label>
            {form.formState.errors.consentSupplement ? (
              <p className="gg-field__error" id="gg-consent-supplement-error">
                {form.formState.errors.consentSupplement.message}
              </p>
            ) : null}
          </>
        ) : null}
      </form>
    </Drawer>
  );
}
