import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

export function Alert({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: ReactNode;
}) {
  return (
    <div
      className={cx("gg-alert", tone === "error" && "gg-alert--error")}
      role="status"
    >
      {children}
    </div>
  );
}
