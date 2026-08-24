"use client";

import { enterMemberHub } from "@/lib/actions/card";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PointsLedger } from "@/components/lifestyle/PointsLedger";
import { POINTS, type Invite, type LedgerEntry } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";
import { useFormStatus } from "react-dom";

function EnterHubButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="commerce" loading={pending}>
      Start my Lifestyle Protocol
    </Button>
  );
}

export function NearlyFree({
  points,
  pending,
  banked,
  ledger,
  invites,
}: {
  points?: number;
  pending?: number;
  banked?: number;
  ledger?: LedgerEntry[];
  invites?: Invite[];
}) {
  const { session } = useSession();
  const earnedPoints = points ?? session.points;
  const earnedPending = pending ?? session.pending;
  const earnedBanked = banked ?? session.banked;
  const rows = ledger ?? session.ledger;
  const inviteRows = invites ?? session.invites;

  return (
    <main className="gg-funnel gg-funnel--commerce">
      <section className="gg-split">
        <div>
          <p className="gg-eyebrow">Nearly free</p>
          <h1 className="gg-display gg-hero__title">
            Most of your first order is <em>already paid</em>.
          </h1>
          <div className="gg-nearly-ledger">
            <PointsLedger
              points={earnedPoints}
              pending={earnedPending}
              banked={earnedBanked}
              ledger={rows}
            />
          </div>
          <Card>
            <p className="gg-eyebrow">Two ways to earn</p>
            <p className="gg-nearly-copy">
              Register +{POINTS.register}. First attend +{POINTS.firstAttend}. Repeat +
              {POINTS.repeatAttend}. Points are not cash. They only pay for your own
              first Gutguard order.
            </p>
          </Card>
          <form className="gg-nearly-cta" action={enterMemberHub}>
            <EnterHubButton />
          </form>
        </div>
        <div className="gg-stack">
          <p className="gg-eyebrow">Your invites</p>
          {inviteRows.map((invite) => (
            <Card key={invite.name}>
              <div className="gg-row gg-invite-row">
                <strong>{invite.name}</strong>
                <Badge active={invite.stage !== "registered"}>{invite.stage}</Badge>
              </div>
              <p className="gg-help gg-invite-copy">
                {invite.stage === "registered"
                  ? `+${POINTS.register} points, waiting. They have to come to an event first.`
                  : invite.stage === "showed"
                    ? `+${POINTS.register + POINTS.firstAttend} points — yours.`
                    : "Bought. Points pay for your own first order."}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
