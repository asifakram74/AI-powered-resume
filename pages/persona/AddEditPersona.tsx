"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  Upload,
  Linkedin,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { CVData } from "@/types/cv-data";
import PDFUploader  from "@/pages/persona/PersonaPDFUploader";

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
  // const [selectedOption, setSelectedOption] = useState<"manual" | "pdf" | "linkedin" | null>(null); // Add this state
  const [selectedOption, setSelectedOption] = useState<"manual" | "pdf" | "linkedin">("manual");
  const [extractedData, setExtractedData] = useState<Partial<Omit<CVData, "id" | "createdAt">> | null>(null); // Add this state

  const handleLinkedInConnect = async () => {
    setIsConnectingLinkedIn(true);
    // Simulate LinkedIn connection
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
    console.log(extractedData)


  return (
    <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${
            selectedOption === "manual" 
              ? "border-blue-500" 
              : "hover:border-blue-200"
          }`}
          onClick={() => setSelectedOption("manual")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Fill Out Form</CardTitle>
            <CardDescription>
              Manually enter your information using our comprehensive form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => onOptionSelect("manual")}
            >
              Start Manual Entry
            </Button>
            <div className="mt-3 text-xs text-gray-500 text-center">
              Most comprehensive control over your data
            </div>
          </CardContent>
        </Card>

        {/* PDF Upload Option */}
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${
            selectedOption === "pdf" 
              ? "border-green-500" 
              : "hover:border-green-200"
          }`}
          onClick={() => setSelectedOption("pdf")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">Upload PDF Resume</CardTitle>
            <CardDescription>
              Extract information automatically from your existing resume
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOption === "pdf" ? (
              <>
                <PDFUploader onDataExtracted={handleDataExtracted} />
                {extractedData && (
                  <Button 
                    className="w-full" 
                    onClick={handleContinueWithPDF}
                  >
                    Continue with Extracted Data
                  </Button>
                )}
              </>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => setSelectedOption("pdf")}
              >
                Upload PDF
              </Button>
            )}
            <div className="mt-3 text-xs text-gray-500 text-center">
              AI will extract and organize your information
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Import Option - Upcoming Feature */}
        <Card className="cursor-not-allowed relative overflow-hidden">
          {/* Blur overlay */}
          {/* <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10"></div> */}
          
          {/* Upcoming badge */}
          <div className="absolute top-4 right-4 z-20">
            <span className="inline-flex items-center rounded-md bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
              Coming Soon
            </span>
          </div>
          
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Linkedin className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Import from LinkedIn</CardTitle>
            <CardDescription>
              Connect your LinkedIn profile to import professional data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              Currently in development
            </div>

            <Button
              className="w-full"
              variant="secondary"
              disabled={true}
            >
              Connect LinkedIn
            </Button>

            <div className="mt-3 text-xs text-gray-500 text-center">
              Secure OAuth connection coming soon
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-1">
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">
              What happens next?
            </h4>
            <p className="text-sm text-blue-700">
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