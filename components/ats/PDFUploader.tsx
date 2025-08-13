// components/PDFUploader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"

interface PDFUploaderProps {
  onExtractedText: (text: string) => void;
  onFileUploaded: (file: File | null) => void;
  className?: string;
}

export const PDFUploader = ({ 
  onExtractedText, 
  onFileUploaded,
  className 
}: PDFUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pdfjs, setPdfjs] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Dynamically import pdfjs-dist on client side only
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
        setPdfjs(pdfjsLib);
      });
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      onFileUploaded(selectedFile);
    } else {
      toast("Please select a PDF file");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    onFileUploaded(null);
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

  const extractTextFromPDF = async () => {
    if (!file || !pdfjs) return;

    setIsExtracting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      onExtractedText(fullText);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      toast("Error extracting text from PDF. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer relative",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          file ? "border-green-500 bg-green-50" : ""
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        {file && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFile();
            }}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}

        <div className="flex flex-col items-center gap-2">
          {file ? (
            <>
              <FileText className="h-10 w-10 text-green-600" />
              <div className="mt-2">
                <p className="text-sm font-medium text-green-700">PDF Uploaded</p>
                <p className="text-xs text-muted-foreground truncate max-w-xs">{file.name}</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="mt-2">
                <p className="text-sm font-medium">Drag & drop your resume PDF</p>
                <p className="text-xs text-muted-foreground">or click to browse</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {file && (
        <Button
          onClick={extractTextFromPDF}
          disabled={isExtracting || !pdfjs}
          className="w-full"
        >
          {isExtracting ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              Extracting Text...
            </>
          ) : (
            "Extract Text from PDF"
          )}
        </Button>
      )}
    </div>
  );
};