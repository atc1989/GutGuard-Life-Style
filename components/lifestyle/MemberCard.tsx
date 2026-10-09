"use client";

import { ChevronRight, QrCode } from "lucide-react";
import { useState, type ReactNode } from "react";
import { QRBlock } from "@/components/ui/QRBlock";
import { cx } from "@/lib/cx";

/**
 * UI Library `MemberCard`. The full card flips to its QR when `qr` is set:
 * a mouse click anywhere flips it, keyboard users get real buttons (the small
 * QR on the front, the whole back face). The hidden face is `inert`.
 * `placeholder` dims the name and number for the landing preview; `mini` is
 * the small card with a points line.
 */
type Props = {
  variant?: "full" | "mini";
  rank?: string;
  name: string;
  number?: string;
  points?: ReactNode;
  qr?: string;
  qrCaption?: string;
  corner?: ReactNode;
  placeholder?: boolean;
  onPointsClick?: () => void;
  /** Controlled flip; omit to let the card hold its own state. */
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  className?: string;
};

function Watermark() {
  return (
    <svg className="gg-mcard__mark" viewBox="0 0 200 200" aria-hidden>
      <circle cx="120" cy="96" r="62" />
      <circle cx="120" cy="96" r="30" />
      <circle cx="58" cy="44" r="16" />
    </svg>
  );
}

function Logo() {
  return (
    <span className="gg-mcard__logo" aria-hidden>
      Gutguard<em>Lifestyle</em>
    </span>
  );
}

export function MemberCard({
  variant = "full",
  rank,
  name,
  number,
  points,
  qr,
  qrCaption = "Show this at the door",
  corner,
  placeholder,
  onPointsClick,
  flipped: controlled,
  onFlip,
  className,
}: Props) {
  const [own, setOwn] = useState(false);
  const flipped = Boolean(qr) && (controlled ?? own);

  function flip(next: boolean) {
    if (!qr) return;
    if (controlled === undefined) setOwn(next);
    onFlip?.(next);
  }

  if (variant === "mini") {
    return (
      <div className={cx("gg-mcard gg-mcard--mini", className)}>
        <Watermark />
        {rank ? <span className="gg-mcard__rank">{rank}</span> : null}
        <strong className="gg-mcard__name">{name}</strong>
        {points !== undefined ? (
          <span className="gg-mcard__mini-points">
            <b>{points}</b> E-Points
          </span>
        ) : null}
      </div>
    );
  }

  const pointsBody =
    points !== undefined ? (
      <>
        <b className="gg-mcard__points-value">{points}</b>
        <span className="gg-mcard__points-label">
          E-Points
          {onPointsClick ? <ChevronRight aria-hidden /> : null}
        </span>
      </>
    ) : null;

  return (
    <div
      className={cx(
        "gg-mcard",
        flipped && "is-flipped",
        placeholder && "gg-mcard--placeholder",
        qr && "gg-mcard--flips",
        className,
      )}
      onClick={qr ? () => flip(!flipped) : undefined}
    >
      <div className="gg-mcard__inner">
        <div className="gg-mcard__face gg-mcard__front" inert={flipped}>
          <Watermark />
          <div className="gg-mcard__top">
            <Logo />
            {rank ? <span className="gg-mcard__rank">{rank}</span> : null}
          </div>
          <div className="gg-mcard__id">
            <strong className="gg-mcard__name">{name}</strong>
            {number ? <span className="gg-mcard__number">{number}</span> : null}
          </div>
          <div className="gg-mcard__foot">
            {pointsBody ? (
              onPointsClick ? (
                <button
                  type="button"
                  className="gg-mcard__points"
                  aria-label={`${points} E-Points`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onPointsClick();
                  }}
                >
                  {pointsBody}
                </button>
              ) : (
                <span className="gg-mcard__points">{pointsBody}</span>
              )
            ) : (
              <span />
            )}
            {qr ? (
              <button
                type="button"
                className="gg-mcard__qr-btn"
                aria-label="Show my QR code"
                onClick={(event) => {
                  event.stopPropagation();
                  flip(true);
                }}
              >
                <span className="gg-mcard__qr-mini" aria-hidden>
                  <QrCode />
                </span>
                <span className="gg-mcard__corner">Tap to show</span>
              </button>
            ) : corner ? (
              <span className="gg-mcard__corner">{corner}</span>
            ) : null}
          </div>
        </div>
        {qr ? (
          <button
            type="button"
            className="gg-mcard__face gg-mcard__back"
            inert={!flipped}
            aria-label="Show the front of my card"
            onClick={(event) => {
              event.stopPropagation();
              flip(false);
            }}
          >
            <span className="gg-mcard__scan" role="img" aria-label="Member QR code">
              <QRBlock seed={qr} />
            </span>
            <span className="gg-mcard__scan-copy">
              <span className="gg-mcard__scan-caption">{qrCaption}</span>
              {number ? <span className="gg-mcard__number">{number}</span> : null}
            </span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
