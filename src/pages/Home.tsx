import { Activity, ArrowRight, BarChart3, BrainCircuit, Database, Workflow } from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ResearchDisclaimer } from "../components/ResearchDisclaimer";
import { StatCard } from "../components/StatCard";
import { useModelMetadata } from "../hooks/useModelMetadata";
import { formatNumber, formatPercent } from "../lib/format";

type HomeProps = {
  onNavigate: (path: string) => void;
};

export function Home({ onNavigate }: HomeProps) {
  const { metadata, isLoading, isLive } = useModelMetadata();
  const testAccuracy =
    typeof metadata.test_metrics.accuracy === "number"
      ? formatPercent(metadata.test_metrics.accuracy)
      : "Pending";

  return (
    <div>
      <PageHeader
        eyebrow="Academic MVP"
        title="Alzheimer MRI Classification Workbench"
        description="Upload MRI images for ResNet50 classification, review the data and model pipeline, and inspect the final evaluation metadata served by Flask."
        action={
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
              isLive
                ? "border-teal-200 bg-teal-50 text-teal-800"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {isLoading ? "Loading metadata" : isLive ? "Live Flask metadata" : "Mock metadata"}
          </span>
        }
      />

      <div className="-mt-4 mb-8 inline-flex rounded-full border border-clinical-line bg-white px-4 py-2 text-sm font-medium text-clinical-muted">
        Daffa Fayyaz Erzeltra - Binus University
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Database className="h-6 w-6" aria-hidden="true" />}
          label="Dataset Images"
          value={formatNumber(metadata.dataset.total_images)}
          helper={metadata.dataset.source_name ?? "Augmented Alzheimer MRI dataset"}
        />
        <StatCard
          icon={<BrainCircuit className="h-6 w-6" aria-hidden="true" />}
          label="MRI Classes"
          value={String(metadata.dataset.num_classes)}
          helper="Non, very mild, mild, and moderate dementia labels"
        />
        <StatCard
          icon={<Activity className="h-6 w-6" aria-hidden="true" />}
          label="Backbone"
          value={metadata.model.architecture}
          helper={`${metadata.model.pretrained_weights} weights, ${metadata.model.input_size.join(" x ")} input`}
        />
        <StatCard
          icon={<Workflow className="h-6 w-6" aria-hidden="true" />}
          label="Test Accuracy"
          value={testAccuracy}
          helper={isLive ? "From Flask /metadata" : "Fallback metadata until Flask is reachable"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <Panel className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-blue-50 text-clinical-blue">
              <Activity className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Run MRI Detection</h2>
              <p className="mt-2 leading-7 text-clinical-muted">
                Submit one MRI image to the Flask <span className="font-mono">/predict</span>{" "}
                endpoint and render the predicted class, confidence, and probability distribution.
              </p>
              <button
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-clinical-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                onClick={() => onNavigate("/detect")}
                type="button"
              >
                Open Detect Page
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-teal-50 text-clinical-teal">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Review Research Insights</h2>
              <p className="mt-2 leading-7 text-clinical-muted">
                Explore the background problem, class balance, train/validation/test split, final
                evaluation metrics, and source citations.
              </p>
              <button
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-clinical-line px-4 py-3 text-sm font-semibold text-clinical-ink transition hover:bg-slate-100"
                onClick={() => onNavigate("/research")}
                type="button"
              >
                View Research
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-lg bg-violet-50 text-violet-700">
              <Workflow className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold">Inspect the DL Pipeline</h2>
              <p className="mt-2 leading-7 text-clinical-muted">
                Follow the ResNet50 path from EDA and stratified splitting through frozen-base
                training, fine-tuning, and final test-set evaluation.
              </p>
              <button
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-clinical-line px-4 py-3 text-sm font-semibold text-clinical-ink transition hover:bg-slate-100"
                onClick={() => onNavigate("/pipeline")}
                type="button"
              >
                View Pipeline
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </Panel>
      </div>

      <div className="mt-8">
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
