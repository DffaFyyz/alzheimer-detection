import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { mockMetadata } from "../data/edaSummary";
import type { PredictionLabel, PredictionResponse } from "../types/prediction";

type ResultCardProps = {
  result: PredictionResponse;
};

const labelStyles: Record<PredictionLabel, string> = {
  NonDemented: "border-emerald-200 bg-emerald-50 text-emerald-900",
  VeryMildDemented: "border-violet-200 bg-violet-50 text-violet-900",
  MildDemented: "border-blue-200 bg-blue-50 text-blue-900",
  ModerateDemented: "border-red-200 bg-red-50 text-red-900",
};

const probabilityColors: Record<PredictionLabel, string> = {
  NonDemented: "bg-emerald-700",
  VeryMildDemented: "bg-violet-700",
  MildDemented: "bg-blue-700",
  ModerateDemented: "bg-red-700",
};

export function ResultCard({ result }: ResultCardProps) {
  const isNonDemented = result.prediction === "NonDemented";
  const Icon = isNonDemented ? CheckCircle2 : AlertTriangle;
  const responseModelName = result.model_name ?? result.model ?? mockMetadata.model.architecture;
  const classProbabilities = result.class_probabilities;

  return (
    <div className="space-y-5">
      <div className={`rounded-lg border p-5 ${labelStyles[result.prediction]}`}>
        <div className="flex items-start gap-3">
          <Icon className="mt-1 h-6 w-6 flex-none" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium">Model classification result</p>
            <p className="mt-1 text-3xl font-semibold">{result.prediction}</p>
            <p className="mt-2 text-sm">Model: {responseModelName}</p>
          </div>
        </div>
      </div>

      <ConfidenceMeter value={result.confidence} />

      {classProbabilities ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {mockMetadata.dataset.class_names.map((label) => {
            const probability = classProbabilities[label] ?? 0;

            return (
              <div key={label} className="rounded-lg border border-clinical-line bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-clinical-muted">{label}</span>
                  <span className="text-sm font-semibold text-clinical-ink">
                    {(probability * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white">
                  <div
                    className={`h-2 rounded-full ${probabilityColors[label]}`}
                    style={{ width: `${Math.max(0, Math.min(100, probability * 100))}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
