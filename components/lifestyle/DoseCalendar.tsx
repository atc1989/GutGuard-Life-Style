"use client";

import { FileAttachment } from "@/components/ui/FileAttachment";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { Button } from "@/components/ui/Button";
import { DOSE_SLOTS, type DoseLog, type DoseSlotId } from "@/lib/mock/seed";
import {
  dayDoseLabel,
  dayDoseState,
  lastDayKeys,
  takenSlotCount,
  todayKey,
} from "@/lib/health";
import { useMemo, useState } from "react";

export function DoseCalendar({
  log,
  capsulesPerDay,
  onToggle,
  onProof,
  onProofRemove,
}: {
  log: DoseLog;
  capsulesPerDay: number;
  onToggle: (day: string, slotId: DoseSlotId) => void;
  onProof: (day: string, file: File) => void;
  onProofRemove?: (day: string) => void;
}) {
  const days = useMemo(() => lastDayKeys(10), []);
  const [selected, setSelected] = useState(todayKey);
  const entry = log[selected] ?? {};
  const taken = takenSlotCount(entry);
  const selectedState = dayDoseState(log, selected, capsulesPerDay);
  const isToday = selected === todayKey();

  return (
    <div>
      <p className="gg-eyebrow">Calendar and proof</p>
      <p className="gg-help gg-space-top-sm">
        {capsulesPerDay} capsules a day · {isToday ? "Today" : selected} ·{" "}
        {dayDoseLabel(selectedState)}
      </p>
      <div className="gg-cal" role="tablist" aria-label="Dose days">
        {days.map((day) => {
          const state = dayDoseState(log, day, capsulesPerDay);
          const count = takenSlotCount(log[day]);
          const label = new Date(`${day}T00:00:00`).getDate();
          return (
            <button
              key={day}
              type="button"
              role="tab"
              className="gg-cal__day"
              aria-selected={day === selected}
              aria-label={`${day}, ${dayDoseLabel(state)}`}
              onClick={() => setSelected(day)}
            >
              <span>{label}</span>
              <i data-count={count} data-state={state} />
            </button>
          );
        })}
      </div>
      <ProgressRail value={taken} max={DOSE_SLOTS.length} label="Selected day doses" />
      <div className="gg-stack gg-space-top">
        {DOSE_SLOTS.map((slot) => {
          const done = Boolean(entry[slot.id]);
          return (
            <div key={slot.id} className="gg-row">
              <div>
                <strong>{slot.label}</strong>
                <p className="gg-help">{slot.note}</p>
                <p className="gg-help">{done ? "Logged" : "Not logged"}</p>
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
      <div className="gg-space-top">
        <FileAttachment
          fileName={entry.proof}
          onPick={(file) => onProof(selected, file)}
          onRemove={
            entry.proof && onProofRemove
              ? () => onProofRemove(selected)
              : undefined
          }
        />
        <p className="gg-help gg-space-top-sm">
          Optional. Only you and staff helping with your protocol can see a photo
          you attach.
        </p>
      </div>
    </div>
  );
}
