"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "../../components/ui/card";
import { Upload, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import type { CVData } from "../../types/cv-data";
import { toast } from "sonner";

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

  // Fixed height for consistent layout
  const cardHeight = "h-32"; // Fixed height for all states

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
      "Uploading file...": "Securely transferring your resume to our servers...",
      "Extracting text...": "Reading and extracting text content from your PDF...",
      "Analyzing with AI...": "Our AI is analyzing your skills, experience, and qualifications...",
      "Organizing data...": "Structuring your information into a professional format...",
      "Finalizing...": "Almost done! Preparing your resume data..."
    };
    return stepDescriptions[step] || "Processing your resume...";
  };

  const getFriendlyMessage = (progress: number) => {
    if (progress < 25) return "Getting started with your resume...";
    if (progress < 50) return "Reading through your experience and skills...";
    if (progress < 75) return "Analyzing your qualifications in detail...";
    if (progress < 90) return "Putting the final touches...";
    return "Almost there!";
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

      const extractResponse = await fetch(' http://localhost:3001/api/extract-pdf-text', {
        method: 'POST',
        body: formData,
      });

      if (!extractResponse.ok) {
        throw new Error(`Upload failed: ${extractResponse.status}`);
      }

      const extractResult = await extractResponse.json();
      
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
      
      const parseResponse = await fetch(' http://localhost:3001/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractedText: extractResult.text,
        }),
      });

      if (!parseResponse.ok) {
        const errorText = await parseResponse.text();
        throw new Error(`Analysis failed: ${parseResponse.status} - ${errorText}`);
      }

      const parseResult = await parseResponse.json();

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
      {/* Main Upload Card - Fixed Height */}
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer",
          cardHeight, // Fixed height
          "flex items-center justify-center", // Center content vertically
          isDragOver ? "border-emerald-500 bg-emerald-50 scale-[1.02]" : "border-gray-300",
          file && !isProcessing && !error ? "border-emerald-500 bg-emerald-50" : "",
          error ? "border-red-300 bg-red-50" : "",
          isProcessing ? "pointer-events-none border-emerald-300 bg-emerald-50" : "hover:border-emerald-400 hover:bg-emerald-50"
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
                <p className="text-xs text-gray-600 truncate max-w-[200px]">{file.name}</p>
              </div>
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
              <div className="space-y-2 w-full max-w-[280px]">
                <p className="text-xs font-medium text-gray-800">{getFriendlyMessage(safeProgress)}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${safeProgress}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Processing...</span>
                  <span>{Math.round(safeProgress)}%</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-emerald-100">
                <Upload className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-800">Upload your CV (PDF)</p>
                <p className="text-xs text-gray-600">
                  Drag & drop or click to browse
                </p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PDFUploader;