import { formatNumber } from "../lib/format";

type FeatureGridProps = {
  values: Record<string, number>;
};

export function FeatureGrid({ values }: FeatureGridProps) {
  const entries = Object.entries(values);

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-clinical-line bg-slate-50 p-4 text-sm text-clinical-muted">
        No numeric values are available.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-lg border border-clinical-line bg-slate-50 p-4">
          <p className="text-sm font-medium text-clinical-muted">{key}</p>
          <p className="mt-2 text-2xl font-semibold text-clinical-ink">{formatNumber(value)}</p>
        </div>
      ))}
    </div>
  );
}
