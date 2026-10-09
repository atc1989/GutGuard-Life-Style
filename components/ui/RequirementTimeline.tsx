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
          <Card>
            <Badge active={step.done}>{step.done ? "Done" : step.when}</Badge>
            <h3 className="gg-heading" style={{ fontSize: 24, marginTop: 8 }}>
              {step.title}
            </h3>
            <p className="gg-help" style={{ marginTop: 6 }}>
              {step.detail}
            </p>
            {step.onToggle ? (
              <Button
                variant="secondary"
                onClick={step.onToggle}
                style={{ marginTop: 12 }}
              >
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
        <strong style={{ fontSize: 22 }}>{when.match(/\d+/)?.[0] ?? "—"}</strong>
      </div>
      <div style={{ flex: 1 }}>
        <strong>{title}</strong>
        <p className="gg-help">
          {place} · {when}
        </p>
      </div>
      {onBook ? (
        <Button variant="secondary" onClick={onBook}>
          Book this
        </Button>
      ) : null}
    </div>
  );
}
