"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { persistStory } from "@/lib/actions/member";
import { OUTCOMES } from "@/lib/mock/seed";
import {
  emptyStoryDraft,
  firstInvalidField,
  namesMatch,
  STORY_STEP_FIELDS,
  STORY_STEPS,
  storyShareSchema,
  type StoryShareValues,
} from "@/lib/schemas/story-share";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { FileAttachment } from "@/components/ui/FileAttachment";
import { FormField } from "@/components/ui/FormField";
import { cx } from "@/lib/cx";

export function StoryShare({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { session, update } = useSession();
  const { push } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const skipSave = useRef(false);
  const form = useForm<StoryShareValues>({
    resolver: zodResolver(storyShareSchema),
    defaultValues: session.storyDraft ?? emptyStoryDraft(session.capsulesPerDay),
  });
  const outcomes = useWatch({ control: form.control, name: "outcomes" }) ?? [];
  const about = useWatch({ control: form.control, name: "about" });
  const values = useWatch({ control: form.control });

  useEffect(() => {
    if (!open) return;
    skipSave.current = true;
    form.reset(session.storyDraft ?? emptyStoryDraft(session.capsulesPerDay));
    setStep(0);
    const timer = window.setTimeout(() => {
      skipSave.current = false;
    }, 0);
    return () => window.clearTimeout(timer);
    // Restore once per open so auto-save does not reset the wizard.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open is the gate
  }, [open]);

  useEffect(() => {
    if (!open || skipSave.current) return;
    const timer = window.setTimeout(() => {
      update({ storyDraft: form.getValues() });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open, update, values, form]);

  async function goNext() {
    const fields = STORY_STEP_FIELDS[step] ?? [];
    if (fields.length) {
      const valid = await form.trigger(fields);
      if (!valid) {
        const invalid = firstInvalidField(form.formState.errors, fields);
        if (invalid) document.getElementById(String(invalid))?.focus();
        return;
      }
    }
    setStep((n) => n + 1);
  }

  async function submit() {
    const valid = await form.trigger();
    if (!valid) {
      const invalid = firstInvalidField(
        form.formState.errors,
        STORY_STEP_FIELDS[STORY_STEPS.length - 1] ?? [],
      );
      if (invalid) document.getElementById(String(invalid))?.focus();
      return;
    }
    const next = form.getValues();
    if (!namesMatch(next.signature ?? "", session.name)) {
      form.setError("signature", {
        message: "Type your name as it appears on the card.",
      });
      document.getElementById("signature")?.focus();
      return;
    }
    setLoading(true);
    if (isSupabaseConfigured()) {
      const result = await persistStory({
        about: next.about,
        relationship: next.relationship,
        days: next.days,
        capsules: next.capsules,
        outcomes: next.outcomes,
      });
      if (!result.ok) {
        push({ tone: "error", title: "Could not save", body: result.error });
        setLoading(false);
        return;
      }
    }
    update({ storyDraft: null });
    push({
      tone: "success",
      title: "Submitted for review",
      body: "You can ask your sponsor to withdraw it later.",
    });
    setLoading(false);
    setStep(0);
    onClose();
  }

  return (
    <Drawer
      title="Stories of Hope"
      open={open}
      onClose={onClose}
      footer={
        <div className="gg-row gg-row--spread">
          {step > 0 ? (
            <Button variant="secondary" onClick={() => setStep((n) => n - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {step < STORY_STEPS.length - 1 ? (
            <Button variant="commerce" onClick={() => void goNext()}>
              Next
            </Button>
          ) : (
            <Button variant="commerce" loading={loading} onClick={() => void submit()}>
              Submit for review
            </Button>
          )}
        </div>
      }
    >
      <ol className="gg-wizard" aria-label="Story steps">
        {STORY_STEPS.map((name, index) => (
          <li
            key={name}
            className={cx(
              index === step && "is-current",
              index < step && "is-done",
            )}
          >
            {name}
          </li>
        ))}
      </ol>
      <form className="gg-stack gg-space-top">
        {step === 0 ? (
          <>
            <p className="gg-lede">Who is this story about?</p>
            <div className="gg-chip-row">
              {(["self", "other"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  className={cx("gg-chip", about === value && "is-active")}
                  aria-pressed={about === value}
                  onClick={() => form.setValue("about", value)}
                >
                  {value === "self" ? "My experience" : "Someone else"}
                </button>
              ))}
            </div>
            {about === "other" ? (
              <FormField
                id="relationship"
                label="Your relationship"
                placeholder="e.g. my child, my father"
                {...form.register("relationship")}
                error={form.formState.errors.relationship?.message}
              />
            ) : null}
          </>
        ) : null}

        {step === 1 ? (
          <>
            <p className="gg-eyebrow">What changed</p>
            <p className="gg-help">Tap all that apply. These are reports, not medical claims.</p>
            <div id="outcomes" tabIndex={-1} className="gg-chip-row">
              {OUTCOMES.map((outcome) => {
                const selected = outcomes.includes(outcome);
                return (
                  <button
                    key={outcome}
                    type="button"
                    className={cx("gg-chip", selected && "is-active")}
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
            {form.formState.errors.outcomes?.message ? (
              <p className="gg-field__error" role="alert">
                {form.formState.errors.outcomes.message}
              </p>
            ) : null}
            <label className="gg-field" htmlFor="statement">
              <span className="gg-field__label">Short statement</span>
              <textarea
                id="statement"
                className="gg-field__control gg-field__control--area"
                rows={3}
                {...form.register("statement")}
              />
            </label>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <FormField
              id="days"
              label="Days taking Gutguard"
              {...form.register("days")}
              error={form.formState.errors.days?.message}
            />
            <FormField
              id="capsules"
              label="Capsules per day"
              {...form.register("capsules")}
              error={form.formState.errors.capsules?.message}
            />
            <p className="gg-help">
              Pre-filled from the record — adjust if the story is about someone else.
            </p>
            <FileAttachment
              label="Optional lab or photo"
              hint="Private until reviewed. Not shown on the community feed."
              fileName={form.getValues("evidenceName") || undefined}
              onPick={(file) =>
                form.setValue("evidenceName", file.name, { shouldValidate: true })
              }
              onRemove={() => form.setValue("evidenceName", "", { shouldValidate: true })}
            />
            <label className="gg-check" htmlFor="consentUpload">
              <input
                id="consentUpload"
                type="checkbox"
                checked={Boolean(form.watch("consentUpload"))}
                onChange={(event) =>
                  form.setValue("consentUpload", event.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
              Upload consent is separate from public use. Staff may review a file. The
              feed will not show raw evidence.
            </label>
            {form.formState.errors.consentUpload?.message ? (
              <p className="gg-field__error" role="alert">
                {form.formState.errors.consentUpload.message}
              </p>
            ) : null}
          </>
        ) : null}

        {step === 3 ? (
          <div className="gg-stack">
            <p className="gg-eyebrow">Review</p>
            <p className="gg-lede">
              {about === "other"
                ? `About ${form.getValues("relationship") || "someone else"}`
                : "Your own story"}
            </p>
            <p className="gg-help">
              {form.getValues("days")} days · {form.getValues("capsules")} capsules ·{" "}
              {(form.getValues("outcomes") ?? []).join(", ")}
            </p>
            {form.getValues("statement") ? (
              <p className="gg-lede">{form.getValues("statement")}</p>
            ) : null}
            <p className="gg-help">
              Name, photo, story, and optional evidence stay private until review.
              Public use needs the next step. You can ask your sponsor to withdraw a
              published story later.
            </p>
          </div>
        ) : null}

        {step === 4 ? (
          <>
            <p className="gg-help">
              Withdraw later through your sponsor or Settings. Final legal wording
              is still with the team — this typed name confirms you reviewed the
              story, not a closed contract.
            </p>
            <label className="gg-check" htmlFor="consentPublic">
              <input
                id="consentPublic"
                type="checkbox"
                checked={Boolean(form.watch("consentPublic"))}
                onChange={(event) =>
                  form.setValue("consentPublic", event.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
              Public-use consent: approved display name, place, and short statement
              may appear on My Story after review. Evidence stays off the feed.
            </label>
            <label className="gg-check" htmlFor="consentTruth">
              <input
                id="consentTruth"
                type="checkbox"
                checked={Boolean(form.watch("consentTruth"))}
                onChange={(event) =>
                  form.setValue("consentTruth", event.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
              This story is truthful and shared voluntarily.
            </label>
            <label className="gg-check" htmlFor="consentSupplement">
              <input
                id="consentSupplement"
                type="checkbox"
                checked={Boolean(form.watch("consentSupplement"))}
                onChange={(event) =>
                  form.setValue("consentSupplement", event.target.checked, {
                    shouldValidate: true,
                  })
                }
              />
              I understand Gutguard is a food supplement with no approved therapeutic
              claims — results vary.
            </label>
            <FormField
              id="signature"
              label="Type your full name"
              {...form.register("signature")}
              error={form.formState.errors.signature?.message}
            />
          </>
        ) : null}
      </form>
    </Drawer>
  );
}
