"use client";

import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { cx } from "@/lib/cx";
import type { ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({ title, open, onClose, children, footer }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [rendered, setRendered] = useState(open);
  const closing = rendered && !open;

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      setRendered(false);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [closing]);

  if (open && !rendered) setRendered(true);

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const container = dialog?.parentElement;
    const siblings = container
      ? Array.from(container.parentElement?.children ?? []).filter(
          (node): node is HTMLElement =>
            node instanceof HTMLElement && node !== container,
        )
      : [];
    const previousState = siblings.map((node) => ({
      node,
      inert: node.inert,
      ariaHidden: node.getAttribute("aria-hidden"),
    }));

    siblings.forEach((node) => {
      node.inert = true;
      node.setAttribute("aria-hidden", "true");
    });

    const focusableSelector = [
      "button:not([disabled])",
      "a[href]",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");
    const focusables = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
      ).filter((node) => !node.hidden && node.getClientRects().length > 0);

    requestAnimationFrame(() => {
      (focusables()[0] ?? dialog)?.focus();
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previousState.forEach(({ node, inert, ariaHidden }) => {
        node.inert = inert;
        if (ariaHidden === null) node.removeAttribute("aria-hidden");
        else node.setAttribute("aria-hidden", ariaHidden);
      });
      if (
        openerRef.current?.isConnected &&
        openerRef.current !== document.body
      ) {
        openerRef.current.focus();
      } else {
        document.getElementById("gg-account-trigger")?.focus();
      }
    };
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <div
      className={cx("gg-backdrop", closing && "is-closing")}
      onClick={onClose}
    >
      <div
        className={cx("gg-dialog", closing && "is-closing")}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={dialogRef}
        tabIndex={-1}
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
