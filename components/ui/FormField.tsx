import { cx } from "@/lib/cx";
import type { InputHTMLAttributes, ReactNode, Ref } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  variant?: "boxed" | "ruled";
  hint?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

export function FormField({
  label,
  error,
  variant = "boxed",
  hint,
  id,
  className,
  ref,
  ...props
}: Props) {
  const fieldId = id ?? props.name;
  const invalid = Boolean(error);
  const describedBy =
    [hint ? `${fieldId}-hint` : null, error ? `${fieldId}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  const hintNode = hint ? (
    <p className="gg-help" id={`${fieldId}-hint`}>
      {hint}
    </p>
  ) : null;
  const errorNode = error ? (
    <p className="gg-field__error" id={`${fieldId}-error`}>
      {error}
    </p>
  ) : null;

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
          ref={ref}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
        />
        {hintNode}
        {errorNode}
      </div>
    );
  }

  return (
    <label className={cx("gg-field", className)} htmlFor={fieldId}>
      <span className="gg-field__label">{label}</span>
      <input
        id={fieldId}
        className={cx(
          "gg-field__control",
          props["aria-label"] ? undefined : "gg-field__control--lg",
        )}
        {...props}
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
      />
      {hintNode}
      {errorNode}
    </label>
  );
}
