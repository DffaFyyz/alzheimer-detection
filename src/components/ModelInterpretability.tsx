import { BrainCircuit } from "lucide-react";
import { mockMetadata } from "../data/edaSummary";

export function ModelInterpretability() {
  return (
    <div>
      <div className="flex items-start gap-3">
        <BrainCircuit className="mt-0.5 h-5 w-5 text-clinical-teal" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold">ResNet50 Interpretability</h2>
          <p className="mt-2 text-sm leading-6 text-clinical-muted">
            Classical feature importance is not available for this convolutional model. The MVP is
            prepared for future Grad-CAM or saliency-map artifacts once the final model is exported.
          </p>
        </div>
      </div>
      <div className="mt-5 rounded-lg border border-clinical-line bg-slate-50 p-4 text-sm leading-6 text-clinical-muted">
        Current model: {mockMetadata.model.architecture} with {mockMetadata.model.pretrained_weights}{" "}
        weights and {mockMetadata.dataset.num_classes} output classes.
      </div>
    </div>
  );
}
