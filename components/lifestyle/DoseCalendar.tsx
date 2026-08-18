"use client";

import { FileAttachment } from "@/components/ui/FileAttachment";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { Button } from "@/components/ui/Button";
import { DOSE_SLOTS, type DoseLog } from "@/lib/mock/seed";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DoseCalendar({
  log,
  capsulesPerDay,
  onToggle,
  onProof,
}: {
  log: DoseLog;
  capsulesPerDay: number;
  onToggle: (slotId: "morning" | "midday" | "dreams") => void;
  onProof: (file: File) => void;
}) {
  const day = todayKey();
  const today = log[day] ?? {};
  const taken = DOSE_SLOTS.filter((slot) => today[slot.id]).length;

  return (
    <div>
      <p className="gg-eyebrow">Today’s doses</p>
      <p className="gg-help" style={{ margin: "6px 0 12px" }}>
        {capsulesPerDay} capsules a day · {taken} of {DOSE_SLOTS.length} logged
      </p>
      <ProgressRail value={taken} max={DOSE_SLOTS.length} label="Today’s doses" />
      <div className="gg-stack" style={{ marginTop: 16 }}>
        {DOSE_SLOTS.map((slot) => {
          const done = Boolean(today[slot.id]);
          return (
            <div key={slot.id} className="gg-row">
              <div>
                <strong>{slot.label}</strong>
                <p className="gg-help">{slot.note}</p>
              </div>
              <Button
                variant={done ? "secondary" : "primary"}
                onClick={() => onToggle(slot.id)}
              >
                {done ? "Taken" : "Log"}
              </Button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16 }}>
        <FileAttachment
          fileName={today.proof ? "dose-proof.jpg" : undefined}
          onPick={onProof}
        />
      </div>
    </div>
  );
}
