import { cx } from "@/lib/cx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "editorial"
  | "commerce"
  | "pill"
  | "ghost";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  block,
  className,
  type = "button",
  children,
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cx(
        "gg-button",
        `gg-button--${variant}`,
        block && "gg-button--block",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
