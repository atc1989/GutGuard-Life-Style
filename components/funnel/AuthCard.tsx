import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./AuthLayout.module.css";

/**
 * The one elevated surface behind every auth state — sign up, sign in, and the
 * confirmation code. Presentational only: it never adds a nested form.
 */
export function AuthCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cx(styles.card, className)}>{children}</div>;
}
