"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { cx } from "@/lib/cx";
import {
  communityCopy,
  contactChannelCopy,
  healthSetupSteps,
  setupComplete,
} from "@/lib/health";
import type {
  CommunityDestination,
  ContactChannel,
  HealthSetupId,
} from "@/lib/mock/seed";
import { useSession } from "@/lib/session";

const CONTACT_OPTIONS: Array<{ id: ContactChannel; label: string }> = [
  { id: "sms", label: "SMS" },
  { id: "telegram", label: "Telegram" },
  { id: "in-app", label: "In-app only" },
];

const COMMUNITY_OPTIONS: Array<{ id: CommunityDestination; label: string }> = [
  { id: "events", label: "Evenings and stories" },
  { id: "telegram", label: "Telegram" },
  { id: "facebook", label: "Facebook" },
];

export function HealthSetupCard({
  onOpen,
}: {
  onOpen: (id: HealthSetupId) => void;
}) {
  const { session } = useSession();
  const steps = healthSetupSteps(session);
  const done = setupComplete(session);

  if (done) {
    return (
      <Card>
        <p className="gg-eyebrow">First ten days</p>
        <h2 className="gg-heading gg-heading--sm">Setup complete</h2>
        <p className="gg-help gg-space-top-sm">
          {session.capsulesPerDay} capsules · {contactChannelCopy(session.contactChannel)}{" "}
          · {communityCopy(session.communityDestination)}
        </p>
        <Button variant="secondary" className="gg-space-top" onClick={() => onOpen("doses")}>
          Edit setup
        </Button>
      </Card>
    );
  }

  return (
    <div className="gg-stack">
      <p className="gg-eyebrow">First ten days</p>
      {steps.map((step) => (
        <div key={step.id} className="gg-req">
          <div>
            <div className={cx("gg-req__node", step.done && "is-done")} />
          </div>
          <Card>
            <Badge active={step.done}>{step.done ? "Done" : step.when}</Badge>
            <h3 className="gg-heading gg-heading--sm">{step.title}</h3>
            <p className="gg-help gg-space-top-sm">{step.detail}</p>
            <Button
              variant="secondary"
              className="gg-space-top"
              onClick={() => onOpen(step.id)}
            >
              {step.done ? "Edit" : "Open"}
            </Button>
          </Card>
        </div>
      ))}
    </div>
  );
}

export function HealthSetupSheet({
  step,
  onClose,
}: {
  step: HealthSetupId | null;
  onClose: () => void;
}) {
  const { session, update } = useSession();

  function mark(id: HealthSetupId) {
    update({ healthSetup: { ...session.healthSetup, [id]: true } });
    onClose();
  }

  return (
    <Drawer
      title={
        step === "doses"
          ? "Daily doses"
          : step === "contact"
            ? "How we may contact you"
            : "Community destination"
      }
      open={step !== null}
      onClose={onClose}
    >
      {step === "doses" ? (
        <div className="gg-stack">
          <p className="gg-lede">
            The protocol needs at least two capsules a day. Changing this count
            applies from tomorrow. Today still uses the slots on the calendar.
          </p>
          <div className="gg-row">
            <span>Capsules per day</span>
            <QuantityStepper
              label="Daily capsules"
              value={session.capsulesPerDay}
              min={2}
              max={3}
              onChange={(capsulesPerDay) => update({ capsulesPerDay })}
            />
          </div>
          <Button variant="commerce" onClick={() => mark("doses")}>
            Save daily doses
          </Button>
        </div>
      ) : null}

      {step === "contact" ? (
        <div className="gg-stack">
          <p className="gg-lede">
            Your sponsor uses this for refill and check-in. We will not text a
            group or sell the number.
          </p>
          <div className="gg-chip-row">
            {CONTACT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={cx(
                  "gg-chip",
                  session.contactChannel === option.id && "is-active",
                )}
                aria-pressed={session.contactChannel === option.id}
                onClick={() => update({ contactChannel: option.id })}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="commerce" onClick={() => mark("contact")}>
            Save contact preference
          </Button>
        </div>
      ) : null}

      {step === "community" ? (
        <div className="gg-stack">
          <p className="gg-lede">
            This is where gathering notes and approved stories go. You can change
            it later in Settings.
          </p>
          <div className="gg-chip-row">
            {COMMUNITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={cx(
                  "gg-chip",
                  session.communityDestination === option.id && "is-active",
                )}
                aria-pressed={session.communityDestination === option.id}
                onClick={() => update({ communityDestination: option.id })}
              >
                {option.label}
              </button>
            ))}
          </div>
          <Button variant="commerce" onClick={() => mark("community")}>
            Save community
          </Button>
        </div>
      ) : null}
    </Drawer>
  );
}
