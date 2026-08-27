import { cx } from "@/lib/cx";
import { memberInitials } from "@/lib/initials";

export function Avatar({
  name,
  size = "md",
}: {
  name: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={cx("gg-avatar", size === "sm" && "gg-avatar--sm")}
      aria-hidden="true"
    >
      {memberInitials(name)}
    </span>
  );
}
