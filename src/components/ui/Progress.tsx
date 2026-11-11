type ProgressProps = { value: number; label: string; className?: string };

/** A value from 0 to 1. The label is read out; the bar is decoration. */
export function Progress({ value, label, className = '' }: ProgressProps) {
  const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className={`h-2 w-full overflow-hidden rounded-full bg-card-raised ${className}`}>
      <div className="h-full rounded-full bg-lime transition-[width] duration-250 ease-brand" style={{ width: `${percent}%` }} />
    </div>
  );
}
