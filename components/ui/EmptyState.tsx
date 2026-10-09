import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

/**
 * Empty State. Default is the quiet bordered panel; `soon` is the UI Library
 * dashed box with an outline badge for a section that is not open yet.
 */
export function EmptyState({
  title,
  copy,
  badge,
  variant = "panel",
  action,
}: {
  title: string;
  copy: string;
  badge?: ReactNode;
  variant?: "panel" | "soon";
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className={variant === "soon" ? "gg-empty gg-empty--soon" : "gg-empty"}>
      {badge ? <Badge>{badge}</Badge> : null}
      <strong>{title}</strong>
      <p>{copy}</p>
      {action ? (
        <Button variant="outline" onClick={action.onClick}>
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
