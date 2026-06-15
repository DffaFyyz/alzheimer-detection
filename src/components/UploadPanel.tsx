import { FileImage, RefreshCw, Upload } from "lucide-react";
import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { formatFileSize } from "../lib/format";

type UploadPanelProps = {
  file: File | null;
  imageUrl: string | null;
  isLoading: boolean;
  onFileChange: (file: File) => void;
  onAnalyze: () => void;
  onReset: () => void;
};

export function UploadPanel({
  file,
  imageUrl,
  isLoading,
  onFileChange,
  onAnalyze,
  onReset,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFiles(files: FileList | null) {
    const nextFile = files?.[0];
    if (nextFile) onFileChange(nextFile);
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFiles(event.target.files);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  }

  return (
    <div className="space-y-5">
      <div
        className={`rounded-lg border-2 border-dashed p-5 transition ${
          isDragging ? "border-clinical-blue bg-blue-50" : "border-clinical-line bg-slate-50"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={onDrop}
      >
        <input
          accept="image/*"
          className="sr-only"
          disabled={isLoading}
          onChange={onInputChange}
          ref={inputRef}
          type="file"
        />

        {imageUrl && file ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-clinical-line bg-white">
              <img className="max-h-80 w-full object-contain" src={imageUrl} alt="Selected MRI" />
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-white p-3">
              <FileImage className="h-5 w-5 flex-none text-clinical-blue" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-clinical-ink">{file.name}</p>
                <p className="text-sm text-clinical-muted">{formatFileSize(file.size)}</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            className="flex w-full flex-col items-center justify-center gap-3 px-4 py-10 text-center"
            disabled={isLoading}
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-clinical-blue">
              <Upload className="h-6 w-6" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-base font-semibold text-clinical-ink">
                Upload an MRI image
              </span>
              <span className="mt-1 block text-sm text-clinical-muted">
                Drag and drop an image here, or select one from your device.
              </span>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-clinical-blue px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={!file || isLoading}
          onClick={onAnalyze}
          type="button"
        >
          {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {isLoading ? "Analyzing..." : "Analyze MRI"}
        </button>
        <button
          className="inline-flex items-center justify-center rounded-lg border border-clinical-line px-4 py-3 text-sm font-semibold text-clinical-ink transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={!file || isLoading}
          onClick={onReset}
          type="button"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
