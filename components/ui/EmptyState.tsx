import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="gg-empty">
      <strong>{title}</strong>
      <p>{copy}</p>
      {action ? (
        <Button
          variant="secondary"
          onClick={action.onClick}
          style={{ marginTop: 12 }}
        >
          {action.label}
        </Button>
      ) : null}
    </div>
  );
}

export function SectionLabel({
  number,
  children,
}: {
  number?: string;
  children: ReactNode;
}) {
  return (
    <p className="gg-eyebrow">
      {number ? <em className="gg-section-num">{number}</em> : null}
      {children}
    </p>
  );
}
