export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="gg-switch-row"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span>{label}</span>
      <span className="gg-switch" aria-hidden="true" />
    </button>
  );
}
