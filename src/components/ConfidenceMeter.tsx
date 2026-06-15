import { formatPercent } from "../lib/format";

type ConfidenceMeterProps = {
  value: number;
};

export function ConfidenceMeter({ value }: ConfidenceMeterProps) {
  const width = Math.max(0, Math.min(100, value * 100));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-clinical-muted">Model confidence</span>
        <span className="text-sm font-semibold text-clinical-ink">{formatPercent(value)}</span>
      </div>
      <div
        className="h-3 rounded-full bg-slate-100"
        role="meter"
        aria-label="Model confidence"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Number(width.toFixed(2))}
      >
        <div
          className="h-3 rounded-full bg-clinical-blue transition-all"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
