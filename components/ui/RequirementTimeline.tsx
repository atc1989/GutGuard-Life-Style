import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cx } from "@/lib/cx";

export function RequirementTimeline({
  steps,
}: {
  steps: Array<{
    title: string;
    when: string;
    detail: string;
    done: boolean;
    onToggle?: () => void;
  }>;
}) {
  return (
    <div className="gg-stack">
      {steps.map((step) => (
        <div key={step.title} className="gg-req">
          <div>
            <div className={cx("gg-req__node", step.done && "is-done")} />
          </div>
          <Card
            title={step.title}
            aside={<Badge tone="status" active={step.done}>{step.done ? "Done" : step.when}</Badge>}
          >
            <p className="gg-help">{step.detail}</p>
            {step.onToggle ? (
              <Button variant="outline" size="sm" onClick={step.onToggle}>
                {step.done ? "Mark open" : "Mark done"}
              </Button>
            ) : null}
          </Card>
        </div>
      ))}
    </div>
  );
}

export function EventRow({
  title,
  place,
  when,
  onBook,
}: {
  title: string;
  place: string;
  when: string;
  onBook?: () => void;
}) {
  const day = when.split(" ")[0];
  return (
    <div className="gg-event">
      <div className="gg-event__date">
        <small>{day}</small>
        <strong>{when.match(/\d+/)?.[0] ?? "—"}</strong>
      </div>
      <div className="gg-event__main">
        <strong>{title}</strong>
        <p className="gg-help">
          {place} · {when}
        </p>
      </div>
      {onBook ? (
        <Button variant="outline" size="sm" onClick={onBook}>
          Book this
        </Button>
      ) : null}
    </div>
  );
}
