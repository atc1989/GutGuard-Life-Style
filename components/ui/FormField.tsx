import { cx } from "@/lib/cx";
import type { InputHTMLAttributes, ReactNode } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  variant?: "boxed" | "ruled";
  hint?: ReactNode;
};

export function FormField({
  label,
  error,
  variant = "boxed",
  hint,
  id,
  className,
  ...props
}: Props) {
  const fieldId = id ?? props.name;
  const invalid = Boolean(error);

  if (variant === "ruled") {
    return (
      <div className={cx("gg-ruled-field", invalid && "has-error", className)}>
        <label className="gg-ruled-field__label" htmlFor={fieldId}>
          {label}
        </label>
        <input
          id={fieldId}
          className="gg-ruled-field__control"
          aria-invalid={invalid}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        {error ? (
          <p className="gg-field__error" id={`${fieldId}-error`}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <label className={cx("gg-field", className)} htmlFor={fieldId}>
      <span className="gg-field__label">{label}</span>
      <input
        id={fieldId}
        className={cx("gg-field__control", props["aria-label"] ? undefined : "gg-field__control--lg")}
        aria-invalid={invalid}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        {...props}
      />
      {error ? (
        <span className="gg-field__error" id={`${fieldId}-error`}>
          {error}
        </span>
      ) : hint ? (
        <span className="gg-help">{hint}</span>
      ) : null}
    </label>
  );
}
