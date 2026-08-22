"use client";

import { FileAttachment } from "@/components/ui/FileAttachment";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { Button } from "@/components/ui/Button";
import { DOSE_SLOTS, type DoseLog, type DoseSlotId } from "@/lib/mock/seed";
import { useMemo, useState } from "react";

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return dayKey(new Date());
}

function lastDays(count: number) {
  const days: string[] = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    days.push(dayKey(date));
  }
  return days;
}

export function DoseCalendar({
  log,
  capsulesPerDay,
  onToggle,
  onProof,
}: {
  log: DoseLog;
  capsulesPerDay: number;
  onToggle: (day: string, slotId: DoseSlotId) => void;
  onProof: (day: string, file: File) => void;
}) {
  const days = useMemo(() => lastDays(10), []);
  const [selected, setSelected] = useState(todayKey);
  const entry = log[selected] ?? {};
  const taken = DOSE_SLOTS.filter((slot) => entry[slot.id]).length;
  const isToday = selected === todayKey();

  return (
    <div>
      <p className="gg-eyebrow">Calendar & proof</p>
      <p className="gg-help" style={{ margin: "6px 0 12px" }}>
        {capsulesPerDay} capsules a day · {isToday ? "today" : selected}
      </p>
      <div className="gg-cal" role="tablist" aria-label="Dose days">
        {days.map((day) => {
          const row = log[day] ?? {};
          const count = DOSE_SLOTS.filter((slot) => row[slot.id]).length;
          const label = new Date(`${day}T00:00:00`).getDate();
          return (
            <button
              key={day}
              type="button"
              role="tab"
              className="gg-cal__day"
              aria-selected={day === selected}
              onClick={() => setSelected(day)}
            >
              <span>{label}</span>
              <i data-count={count} />
            </button>
          );
        })}
      </div>
      <ProgressRail value={taken} max={DOSE_SLOTS.length} label="Selected day doses" />
      <div className="gg-stack" style={{ marginTop: 16 }}>
        {DOSE_SLOTS.map((slot) => {
          const done = Boolean(entry[slot.id]);
          return (
            <div key={slot.id} className="gg-row">
              <div>
                <strong>{slot.label}</strong>
                <p className="gg-help">{slot.note}</p>
              </div>
              <Button
                variant={done ? "secondary" : "primary"}
                onClick={() => onToggle(selected, slot.id)}
              >
                {done ? "Taken" : "Log"}
              </Button>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 16 }}>
        <FileAttachment
          fileName={entry.proof ? "dose-proof.jpg" : undefined}
          onPick={(file) => onProof(selected, file)}
        />
        <p className="gg-help" style={{ marginTop: 8 }}>
          Tap a checked day to see its proof.
        </p>
      </div>
    </div>
  );
}
