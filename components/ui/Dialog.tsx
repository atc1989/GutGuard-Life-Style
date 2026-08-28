"use client";

import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cx } from "@/lib/cx";
import type { ReactNode, TransitionEvent } from "react";
import { useEffect, useState } from "react";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ title, open, onClose, children, footer }: Props) {
  const [shown, setShown] = useState(false);
  const [entered, setEntered] = useState(false);

  if (open && !shown) {
    setShown(true);
  }

  useEffect(() => {
    if (!shown) return;

    const reduceMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (open) {
      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setEntered(true));
      });
      return () => window.cancelAnimationFrame(frame);
    }

    const hide = () => {
      setEntered(false);
      setShown(false);
    };

    if (reduceMotion()) {
      const timeout = window.setTimeout(hide, 0);
      return () => window.clearTimeout(timeout);
    }

    const leave = window.requestAnimationFrame(() => setEntered(false));
    const timeout = window.setTimeout(hide, 360);
    return () => {
      window.cancelAnimationFrame(leave);
      window.clearTimeout(timeout);
    };
  }, [open, shown]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function handleBackdropTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== "opacity") return;
    if (!open) {
      setEntered(false);
      setShown(false);
    }
  }

  if (!shown) return null;

  const titleId = "gg-dialog-title";

  return (
    <div
      className={cx("gg-backdrop", entered && "is-open")}
      onClick={onClose}
      onTransitionEnd={handleBackdropTransitionEnd}
    >
      <div
        className="gg-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="gg-dialog-grab" aria-hidden />
        <div className="gg-dialog-header">
          <h2 className="gg-dialog-title" id={titleId}>
            {title}
          </h2>
          <IconButton label="Close" onClick={onClose}>
            <X />
          </IconButton>
        </div>
        <div className="gg-dialog-body">{children}</div>
        {footer ? <div className="gg-dialog-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
