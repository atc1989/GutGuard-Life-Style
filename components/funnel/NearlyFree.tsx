"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { Badge } from "@/components/ui/Badge";
import {
  FIRST_ORDER_PESOS,
  PESO_PER_POINT,
  POINTS,
} from "@/lib/mock/seed";
import { useSession } from "@/lib/session";

export function NearlyFree() {
  const { session, setPhase } = useSession();
  const router = useRouter();
  const earned = Math.min(session.points * PESO_PER_POINT + session.banked, FIRST_ORDER_PESOS);
  const pct = earned / FIRST_ORDER_PESOS;

  return (
    <main className="gg-funnel">
      <section className="gg-split">
        <div>
          <p className="gg-eyebrow">Nearly free</p>
          <h1 className="gg-display" style={{ marginTop: 10 }}>
            Most of your first order is <em>already paid</em>.
          </h1>
          <Card style={{ marginTop: 28 }}>
            <p className="gg-eyebrow">Lifestyle rewards</p>
            <p className="gg-heading" style={{ fontSize: 48, margin: "8px 0" }}>
              ₱{earned.toLocaleString()}
            </p>
            <p className="gg-help">of ₱{FIRST_ORDER_PESOS.toLocaleString()} first order</p>
            <ProgressRail value={pct * 100} label="Points toward first order" />
            <p className="gg-help" style={{ marginTop: 10 }}>
              {session.points} points · {session.pending} pending · {session.banked} banked
            </p>
          </Card>
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
