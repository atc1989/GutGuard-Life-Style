import { cx } from "@/lib/cx";

export function Spinner({
  label = "Loading",
  block,
  decorative,
}: {
  label?: string;
  block?: boolean;
  decorative?: boolean;
}) {
  return (
    <span
      className={cx("gg-spinner", block && "gg-spinner--block")}
      role={decorative ? undefined : "status"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
    />
  );
}
