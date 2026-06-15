import { AlertCircle, BrainCircuit, FlaskConical, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ResearchDisclaimer } from "../components/ResearchDisclaimer";
import { ResultCard } from "../components/ResultCard";
import { UploadPanel } from "../components/UploadPanel";
import { mockMetadata } from "../data/edaSummary";
import { predictImage } from "../lib/api";
import type { PredictionResponse } from "../types/prediction";

const classGuidance = [
  {
    label: "NonDemented",
    description:
      "MRI pattern is closest to the dataset class without visible dementia-related labeling.",
    tone: "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
  {
    label: "VeryMildDemented",
    description:
      "MRI pattern is closest to the earliest dementia-labeled category in the training data.",
    tone: "border-violet-200 bg-violet-50 text-violet-900",
  },
  {
    label: "MildDemented",
    description:
      "MRI pattern is closest to the mild dementia category learned by the ResNet50 model.",
    tone: "border-blue-200 bg-blue-50 text-blue-900",
  },
  {
    label: "ModerateDemented",
    description:
      "MRI pattern is closest to the moderate dementia category in the dataset labels.",
    tone: "border-red-200 bg-red-50 text-red-900",
  },
];

export function Predict() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  function handleFileChange(nextFile: File) {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(nextFile);
    setImageUrl(URL.createObjectURL(nextFile));
    setResult(null);
    setError(null);
  }

  function handleReset() {
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setFile(null);
    setImageUrl(null);
    setResult(null);
    setError(null);
  }

  async function handleAnalyze() {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await predictImage(file);
      setResult(response);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to complete prediction request.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="Live detection"
        title="Classify an Alzheimer MRI Image"
        description="Upload a brain MRI image and review how the ResNet50 model maps it to the four Alzheimer dataset classes."
        action={
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
            <FlaskConical className="h-4 w-4" aria-hidden="true" />
            POST /predict
          </span>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Panel className="p-6">
          <h2 className="text-lg font-semibold">MRI Upload</h2>
          <p className="mt-2 text-sm leading-6 text-clinical-muted">
            The request is sent as multipart form data with an{" "}
            <span className="font-mono">image</span> field. The ResNet50 model is selected by the
            backend.
          </p>
          <div className="mt-5 rounded-lg border border-clinical-line bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <BrainCircuit className="mt-0.5 h-5 w-5 text-clinical-blue" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-clinical-ink">
                  {mockMetadata.model.architecture}
                </p>
                <p className="mt-1 text-sm leading-6 text-clinical-muted">
                  {mockMetadata.model.pretrained_weights} backbone,{" "}
                  {mockMetadata.model.input_size.join(" x ")} input,{" "}
                  {mockMetadata.dataset.num_classes} output classes.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5">
            <UploadPanel
              file={file}
              imageUrl={imageUrl}
              isLoading={isLoading}
              onAnalyze={handleAnalyze}
              onFileChange={handleFileChange}
              onReset={handleReset}
            />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel className="p-6">
            <h2 className="text-lg font-semibold">Prediction Result</h2>
            <div className="mt-5">
              {isLoading ? (
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-5 text-blue-900">
                  <p className="font-semibold">Analyzing MRI image...</p>
                  <p className="mt-2 text-sm leading-6">
                    Running the uploaded image through the ResNet50 inference endpoint.
                  </p>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-900">
                  <div className="flex gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">Prediction failed</p>
                      <p className="mt-2 text-sm leading-6">{error}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {result ? <ResultCard result={result} /> : null}

              {!isLoading && !error && !result ? (
                <div className="rounded-lg border border-clinical-line bg-slate-50 p-6 text-center">
                  <p className="font-semibold text-clinical-ink">No result yet</p>
                  <p className="mt-2 text-sm leading-6 text-clinical-muted">
                    Select an MRI image and run analysis to see the model output.
                  </p>
                </div>
              ) : null}
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-clinical-teal" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-semibold">Understanding the Classes</h2>
                <p className="mt-2 text-sm leading-6 text-clinical-muted">
                  The model compares the uploaded MRI against labels learned from the augmented
                  Alzheimer MRI dataset. The confidence score shows how strongly the model favors
                  the selected class compared with the other classes.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {classGuidance.map((item) => (
                <div key={item.label} className={`rounded-lg border p-4 ${item.tone}`}>
                  <p className="font-semibold">{item.label}</p>
                  <p className="mt-2 text-sm leading-6">{item.description}</p>
                </div>
              ))}
            </div>
          </Panel>

          <ResearchDisclaimer compact />
        </div>
      </div>
    </div>
  );
}
