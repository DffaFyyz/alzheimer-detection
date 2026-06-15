import type { PredictionLabel } from "./prediction";

export type NullableMetric = number | null;

export type Citation = {
  label: string;
  organization: string;
  title: string;
  url: string;
  accessed: string;
};

export type ClassDistributionItem = {
  class: PredictionLabel;
  count: number;
  percentage: number;
  fill?: string;
};

export type SplitDistributionItem = {
  class: PredictionLabel;
  train: number;
  validation: number;
  test: number;
};

export type ClassificationReportRow = {
  class: string;
  precision: NullableMetric;
  recall: NullableMetric;
  "f1-score": NullableMetric;
  support: NullableMetric;
};

export type PipelineStep = {
  step: string;
  detail: string;
  output: string;
};

export type ModelMetadata = {
  metadata_source?: "api" | "mock";
  experiment: {
    name: string;
    created_at?: string | null;
    description: string;
    status?: "not_started" | "training" | "metrics_pending" | "complete";
  };
  dataset: {
    dataset_dir?: string | null;
    source_name?: string;
    total_images: number;
    num_classes: number;
    class_names: PredictionLabel[];
    class_distribution: ClassDistributionItem[];
    image_size_summary?: Record<string, string | number | null>[];
  };
  split: {
    strategy: string;
    train_size: number;
    validation_size: number;
    test_size: number;
    split_distribution: SplitDistributionItem[];
  };
  training_data_balance: {
    train_oversampling_enabled: boolean;
    class_weight_enabled: boolean;
    original_train_size: number;
    effective_train_size: number;
  };
  model: {
    architecture: string;
    pretrained_weights: string;
    input_size: [number, number];
    num_classes: number;
    fine_tuning_enabled: boolean;
    fine_tune_layers: number;
    total_params: NullableMetric;
  };
  training_config: {
    batch_size: number;
    stage_1_epochs: number;
    stage_2_epochs: number;
    stage_1_learning_rate: number;
    stage_2_learning_rate: number;
    training_augmentation_enabled: boolean;
    seed: number;
  };
  training_result: {
    stage_1_epochs_ran: NullableMetric;
    stage_2_epochs_ran: NullableMetric;
    total_epochs_ran: NullableMetric;
    best_val_accuracy: NullableMetric;
    best_val_loss: NullableMetric;
    final_train_accuracy: NullableMetric;
    final_val_accuracy: NullableMetric;
    final_train_loss: NullableMetric;
    final_val_loss: NullableMetric;
  };
  test_metrics: {
    accuracy: NullableMetric;
    macro_precision: NullableMetric;
    macro_recall: NullableMetric;
    macro_f1: NullableMetric;
    weighted_f1: NullableMetric;
  };
  classification_report: ClassificationReportRow[];
  confusion_matrix: {
    labels: PredictionLabel[];
    matrix: number[][] | null;
  };
  workflow?: string[];
  pipeline_steps?: PipelineStep[];
  limitations?: string[];
  artifacts?: {
    output_dir: string;
    best_stage_1_model: string;
    best_finetuned_model: string;
    final_model: string;
    accuracy_curve: string;
    loss_curve: string;
    confusion_matrix_image: string;
  };
  background?: {
    problem: string[];
    key_statistics: {
      label: string;
      value: string;
      helper: string;
      citation_label: string;
    }[];
    citations: Citation[];
  };
  environment?: {
    python_version?: string;
    tensorflow_version?: string;
    gpu_available?: boolean;
  };
};

export type MetadataResponse = {
  status?: string;
  metadata?: ModelMetadata;
};
