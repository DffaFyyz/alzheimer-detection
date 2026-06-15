import { BrainCircuit, CheckCircle2 } from "lucide-react";
import { mockMetadata } from "../data/edaSummary";

type ModelSelectorProps = {
  isLoading: boolean;
};

export function ModelSelector({ isLoading }: ModelSelectorProps) {
  return (
    <button
      className="w-full rounded-lg border border-clinical-blue bg-blue-50 p-4 text-left"
      disabled={isLoading}
      type="button"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white text-clinical-blue">
          {isLoading ? (
            <BrainCircuit className="h-5 w-5" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-semibold text-clinical-ink">{mockMetadata.model.architecture}</span>
          <span className="mt-1 block text-sm leading-6 text-clinical-muted">
            Single backend-selected model for the Alzheimer MRI MVP.
          </span>
        </span>
      </div>
    </button>
  );
}
