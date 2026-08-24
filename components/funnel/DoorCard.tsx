"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { claimCard } from "@/lib/actions/card";
import { Button } from "@/components/ui/Button";
import { CardBack, CardFace, FlipCard } from "@/components/lifestyle/FlipCard";
import { Confetti } from "@/components/lifestyle/Confetti";
import { useSession } from "@/lib/session";

function ClaimButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="commerce" loading={pending}>
      Continue
    </Button>
  );
}

export function DoorCard({
  memberName,
  memberMobile,
  cardNo,
  claimed = false,
  claimFailed = false,
}: {
  memberName?: string;
  memberMobile?: string;
  cardNo: string;
  claimed?: boolean;
  claimFailed?: boolean;
}) {
  const { session, update } = useSession();
  const [flipped, setFlipped] = useState(false);
  const name = memberName?.trim() || session.name;
  const number = cardNo || session.cardNo;

  useEffect(() => {
    if (!memberName?.trim()) return;
    update({
      name: memberName.trim(),
      ...(memberMobile ? { mobile: memberMobile } : {}),
      cardNo: number,
      claimed,
      phase: claimed ? "claimed" : "invited",
    });
  }, [memberName, memberMobile, number, claimed, update]);

  return (
    <main className="gg-funnel gg-funnel--ceremonial">
      <Confetti fire={claimed} />
      <section className="gg-split gg-split--card">
        <FlipCard
          flipped={flipped}
          onFlip={() => setFlipped((value) => !value)}
          front={
            <CardFace name={name} claimed={claimed}>
              <p className="gg-help gg-card-face__hint">
                {flipped
                  ? "Front of card"
                  : "Flip for staff QR · Ipakita ito sa pintuan"}
              </p>
            </CardFace>
          }
          back={<CardBack seed={number} cardNo={number} />}
        />
        <div>
          <p className="gg-eyebrow">
            {claimed ? "Already yours" : "Before the door"}
          </p>
          <h1 className="gg-heading gg-door-copy">
            {claimed
              ? "This is your Lifestyle Member card."
              : "Show this at the door"}
          </h1>
          <p className="gg-lede gg-door-lede">
            {claimed
              ? "Keep it for the door and the centers. Points on this card pay for your own first Gutguard — they are not cash."
              : "Staff scan the back. Your name is already on the front."}
          </p>
          <div className="gg-door-actions">
            {!claimed ? (
              <form action={claimCard}>
                <ClaimButton />
              </form>
            ) : (
              <Link href="/nearly" className="gg-button gg-button--commerce">
                See how you earned these
              </Link>
            )}
          </div>
          <p className="gg-live" aria-live="polite">
            {claimed
              ? "Card claimed. This is now your Lifestyle Member card."
              : claimFailed
                ? "We could not claim this card. Please try again."
                : ""}
          </p>
        </div>
      </section>
    </main>
  );
}
