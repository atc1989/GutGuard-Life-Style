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
        <Button variant="secondary" onClick={action.onClick}>
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
      {number ? (
        <em style={{ fontFamily: "var(--gg-serif)", marginRight: 8 }}>
          {number}
        </em>
      ) : null}
      {children}
    </p>
  );
}
