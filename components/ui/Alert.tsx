import { cx } from "@/lib/cx";
import type { ReactNode } from "react";

export function Alert({
  tone = "info",
  children,
  className,
}: {
  tone?: "info" | "error" | "care" | "note";
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "gg-alert",
        tone === "error" && "gg-alert--error",
        tone === "care" && "gg-alert--care",
        tone === "note" && "gg-alert--note",
        className,
      )}
      role={tone === "error" || tone === "care" ? "alert" : "status"}
      aria-live="polite"
    >
      {children}
    </div>
  );
}
