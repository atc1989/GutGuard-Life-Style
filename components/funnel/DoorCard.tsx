"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardBack, CardFace, FlipCard } from "@/components/lifestyle/FlipCard";
import { Confetti } from "@/components/lifestyle/Confetti";
import { useSession } from "@/lib/session";

export function DoorCard() {
  const { session, setPhase, update } = useSession();
  const params = useSearchParams();
  const claimed = params.get("claimed") === "1" || session.claimed;
  const [flipped, setFlipped] = useState(false);
  const router = useRouter();

  return (
    <main className="gg-funnel">
      <Confetti fire={claimed} />
      <section className="gg-split gg-split--card">
        <FlipCard
          flipped={flipped}
          onFlip={() => setFlipped((value) => !value)}
          front={
            <CardFace name={session.name} claimed={claimed}>
              <p className="gg-help" style={{ color: "var(--gg-gold-soft)", marginTop: 24 }}>
                Click to flip · Ipakita ito sa pintuan
              </p>
            </CardFace>
          }
          back={<CardBack seed={session.cardNo} cardNo={session.cardNo} />}
        />
        <div>
          <p className="gg-eyebrow">{claimed ? "Already yours" : "Before the door"}</p>
          <h1 className="gg-heading" style={{ margin: "10px 0 16px" }}>
            {claimed ? "Sa iyo na ’yan." : "Show this at the door"}
          </h1>
          <p className="gg-lede" style={{ marginBottom: 24 }}>
            {claimed
              ? "It becomes your Lifestyle Member card at the door and in the centers."
              : "Staff scan the back. Your name is already on the front."}
          </p>
          {!claimed ? (
            <Button
              variant="commerce"
              onClick={() => {
                update({ claimed: true });
                setPhase("claimed");
                router.push("/card?claimed=1");
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="commerce"
              onClick={() => {
                setPhase("nearly");
                router.push("/nearly");
              }}
            >
              See how you earned these ›
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}
