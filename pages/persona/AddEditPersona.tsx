"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  FileText,
  Upload,
  Linkedin,
  CheckCircle,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { CVData } from "../../types/cv-data";
import PDFUploader  from "./PersonaPDFUploader";

interface PersonaCreationOptionsProps {
  onOptionSelect: (
    option: "manual" | "pdf" | "linkedin",
    data?: Partial<Omit<CVData, "id" | "createdAt">>
  ) => void;
}

export function PersonaCreationOptions({
  onOptionSelect,
}: PersonaCreationOptionsProps) {
  const [isConnectingLinkedIn, setIsConnectingLinkedIn] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"manual" | "pdf" | "linkedin">("manual");
  const [extractedData, setExtractedData] = useState<Partial<Omit<CVData, "id" | "createdAt">> | null>(null);

  const handleLinkedInConnect = async () => {
    setIsConnectingLinkedIn(true);
    setTimeout(() => {
      setLinkedInConnected(true);
      setIsConnectingLinkedIn(false);
    }, 2000);
  };

  const handleDataExtracted = (data: Partial<Omit<CVData, "id" | "createdAt">>) => {
    setExtractedData(data);
  };

  const handleContinueWithPDF = () => {
    if (extractedData) {
      onOptionSelect("pdf", extractedData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manual Entry Option */}
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${
            selectedOption === "manual" 
              ? "border-[#70E4A8]" 
              : "hover:border-[#70E4A8]/50 border-gray-200"
          }`}
          onClick={() => setSelectedOption("manual")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#70E4A8]/20 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-[#70E4A8]" />
            </div>
            <CardTitle className="text-lg font-rubik text-[#2D3639]">
              Fill Out Form
            </CardTitle>
            <CardDescription className="font-inter text-gray-600">
              Manually enter your information using our comprehensive form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full resumaic-gradient-green hover:opacity-90 hover-lift button-press"
              onClick={() => onOptionSelect("manual")}
            >
              Start Manual Entry
            </Button>
            <div className="mt-3 text-xs text-gray-500 text-center font-inter">
              Most comprehensive control over your data
            </div>
          </CardContent>
        </Card>

        {/* PDF Upload Option */}
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${
            selectedOption === "pdf" 
              ? "border-[#70E4A8]" 
              : "hover:border-[#70E4A8]/50 border-gray-200"
          }`}
          onClick={() => setSelectedOption("pdf")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#70E4A8]/20 rounded-lg flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-[#70E4A8]" />
            </div>
            <CardTitle className="text-lg font-rubik text-[#2D3639]">
              Upload PDF Resume
            </CardTitle>
            <CardDescription className="font-inter text-gray-600">
              Extract information automatically from your existing resume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOption === "pdf" ? (
              <>
                <PDFUploader onDataExtracted={handleDataExtracted} />
                {extractedData && (
                  <Button 
                    className="w-full resumaic-gradient-green hover:opacity-90 hover-lift button-press"
                    onClick={handleContinueWithPDF}
                  >
                    Continue with Extracted Data
                  </Button>
                )}
              </>
            ) : (
              <Button 
                className="w-full resumaic-gradient-green hover:opacity-90 hover-lift button-press"
                onClick={() => setSelectedOption("pdf")}
              >
                Upload PDF
              </Button>
            )}
            <div className="mt-3 text-xs text-gray-500 text-center font-inter">
              AI will extract and organize your information
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Import Option - Upcoming Feature */}
        <Card className="cursor-not-allowed relative overflow-hidden border-2 border-gray-200">
          <div className="absolute top-4 right-4 z-20">
            <span className="inline-flex items-center rounded-md bg-[#EA580C]/20 px-2.5 py-0.5 text-xs font-medium text-[#EA580C] font-inter">
              Coming Soon
            </span>
          </div>
          
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#EA580C]/20 rounded-lg flex items-center justify-center mb-3">
              <Linkedin className="h-6 w-6 text-[#EA580C]" />
            </div>
            <CardTitle className="text-lg font-rubik text-[#2D3639]">
              Import from LinkedIn
            </CardTitle>
            <CardDescription className="font-inter text-gray-600">
              Connect your LinkedIn profile to import professional data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-inter">
              <AlertCircle className="h-4 w-4" />
              Currently in development
            </div>

            <Button
              className="w-full"
              variant="outline"
              disabled={true}
            >
              Connect LinkedIn
            </Button>

            <div className="mt-3 text-xs text-gray-500 text-center font-inter">
              Secure OAuth connection coming soon
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[#70E4A8]/20 border border-[#70E4A8]/30 rounded-lg p-4 animate-fade-in">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-[#70E4A8]/30 p-2">
            <Sparkles className="h-4 w-4 text-[#70E4A8]" />
          </div>
          <div>
            <h4 className="font-medium text-[#2D3639] mb-1 font-rubik">
              What happens next?
            </h4>
            <p className="text-sm text-[#2D3639]/80 font-inter">
              Regardless of the method you choose, you'll see the complete
              persona form with any extracted data pre-filled. You can then
              review, edit, and complete any missing information before
              generating your final AI persona.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonaCreationOptions;