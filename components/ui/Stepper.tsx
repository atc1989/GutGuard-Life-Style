"use client";

import { Minus, Plus } from "lucide-react";

/**
 * UI Library `Stepper`: minus / value / plus pill for small counts. The value
 * is announced politely; buttons name the group they change.
 */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 99,
  unit,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}) {
  return (
    <div className="gg-step" role="group" aria-label={label}>
      <button
        type="button"
        aria-label={`One less: ${label}`}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus aria-hidden />
      </button>
      <span aria-live="polite">
        <b>{value}</b>
        {unit ? <small>{unit}</small> : null}
      </span>
      <button
        type="button"
        aria-label={`One more: ${label}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus aria-hidden />
      </button>
    </div>
  );
}
