import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

export function Badge({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <span className={cx("gg-badge", active && "gg-badge--active")}>
      {children}
    </span>
  );
}
