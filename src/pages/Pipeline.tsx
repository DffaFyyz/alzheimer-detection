import {
  ArrowRight,
  BrainCircuit,
  Database,
  FileJson,
  Image,
  Layers3,
  LineChart,
  SplitSquareHorizontal,
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ResearchDisclaimer } from "../components/ResearchDisclaimer";
import { mockMetadata } from "../data/edaSummary";
import { useModelMetadata } from "../hooks/useModelMetadata";
import { formatPercent } from "../lib/format";

const stepIcons = [Database, SplitSquareHorizontal, Image, Layers3, BrainCircuit, FileJson];

export function Pipeline() {
  const { metadata, isLive } = useModelMetadata();
  const pipelineSteps = metadata.pipeline_steps ?? mockMetadata.pipeline_steps ?? [];
  const limitations = metadata.limitations ?? mockMetadata.limitations ?? [];
  const stage1Ran = metadata.training_result.stage_1_epochs_ran;
  const stage2Ran = metadata.training_result.stage_2_epochs_ran;
  const bestValAccuracy =
    typeof metadata.training_result.best_val_accuracy === "number"
      ? formatPercent(metadata.training_result.best_val_accuracy)
      : "Pending";

  return (
    <div>
      <PageHeader
        eyebrow="Methodology"
        title="Deep Learning Pipeline"
        description="A visual walkthrough of the ResNet50 experiment from EDA to final Flask-served evaluation metadata."
        action={
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
              isLive
                ? "border-teal-200 bg-teal-50 text-teal-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            {isLive ? "Live metadata" : `${metadata.model.architecture} + ${metadata.model.pretrained_weights}`}
          </span>
        }
      />

      <Panel className="p-6">
        <h2 className="text-lg font-semibold">End-to-End Flow</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pipelineSteps.map((item, index) => {
            const Icon = stepIcons[index] ?? BrainCircuit;

            return (
              <div
                key={item.step}
                className="relative flex min-w-0 flex-col rounded-lg border border-clinical-line bg-slate-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-clinical-blue">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-clinical-muted">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-clinical-ink">{item.step}</h3>
                <p className="mt-2 text-sm leading-6 text-clinical-muted">{item.detail}</p>
                <div className="mt-auto break-words rounded-md bg-white px-3 py-2 font-mono text-xs leading-5 text-clinical-muted">
                  {item.output}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel className="mt-8 p-6">
        <h2 className="text-lg font-semibold">Pipeline Visualization</h2>
        <div className="mt-6 rounded-lg border border-clinical-line bg-white p-4">
          <div className="flex w-full items-stretch gap-2">
            {[
              "MRI folders",
              "EDA tables",
              "Stratified split",
              "224 x 224 tensors",
              "ResNet50 head",
              "Fine-tuned model",
              "metadata JSON",
            ].map((item, index, list) => (
              <div key={item} className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex min-h-24 min-w-0 flex-1 items-center justify-center rounded-lg border border-clinical-line bg-slate-50 px-2 py-3 text-center text-sm font-semibold leading-5 text-clinical-ink">
                  {item}
                </div>
                {index < list.length - 1 ? (
                  <ArrowRight className="h-4 w-4 flex-none text-clinical-muted" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel className="mt-8 p-6">
        <div className="flex items-start gap-3">
          <LineChart className="mt-0.5 h-5 w-5 text-clinical-teal" aria-hidden="true" />
          <div>
            <h2 className="text-lg font-semibold">Two-Stage Training</h2>
            <p className="mt-3 max-w-4xl leading-7 text-clinical-muted">
              Transfer learning is split into two passes so the model learns the MRI label space
              without immediately disturbing the pretrained ResNet50 representation. The first pass
              stabilizes the new classifier head; the second pass carefully adapts the deepest
              convolutional layers to the Alzheimer MRI dataset.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-clinical-line bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-clinical-teal">
                  Stage 1
                </p>
                <h3 className="mt-1 text-lg font-semibold text-clinical-ink">
                  Frozen ResNet50 Base
                </h3>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                Head training
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-clinical-muted">
              The ImageNet-pretrained ResNet50 layers stay frozen. Only the new classification head
              learns from the MRI labels, which keeps early training stable and reduces the chance
              of overwriting useful generic visual filters.
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Epoch budget</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">
                  {metadata.training_config.stage_1_epochs}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Epochs ran</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">
                  {stage1Ran ?? "Pending"}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Learning rate</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">
                  {metadata.training_config.stage_1_learning_rate}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Trainable scope</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">Classifier head only</dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Early stopping</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">val_loss, patience 5</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-clinical-line bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-clinical-teal">
                  Stage 2
                </p>
                <h3 className="mt-1 text-lg font-semibold text-clinical-ink">
                  Fine-Tune Top ResNet Layers
                </h3>
              </div>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                Low LR adaptation
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-clinical-muted">
              After the head has learned a useful decision boundary, the final{" "}
              {metadata.model.fine_tune_layers} ResNet50 layers are unfrozen. BatchNorm layers stay
              frozen to avoid unstable statistics while the model adapts deeper image features.
            </p>
            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Epoch budget</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">
                  {metadata.training_config.stage_2_epochs}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Epochs ran</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">
                  {stage2Ran ?? "Pending"}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Learning rate</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">
                  {metadata.training_config.stage_2_learning_rate}
                </dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Trainable scope</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">
                  Last {metadata.model.fine_tune_layers} layers
                </dd>
              </div>
              <div className="rounded-lg bg-white p-3">
                <dt className="text-clinical-muted">Early stopping</dt>
                <dd className="mt-1 font-semibold text-clinical-ink">val_loss, patience 7</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-clinical-line bg-white p-4">
            <h3 className="font-semibold text-clinical-ink">Why Not Fine-Tune Immediately?</h3>
            <p className="mt-2 text-sm leading-6 text-clinical-muted">
              The classifier head starts with random weights. Freezing the backbone first lets that
              head settle before gradients are allowed to update pretrained convolutional filters.
            </p>
          </div>
          <div className="rounded-lg border border-clinical-line bg-white p-4">
            <h3 className="font-semibold text-clinical-ink">What To Watch</h3>
            <p className="mt-2 text-sm leading-6 text-clinical-muted">
              Validation loss is the main stopping signal. A widening gap between training accuracy
              and validation accuracy is the clearest warning that fine-tuning is overfitting. Best
              validation accuracy from metadata: <span className="font-semibold">{bestValAccuracy}</span>.
            </p>
          </div>
          <div className="rounded-lg border border-clinical-line bg-white p-4">
            <h3 className="font-semibold text-clinical-ink">Final Evaluation</h3>
            <p className="mt-2 text-sm leading-6 text-clinical-muted">
              After training, the held-out test set is used once to compute accuracy, macro
              precision, macro recall, macro F1, weighted F1, and the confusion matrix.
            </p>
          </div>
        </div>
      </Panel>

      <Panel className="mt-8 p-6">
        <h2 className="text-lg font-semibold">Known Limitations</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {limitations.map((item) => (
            <div
              key={item}
              className="rounded-lg border border-clinical-line bg-slate-50 p-4 text-sm leading-6 text-clinical-muted"
            >
              {item}
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-8">
        <ResearchDisclaimer />
      </div>
    </div>
  );
}
