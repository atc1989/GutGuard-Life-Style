"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DoseCalendar } from "@/components/lifestyle/DoseCalendar";
import { PointsLedger } from "@/components/lifestyle/PointsLedger";
import { persistDose, uploadDoseProof } from "@/lib/actions/member";
import { BASE_STEPS, refillCopy } from "@/lib/mock/seed";
import type { HealthSnapshot } from "@/lib/member-data";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/lib/toast";

export function HealthPage({ snapshot }: { snapshot: HealthSnapshot | null }) {
  const { session, update } = useSession();
  const { open } = useOverlay();
  const { push } = useToast();
  const [proofNote, setProofNote] = useState("");
  const hydrated = useRef(false);
  const mock = snapshot?.mock ?? !isSupabaseConfigured();

  useEffect(() => {
    if (!snapshot || hydrated.current) return;
    hydrated.current = true;
    update({
      name: snapshot.name,
      daysLeft: snapshot.daysLeft,
      capsulesPerDay: snapshot.capsulesPerDay,
      sponsor: snapshot.sponsor,
      points: snapshot.points,
      pending: snapshot.pending,
      banked: snapshot.banked,
      doseLog: snapshot.doseLog,
      baseDone: snapshot.baseDone,
      ledger: snapshot.ledger,
    });
  }, [snapshot, update]);

  const refill = refillCopy(session.daysLeft);
  const baseCount = session.baseDone.filter(Boolean).length;

  return (
    <div className="gg-stack">
      <div className="gg-page-head">
        <div>
          <h1 className="gg-heading">My Health</h1>
          <p className="gg-lede">
            Simple daily habits that support your mood and energy.
          </p>
        </div>
        <Button variant="commerce" onClick={() => open("order")}>
          {session.daysLeft <= 0 ? "Order now" : "Order more"}
        </Button>
      </div>

      {mock ? (
        <p className="gg-help">
          Mock session — dose logs stay on this device until Supabase is connected.
        </p>
      ) : null}

      {refill ? (
        <Alert>
          {refill.en} <em>{refill.tl}</em>
        </Alert>
      ) : null}

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
              const note = isSupabaseConfigured()
                ? "Proof saved to your member record."
                : "Proof kept on this device for the mock session.";
              setProofNote(note);
              if (isSupabaseConfigured()) {
                const form = new FormData();
                form.set("file", file);
                void uploadDoseProof(day, form);
              }
              push({
                tone: "success",
                title: "Proof saved",
                body: note,
              });
            }}
          />
          <p className="gg-live" aria-live="polite">
            {proofNote}
          </p>
        </Card>
        <div className="gg-stack">
          <Card>
            <p className="gg-eyebrow">Your Gutguard</p>
            <h2 className="gg-heading gg-stat-title">{session.daysLeft} days left</h2>
            <p className="gg-help">{session.sponsor} will reach you before it runs out.</p>
          </Card>
          <Card>
            <p className="gg-eyebrow">Activation badge</p>
            <h2 className="gg-heading gg-stat-title">
              {baseCount} of {BASE_STEPS.length} stars
            </h2>
            <p className="gg-help">Finish all five and GEMA and My Team open.</p>
            <Button
              variant="secondary"
              className="gg-card-action"
              onClick={() => open("base")}
            >
              {baseCount === BASE_STEPS.length ? "BASE Activation ✓" : "Continue BASE"}
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
    </div>
  );
}
