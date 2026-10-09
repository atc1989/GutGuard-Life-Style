"use client";

import { QrCode } from "lucide-react";
import { MemberCard } from "@/components/lifestyle/MemberCard";

const RANK = "Lifestyle member";

/**
 * UI Library section `MemberGreeting`: greeting `h1`, today's date, then the
 * member's card — a compact card row + E-Points tile on phones, the full
 * MemberCard (flips to the QR) from 900px.
 */
export function MemberGreeting({
  name,
  cardNo,
  points,
  onShowCard,
}: {
  name: string;
  cardNo: string;
  points: number;
  onShowCard: () => void;
}) {
  const first = name.trim().split(/\s+/)[0] ?? "";
  const today = new Date().toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="gg-greet" aria-labelledby="gg-greet-title">
      <h1 className="gg-greet__title" id="gg-greet-title">
        Kumusta{first ? `, ${first}` : ""}.
      </h1>
      <p className="gg-greet__sub" suppressHydrationWarning>
        {today}
      </p>

      <div className="gg-greet__compact">
        <button
          type="button"
          className="gg-greet__card gg-tap"
          aria-label="Show my Lifestyle card and QR"
          onClick={onShowCard}
        >
          <span className="gg-greet__thumb" aria-hidden>
            <QrCode />
          </span>
          <span className="gg-greet__who">
            <strong>{name}</strong>
            <span>{RANK}</span>
          </span>
          <span className="gg-action-text" aria-hidden>
            Card ›
          </span>
        </button>
        <a className="gg-greet__points gg-tap" href="#rewards" aria-label={`${points} E-Points`}>
          <b>{points.toLocaleString()}</b>
          <span>E-Points</span>
        </a>
      </div>

      <div className="gg-greet__full">
        <MemberCard
          rank={RANK}
          name={name}
          number={cardNo || undefined}
          points={points.toLocaleString()}
          qr={cardNo || undefined}
          qrCaption="Show this to staff at the door"
          corner={cardNo ? undefined : "Card not ready"}
        />
        <p className="gg-greet__hint">
          {cardNo ? "Tap the card to show your QR at the door." : "Your card number shows here once it is minted."}
        </p>
      </div>
    </section>
  );
}
