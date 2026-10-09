import { cx } from "@/lib/cx";

/**
 * UI Library `StepProgress`: one 4px bar per step with a numbered label.
 * Steps up to and including the current one are blue.
 */
export function StepProgress({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <ol
      className={cx("gg-steps", className)}
      aria-label={`Step ${current} of ${steps.length}`}
    >
      {steps.map((step, index) => {
        const n = index + 1;
        return (
          <li
            key={step}
            className={cx("gg-steps__item", n <= current && "is-on")}
            aria-current={n === current ? "step" : undefined}
          >
            {n} · {step}
          </li>
        );
      })}
    </ol>
  );
}
