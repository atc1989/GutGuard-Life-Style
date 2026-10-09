import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { FIRST_ORDER_PESOS, type LedgerEntry } from "@/lib/mock/seed";
import { firstOrderEarned } from "@/lib/points";

export function PointsLedger({
  points,
  pending,
  banked,
  ledger,
}: {
  points: number;
  pending: number;
  banked: number;
  ledger: LedgerEntry[];
}) {
  const earned = firstOrderEarned(points, banked);
  return (
    <div className="gg-stack">
      <Card>
        <p className="gg-eyebrow">Lifestyle rewards</p>
        <p className="gg-heading" style={{ fontSize: 40, margin: "8px 0" }}>
          ₱{earned.toLocaleString()}
        </p>
        <p className="gg-help">of ₱{FIRST_ORDER_PESOS.toLocaleString()} first order</p>
        <ProgressRail
          value={(earned / FIRST_ORDER_PESOS) * 100}
          label="Points toward first order"
        />
        <p className="gg-help" style={{ marginTop: 10 }}>
          {points} points · {pending} pending · {banked} banked
        </p>
      </Card>
      {ledger.map((entry) => (
        <Card key={entry.id}>
          <div className="gg-row">
            <div>
              <strong>{entry.label}</strong>
              <p className="gg-help">
                {entry.pending ? "Waiting for an event" : "Yours"}
              </p>
            </div>
            <Badge active={!entry.pending}>
              {entry.pending ? "+" : ""}
              {entry.amount} pts
            </Badge>
          </div>
        </Card>
      ))}
    </div>
  );
}
