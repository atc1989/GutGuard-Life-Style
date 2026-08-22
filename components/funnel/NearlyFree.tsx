"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PointsLedger } from "@/components/lifestyle/PointsLedger";
import { POINTS } from "@/lib/mock/seed";
import { useSession } from "@/lib/session";

export function NearlyFree() {
  const { session, setPhase } = useSession();
  const router = useRouter();

  return (
    <main className="gg-funnel">
      <section className="gg-split">
        <div>
          <p className="gg-eyebrow">Nearly free</p>
          <h1 className="gg-display" style={{ marginTop: 10 }}>
            Most of your first order is <em>already paid</em>.
          </h1>
          <div style={{ marginTop: 28 }}>
            <PointsLedger
              points={session.points}
              pending={session.pending}
              banked={session.banked}
              ledger={session.ledger}
            />
          </div>
          <Card style={{ marginTop: 18 }}>
            <p className="gg-eyebrow">Two ways to earn</p>
            <p style={{ marginTop: 8 }}>
              Register +{POINTS.register}. First attend +{POINTS.firstAttend}. Repeat +{POINTS.repeatAttend}.
              Points are not cash. They only pay for your own first order.
            </p>
          </Card>
          <Button
            variant="commerce"
            style={{ marginTop: 22 }}
            onClick={() => {
              setPhase("member");
              router.push("/app/health");
            }}
          >
            Start my Lifestyle Protocol
          </Button>
        </div>
        <div className="gg-stack">
          <p className="gg-eyebrow">Your invites</p>
          {session.invites.map((invite) => (
            <Card key={invite.name}>
              <div className="gg-row">
                <strong>{invite.name}</strong>
                <Badge active={invite.stage !== "registered"}>{invite.stage}</Badge>
              </div>
              <p className="gg-help" style={{ marginTop: 6 }}>
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
