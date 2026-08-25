"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DoseCalendar } from "@/components/lifestyle/DoseCalendar";
import { PointsLedger } from "@/components/lifestyle/PointsLedger";
import { persistDose, uploadDoseProof } from "@/lib/actions/member";
import { BASE_STEPS, hasSupply, refillCopy } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/lib/toast";

export function HealthPage() {
  const { session, update } = useSession();
  const { open } = useOverlay();
  const { push } = useToast();
  const refill = refillCopy(session.daysLeft);
  const baseCount = session.baseDone.filter(Boolean).length;
  const supplied = hasSupply(session.daysLeft);

  return (
    <div className="gg-stack">
      <div className="gg-page-head">
        <div>
          <h1 className="gg-heading">My Health</h1>
          <p className="gg-lede">Simple daily habits that support your mood and energy.</p>
        </div>
        <Button variant="commerce" onClick={() => open("order")}>
          {supplied && session.daysLeft > 0 ? "Order more" : "Order now"}
        </Button>
      </div>

      {!supplied ? (
        <EmptyState
          title="Your protocol starts with a bottle"
          copy="Show your card at the door. Ate Marites will reach you. Nothing to log until Gutguard is in the house."
          action={{ label: "Order now", onClick: () => open("order") }}
        />
      ) : null}

      {refill ? (
        <Alert>
          {refill.en} <em>{refill.tl}</em>
        </Alert>
      ) : null}

      {supplied ? (
      <div className="gg-split">
        <Card>
          <DoseCalendar
            log={session.doseLog}
            capsulesPerDay={session.capsulesPerDay}
            onToggle={(day, slotId) => {
              const entry = session.doseLog[day] ?? {};
              const nextValue = !entry[slotId];
              update({
                doseLog: {
                  ...session.doseLog,
                  [day]: { ...entry, [slotId]: nextValue },
                },
              });
              if (isSupabaseConfigured()) {
                void persistDose(day, slotId, nextValue);
              }
            }}
            onProof={(day, file) => {
              const entry = session.doseLog[day] ?? {};
              update({
                doseLog: {
                  ...session.doseLog,
                  [day]: { ...entry, proof: file.name },
                },
              });
              if (isSupabaseConfigured()) {
                const form = new FormData();
                form.set("file", file);
                void uploadDoseProof(day, form);
              }
              push({
                tone: "success",
                title: "Proof saved",
                body: isSupabaseConfigured()
                  ? "Uploaded to your member record."
                  : "Kept on this device for the mock session.",
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
            <p className="gg-help">{session.sponsor} will reach you before it runs out.</p>
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
          <PointsLedger
            points={session.points}
            pending={session.pending}
            banked={session.banked}
            ledger={session.ledger}
          />
        </div>
      </div>
      ) : null}
    </div>
  );
}
