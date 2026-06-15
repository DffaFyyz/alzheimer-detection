import { mockMetadata } from "../data/edaSummary";
import type { MetadataResponse, ModelMetadata } from "../types/metadata";
import type { PredictionResponse } from "../types/prediction";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000";

export type TrainingHistoryPoint = {
  epoch: number;
  accuracy: number;
  loss: number;
  val_accuracy: number;
  val_loss: number;
  stage: string;
};

function hasWrappedMetadata(payload: MetadataResponse | ModelMetadata): payload is MetadataResponse {
  return "metadata" in payload;
}

export async function predictImage(image: File): Promise<PredictionResponse> {
  const formData = new FormData();
  formData.append("image", image);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string"
        ? payload.error
        : "Prediction request failed. Check that the Flask API is running.";
    throw new Error(message);
  }

  return payload as PredictionResponse;
}

export async function fetchModelMetadata(): Promise<ModelMetadata> {
  try {
    const response = await fetch(`${API_BASE_URL}/metadata`);
    const payload = (await response.json().catch(() => null)) as MetadataResponse | ModelMetadata | null;

    if (!response.ok) {
      throw new Error("Metadata request failed.");
    }

    const metadata = payload && hasWrappedMetadata(payload) ? payload.metadata : payload;

    if (!metadata) {
      throw new Error("Metadata response did not include a metadata object.");
    }

    return {
      ...metadata,
      metadata_source: "api",
    };
  } catch {
    return mockMetadata;
  }
}

export async function fetchTrainingHistory(): Promise<TrainingHistoryPoint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/training-history`);
    const payload = (await response.json().catch(() => null)) as
      | { history?: TrainingHistoryPoint[] }
      | null;

    if (!response.ok || !Array.isArray(payload?.history)) {
      return [];
    }

    return payload.history;
  } catch {
    return [];
  }
}

export function getArtifactUrl(filename: string): string {
  return `${API_BASE_URL}/artifacts/${filename}`;
}
