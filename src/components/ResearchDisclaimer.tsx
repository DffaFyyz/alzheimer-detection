import { ShieldAlert } from "lucide-react";

type ResearchDisclaimerProps = {
  compact?: boolean;
};

export function ResearchDisclaimer({ compact = false }: ResearchDisclaimerProps) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-amber-50 text-amber-900 ${
        compact ? "p-3 text-sm" : "p-4"
      }`}
    >
      <div className="flex gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <p className="leading-6">
          This tool is intended for academic and research use only. It is not a
          certified medical diagnostic system and should not be used as the sole
          basis for clinical decisions.
        </p>
      </div>
    </div>
  );
}
