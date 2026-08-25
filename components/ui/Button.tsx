import { cx } from "@/lib/cx";
import { Spinner } from "@/components/ui/Spinner";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "editorial"
  | "commerce"
  | "pill"
  | "ghost"
  | "signout";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  block?: boolean;
  loading?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  block,
  loading,
  className,
  type = "button",
  disabled,
  children,
  ...props
}: Props) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(
        "gg-button",
        `gg-button--${variant}`,
        block && "gg-button--block",
        loading && "gg-button--loading",
        className,
      )}
      {...props}
    >
      {loading ? <Spinner label="Working" /> : null}
      {children}
    </button>
  );
}
