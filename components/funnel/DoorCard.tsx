"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AuthPanel, FunnelPage } from "@/components/funnel/AuthPanel";
import { FunnelTopBar } from "@/components/funnel/FunnelTopBar";
import { Confetti } from "@/components/lifestyle/Confetti";
import { MemberCard } from "@/components/lifestyle/MemberCard";
import { StepProgress } from "@/components/lifestyle/StepProgress";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/ui/SignOutButton";
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
    <>
      <FunnelTopBar signIn={false} />
      <FunnelPage>
        <Confetti fire={claimed} />
        {!claimed ? <StepProgress steps={["Card", "Code", "Start"]} current={3} /> : null}
        <AuthPanel
          sticky="card"
          intro={claimed ? "Already yours" : "Before the door"}
          card={
            <>
              <MemberCard
                rank="Lifestyle member"
                name={name || "Member"}
                number={doorCardNo || undefined}
                qr={doorCardNo || undefined}
                qrCaption="Ipakita ito sa staff · Scan at the door"
                flipped={flipped}
                onFlip={setFlipped}
              />
              <p className="gg-greet__hint">Tap to flip · Ipakita ito sa pintuan</p>
            </>
          }
        >
          <div className="gg-auth-single gg-auth-single--left">
            <h1 className="gg-auth-single__title">
              {claimed ? "Sa iyo na ’yan." : "Show this at the door"}
            </h1>
            <p className="gg-auth-single__lede">
              {claimed
                ? "It becomes your Lifestyle Member card at the door and in the centers."
                : "Staff scan the back. Your name is already on the front."}
            </p>
          </div>
          <div className="gg-stack gg-stack--tight">
            <Button
              size="lg"
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
              variant="outline"
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
        </AuthPanel>
      </FunnelPage>
    </>
  );
}
