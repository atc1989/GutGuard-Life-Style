"use client";

import { Camera, Check } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { IconButton } from "@/components/ui/IconButton";

/**
 * UI Library `DoseRow` for the day list. `next` is the next dose (blue border,
 * NEXT tag, filled Done), `upcoming` a later one (outline Done), `done` a taken
 * one (pale blue, check, Undo). Only the fields the app records are shown.
 * The `settings` variant is not built: the app has no per-dose times.
 */
export function DoseRow({
  state,
  icon,
  title,
  meta,
  note,
  onDone,
  onUndo,
  onPhoto,
  className,
}: {
  state: "next" | "upcoming" | "done";
  icon: ReactNode;
  title: string;
  meta?: ReactNode;
  note?: ReactNode;
  onDone?: () => void;
  onUndo?: () => void;
  onPhoto?: () => void;
  className?: string;
}) {
  const done = state === "done";
  return (
    <div className={cx("gg-dose", `gg-dose--${state}`, className)}>
      <span className="gg-dose__icon" aria-hidden>
        {done ? <Check /> : icon}
      </span>
      <div className="gg-dose__body">
        <p className="gg-dose__title">
          {title}
          {state === "next" ? <span className="gg-dose__tag">Next</span> : null}
        </p>
        {meta ? <p className="gg-dose__meta">{meta}</p> : null}
        {note ? <p className="gg-dose__note">{note}</p> : null}
      </div>
      <div className="gg-dose__actions">
        {onPhoto ? (
          <IconButton
            shape="round"
            label={`Take a photo of your ${title} dose`}
            onClick={onPhoto}
          >
            <Camera />
          </IconButton>
        ) : null}
        {done ? (
          <button
            type="button"
            className="gg-dose__undo"
            aria-label={`Undo ${title}`}
            onClick={onUndo}
          >
            Undo
          </button>
        ) : (
          <button
            type="button"
            className={cx("gg-dose__done", state === "upcoming" && "is-soft")}
            aria-label={`Done, ${title}`}
            onClick={onDone}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
