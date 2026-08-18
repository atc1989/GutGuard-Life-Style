import { cx } from "@/lib/cx";

type Option<T extends string> = {
  id: T;
  label: string;
  badge?: number;
};

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (id: T) => void;
  label: string;
};

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
}: Props<T>) {
  return (
    <div className="gg-segment" role="tablist" aria-label={label}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            className={cx("gg-segment__button", selected && "is-active")}
            onClick={() => onChange(option.id)}
          >
            {option.label}
            {option.badge ? ` · ${option.badge}` : ""}
          </button>
        );
      })}
    </div>
  );
}
