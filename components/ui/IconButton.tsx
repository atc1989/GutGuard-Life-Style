import { cx } from "@/lib/cx";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  ghost?: boolean;
  children: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  function IconButton(
    { label, ghost, className, children, type = "button", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        aria-label={label}
        className={cx("gg-icon-btn", ghost && "gg-icon-btn--ghost", className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);
