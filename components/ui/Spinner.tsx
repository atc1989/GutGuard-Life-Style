import { cx } from "@/lib/cx";

export function Spinner({
  label = "Loading",
  block,
}: {
  label?: string;
  block?: boolean;
}) {
  return (
    <span
      className={cx("gg-spinner", block && "gg-spinner--block")}
      role="status"
      aria-label={label}
    />
  );
}
