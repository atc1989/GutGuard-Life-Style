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
  const describedBy = [
    error ? `${fieldId}-error` : null,
    hint ? `${fieldId}-hint` : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  if (variant === "ruled") {
    return (
      <div className={cx("gg-ruled-field", invalid && "has-error", className)}>
        <label className="gg-ruled-field__label" htmlFor={fieldId}>
          {label}
        </label>
        <input
          id={fieldId}
          className="gg-ruled-field__control"
          {...props}
          aria-invalid={invalid}
          aria-describedby={describedBy}
        />
        {error ? (
          <p className="gg-field__error" id={`${fieldId}-error`}>
            {error}
          </p>
        ) : hint ? (
          <p className="gg-help" id={`${fieldId}-hint`}>
            {hint}
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
        {...props}
        aria-invalid={invalid}
        aria-describedby={describedBy}
      />
      {error ? (
        <span className="gg-field__error" id={`${fieldId}-error`}>
          {error}
        </span>
      ) : hint ? (
        <span className="gg-help" id={`${fieldId}-hint`}>
          {hint}
        </span>
      ) : null}
    </label>
  );
}
