import type { ModelMetadata } from "../types/metadata";

const classDistribution = [
  { class: "MildDemented", count: 8960, percentage: 26.365348, fill: "#2563EB" },
  { class: "ModerateDemented", count: 6464, percentage: 19.020716, fill: "#DC2626" },
  { class: "NonDemented", count: 9600, percentage: 28.248588, fill: "#0F766E" },
  { class: "VeryMildDemented", count: 8960, percentage: 26.365348, fill: "#7C3AED" },
] as const;

export const mockMetadata: ModelMetadata = {
  metadata_source: "mock",
  experiment: {
    name: "resnet50_uraninjo_augmented",
    created_at: null,
    description: "ResNet50 Alzheimer MRI classification using the Uraninjo augmented dataset.",
    status: "metrics_pending",
  },
  dataset: {
    dataset_dir:
      "/kaggle/input/datasets/uraninjo/augmented-alzheimer-mri-dataset/AugmentedAlzheimerDataset",
    source_name: "Uraninjo Augmented Alzheimer MRI Dataset",
    total_images: 33984,
    num_classes: 4,
    class_names: ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"],
    class_distribution: [...classDistribution],
    image_size_summary: [
      { statistic: "Expected model input", width: 224, height: 224, channels: 3 },
      { statistic: "EDA scan limit", images: 5000, note: "Configured in notebook" },
    ],
  },
  split: {
    strategy: "Stratified train/validation/test split",
    train_size: 23788,
    validation_size: 5098,
    test_size: 5098,
    split_distribution: [
      { class: "MildDemented", train: 6272, validation: 1344, test: 1344 },
      { class: "ModerateDemented", train: 4524, validation: 970, test: 970 },
      { class: "NonDemented", train: 6720, validation: 1440, test: 1440 },
      { class: "VeryMildDemented", train: 6272, validation: 1344, test: 1344 },
    ],
  },
  training_data_balance: {
    train_oversampling_enabled: false,
    class_weight_enabled: false,
    original_train_size: 23788,
    effective_train_size: 23788,
  },
  model: {
    architecture: "ResNet50",
    pretrained_weights: "ImageNet",
    input_size: [224, 224],
    num_classes: 4,
    fine_tuning_enabled: true,
    fine_tune_layers: 30,
    total_params: null,
  },
  training_config: {
    batch_size: 32,
    stage_1_epochs: 15,
    stage_2_epochs: 35,
    stage_1_learning_rate: 0.0001,
    stage_2_learning_rate: 0.00001,
    training_augmentation_enabled: false,
    seed: 42,
  },
  training_result: {
    stage_1_epochs_ran: null,
    stage_2_epochs_ran: null,
    total_epochs_ran: null,
    best_val_accuracy: null,
    best_val_loss: null,
    final_train_accuracy: null,
    final_val_accuracy: null,
    final_train_loss: null,
    final_val_loss: null,
  },
  test_metrics: {
    accuracy: null,
    macro_precision: null,
    macro_recall: null,
    macro_f1: null,
    weighted_f1: null,
  },
  classification_report: [],
  confusion_matrix: {
    labels: ["MildDemented", "ModerateDemented", "NonDemented", "VeryMildDemented"],
    matrix: null,
  },
  workflow: [
    "Upload a brain MRI image through the detection page.",
    "Decode and resize the image to the ResNet50 input size.",
    "Apply the same preprocessing used during model training.",
    "Run the trained ResNet50 classifier through the Flask API.",
    "Return the predicted Alzheimer MRI class, confidence, and per-class probabilities.",
  ],
  pipeline_steps: [
    {
      step: "Dataset EDA",
      detail: "Count images per class, inspect image dimensions, and confirm the four-class label structure.",
      output: "class_distribution.csv",
    },
    {
      step: "Stratified Split",
      detail: "Split images into train, validation, and test sets while preserving class ratios.",
      output: "train_df, val_df, test_df",
    },
    {
      step: "Preprocessing",
      detail: "Resize MRI images to 224 x 224, decode color channels, batch data, and apply ResNet preprocessing.",
      output: "tf.data.Dataset",
    },
    {
      step: "Frozen Training",
      detail: "Train a classification head on top of an ImageNet-pretrained ResNet50 base.",
      output: "best_model_stage_1.keras",
    },
    {
      step: "Fine-Tuning",
      detail: "Unfreeze the last 30 ResNet50 layers while keeping BatchNorm stable, then continue training at a lower learning rate.",
      output: "best_model_finetuned.keras",
    },
    {
      step: "Evaluation Export",
      detail: "Evaluate on the held-out test set and export metrics, confusion matrix, curves, predictions, and metadata.",
      output: "model_metadata.json",
    },
  ],
  limitations: [
    "The current dataset is pre-augmented, so an image-level split can overestimate real generalization if transformed versions of one original MRI appear in different splits.",
    "The MVP is a research interface only. Alzheimer diagnosis requires clinical context, cognitive assessment, laboratory tests, and professional review.",
    "The model is trained on 2D MRI images, so it does not represent the full information available in a complete volumetric MRI study.",
    "Evaluation metrics are intentionally shown as pending until the final notebook run exports model_metadata.json.",
  ],
  artifacts: {
    output_dir: "/kaggle/working/resnet50_uraninjo_augmented",
    best_stage_1_model: "best_model_stage_1.keras",
    best_finetuned_model: "best_model_finetuned.keras",
    final_model: "final_resnet50_augmented_alzheimer.keras",
    accuracy_curve: "accuracy_curve.png",
    loss_curve: "loss_curve.png",
    confusion_matrix_image: "confusion_matrix.png",
  },
  background: {
    problem: [
      "Dementia is a progressive decline in memory, thinking, and daily functioning. Alzheimer disease is the most common form of dementia, so image-based research around Alzheimer-related brain changes is clinically relevant but must be interpreted carefully.",
      "Brain imaging is only one part of an Alzheimer workup. Clinical diagnosis combines medical history, neurological and cognitive assessment, brain imaging, and biomarker or laboratory testing when appropriate.",
      "This MVP demonstrates how a convolutional neural network can classify MRI images into four dataset labels: NonDemented, VeryMildDemented, MildDemented, and ModerateDemented.",
      "The goal is to make the model workflow inspectable before the final model is ready: users can review dataset balance, preprocessing, training configuration, pending metrics, and later the exported evaluation artifacts from model_metadata.json.",
    ],
    key_statistics: [
      {
        label: "Global dementia burden",
        value: "57M",
        helper: "People had dementia worldwide in 2021.",
        citation_label: "WHO 2025",
      },
      {
        label: "New cases each year",
        value: "~10M",
        helper: "Nearly 10 million new dementia cases occur annually.",
        citation_label: "WHO 2025",
      },
      {
        label: "Alzheimer share",
        value: "60-70%",
        helper: "Estimated contribution of Alzheimer disease among dementia cases.",
        citation_label: "WHO 2025",
      },
      {
        label: "U.S. prevalence",
        value: "7.4M",
        helper: "Americans age 65+ estimated to be living with Alzheimer's in 2026.",
        citation_label: "AA 2026",
      },
    ],
    citations: [
      {
        label: "WHO 2025",
        organization: "World Health Organization",
        title: "Dementia fact sheet",
        url: "https://www.who.int/news-room/fact-sheets/detail/dementia",
        accessed: "2026-06-15",
      },
      {
        label: "AA 2026",
        organization: "Alzheimer's Association",
        title: "Alzheimer's Disease Facts and Figures",
        url: "https://www.alz.org/alzheimers-dementia/facts-figures",
        accessed: "2026-06-15",
      },
      {
        label: "AA Diagnosis",
        organization: "Alzheimer's Association",
        title: "Medical Tests for Diagnosing Alzheimer's",
        url: "https://www.alz.org/alzheimers-dementia/diagnosis/medical_tests",
        accessed: "2026-06-15",
      },
    ],
  },
  environment: {
    python_version: "3.12.13",
    tensorflow_version: "2.19.0",
    gpu_available: true,
  },
};

export const edaSummary = mockMetadata;
