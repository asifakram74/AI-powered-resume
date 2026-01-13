// components/PDFUploader.tsx
"use client";

import { useState, useRef } from "react";
import { Card } from "../../components/ui/card";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { nodeApi } from "../../lib/api/index";

interface PDFUploaderProps {
  onExtractedText: (text: string) => void;
  onFileUploaded: (file: File | null) => void;
  className?: string;
}

export const PDFUploader = ({ onExtractedText, onFileUploaded, className }: PDFUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cardHeight = "h-32";

  const resetState = () => {
    setProgress(0);
    setError(null);
    setProcessingStep("");
  };

  const getFriendlyMessage = (value: number) => {
    if (value < 25) return "Getting started with your resume...";
    if (value < 50) return "Reading the document...";
    if (value < 75) return "Extracting text content...";
    if (value < 90) return "Finalizing extraction...";
    return "Almost there!";
  };

  const safeProgress = Math.min(100, Math.max(0, progress));

  const processFile = async (selected: File) => {
    setIsProcessing(true);
    setProgress(5);
    setProcessingStep("Uploading file...");

    try {
      const formData = new FormData();
      formData.append("pdf", selected);

      // Backend text extraction for consistency with Persona uploader
      const extractResponse = await nodeApi.post("/api/extract-pdf-text", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const extractResult = extractResponse.data;
      if (extractResult.error) {
        throw new Error(extractResult.error);
      }

      setProcessingStep("Extracting text...");
      setProgress(85);

      // Complete
      setProcessingStep("Finalizing...");
      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Notify parent
      onExtractedText(extractResult.text || "");
      onFileUploaded(selected);
      toast.success("Resume uploaded successfully!");
    } catch (err) {
      console.error("Error processing PDF:", err);
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      setProgress(0);

      // Helpful error messages similar to Persona uploader
      if (message.includes("timeout")) {
        toast.error("Analysis timed out. Please try again.");
      } else if (message.includes("Upload failed")) {
        toast.error("Failed to upload PDF. Please check file size and format.");
      } else if (message.includes("Network Error")) {
        toast.error("Cannot connect to extraction server. Please start the backend.");
      } else {
        toast.error(`Error: ${message}`);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      resetState();
      processFile(selectedFile);
    } else {
      toast.error("Please select a PDF file");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer",
          cardHeight,
          "flex items-center justify-center",
          isDragOver
            ? "border-emerald-500 bg-emerald-50 scale-[1.02] dark:bg-emerald-900/10"
            : "border-gray-300 dark:border-gray-700",
          file && !isProcessing && !error ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10" : "",
          error ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/20" : "",
          isProcessing
            ? "pointer-events-none border-emerald-300 bg-emerald-50 dark:bg-emerald-900/10"
            : "hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center space-y-2 w-full">
          {error ? (
            <>
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-700">Upload Failed</p>
                <p className="text-xs text-red-600 line-clamp-2">{error}</p>
              </div>
            </>
          ) : file && !isProcessing ? (
            <>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-emerald-700">Ready to Analyze</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[200px]">{file.name}</p>
              </div>
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <div className="space-y-2 w-full max-w-[280px]">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{getFriendlyMessage(safeProgress)}</p>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${safeProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Processing...</span>
                  <span>{Math.round(safeProgress)}%</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <Upload className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-800 dark:text-gray-200">Upload your Resume (PDF)</p>
                <p className="text-xs text-gray-600 dark:text-gray-300">Drag & drop or click to browse</p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PDFUploader;
