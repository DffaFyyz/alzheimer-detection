export type PredictionLabel =
  | "MildDemented"
  | "ModerateDemented"
  | "NonDemented"
  | "VeryMildDemented";

export type ModelId = "resnet50";

export type ClassProbabilities = Partial<Record<PredictionLabel, number>>;

export type ExtractedFeatures = Record<string, number>;

export type PredictionResponse = {
  status: string;
  prediction: PredictionLabel;
  confidence: number;
  model?: ModelId | string;
  model_name?: string;
  class_probabilities?: ClassProbabilities;
};
