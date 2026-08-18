import { cx } from "@/lib/cx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  ghost?: boolean;
  children: ReactNode;
};

export function IconButton({
  label,
  ghost,
  className,
  children,
  type = "button",
  ...props
}: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx("gg-icon-btn", ghost && "gg-icon-btn--ghost", className)}
      {...props}
    >
      {children}
    </button>
  );
}
