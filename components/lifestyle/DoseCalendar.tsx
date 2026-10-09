"use client";

import { Moon, Sun, Utensils } from "lucide-react";
import { useMemo, useState } from "react";
import { DoseRow } from "@/components/lifestyle/DoseRow";
import { FileAttachment } from "@/components/ui/FileAttachment";
import { DOSE_SLOTS, type DoseLog, type DoseSlotId } from "@/lib/mock/seed";
import { cx } from "@/lib/cx";

const SLOT_ICONS: Record<DoseSlotId, typeof Sun> = {
  morning: Sun,
  midday: Utensils,
  dreams: Moon,
};

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

/**
 * Dose log for the last 10 days. Same data and callbacks as before; the day
 * strip uses the UI Library calendar cell look and each slot is a `DoseRow`.
 * Proof stays one photo per day, so it remains a File Attachment under the
 * rows rather than a per-dose camera button.
 */
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
  const isToday = selected === todayKey();
  const nextSlot = isToday ? DOSE_SLOTS.find((slot) => !entry[slot.id])?.id : undefined;
  const selectedLabel = isToday
    ? "Today"
    : new Date(`${selected}T00:00:00`).toLocaleDateString("en-PH", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

  return (
    <section className="gg-doses" aria-labelledby="gg-doses-title">
      <div className="gg-section-head">
        <h2 className="gg-section-head__title" id="gg-doses-title">
          {isToday ? "Today’s doses" : "Doses"}
        </h2>
        <span className="gg-section-head__aside" suppressHydrationWarning>
          {selectedLabel} · {capsulesPerDay} capsules a day
        </span>
      </div>

      <div className="gg-daystrip" role="tablist" aria-label="Dose days">
        {days.map((day) => {
          const row = log[day] ?? {};
          const count = DOSE_SLOTS.filter((slot) => row[slot.id]).length;
          const date = new Date(`${day}T00:00:00`);
          const status = count === 0 ? "none" : count === DOSE_SLOTS.length ? "full" : "half";
          return (
            <button
              key={day}
              type="button"
              role="tab"
              className={cx("gg-daystrip__day", day === todayKey() && "is-today")}
              aria-selected={day === selected}
              aria-label={`${date.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric" })}: ${count} of ${DOSE_SLOTS.length} doses${row.proof ? ", with photo" : ""}`}
              onClick={() => setSelected(day)}
              suppressHydrationWarning
            >
              <span suppressHydrationWarning>{date.getDate()}</span>
              <i data-status={status} aria-hidden />
            </button>
          );
        })}
      </div>

      <div className="gg-doses__rows">
        {DOSE_SLOTS.map((slot) => {
          const done = Boolean(entry[slot.id]);
          const Icon = SLOT_ICONS[slot.id];
          return (
            <DoseRow
              key={slot.id}
              state={done ? "done" : slot.id === nextSlot ? "next" : "upcoming"}
              icon={<Icon />}
              title={slot.label}
              note={slot.note}
              onDone={() => onToggle(selected, slot.id)}
              onUndo={() => onToggle(selected, slot.id)}
            />
          );
        })}
      </div>

      <FileAttachment
        label={isToday ? "Add today’s dose photo" : "Add a dose photo for this day"}
        fileName={entry.proof ? "dose-proof.jpg" : undefined}
        onPick={(file) => onProof(selected, file)}
      />
    </section>
  );
}
