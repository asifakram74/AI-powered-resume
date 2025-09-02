"use client";

import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CVData } from "@/types/cv-data";
import { toast } from "sonner"
import { callNodeApi } from "@/lib/config/api";

// Helper function to remove duplicates from an array
const removeDuplicates = (arr: string[]): string[] => {
  return [...new Set(arr)];
};

interface PDFUploaderProps {
  onDataExtracted: (data: Partial<Omit<CVData, "id" | "createdAt">>) => void;
}

const PDFUploader = ({ onDataExtracted }: PDFUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pdfjs, setPdfjs] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
        setPdfjs(pdfjsLib);
      });
    }
  }, []);

  useEffect(() => {
    if (file && pdfjs) {
      extractDataFromPDF();
    }
  }, [file, pdfjs]);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast("Please select a PDF file");
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

  const sendToDeepSeek = async (text: string): Promise<Partial<Omit<CVData, "id" | "createdAt">>> => {
    try {
      const response = await callNodeApi.post('/api/parse-resume', {
        extractedText: text,
      });
  
      if (!response.ok) {
        throw new Error("Failed to analyze with DeepSeek");
      }
  
      const result = await response.json();
      
      // Log the raw DeepSeek response
      console.log('Raw DeepSeek Response:', JSON.stringify(result, null, 2));
      
      // Transform the API response into our CVData format
      const transformedData: Partial<Omit<CVData, "id" | "createdAt">> = {
        personalInfo: {
          fullName: result.personalInfo?.fullName || "",
          jobTitle: result.personalInfo?.jobTitle || "",
          email: result.personalInfo?.email || "",
          phone: result.personalInfo?.phone || "",
          address: result.personalInfo?.address || "",
          city: result.personalInfo?.city || "",
          country: result.personalInfo?.country || "",
          profilePicture: result.personalInfo?.profilePicture || "",
          summary: result.personalInfo?.summary || "",
          linkedin: result.personalInfo?.linkedin || "",
          github: result.personalInfo?.github || "",
        },
        experience: Array.isArray(result.experience) 
          ? result.experience.map((exp: any, index: number) => ({
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
        education: Array.isArray(result.education)
          ? result.education.map((edu: any, index: number) => ({
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
          technical: Array.isArray(result.skills?.technical) 
            ? removeDuplicates(result.skills.technical) 
            : [],
          soft: Array.isArray(result.skills?.soft) 
            ? removeDuplicates(result.skills.soft) 
            : [],
        },
        languages: Array.isArray(result.languages)
          ? result.languages.map((lang: any, index: number) => ({
              id: index.toString(),
              name: lang.name || "",
              proficiency: lang.proficiency || "Intermediate",
            }))
          : [],
        certifications: Array.isArray(result.certifications)
          ? result.certifications.map((cert: any, index: number) => ({
              id: index.toString(),
              title: cert.title || "",
              issuingOrganization: cert.issuingOrganization || "",
              dateObtained: cert.dateObtained || "",
              verificationLink: cert.verificationLink || "",
            }))
          : [],
        projects: Array.isArray(result.projects)
          ? result.projects.map((project: any, index: number) => ({
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
          interests: Array.isArray(result.additional?.interests) ? result.additional.interests : [],
        },
      };
  
      // Log the transformed data
      console.log('Transformed Data:', JSON.stringify(transformedData, null, 2));
      
      return transformedData;
    } catch (error) {
      console.error("DeepSeek analysis error:", error);
      throw error;
    }
  };
  const extractDataFromPDF = async () => {
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

      // Log the extracted PDF text
      console.log('Extracted PDF Text:', fullText);

      // Send to DeepSeek for advanced parsing
      const deepSeekData = await sendToDeepSeek(fullText);
      onDataExtracted(deepSeekData);
      toast.success("Data extracted and analyzed successfully!");
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error("Error processing PDF. Please try again.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-2">
      <Card
        className={cn(
          "border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer",
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

        <div className="flex flex-col items-center">
          {file ? (
            <>
              <FileText className="h-3 w-3 text-green-600" />
              <div className="">
                <p className="text-xs font-medium text-green-700">PDF Uploaded Successfully</p>
                <p className="text-xs text-muted-foreground">{file.name}</p>
              </div>
              {isExtracting && (
                <div className="mt-2 flex items-center text-sm text-muted-foreground">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Extracting data...
                </div>
              )}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 text-muted-foreground" />
              <div className="">
                <p className="text-sm font-medium">Upload your CV (PDF)</p>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PDFUploader;