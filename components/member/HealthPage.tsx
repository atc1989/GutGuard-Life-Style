"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { DoseCalendar } from "@/components/lifestyle/DoseCalendar";
import { PointsLedger } from "@/components/lifestyle/PointsLedger";
import { HealthSetupCard, HealthSetupSheet } from "@/components/member/HealthSetup";
import { persistDose, uploadDoseProof } from "@/lib/actions/member";
import {
  completedDoseDays,
  dailyGuidance,
  dayTenCopy,
  takenSlotCount,
  todayKey,
} from "@/lib/health";
import { BASE_STEPS, DOSE_SLOTS, hasSupply, refillCopy, type HealthSetupId } from "@/lib/mock/seed";
import { useOverlay } from "@/lib/overlay-store";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/lib/toast";

export function HealthPage() {
  const { session, update } = useSession();
  const { open } = useOverlay();
  const { push } = useToast();
  const [setupStep, setSetupStep] = useState<HealthSetupId | null>(null);
  const refill = refillCopy(session.daysLeft);
  const baseCount = session.baseDone.filter(Boolean).length;
  const supplied = hasSupply(session.daysLeft);
  const today = todayKey();
  const todayTaken = takenSlotCount(session.doseLog[today]);
  const completed = completedDoseDays(session.doseLog, session.capsulesPerDay);
  const milestone = dayTenCopy(completed);
  const guidance = dailyGuidance(session, today);

  return (
    <div className="gg-stack">
      <div className="gg-page-head">
        <div>
          <h1 className="gg-heading">My Health</h1>
          <p className="gg-lede">Simple daily habits that support your mood and energy.</p>
        </div>
      </div>

      {!supplied ? (
        <EmptyState
          title="Your protocol starts with a bottle"
          copy="Show your card at the door. Ate Marites will reach you. Nothing to log until Gutguard is in the house."
        />
      ) : (
        <Card>
          <p className="gg-eyebrow">Today</p>
          <h2 className="gg-heading gg-heading--sm">
            {todayTaken} of {session.capsulesPerDay} doses logged
          </h2>
          <p className="gg-help gg-space-top-sm">
            {todayTaken >= session.capsulesPerDay
              ? "Today is complete."
              : "Log each slot when you take it. Completed states stay readable without green alone."}
          </p>
          <ul className="gg-today-slots">
            {DOSE_SLOTS.map((slot) => {
              const done = Boolean(session.doseLog[today]?.[slot.id]);
              return (
                <li key={slot.id} className="gg-row">
                  <div>
                    <strong>{slot.label}</strong>
                    <p className="gg-help">{done ? "Logged" : "Waiting"}</p>
                  </div>
                  <Button
                    variant={done ? "secondary" : "primary"}
                    onClick={() => {
                      update({
                        doseLog: {
                          ...session.doseLog,
                          [today]: {
                            ...session.doseLog[today],
                            [slot.id]: !done,
                          },
                        },
                      });
                      if (isSupabaseConfigured()) {
                        void persistDose(today, slot.id, !done);
                      }
                    }}
                  >
                    {done ? "Taken" : "Log"}
                  </Button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {supplied ? (
        milestone.done ? (
          <Card>
            <p className="gg-eyebrow">Day-ten milestone</p>
            <h2 className="gg-heading gg-heading--sm">{milestone.title}</h2>
            <p className="gg-help gg-space-top-sm">{milestone.body}</p>
            <Button variant="commerce" className="gg-space-top" onClick={() => open("share")}>
              Share a story if you want
            </Button>
          </Card>
        ) : (
          <>
            <HealthSetupCard onOpen={setSetupStep} />
            <Card>
              <p className="gg-eyebrow">Day-ten milestone</p>
              <h2 className="gg-heading gg-heading--sm">{milestone.title}</h2>
              <p className="gg-help gg-space-top-sm">{milestone.body}</p>
            </Card>
          </>
        )
      ) : null}

      {supplied ? (
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
            onProofRemove={(day) => {
              const entry = session.doseLog[day] ?? {};
              const next = { ...entry };
              delete next.proof;
              update({
                doseLog: {
                  ...session.doseLog,
                  [day]: next,
                },
              });
            }}
          />
        </Card>
      ) : null}

      {supplied ? (
        <Alert tone={guidance.tone}>
          <strong className="gg-alert__kicker">{guidance.title}</strong>
          {guidance.body}
        </Alert>
      ) : null}

      {refill ? (
        <Alert tone="care">
          {refill.en} <em>{refill.tl}</em>
        </Alert>
      ) : null}

      {supplied ? (
        <div className="gg-split">
          <Card>
            <p className="gg-eyebrow">Your Gutguard</p>
            <h2 className="gg-heading gg-heading--md">{session.daysLeft} days left</h2>
            <p className="gg-help">
              Projected run-out uses the bottle on this card. {session.sponsor} will
              reach you before it runs out.
            </p>
          </Card>
          <div className="gg-stack">
            <Card>
              <p className="gg-eyebrow">Activation badge</p>
              <h2 className="gg-heading gg-heading--md">
                {baseCount} of {BASE_STEPS.length} stars
              </h2>
              <p className="gg-help">Finish all five and GEMA opens.</p>
              <Button
                variant="secondary"
                className="gg-space-top"
                onClick={() => open("base")}
              >
                {baseCount === BASE_STEPS.length ? "BASE Activation done" : "Continue BASE"}
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

      <HealthSetupSheet step={setupStep} onClose={() => setSetupStep(null)} />
    </div>
  );
}
