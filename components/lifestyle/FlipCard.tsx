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
      aria-pressed={flipped}
    >
      <span className="gg-vh">
        {flipped ? "Showing the staff QR side" : "Showing the name side"}
      </span>
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
    <div
      className={cx(
        "gg-card gg-card--ceremonial gg-card-face",
        claimed && "is-claimed",
      )}
    >
      <p className="gg-eyebrow">
        {claimed ? "Lifestyle member" : "Show this at the door"}
      </p>
      <h2 className="gg-heading gg-card-face__name">{name}</h2>
      <p className="gg-lede gg-card-face__brand">Gutguard Lifestyle</p>
      {children}
    </div>
  );
}

export function CardBack({ seed, cardNo }: { seed: string; cardNo: string }) {
  return (
    <div className="gg-card gg-card-face gg-card-face--back">
      <p className="gg-eyebrow">Ipakita ito sa staff</p>
      <h2 className="gg-heading gg-card-face__back-title">Scan at the door</h2>
      <QRBlock seed={seed} />
      <p className="gg-card-no">{cardNo}</p>
    </div>
  );
}
