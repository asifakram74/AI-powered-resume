"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CVData } from "@/types/cv-data";
import { toast } from "sonner"

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
    // Dynamically import pdfjs-dist on client side only
    if (typeof window !== "undefined") {
      import("pdfjs-dist").then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.js";
        setPdfjs(pdfjsLib);
      });
    }
  }, []);

  useEffect(() => {
    // Automatically extract data when a file is selected and pdfjs is loaded
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

  const parseExtractedText = (text: string): Partial<Omit<CVData, "id" | "createdAt">> => {
    const data: Omit<CVData, "id" | "createdAt"> = {
      personalInfo: {
        fullName: "",
        jobTitle: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        profilePicture: "",
        summary: "",
        linkedin: "",
        github: "",
      },
      experience: [],
      education: [],
      skills: {
        technical: [],
        soft: [],
      },
      languages: [],
      certifications: [],
      projects: [],
      additional: {
        interests: [],
      },
    };

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    // Improved Full Name Extraction: Check first 5 lines for a valid name
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      // Exclude common section headers
      if (/experience|education|skills|summary|projects|certifications|languages/i.test(line)) {
        continue;
      }
      // Match 2 or 3 capitalized words (likely a name)
      const nameMatch = line.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})$/);
      if (nameMatch) {
        data.personalInfo.fullName = nameMatch[1];
        break;
      }
    }

    // Parse personal info (email, phone, job title, linkedin, github)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Email
      if (!data.personalInfo.email) {
        const emailMatch = line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) {
          data.personalInfo.email = emailMatch[0];
          continue;
        }
      }

      // Phone (scan all lines)
      if (!data.personalInfo.phone) {
        const phoneMatch = line.match(/[\+\(]?[0-9][0-9\-\(\)\.\s]{7,}[0-9]/);
        if (phoneMatch) {
          data.personalInfo.phone = phoneMatch[0];
          continue;
        }
      }

      // Job title (often appears near name)
      if (!data.personalInfo.jobTitle) {
        const jobTitleMatch = line.match(/(engineer|developer|manager|consultant|analyst|specialist|director|lead|architect)/i);
        if (jobTitleMatch) {
          data.personalInfo.jobTitle = jobTitleMatch[0];
          continue;
        }
      }

      // LinkedIn (scan all lines)
      if (!data.personalInfo.linkedin) {
        const linkedInMatch = line.match(/linkedin\.com\/in\/[a-zA-Z0-9\-]+/);
        if (linkedInMatch) {
          data.personalInfo.linkedin = linkedInMatch[0];
          continue;
        }
      }

      // GitHub (scan all lines)
      if (!data.personalInfo.github) {
        const githubMatch = line.match(/github\.com\/[a-zA-Z0-9\-]+/);
        if (githubMatch) {
          data.personalInfo.github = githubMatch[0];
          continue;
        }
      }
    }

    // Parse experience
    let inExperience = false;
    let currentExp: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/experience|work history|employment/i)) {
        inExperience = true;
        continue;
      }
      
      if (inExperience) {
        const expMatch = line.match(/(.+?)\s+at\s+(.+?)\s*\((.+?)\s*-\s*(.+?)\)/i);
        if (expMatch) {
          if (currentExp) data.experience.push(currentExp);
          currentExp = {
            id: Date.now().toString() + i,
            jobTitle: expMatch[1].trim(),
            companyName: expMatch[2].trim(),
            location: '',
            startDate: expMatch[3].trim(),
            endDate: expMatch[4].trim(),
            current: expMatch[4].toLowerCase().includes('present'),
            responsibilities: [],
          };
        } else if (currentExp && (line.startsWith('-') || line.startsWith('•'))) {
          currentExp.responsibilities.push(line.replace(/^[-•]\s*/, '').trim());
        }
      }
    }
    if (currentExp) data.experience.push(currentExp);

    // Parse education
    let inEducation = false;
    let currentEdu: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/education|academic background/i)) {
        inEducation = true;
        continue;
      }
      
      if (inEducation) {
        const eduMatch = line.match(/(.+?),\s*(.+?)\s*-\s*(.+?)$/i);
        if (eduMatch) {
          if (currentEdu) data.education.push(currentEdu);
          currentEdu = {
            id: Date.now().toString() + i,
            degree: eduMatch[1].trim(),
            institutionName: eduMatch[2].trim(),
            location: '',
            graduationDate: eduMatch[3].trim(),
            gpa: '',
            honors: '',
            additionalInfo: '',
          };
        }
      }
    }
    if (currentEdu) data.education.push(currentEdu);

    // Parse skills
    let inSkills = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.match(/skills|technical skills|competencies/i)) {
        inSkills = true;
        continue;
      }
      
      if (inSkills) {
        const skills = line.split(/[,;]/).map(s => s.trim()).filter(s => s);
        data.skills.technical.push(...skills);
      }
    }

    return data;
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

      const parsedData = parseExtractedText(fullText);
      onDataExtracted(parsedData);
      toast.success("Data extracted successfully!");
    } catch (error) {
      console.error("Error extracting data from PDF:", error);
      toast.error("Error extracting data from PDF. Please try again.");
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