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
      aria-label="Flip member card"
    >
      <div className="gg-flip__inner">
        <div className="gg-flip__face">{front}</div>
        <div className="gg-flip__face gg-flip__face--back">{back}</div>
      </div>
    </button>
  );
}

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
    <div className="gg-card gg-card--ceremonial" style={{ minHeight: 420 }}>
      <p className="gg-eyebrow" style={{ color: "var(--gg-gold-soft)" }}>
        {claimed ? "Already yours" : "Show this at the door"}
      </p>
      <h2 className="gg-heading" style={{ color: "var(--gg-bone)", marginTop: 12 }}>
        {name}
      </h2>
      <p className="gg-lede" style={{ color: "var(--gg-bone)", opacity: 0.86, marginTop: 8 }}>
        Gutguard Lifestyle
      </p>
      {children}
    </div>
  );
}

export function CardBack({ seed, cardNo }: { seed: string; cardNo: string }) {
  return (
    <div className="gg-card" style={{ minHeight: 420, textAlign: "center" }}>
      <p className="gg-eyebrow">Ipakita ito sa staff</p>
      <h2 className="gg-heading" style={{ fontSize: 28, margin: "10px 0 16px" }}>
        Scan at the door
      </h2>
      <QRBlock seed={seed} />
      <p className="gg-help" style={{ marginTop: 14, fontFamily: "var(--gg-mono)" }}>
        {cardNo}
      </p>
    </div>
  );
}
