"use client";

import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ title, open, onClose, children, footer }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const titleId = "gg-dialog-title";

  return (
    <div className="gg-backdrop" onClick={onClose}>
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
