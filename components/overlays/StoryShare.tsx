"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { OUTCOMES } from "@/lib/mock/seed";
import { storyShareSchema, type StoryShareValues } from "@/lib/schemas/story-share";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { FormField } from "@/components/ui/FormField";

export function StoryShare({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { session } = useSession();
  const { push } = useToast();
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
  const consentTruth = useWatch({ control: form.control, name: "consentTruth" });
  const consentSupplement = useWatch({
    control: form.control,
    name: "consentSupplement",
  });

  return (
    <Drawer
      title="Stories of Hope"
      open={open}
      onClose={onClose}
      footer={
        <Button
          variant="commerce"
          onClick={form.handleSubmit(() => {
            push({
              tone: "success",
              title: "Signed",
              body: "Posted to the community page.",
            });
            onClose();
          })}
        >
          Sign & share
        </Button>
      }
    >
      <form className="gg-stack">
        <p className="gg-lede">
          Your story is the reward — no points, no cash. Share it to give another family hope.
        </p>
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
        <p className="gg-eyebrow">Tap all that apply</p>
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
        {form.formState.errors.outcomes ? (
          <p className="gg-field__error">{form.formState.errors.outcomes.message}</p>
        ) : null}
        <label className="gg-help" style={{ display: "flex", gap: 10 }}>
          <input
            type="checkbox"
            checked={Boolean(consentTruth)}
            onChange={(event) =>
              form.setValue("consentTruth", event.target.checked as true, {
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
              form.setValue("consentSupplement", event.target.checked as true, {
                shouldValidate: true,
              })
            }
            style={{ width: 19, height: 19, accentColor: "#0608A9" }}
          />
          I understand Gutguard is a food supplement with no approved therapeutic claims — results vary.
        </label>
      </form>
    </Drawer>
  );
}
