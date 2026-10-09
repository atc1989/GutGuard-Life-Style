"use client";

import { useRouter } from "next/navigation";
import { FunnelPage } from "@/components/funnel/AuthPanel";
import { FunnelTopBar } from "@/components/funnel/FunnelTopBar";
import { PersonRow } from "@/components/lifestyle/PersonRow";
import { PointsLedger } from "@/components/lifestyle/PointsLedger";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SignOutButton } from "@/components/ui/SignOutButton";
import { POINTS } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";

export function NearlyFree() {
  const { session, setPhase } = useSession();
  const router = useRouter();
  const empty = session.invites.length === 0;

  return (
    <>
      <FunnelTopBar signIn={false} />
      <FunnelPage>
        <div className="gg-cols">
          <div className="gg-col">
            <header className="gg-page-head">
              <Eyebrow>Nearly free</Eyebrow>
              <h1 className="gg-page-head__title gg-page-head__title--display">
                {empty ? (
                  <>Points pay for your own first order.</>
                ) : (
                  <>
                    Most of your first order is <em>already paid</em>.
                  </>
                )}
              </h1>
            </header>
            <PointsLedger
              points={session.points}
              pending={session.pending}
              banked={session.banked}
              ledger={session.ledger}
            />
            <Card eyebrow="Two ways to earn">
              <p className="gg-card__body">
              Register +{POINTS.register}. First attend +{POINTS.firstAttend}. Repeat +
              {POINTS.repeatAttend}. Points are not cash. They only pay for your own first
              order.
              </p>
            </Card>
          </div>

          <div className="gg-col">
            <section className="gg-stack gg-stack--tight" aria-labelledby="gg-invites-title">
              <Eyebrow as="h2" id="gg-invites-title">
                Your invites
              </Eyebrow>
              {empty ? (
                <EmptyState
                  title="No invites yet"
                  copy="Come to Saturday’s event with Ate Marites. Invite one tao when you’re ready."
                />
              ) : (
                session.invites.map((invite) => (
                  <PersonRow
                    key={invite.name}
                    variant="team"
                    initialsFrom={invite.name}
                    name={invite.name}
                    trailing={
                      <Badge active={invite.stage !== "registered"}>{invite.stage}</Badge>
                    }
                    description={
                      invite.stage === "registered"
                        ? `+${POINTS.register} points, waiting. They have to come to an event first.`
                        : invite.stage === "showed"
                          ? `+${POINTS.register + POINTS.firstAttend} points — yours.`
                          : "Bought. Points pay for your own first order."
                    }
                  />
                ))
              )}
            </section>
            <div className="gg-stack gg-stack--tight">
              <Button
                size="lg"
                onClick={() => {
                  setPhase("member");
                  router.push("/app/health");
                }}
              >
                Start my Lifestyle Protocol
              </Button>
              <Button
                variant="outline"
                block
                onClick={() => {
                  setPhase("claimed");
                  router.push("/card?claimed=1");
                }}
              >
                Back to my card
              </Button>
              <SignOutButton />
            </div>
          </div>
        </div>
      </FunnelPage>
    </>
  );
}
