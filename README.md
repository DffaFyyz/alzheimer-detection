# Alzheimer MRI Classification Workbench

MVP web application for classifying Alzheimer MRI images with a fine-tuned ResNet50 model. The app provides a live detection page, research/EDA insights, training curves, evaluation metrics, and a methodology page explaining the deep learning pipeline.

Author:

```text
Daffa Fayyaz Erzeltra - Binus University
```

## Overview

This project is split into two parts:

- **Frontend:** React + Vite app in this repository.
- **Backend:** Flask API in `/home/erzeltra/daffa/projects/alzheimers-flask`.

The frontend uploads MRI images to the Flask API, receives model predictions, and displays final metadata from `model_metadata.json`.

## Model

The classifier is a **ResNet50** convolutional neural network trained for four Alzheimer MRI dataset classes:

- `MildDemented`
- `ModerateDemented`
- `NonDemented`
- `VeryMildDemented`

Model configuration:

- Architecture: ResNet50
- Pretrained weights: ImageNet
- Input size: `224 x 224`
- Output classes: 4
- Fine-tuning: enabled
- Fine-tuned layers: 30
- Parameters: 23,595,908

Training setup:

- Stage 1: frozen ResNet50 base, classifier head training
- Stage 2: fine-tuning top ResNet50 layers with lower learning rate
- Total epochs ran: 27
- Stage 1 epochs ran: 15
- Stage 2 epochs ran: 12

Final evaluation metrics:

| Metric | Value |
| --- | ---: |
| Accuracy | 93.49% |
| Macro Precision | 94.08% |
| Macro Recall | 93.92% |
| Macro F1 | 93.96% |
| Weighted F1 | 93.47% |
| Best Validation Accuracy | 95.02% |

## Dataset Metadata

The model metadata reports:

- Total images: 33,984
- Classes: 4
- Split strategy: stratified train/validation/test split
- Train size: 23,788
- Validation size: 5,098
- Test size: 5,098

The dataset used by the notebook is the Uraninjo augmented Alzheimer MRI dataset.

## Frontend Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS
- Recharts
- lucide-react

## Frontend Pages

### Home `/`

Shows project overview, model summary, dataset count, class count, live metadata status, test accuracy, and navigation cards.

### Detect `/detect`

Uploads an MRI image and sends it to the Flask prediction endpoint. Displays:

- predicted class
- model confidence
- per-class probabilities
- short explanation of the four output classes

### Research `/research`

Displays EDA and model evaluation content:

- background problem and citations
- dataset class distribution
- train/validation/test split chart
- model configuration
- training configuration
- final evaluation metrics
- training accuracy curve
- training loss curve
- training curve interpretation and overfitting note
- classification report
- heatmap-style confusion matrix

### Pipeline `/pipeline`

Explains the deep learning process:

- dataset EDA
- stratified split
- preprocessing
- frozen-base training
- fine-tuning
- evaluation export
- two-stage training interpretation
- known limitations

## Backend API

The Flask API lives in:

```text
/home/erzeltra/daffa/projects/alzheimers-flask
```

Endpoints:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | API and artifact status |
| `GET` | `/metadata` | Returns `model_metadata.json` |
| `GET` | `/training-history` | Returns per-epoch training history |
| `GET` | `/artifacts/<filename>` | Serves allowed visualization artifacts |
| `POST` | `/predict` | Runs MRI prediction |

### Prediction Request

`POST /predict` expects multipart form data with one file field:

```text
image
```

Example:

```bash
curl -X POST http://localhost:5000/predict \
  -F "image=@/path/to/mri-image.jpg"
```

Example response:

```json
{
  "status": "success",
  "prediction": "VeryMildDemented",
  "confidence": 0.87,
  "model": "resnet50",
  "model_name": "ResNet50",
  "class_probabilities": {
    "MildDemented": 0.08,
    "ModerateDemented": 0.01,
    "NonDemented": 0.04,
    "VeryMildDemented": 0.87
  }
}
```

## Running the Frontend

From this repository:

```bash
cd /home/erzeltra/daffa/projects/alzheimers
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

The frontend defaults to:

```text
http://localhost:5000
```

for Flask API calls. To use another API URL:

```bash
VITE_API_BASE_URL=http://your-api-host:port npm run dev
```

## Running the Flask API

Use your active conda environment.

```bash
cd /home/erzeltra/daffa/projects/alzheimers-flask
pip install -r requirements.txt
python app.py
```

The API runs at:

```text
http://localhost:5000
```

## Important Implementation Notes

The saved Keras model contains a ResNet50 preprocessing `Lambda` layer. Because of that:

- Flask inference passes raw RGB `0-255` pixels after resizing.
- Do not apply ResNet50 preprocessing again in the API unless the model is re-exported without the preprocessing layer.

The Flask loader includes compatibility handling for:

- `preprocess_input` Lambda deserialization
- Keras `quantization_config` keys from newer saved-model configs

If prediction fails during model loading, align the conda environment with the training environment. The metadata reports TensorFlow `2.19.0`.

## Research Disclaimer

This application is for academic and research use only. It is not a certified medical diagnostic system and should not be used as the sole basis for clinical decisions.

## Verification

Current frontend verification:

```bash
npm run build
```

The build passes. Vite may warn about large chunks because Recharts is bundled into the app.
