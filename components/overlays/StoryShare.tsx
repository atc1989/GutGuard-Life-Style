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
import { Sheet } from "@/components/ui/Sheet";
import { Checkbox } from "@/components/ui/Checkbox";
import { StepProgress } from "@/components/lifestyle/StepProgress";
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
    <Sheet
      title="Stories of Hope"
      open={open}
      onClose={() => {
        setStep(0);
        onClose();
      }}
      footer={
        <div className="gg-row gg-row--fill">
          {step > 0 ? (
            <Button variant="outline" onClick={() => setStep((n) => n - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((n) => n + 1)}>
              Next
            </Button>
          ) : (
            <Button loading={loading} onClick={() => void submit()}>
              Sign & share
            </Button>
          )}
        </div>
      }
    >
      <StepProgress steps={[...STEPS]} current={step + 1} />
      <form className="gg-stack gg-sheet__section">
        {step === 0 ? (
          <>
            <p className="gg-row__label">Para kanino ang kwento?</p>
            <div className="gg-chips">
              {(["self", "other"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className="gg-chip"
                  aria-pressed={about === value}
                  onClick={() => form.setValue("about", value)}
                >
                  {value === "self" ? "Aking karanasan" : "Story about someone"}
                </button>
              ))}
            </div>
            {about === "other" ? (
              <FormField
                variant="lifestyle"
                label="Your relationship"
                placeholder="e.g. my child, my father"
                {...form.register("relationship")}
              />
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className="gg-row__label">Before starting Gutguard · After taking Gutguard</p>
            <p className="gg-help">Tap all that apply</p>
            <div className="gg-chips">
              {OUTCOMES.map((outcome) => {
                const selected = outcomes.includes(outcome);
                return (
                  <button
                    key={outcome}
                    type="button"
                    className="gg-chip"
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
          </>
        ) : null}

        {step === 2 ? (
          <>
            <FormField
              variant="lifestyle"
              label="Days taking Gutguard"
              {...form.register("days")}
              error={form.formState.errors.days?.message}
            />
            <FormField
              variant="lifestyle"
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
            <Checkbox
              checked={Boolean(consentTruth)}
              onChange={(event) =>
                form.setValue("consentTruth", event.target.checked, {
                  shouldValidate: true,
                })
              }
            >
              This story is truthful and shared voluntarily.
            </Checkbox>
            <Checkbox
              checked={Boolean(consentSupplement)}
              onChange={(event) =>
                form.setValue("consentSupplement", event.target.checked, {
                  shouldValidate: true,
                })
              }
            >
              I understand Gutguard is a food supplement with no approved therapeutic claims — results vary.
            </Checkbox>
          </>
        ) : null}
      </form>
    </Sheet>
  );
}
