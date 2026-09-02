"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { CardBack, CardFace, FlipCard } from "@/components/lifestyle/FlipCard";
import { Confetti } from "@/components/lifestyle/Confetti";
import { claimCard as persistClaimCard } from "@/lib/actions/member";
import { useSession } from "@/lib/session";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { useToast } from "@/lib/toast";

export function DoorCard({
  memberName,
  cardNo,
}: {
  memberName?: string;
  cardNo?: string;
}) {
  const { session, setPhase, update } = useSession();
  const params = useSearchParams();
  const claimed = params.get("claimed") === "1" || session.claimed;
  const [flipped, setFlipped] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { push } = useToast();
  const name = memberName?.trim() || session.name;
  const doorCardNo = cardNo?.trim() || session.cardNo;

  async function claimCard() {
    if (isSupabaseConfigured()) {
      const result = await persistClaimCard();
      if (!result.ok) {
        push({ tone: "error", title: "Could not claim", body: result.error });
        return false;
      }
    }
    update({ claimed: true });
    return true;
  }

  return (
    <main className="gg-funnel">
      <Confetti fire={claimed} />
      <section className="gg-split gg-split--card">
        <FlipCard
          flipped={flipped}
          onFlip={() => setFlipped((value) => !value)}
          front={
            <CardFace name={name} claimed={claimed}>
              <p className="gg-help gg-card-hint">
                Tap to flip · Ipakita ito sa pintuan
              </p>
            </CardFace>
          }
          back={<CardBack seed={doorCardNo} cardNo={doorCardNo} />}
        />
        <div>
          <p className="gg-eyebrow">{claimed ? "Already yours" : "Before the door"}</p>
          <h1 className="gg-heading gg-funnel-title">
            {claimed ? "Sa iyo na ’yan." : "Show this at the door"}
          </h1>
          <p className="gg-lede gg-funnel-lede">
            {claimed
              ? "It becomes your Lifestyle Member card at the door and in the centers."
              : "Staff scan the back. Your name is already on the front."}
          </p>
          <div className="gg-stack">
            <Button
              variant="editorial"
              block
              loading={busy}
              onClick={() => {
                void (async () => {
                  setBusy(true);
                  const ok = await claimCard();
                  setBusy(false);
                  if (!ok) return;
                  setPhase("member");
                  router.push("/app/health");
                })();
              }}
            >
              Go to my dashboard
            </Button>
            <Button
              variant="secondary"
              block
              loading={busy}
              onClick={() => {
                void (async () => {
                  setBusy(true);
                  const ok = await claimCard();
                  setBusy(false);
                  if (!ok) return;
                  setPhase("nearly");
                  router.push("/nearly");
                })();
              }}
            >
              How points work
            </Button>
            <SignOutButton />
          </div>
        </div>
      </section>
    </main>
  );
}
