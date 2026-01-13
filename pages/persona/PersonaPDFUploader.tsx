"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import type { CVData } from "../../types/cv-data";
import { toast } from "sonner";
import { nodeApi } from "../../lib/api/index";

// Helper function to remove duplicates from an array
const removeDuplicates = (arr: string[]): string[] => {
  return [...new Set(arr)];
};

interface PDFUploaderProps {
  onDataExtracted: (data: Partial<Omit<CVData, "id" | "createdAt">>) => void;
  onProcessingStart?: () => void;
}

const PDFUploader = ({ onDataExtracted, onProcessingStart }: PDFUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compact height for better UX
  const cardHeight = "h-auto min-h-[5rem]";

  // Simulate progress updates with proper limits
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    
    if (isProcessing && progress < 95) { // Stop at 95% until final completion
      progressInterval = setInterval(() => {
        setProgress(prev => {
          // Slow down progress as it gets closer to 95%
          if (prev >= 85) return prev + 0.3;
          if (prev >= 70) return prev + 0.8;
          if (prev >= 50) return prev + 1.2;
          return prev + 2;
        });
      }, 500);
    }

    return () => {
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [isProcessing, progress]);

  const resetState = () => {
    setProgress(0);
    setError(null);
    setProcessingStep("");
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

  const getStepDescription = (step: string) => {
    const stepDescriptions: { [key: string]: string } = {
      "Uploading file...": "Securely transferring your resume...",
      "Extracting text...": "Reading text content...",
      "Analyzing with AI...": "Analyzing skills & experience...",
      "Organizing data...": "Structuring information...",
      "Finalizing...": "Almost done..."
    };
    return stepDescriptions[step] || "Processing...";
  };

  const getFriendlyMessage = (progress: number) => {
    if (progress < 25) return "Starting...";
    if (progress < 50) return "Reading details...";
    if (progress < 75) return "Analyzing...";
    if (progress < 90) return "Finalizing...";
    return "Done!";
  };

  // Ensure progress never exceeds 100%
  const safeProgress = Math.min(100, Math.max(0, progress));

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setProgress(5); // Start with 5% immediately
    
    // Notify parent that processing has started
    if (onProcessingStart) {
      onProcessingStart();
    }
    
    try {
      // Step 1: Upload file and extract text
      setProcessingStep("Uploading file...");
      setProgress(15);
      
      const formData = new FormData();
      formData.append('pdf', file);

      const extractResponse = await nodeApi.post('/api/extract-pdf-text', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const extractResult = extractResponse.data;
      
      if (extractResult.error) {
        throw new Error(extractResult.error);
      }

      console.log('Text extraction successful:', {
        textLength: extractResult.text.length,
        pages: extractResult.metadata?.pages,
        truncated: extractResult.metadata?.truncated
      });

      // Step 2: Extract text from PDF
      setProcessingStep("Extracting text...");
      setProgress(40);
      
      // Step 3: Analyze with AI
      setProcessingStep("Analyzing with AI...");
      setProgress(60);
      
      const parseResponse = await nodeApi.post('/api/parse-resume', {
        extractedText: extractResult.text,
      });

      const parseResult = parseResponse.data;

      if (parseResult.error) {
        throw new Error(parseResult.error);
      }

      // Step 4: Organizing data
      setProcessingStep("Organizing data...");
      setProgress(85);

      // Transform the API response into our CVData format
      const transformedData: Partial<Omit<CVData, "id" | "createdAt">> = {
        personalInfo: {
          fullName: parseResult.personalInfo?.fullName || "",
          jobTitle: parseResult.personalInfo?.jobTitle || "",
          email: parseResult.personalInfo?.email || "",
          phone: parseResult.personalInfo?.phone || "",
          address: parseResult.personalInfo?.address || "",
          city: parseResult.personalInfo?.city || "",
          country: parseResult.personalInfo?.country || "",
          profilePicture: parseResult.personalInfo?.profilePicture || "",
          summary: parseResult.personalInfo?.summary || "",
          linkedin: parseResult.personalInfo?.linkedin || "",
          github: parseResult.personalInfo?.github || "",
        },
        experience: Array.isArray(parseResult.experience)
          ? parseResult.experience.map((exp: any, index: number) => ({
            id: index.toString(),
            jobTitle: exp.jobTitle || "",
            companyName: exp.companyName || "",
            location: exp.location || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            current: exp.current || false,
            responsibilities: exp.responsibilities || [],
          }))
          : [],
        education: Array.isArray(parseResult.education)
          ? parseResult.education.map((edu: any, index: number) => ({
            id: index.toString(),
            degree: edu.degree || "",
            institutionName: edu.institutionName || "",
            location: edu.location || "",
            graduationDate: edu.graduationDate || "",
            gpa: edu.gpa || "",
            honors: edu.honors || "",
            additionalInfo: edu.additionalInfo || "",
          }))
          : [],
        skills: {
          technical: Array.isArray(parseResult.skills?.technical)
            ? removeDuplicates(parseResult.skills.technical)
            : [],
          soft: Array.isArray(parseResult.skills?.soft)
            ? removeDuplicates(parseResult.skills.soft)
            : [],
        },
        languages: Array.isArray(parseResult.languages)
          ? parseResult.languages.map((lang: any, index: number) => ({
            id: index.toString(),
            name: lang.name || "",
            proficiency: lang.proficiency || "Intermediate",
          }))
          : [],
        certifications: Array.isArray(parseResult.certifications)
          ? parseResult.certifications.map((cert: any, index: number) => ({
            id: index.toString(),
            title: cert.title || "",
            issuingOrganization: cert.issuingOrganization || "",
            dateObtained: cert.dateObtained || "",
            verificationLink: cert.verificationLink || "",
          }))
          : [],
        projects: Array.isArray(parseResult.projects)
          ? parseResult.projects.map((project: any, index: number) => ({
            id: index.toString(),
            name: project.name || "",
            role: project.role || "Developer",
            description: project.description || "",
            technologies: Array.isArray(project.technologies) ? project.technologies : [],
            liveDemoLink: project.liveDemoLink || "",
            githubLink: project.githubLink || "",
          }))
          : [],
        additional: {
          interests: Array.isArray(parseResult.additional?.interests) ? parseResult.additional.interests : [],
        },
      };

      console.log('Data transformation successful:', transformedData);
      
      // Final step - set to 100% directly to avoid overshooting
      setProcessingStep("Finalizing...");
      setProgress(100);
      
      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 500));
      
      onDataExtracted(transformedData);
      toast.success("Resume analyzed successfully!");
      
    } catch (error) {
      console.error("Error processing PDF:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      setProgress(0);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          toast.error("Analysis timed out. Please try again.");
        } else if (error.message.includes('Upload failed')) {
          toast.error("Failed to upload PDF. Please check file size and format.");
        } else if (error.message.includes('Analysis failed')) {
          toast.error("AI analysis failed. Please try again.");
        } else if (error.message.includes('Network Error')) {
          toast.error("Cannot connect to resume analysis server. Please start the backend.");
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  return (
    <div className="space-y-2">
      {/* Main Upload Card - Compact Design */}
      <Card
        className={cn(
          "border border-dashed transition-all duration-200 cursor-pointer overflow-hidden",
          cardHeight,
          "flex items-center justify-center",
          isDragOver
            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
            : "border-gray-200 dark:border-gray-800 hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10",
          file && !isProcessing && !error ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10" : "",
          error ? "border-red-300 bg-red-50/50 dark:border-red-700 dark:bg-red-950/20" : "",
          isProcessing ? "pointer-events-none border-emerald-300 bg-emerald-50/30 dark:bg-emerald-900/10" : ""
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

        <div className="w-full px-4 py-3">
          {error ? (
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Upload Failed</p>
                <p className="text-xs opacity-90 truncate">{error}</p>
              </div>
            </div>
          ) : file && !isProcessing ? (
            <div className="flex items-center space-x-3 text-emerald-700">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Ready to Analyze</p>
                <p className="text-xs opacity-90 truncate">{file.name}</p>
              </div>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center space-x-3 w-full">
              <Loader2 className="h-5 w-5 text-emerald-600 animate-spin flex-shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-gray-700 dark:text-gray-200 truncate mr-2">{getFriendlyMessage(safeProgress)}</span>
                  <span className="text-gray-500 dark:text-gray-400 tabular-nums">{Math.round(safeProgress)}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${safeProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-3 py-1">
              <div className="p-2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/20 flex-shrink-0">
                <Upload className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Upload CV (PDF)</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  Drag & drop or click
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PDFUploader;
