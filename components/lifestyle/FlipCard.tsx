"use client";

import { QRBlock } from "@/components/ui/QRBlock";
import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

export function FlipCard({
  flipped,
  onFlip,
  front,
  back,
}: {
  flipped: boolean;
  onFlip: () => void;
  front: ReactNode;
  back: ReactNode;
}) {
  return (
    <button
      type="button"
      className={cx("gg-flip", flipped && "is-back")}
      onClick={onFlip}
      aria-label="Tap to flip member card"
      aria-pressed={flipped}
    >
      <div className="gg-flip__inner">
        <div className="gg-flip__face">{front}</div>
        <div className="gg-flip__face gg-flip__face--back">{back}</div>
      </div>
    </button>
  );
}

/**
 * Front and back both fill the shared `--gg-card-ratio` plane set by
 * `.gg-flip__inner` — no face sets its own height.
 */
export function CardFace({
  name,
  claimed,
  children,
}: {
  name: string;
  claimed?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="gg-card gg-card--ceremonial gg-doorcard">
      <p className="gg-eyebrow" style={{ color: "var(--gg-gold-soft)" }}>
        {claimed ? "Already yours" : "Show this at the door"}
      </p>
      <h2 className="gg-doorcard__name">{name}</h2>
      <div>
        <p className="gg-doorcard__sub">Gutguard Lifestyle</p>
        {children}
      </div>
    </div>
  );
}

export function CardBack({ seed, cardNo }: { seed: string; cardNo: string }) {
  return (
    <div className="gg-card gg-doorcard gg-doorcard--back">
      <p className="gg-eyebrow">Ipakita ito sa staff</p>
      <div className="gg-doorcard__scan">
        <QRBlock seed={seed} />
        <div>
          <p className="gg-doorcard__sub" style={{ color: "var(--gg-ink)" }}>
            Scan at the door
          </p>
          <p className="gg-help gg-doorcard__cardno">{cardNo}</p>
        </div>
      </div>
    </div>
  );
}
