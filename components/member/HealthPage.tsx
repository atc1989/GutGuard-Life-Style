"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DoseCalendar } from "@/components/lifestyle/DoseCalendar";
import { BASE_STEPS, refillCopy } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { useToast } from "@/lib/toast";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function HealthPage() {
  const { session, update } = useSession();
  const { open } = useOverlay();
  const { push } = useToast();
  const day = todayKey();
  const log = session.doseLog[day] ?? {};
  const refill = refillCopy(session.daysLeft);
  const baseCount = session.baseDone.filter(Boolean).length;

  return (
    <div className="gg-stack">
      <div className="gg-page-head">
        <div>
          <h1 className="gg-heading">My Health</h1>
          <p className="gg-lede">Simple daily habits that support your mood and energy.</p>
        </div>
        <Button variant="commerce" onClick={() => open("order")}>
          {session.daysLeft <= 0 ? "Order now" : "Order more"}
        </Button>
      </div>

      {refill ? (
        <Alert>
          {refill.en}
          {" "}
          <em>{refill.tl}</em>
        </Alert>
      ) : null}

      <div className="gg-split">
        <Card>
          <DoseCalendar
            log={session.doseLog}
            capsulesPerDay={session.capsulesPerDay}
            onToggle={(slotId) => {
              update({
                doseLog: {
                  ...session.doseLog,
                  [day]: { ...log, [slotId]: !log[slotId] },
                },
              });
            }}
            onProof={(file) => {
              update({
                doseLog: {
                  ...session.doseLog,
                  [day]: { ...log, proof: file.name },
                },
              });
              push({
                tone: "success",
                title: "Proof saved",
                body: "Kept on this device for the mock session.",
              });
            }}
          />
        </Card>
        <div className="gg-stack">
          <Card>
            <p className="gg-eyebrow">Your Gutguard</p>
            <h2 className="gg-heading" style={{ fontSize: 28, margin: "8px 0" }}>
              {session.daysLeft} days left
            </h2>
            <p className="gg-help">
              {session.sponsor} will reach you before it runs out.
            </p>
          </Card>
          <Card>
            <p className="gg-eyebrow">Activation badge</p>
            <h2 className="gg-heading" style={{ fontSize: 28, margin: "8px 0" }}>
              {baseCount} of {BASE_STEPS.length} stars
            </h2>
            <p className="gg-help">Finish all five and GEMA opens.</p>
            <Button variant="secondary" style={{ marginTop: 12 }} onClick={() => open("base")}>
              {baseCount === BASE_STEPS.length ? "BASE Activation ✓" : "Continue BASE →"}
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
