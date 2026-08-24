"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { markWelcomeSeen } from "@/lib/actions/welcome";

export function WelcomeOverlay({ initialSeen }: { initialSeen: boolean }) {
  const [seen, setSeen] = useState(initialSeen);
  const continueRef = useRef<HTMLButtonElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const copyId = useId();

  const dismiss = useCallback(() => {
    setSeen(true);
    void markWelcomeSeen();
  }, []);

  useEffect(() => {
    if (seen) return;
    document.body.classList.add("gg-welcome-open");
    continueRef.current?.focus();
    return () => document.body.classList.remove("gg-welcome-open");
  }, [seen]);

  useEffect(() => {
    if (seen) return;

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab") return;
      const nodes = [continueRef.current, skipRef.current].filter(
        (node): node is HTMLButtonElement => Boolean(node),
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [seen, dismiss]);

  if (seen) return null;

  return (
    <div
      className="gg-welcome"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={copyId}
    >
      <div className="gg-welcome__panel">
        <p className="gg-eyebrow">Welcome</p>
        <h2 id={titleId} className="gg-display">
          Ginhawa starts <em>here</em>
        </h2>
        <p id={copyId} className="gg-lede">
          A card, an invitation, and points that pay for your own first order.
          Nothing to pay to begin.
        </p>
        <div className="gg-welcome__actions">
          <Button ref={continueRef} variant="pill" onClick={dismiss}>
            Tap to continue
          </Button>
          <Button ref={skipRef} variant="ghost" onClick={dismiss}>
            Skip for now
          </Button>
        </div>
      </div>
    </div>
  );
}
