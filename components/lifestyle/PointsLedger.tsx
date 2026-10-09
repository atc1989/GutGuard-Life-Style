import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ListRow } from "@/components/lifestyle/ListRow";
import { FIRST_ORDER_PESOS, type LedgerEntry } from "@/lib/mock/seed";
import { firstOrderEarned } from "@/lib/points";

/** E-Points toward the first order: a Library panel, then static ListRows. */
export function PointsLedger({
  id,
  points,
  pending,
  banked,
  ledger,
}: {
  id?: string;
  points: number;
  pending: number;
  banked: number;
  ledger: LedgerEntry[];
}) {
  const earned = firstOrderEarned(points, banked);
  return (
    <div className="gg-stack gg-stack--tight" id={id}>
      <Card
        title="Lifestyle rewards"
        aside={<Badge tone="status">{points} pts</Badge>}
      >
        <p className="gg-card__figure">
          ₱{earned.toLocaleString()}
          <small> of ₱{FIRST_ORDER_PESOS.toLocaleString()} first order</small>
        </p>
        <ProgressBar
          value={earned}
          max={FIRST_ORDER_PESOS}
          label="Points toward first order"
        />
        <p className="gg-help gg-card__foot">
          {points} points · {pending} pending · {banked} banked
        </p>
      </Card>
      {ledger.map((entry) => (
        <ListRow
          key={entry.id}
          as="div"
          title={entry.label}
          description={entry.pending ? "Waiting for an event" : "Yours"}
          trailing={
            <Badge active={!entry.pending}>
              {entry.pending ? "+" : ""}
              {entry.amount} pts
            </Badge>
          }
        />
      ))}
    </div>
  );
}
