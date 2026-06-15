import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
  icon?: ReactNode;
};

export function StatCard({ label, value, helper, icon }: StatCardProps) {
  return (
    <div className="rounded-lg border border-clinical-line bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-clinical-muted">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-clinical-ink">{value}</p>
        </div>
        {icon ? <div className="text-clinical-blue">{icon}</div> : null}
      </div>
      {helper ? <p className="mt-3 text-sm text-clinical-muted">{helper}</p> : null}
    </div>
  );
}
