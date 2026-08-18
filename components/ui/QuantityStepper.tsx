type Props = {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label: string;
};

export function QuantityStepper({
  value,
  min = 1,
  max = 6,
  onChange,
  label,
}: Props) {
  return (
    <div className="gg-stepper" role="group" aria-label={label}>
      <button
        type="button"
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span aria-live="polite">{value}</span>
      <button
        type="button"
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}
