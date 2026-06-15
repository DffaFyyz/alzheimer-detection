import {
   Bar,
   BarChart,
   CartesianGrid,
   Cell,
   Legend,
   Line,
   LineChart,
   Pie,
   PieChart,
   ReferenceLine,
   ResponsiveContainer,
   Tooltip,
   XAxis,
   YAxis,
} from "recharts";
import {
   Activity,
   AlertCircle,
   BarChart3,
   BrainCircuit,
   Database,
   FlaskConical,
   Scale,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { Panel } from "../components/Panel";
import { ResearchDisclaimer } from "../components/ResearchDisclaimer";
import { StatCard } from "../components/StatCard";
import { mockMetadata } from "../data/edaSummary";
import { fetchModelMetadata, fetchTrainingHistory, type TrainingHistoryPoint } from "../lib/api";
import { formatNumber, formatPercent } from "../lib/format";
import type { ModelMetadata, NullableMetric } from "../types/metadata";
import type { PredictionLabel } from "../types/prediction";

const classColors: Record<PredictionLabel, string> = {
   MildDemented: "#2563EB",
   ModerateDemented: "#DC2626",
   NonDemented: "#0F766E",
   VeryMildDemented: "#7C3AED",
};

function metricPercent(value: NullableMetric | undefined) {
   return typeof value === "number" ? formatPercent(value) : "Pending";
}

function metricNumber(value: NullableMetric | undefined) {
   return typeof value === "number" ? formatNumber(value) : "Pending";
}

function toChartPercent(value: number) {
   return Number((value * 100).toFixed(2));
}

function getStageLabel(stage: string) {
   return stage === "stage_1_frozen" ? "Stage 1" : "Stage 2";
}

function ConfusionMatrixHeatmap({
   labels,
   matrix,
}: {
   labels: string[];
   matrix: number[][];
}) {
   const maxValue = Math.max(...matrix.flat(), 1);

   return (
      <div className="overflow-x-auto">
         <div
            className="grid min-w-[620px] gap-2 rounded-lg border border-clinical-line bg-white p-4"
            style={{ gridTemplateColumns: `150px repeat(${labels.length}, minmax(96px, 1fr))` }}
         >
            <div className="flex items-end justify-start px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-clinical-muted">
               Actual / Predicted
            </div>
            {labels.map((label) => (
               <div
                  key={`predicted-${label}`}
                  className="flex min-h-12 items-end justify-center rounded-md bg-slate-50 px-2 pb-2 text-center text-xs font-semibold text-clinical-muted"
               >
                  {label}
               </div>
            ))}

            {matrix.map((row, rowIndex) => {
               const rowTotal = row.reduce((sum, value) => sum + value, 0);

               return (
                  <Fragment key={`row-${labels[rowIndex]}`}>
                     <div
                        key={`actual-${labels[rowIndex]}`}
                        className="flex min-h-20 items-center rounded-md bg-slate-50 px-3 text-sm font-semibold text-clinical-ink"
                     >
                        {labels[rowIndex]}
                     </div>
                     {row.map((value, columnIndex) => {
                        const intensity = value / maxValue;
                        const isDiagonal = rowIndex === columnIndex;
                        const alpha = 0.1 + intensity * 0.82;
                        const backgroundColor = isDiagonal
                           ? `rgba(37, 99, 235, ${alpha})`
                           : `rgba(220, 38, 38, ${0.08 + intensity * 0.58})`;
                        const foreground = intensity > 0.5 && isDiagonal ? "text-white" : "text-clinical-ink";
                        const rowPercent = rowTotal > 0 ? value / rowTotal : 0;

                        return (
                           <div
                              key={`${rowIndex}-${columnIndex}`}
                              className={`flex min-h-20 flex-col items-center justify-center rounded-md border border-white px-2 text-center ${foreground}`}
                              style={{ backgroundColor }}
                           >
                              <span className="text-xl font-semibold">{formatNumber(value)}</span>
                              <span className="mt-1 text-xs opacity-80">{formatPercent(rowPercent)}</span>
                           </div>
                        );
                     })}
                  </Fragment>
               );
            })}
         </div>
      </div>
   );
}

export function ResearchInsights() {
   const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
   const [trainingHistory, setTrainingHistory] = useState<TrainingHistoryPoint[]>([]);
   const [error, setError] = useState<string | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      let isMounted = true;

      Promise.all([fetchModelMetadata(), fetchTrainingHistory()])
         .then(([nextMetadata, nextTrainingHistory]) => {
            if (!isMounted) return;
            setMetadata(nextMetadata);
            setTrainingHistory(nextTrainingHistory);
            setError(null);
         })
         .catch((caughtError) => {
            if (!isMounted) return;
            setError(
               caughtError instanceof Error
                  ? caughtError.message
                  : "Unable to load model metadata.",
            );
         })
         .finally(() => {
            if (!isMounted) return;
            setIsLoading(false);
         });

      return () => {
         isMounted = false;
      };
   }, []);

   const classDistributionData = useMemo(
      () =>
         (metadata?.dataset.class_distribution ?? []).map((item) => ({
            ...item,
            fill: item.fill ?? classColors[item.class],
         })),
      [metadata],
   );

   const splitChartData = metadata?.split.split_distribution ?? [];
   const trainingCurveData = useMemo(
      () =>
         trainingHistory.map((point) => ({
            epoch: point.epoch,
            stage: getStageLabel(point.stage),
            trainAccuracy: toChartPercent(point.accuracy),
            validationAccuracy: toChartPercent(point.val_accuracy),
            trainLoss: Number(point.loss.toFixed(4)),
            validationLoss: Number(point.val_loss.toFixed(4)),
         })),
      [trainingHistory],
   );
   const fineTuneStartEpoch =
      trainingHistory.find((point) => point.stage === "stage_2_finetuning")?.epoch ?? null;
   const curveInterpretation = useMemo(() => {
      if (trainingHistory.length === 0) return null;

      const finalPoint = trainingHistory[trainingHistory.length - 1];
      const bestValidationAccuracy = Math.max(...trainingHistory.map((point) => point.val_accuracy));
      const bestValidationLoss = Math.min(...trainingHistory.map((point) => point.val_loss));
      const accuracyGap = finalPoint.accuracy - finalPoint.val_accuracy;
      const lossGap = finalPoint.val_loss - finalPoint.loss;
      const hasOverfittingSignal = accuracyGap > 0.04 && lossGap > 0.1;

      return {
         finalTrainAccuracy: finalPoint.accuracy,
         finalValidationAccuracy: finalPoint.val_accuracy,
         finalTrainLoss: finalPoint.loss,
         finalValidationLoss: finalPoint.val_loss,
         bestValidationAccuracy,
         bestValidationLoss,
         accuracyGap,
         lossGap,
         hasOverfittingSignal,
      };
   }, [trainingHistory]);
   const background = metadata?.background ?? mockMetadata.background!;
   const sourceName =
      metadata?.dataset.source_name ?? mockMetadata.dataset.source_name ?? "Augmented Alzheimer MRI dataset";
   const hasFinalMetrics = typeof metadata?.test_metrics.accuracy === "number";
   const experimentStatus = metadata?.experiment.status ?? (hasFinalMetrics ? "complete" : "metrics_pending");

   if (isLoading) {
      return (
         <div>
            <PageHeader
               eyebrow="Research insights"
               title="Dataset, Model, and Evaluation"
               description="Loading model metadata from the Flask API or local fallback metadata."
            />
            <Panel className="p-6">
               <p className="text-sm font-semibold text-clinical-ink">Loading metadata...</p>
               <p className="mt-2 text-sm leading-6 text-clinical-muted">
                  Requesting metadata from the Flask service.
               </p>
            </Panel>
         </div>
      );
   }

   if (error || !metadata) {
      return (
         <div>
            <PageHeader
               eyebrow="Research insights"
               title="Dataset, Model, and Evaluation"
               description="Unable to load model metadata."
            />
            <Panel className="border-red-200 bg-red-50 p-6 text-red-900">
               <div className="flex gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                  <div>
                     <p className="font-semibold">Metadata request failed</p>
                     <p className="mt-2 text-sm leading-6">
                        {error ?? "The metadata response was empty."}
                     </p>
                  </div>
               </div>
            </Panel>
         </div>
      );
   }

   return (
      <div>
         <PageHeader
            eyebrow="Research insights"
            title="Dataset, Model, and Evaluation"
            description="A metadata-driven research view for the Alzheimer MRI classifier. Final metrics will populate automatically when the Flask API returns the completed model_metadata.json."
            action={
               <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${metadata.metadata_source === "api"
                        ? "border-teal-200 bg-teal-50 text-teal-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                     }`}
               >
                  <FlaskConical className="h-4 w-4" aria-hidden="true" />
                  {metadata.metadata_source === "api" ? "Live /metadata" : "Mock metadata"}
               </span>
            }
         />

         <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
               icon={<Database className="h-6 w-6" aria-hidden="true" />}
               label="Total Images"
               value={formatNumber(metadata.dataset.total_images)}
               helper={sourceName}
            />
            <StatCard
               icon={<BrainCircuit className="h-6 w-6" aria-hidden="true" />}
               label="Classes"
               value={String(metadata.dataset.num_classes)}
               helper={metadata.dataset.class_names.join(", ")}
            />
            <StatCard
               icon={<Activity className="h-6 w-6" aria-hidden="true" />}
               label="Train / Val / Test"
               value={`${formatNumber(metadata.split.train_size)} / ${formatNumber(
                  metadata.split.validation_size,
               )} / ${formatNumber(metadata.split.test_size)}`}
               helper={metadata.split.strategy}
            />
            <StatCard
               icon={<BarChart3 className="h-6 w-6" aria-hidden="true" />}
               label="Test Accuracy"
               value={metricPercent(metadata.test_metrics.accuracy)}
               helper={hasFinalMetrics ? "From model_metadata.json" : "Pending until evaluation finishes"}
            />
         </div>

         <Panel className="mt-8 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
               <h2 className="text-lg font-semibold">Background Problem</h2>
               <span className="inline-flex w-fit rounded-full border border-clinical-line bg-slate-50 px-3 py-1 text-xs font-semibold text-clinical-muted">
                  Research context with visible citations
               </span>
            </div>
            <div className="mt-5 grid gap-5 text-sm leading-7 text-clinical-muted lg:grid-cols-2">
               {background.problem.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
               ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
               {background.key_statistics.map((stat) => (
                  <div key={stat.label} className="rounded-lg border border-clinical-line bg-slate-50 p-4">
                     <p className="text-sm font-medium text-clinical-muted">{stat.label}</p>
                     <p className="mt-2 text-3xl font-semibold text-clinical-ink">{stat.value}</p>
                     <p className="mt-2 text-sm leading-6 text-clinical-muted">{stat.helper}</p>
                     <p className="mt-3 text-xs font-semibold text-clinical-teal">{stat.citation_label}</p>
                  </div>
               ))}
            </div>
         </Panel>

         <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Panel className="p-6">
               <h2 className="text-lg font-semibold">Class Distribution</h2>
               <p className="mt-2 text-sm leading-6 text-clinical-muted">
                  Dataset balance from the EDA notebook.
               </p>
               <div className="mt-5 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={classDistributionData}
                           dataKey="count"
                           innerRadius={64}
                           nameKey="class"
                           outerRadius={96}
                           paddingAngle={2}
                        >
                           {classDistributionData.map((entry) => (
                              <Cell key={entry.class} fill={entry.fill} />
                           ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatNumber(value)} />
                     </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {classDistributionData.map((item) => (
                     <div key={item.class} className="rounded-lg border border-clinical-line bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                           <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                           <span className="text-sm font-medium">{item.class}</span>
                        </div>
                        <p className="mt-2 text-xl font-semibold">{formatNumber(item.count)}</p>
                        <p className="mt-1 text-xs text-clinical-muted">{item.percentage.toFixed(2)}%</p>
                     </div>
                  ))}
               </div>
            </Panel>

            <Panel className="p-6">
               <h2 className="text-lg font-semibold">Stratified Split</h2>
               <p className="mt-2 text-sm leading-6 text-clinical-muted">
                  Train, validation, and test counts by class.
               </p>
               <div className="mt-5 h-96">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={splitChartData} margin={{ left: 8, right: 16, top: 10 }}>
                        <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                        <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                        <YAxis tickFormatter={(value: number) => formatNumber(value)} />
                        <Tooltip formatter={(value: number) => formatNumber(value)} />
                        <Bar dataKey="train" name="Train" fill="#2563EB" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="validation" name="Validation" fill="#0F766E" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="test" name="Test" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </Panel>
         </div>

         <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Panel className="overflow-hidden">
               <div className="border-b border-clinical-line p-6">
                  <h2 className="text-lg font-semibold">Model Configuration</h2>
                  <p className="mt-2 text-sm leading-6 text-clinical-muted">
                     Core ResNet50 settings from the experiment notebook.
                  </p>
               </div>
               <dl className="divide-y divide-clinical-line text-sm">
                  {[
                     ["Architecture", metadata.model.architecture],
                     ["Pretrained weights", metadata.model.pretrained_weights],
                     ["Input size", `${metadata.model.input_size.join(" x ")} px`],
                     ["Output classes", String(metadata.model.num_classes)],
                     ["Fine-tuning", metadata.model.fine_tuning_enabled ? "Enabled" : "Disabled"],
                     ["Fine-tuned layers", String(metadata.model.fine_tune_layers)],
                     ["Total params", metricNumber(metadata.model.total_params)],
                  ].map(([label, value]) => (
                     <div key={label} className="grid grid-cols-[0.9fr_1.1fr] gap-4 px-6 py-3">
                        <dt className="font-medium text-clinical-muted">{label}</dt>
                        <dd className="font-semibold text-clinical-ink">{value}</dd>
                     </div>
                  ))}
               </dl>
            </Panel>

            <Panel className="overflow-hidden">
               <div className="border-b border-clinical-line p-6">
                  <h2 className="text-lg font-semibold">Training Configuration</h2>
                  <p className="mt-2 text-sm leading-6 text-clinical-muted">
                     Two-stage training setup planned for the final model run.
                  </p>
               </div>
               <dl className="divide-y divide-clinical-line text-sm">
                  {[
                     ["Batch size", String(metadata.training_config.batch_size)],
                     ["Stage 1 epochs", String(metadata.training_config.stage_1_epochs)],
                     ["Stage 2 epochs", String(metadata.training_config.stage_2_epochs)],
                     ["Stage 1 learning rate", String(metadata.training_config.stage_1_learning_rate)],
                     ["Stage 2 learning rate", String(metadata.training_config.stage_2_learning_rate)],
                     [
                        "Train augmentation",
                        metadata.training_config.training_augmentation_enabled ? "Enabled" : "Disabled",
                     ],
                     ["Seed", String(metadata.training_config.seed)],
                  ].map(([label, value]) => (
                     <div key={label} className="grid grid-cols-[0.9fr_1.1fr] gap-4 px-6 py-3">
                        <dt className="font-medium text-clinical-muted">{label}</dt>
                        <dd className="font-semibold text-clinical-ink">{value}</dd>
                     </div>
                  ))}
               </dl>
            </Panel>
         </div>

         <Panel className="mt-8 overflow-hidden">
            <div className="border-b border-clinical-line p-6">
               <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                     <h2 className="text-lg font-semibold">Evaluation Metrics</h2>
                     <p className="mt-2 text-sm leading-6 text-clinical-muted">
                        {hasFinalMetrics
                           ? "Final test-set metrics loaded from the Flask metadata endpoint."
                           : "These values remain pending until the completed notebook exports them to model_metadata.json."}
                     </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                     <Scale className="h-3.5 w-3.5" aria-hidden="true" />
                     {experimentStatus.replace("_", " ")}
                  </span>
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="min-w-full divide-y divide-clinical-line text-sm">
                  <thead className="bg-slate-50 text-left text-clinical-muted">
                     <tr>
                        <th className="px-6 py-3 font-semibold">Metric</th>
                        <th className="px-6 py-3 font-semibold">Value</th>
                        <th className="px-6 py-3 font-semibold">Use</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-clinical-line bg-white">
                     {[
                        ["Accuracy", metricPercent(metadata.test_metrics.accuracy), "Overall correct predictions"],
                        [
                           "Macro Precision",
                           metricPercent(metadata.test_metrics.macro_precision),
                           "Class-balanced precision average",
                        ],
                        [
                           "Macro Recall",
                           metricPercent(metadata.test_metrics.macro_recall),
                           "Class-balanced recall average",
                        ],
                        ["Macro F1", metricPercent(metadata.test_metrics.macro_f1), "Class-balanced F1 score"],
                        [
                           "Weighted F1",
                           metricPercent(metadata.test_metrics.weighted_f1),
                           "Support-weighted F1 score",
                        ],
                     ].map(([metric, value, helper]) => (
                        <tr key={metric}>
                           <td className="px-6 py-4 font-medium text-clinical-ink">{metric}</td>
                           <td className="px-6 py-4">{value}</td>
                           <td className="px-6 py-4 text-clinical-muted">{helper}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </Panel>

         <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Panel className="p-6">
               <h2 className="text-lg font-semibold">Training Accuracy Curve</h2>
               <p className="mt-2 text-sm leading-6 text-clinical-muted">
                  Training and validation accuracy across frozen-base training and fine-tuning.
               </p>
               {trainingCurveData.length > 0 ? (
                  <div className="mt-5 h-80 rounded-lg border border-clinical-line bg-white p-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trainingCurveData} margin={{ left: 8, right: 20, top: 10 }}>
                           <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                           <XAxis dataKey="epoch" />
                           <YAxis domain={[30, 100]} tickFormatter={(value: number) => `${value}%`} />
                           <Tooltip
                              formatter={(value: number) => `${value.toFixed(2)}%`}
                              labelFormatter={(value: number) => `Epoch ${value}`}
                           />
                           <Legend />
                           {fineTuneStartEpoch ? (
                              <ReferenceLine
                                 x={fineTuneStartEpoch}
                                 label="Fine-tuning"
                                 stroke="#64748B"
                                 strokeDasharray="5 5"
                              />
                           ) : null}
                           <Line
                              dataKey="trainAccuracy"
                              name="Train Accuracy"
                              stroke="#2563EB"
                              strokeDasharray="6 4"
                              strokeWidth={2}
                              type="monotone"
                           />
                           <Line
                              dataKey="validationAccuracy"
                              name="Validation Accuracy"
                              stroke="#0F766E"
                              strokeWidth={2}
                              type="monotone"
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               ) : (
                  <div className="mt-5 rounded-lg border border-clinical-line bg-slate-50 p-5 text-sm leading-6 text-clinical-muted">
                     Training history is not available from the Flask API yet. Restart Flask after the
                     `/training-history` endpoint is added, or place `combined_training_history.csv` next
                     to the model metadata.
                  </div>
               )}
            </Panel>

            <Panel className="p-6">
               <h2 className="text-lg font-semibold">Training Loss Curve</h2>
               <p className="mt-2 text-sm leading-6 text-clinical-muted">
                  Training and validation loss across the same two-stage training run.
               </p>
               {trainingCurveData.length > 0 ? (
                  <div className="mt-5 h-80 rounded-lg border border-clinical-line bg-white p-4">
                     <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trainingCurveData} margin={{ left: 8, right: 20, top: 10 }}>
                           <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" />
                           <XAxis dataKey="epoch" />
                           <YAxis />
                           <Tooltip
                              formatter={(value: number) => value.toFixed(4)}
                              labelFormatter={(value: number) => `Epoch ${value}`}
                           />
                           <Legend />
                           {fineTuneStartEpoch ? (
                              <ReferenceLine
                                 x={fineTuneStartEpoch}
                                 label="Fine-tuning"
                                 stroke="#64748B"
                                 strokeDasharray="5 5"
                              />
                           ) : null}
                           <Line
                              dataKey="trainLoss"
                              name="Train Loss"
                              stroke="#2563EB"
                              strokeDasharray="6 4"
                              strokeWidth={2}
                              type="monotone"
                           />
                           <Line
                              dataKey="validationLoss"
                              name="Validation Loss"
                              stroke="#DC2626"
                              strokeWidth={2}
                              type="monotone"
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               ) : (
                  <div className="mt-5 rounded-lg border border-clinical-line bg-slate-50 p-5 text-sm leading-6 text-clinical-muted">
                     Loss history is not available from the Flask API yet. The chart will render when
                     `combined_training_history.csv` is served by `/training-history`.
                  </div>
               )}
            </Panel>
         </div>

         {curveInterpretation ? (
            <Panel className="mt-8 p-6">
               <h2 className="text-lg font-semibold">Training Curve Interpretation</h2>
               <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-lg border border-clinical-line bg-slate-50 p-4">
                     <p className="text-sm font-medium text-clinical-muted">Final Train Accuracy</p>
                     <p className="mt-2 text-2xl font-semibold text-clinical-ink">
                        {formatPercent(curveInterpretation.finalTrainAccuracy)}
                     </p>
                  </div>
                  <div className="rounded-lg border border-clinical-line bg-slate-50 p-4">
                     <p className="text-sm font-medium text-clinical-muted">Final Validation Accuracy</p>
                     <p className="mt-2 text-2xl font-semibold text-clinical-ink">
                        {formatPercent(curveInterpretation.finalValidationAccuracy)}
                     </p>
                  </div>
                  <div className="rounded-lg border border-clinical-line bg-slate-50 p-4">
                     <p className="text-sm font-medium text-clinical-muted">Best Validation Accuracy</p>
                     <p className="mt-2 text-2xl font-semibold text-clinical-ink">
                        {formatPercent(curveInterpretation.bestValidationAccuracy)}
                     </p>
                  </div>
                  <div className="rounded-lg border border-clinical-line bg-slate-50 p-4">
                     <p className="text-sm font-medium text-clinical-muted">Final Accuracy Gap</p>
                     <p className="mt-2 text-2xl font-semibold text-clinical-ink">
                        {formatPercent(curveInterpretation.accuracyGap)}
                     </p>
                  </div>
               </div>

               <div className="mt-5 grid gap-5 text-sm leading-7 text-clinical-muted lg:grid-cols-2">
                  <p>
                     The curves show a strong improvement after fine-tuning begins. Validation accuracy
                     rises sharply in stage 2 and reaches a best value of{" "}
                     <span className="font-semibold text-clinical-ink">
                        {formatPercent(curveInterpretation.bestValidationAccuracy)}
                     </span>
                     , which means the pretrained ResNet50 features adapted well to the Alzheimer MRI
                     classes.
                  </p>
                  <p>
                     There is also an overfitting signal near the end of training: final training accuracy
                     is{" "}
                     <span className="font-semibold text-clinical-ink">
                        {formatPercent(curveInterpretation.finalTrainAccuracy)}
                     </span>
                     , while final validation accuracy is{" "}
                     <span className="font-semibold text-clinical-ink">
                        {formatPercent(curveInterpretation.finalValidationAccuracy)}
                     </span>
                     . The final validation loss (
                     <span className="font-semibold text-clinical-ink">
                        {curveInterpretation.finalValidationLoss.toFixed(4)}
                     </span>
                     ) is also much higher than final training loss (
                     <span className="font-semibold text-clinical-ink">
                        {curveInterpretation.finalTrainLoss.toFixed(4)}
                     </span>
                     ).
                  </p>
               </div>

               <div
                  className={`mt-5 rounded-lg border p-4 text-sm leading-6 ${curveInterpretation.hasOverfittingSignal
                        ? "border-amber-200 bg-amber-50 text-amber-900"
                        : "border-teal-200 bg-teal-50 text-teal-900"
                     }`}
               >
                  {curveInterpretation.hasOverfittingSignal
                     ? "Interpretation: the model is not simply underfitting, it learns the training set very strongly and shows moderate overfitting after fine-tuning. The held-out test accuracy is still high, but further work should consider stronger regularization, stricter augmentation, earlier stopping, or a patient/original-image-level split if available."
                     : "Interpretation: the train and validation curves remain close enough that there is no strong overfitting signal from the final epoch gap. Continue validating this with the held-out test set and confusion matrix."}
               </div>
            </Panel>
         ) : null}

         <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Panel className="p-6">
               <h2 className="text-lg font-semibold">Classification Report</h2>
               {metadata.classification_report.length > 0 ? (
                  <div className="mt-5 overflow-x-auto">
                     <table className="min-w-full text-sm">
                        <thead className="text-left text-clinical-muted">
                           <tr>
                              <th className="py-2 pr-4">Class</th>
                              <th className="py-2 pr-4">Precision</th>
                              <th className="py-2 pr-4">Recall</th>
                              <th className="py-2 pr-4">F1</th>
                              <th className="py-2 pr-4">Support</th>
                           </tr>
                        </thead>
                        <tbody>
                           {metadata.classification_report.map((row) => (
                              <tr key={row.class} className="border-t border-clinical-line">
                                 <td className="py-3 pr-4 font-medium">{row.class}</td>
                                 <td className="py-3 pr-4">{metricPercent(row.precision)}</td>
                                 <td className="py-3 pr-4">{metricPercent(row.recall)}</td>
                                 <td className="py-3 pr-4">{metricPercent(row["f1-score"])}</td>
                                 <td className="py-3 pr-4">{metricNumber(row.support)}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               ) : (
                  <div className="mt-5 rounded-lg border border-clinical-line bg-slate-50 p-5 text-sm leading-6 text-clinical-muted">
                     Classification report is pending. It will appear here after the evaluation code writes
                     report rows into model_metadata.json.
                  </div>
               )}
            </Panel>

            <Panel className="p-6">
               <h2 className="text-lg font-semibold">Confusion Matrix</h2>
               {metadata.confusion_matrix.matrix ? (
                  <div className="mt-5">
                     <ConfusionMatrixHeatmap
                        labels={metadata.confusion_matrix.labels}
                        matrix={metadata.confusion_matrix.matrix}
                     />
                  </div>
               ) : (
                  <div className="mt-5 rounded-lg border border-clinical-line bg-slate-50 p-5 text-sm leading-6 text-clinical-muted">
                     Confusion matrix is pending. The final matrix will be read from the metadata endpoint
                     after test-set inference is complete.
                  </div>
               )}
            </Panel>
         </div>

         <Panel className="mt-8 p-6">
            <h2 className="text-lg font-semibold">Citations</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
               {background.citations.map((citation) => (
                  <a
                     key={citation.label}
                     className="rounded-lg border border-clinical-line bg-slate-50 p-4 transition hover:border-clinical-blue hover:bg-blue-50"
                     href={citation.url}
                     rel="noreferrer"
                     target="_blank"
                  >
                     <p className="text-xs font-semibold uppercase tracking-wide text-clinical-teal">
                        {citation.label}
                     </p>
                     <p className="mt-2 font-semibold text-clinical-ink">{citation.title}</p>
                     <p className="mt-1 text-sm text-clinical-muted">{citation.organization}</p>
                     <p className="mt-3 text-xs text-clinical-muted">Accessed {citation.accessed}</p>
                  </a>
               ))}
            </div>
         </Panel>

         <div className="mt-8">
            <ResearchDisclaimer />
         </div>
      </div>
   );
}
