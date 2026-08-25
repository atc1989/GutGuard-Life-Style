"use client";

import { Button } from "@/components/ui/Button";
import { useSession } from "@/lib/session";

export function WelcomeOverlay() {
  const { session, ready, update } = useSession();
  if (!ready || session.welcomeSeen) return null;

  return (
    <div className="gg-welcome" role="dialog" aria-modal="true" aria-labelledby="gg-welcome-title">
      <div className="gg-welcome__panel">
        <p className="gg-eyebrow" style={{ color: "var(--gg-gold-soft)" }}>
          Welcome
        </p>
        <h2 id="gg-welcome-title" className="gg-display" style={{ color: "var(--gg-bone)", fontSize: "clamp(40px, 6vw, 64px)" }}>
          Ginhawa starts <em>here</em>
        </h2>
        <p className="gg-lede" style={{ color: "var(--gg-bone)", marginTop: 16 }}>
          A card, an invitation, and points that pay for your own first order. Nothing to pay to begin.
        </p>
        <Button
          variant="pill"
          style={{ marginTop: 28 }}
          onClick={() => update({ welcomeSeen: true })}
        >
          Tap to continue
        </Button>
      </div>
    </div>
  );
}
