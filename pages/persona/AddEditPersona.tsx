import { useState, useEffect } from "react";
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
import PDFUploader from "./PersonaPDFUploader";

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
  const [linkedInError, setLinkedInError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle LinkedIn OAuth callback - only if we're in a proper routing context
  useEffect(() => {
    // Check if we're in a browser environment and have access to URL parameters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const source = urlParams.get('source');
      const error = urlParams.get('error');
      
      if (source === 'linkedin' && token) {
        handleLinkedInCallback(token);
      } else if (error === 'auth_failed') {
        setLinkedInError('LinkedIn authentication failed. Please try again.');
        setIsConnectingLinkedIn(false);
      }
    }
  }, []);

  const handleLinkedInConnect = async () => {
    setIsConnectingLinkedIn(true);
    setLinkedInError(null);
    
    // Redirect to LinkedIn OAuth
    const apiUrl = process.env.NEXT_PUBLIC_NODEJS_API_URL || 'http://localhost:3001';
    window.location.href = `${apiUrl}/api/linkedin/auth`;
  };

  // Handle LinkedIn callback and convert profile data
  const handleLinkedInCallback = async (token: string) => {
    try {
      setIsConnectingLinkedIn(true);
      const apiUrl = process.env.NEXT_PUBLIC_NODEJS_API_URL || 'http://localhost:3001';
      
      const response = await fetch(`${apiUrl}/api/linkedin/convert-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();
      
      if (result.success) {
        setLinkedInConnected(true);
        setExtractedData(result.data);
        setSelectedOption('linkedin');
        
        // Auto-proceed with LinkedIn data after a brief delay
        setTimeout(() => {
          onOptionSelect('linkedin', result.data);
        }, 1000);
      } else {
        setLinkedInError(result.error || 'Failed to convert LinkedIn profile');
      }
    } catch (error) {
      console.error('LinkedIn callback error:', error);
      setLinkedInError('Failed to process LinkedIn data. Please try again.');
    } finally {
      setIsConnectingLinkedIn(false);
      
      // Clean up URL parameters if we're in a browser environment
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        url.searchParams.delete('source');
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.toString());
      }
    }
  };

  const handleDataExtracted = (data: Partial<Omit<CVData, "id" | "createdAt">>) => {
    setExtractedData(data);
    setIsProcessing(false);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
  };

  const handleContinueWithPDF = () => {
    if (extractedData) {
      onOptionSelect("pdf", extractedData);
    }
  };

  const handleContinueWithLinkedIn = () => {
    if (extractedData) {
      onOptionSelect("linkedin", extractedData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Manual Entry Option */}
        <Card
          className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${selectedOption === "manual"
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
          className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${selectedOption === "pdf"
              ? "border-[#70E4A8]"
              : "hover:border-[#70E4A8]/50 border-gray-200"
            }`}
          onClick={() => setSelectedOption("pdf")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#70E4A8]/20 rounded-lg flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-[#70E4A8]" />
            </div>
            {!isProcessing && (
              <>
                <CardTitle className="text-lg font-rubik text-[#2D3639]">
                  Upload PDF Resume
                </CardTitle>
                <CardDescription className="font-inter text-gray-600">
                  Extract information automatically from your existing resume
                </CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOption === "pdf" ? (
              <>
                <PDFUploader 
                  onDataExtracted={handleDataExtracted}
                  onProcessingStart={handleProcessingStart}
                />
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

        {/* LinkedIn Import Option - Now Functional */}
        <Card 
          className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${
            selectedOption === "linkedin"
              ? "border-[#0067c2]"
              : "hover:border-[#0067c2]/50 border-gray-200"
          } ${isConnectingLinkedIn ? 'opacity-75' : ''}`}
          onClick={() => !isConnectingLinkedIn && setSelectedOption("linkedin")}
        >
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-[#0067c2]/20 rounded-lg flex items-center justify-center mb-3">
              <Linkedin className="h-6 w-6 text-[#0067c2]" />
            </div>
            <CardTitle className="text-lg font-rubik text-[#2D3639]">
              Import from LinkedIn
            </CardTitle>
            <CardDescription className="font-inter text-gray-600">
              Connect your LinkedIn profile to import professional data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkedInError && (
              <div className="flex items-center gap-2 text-sm text-red-600 font-inter bg-red-50 p-2 rounded">
                <AlertCircle className="h-4 w-4" />
                {linkedInError}
              </div>
            )}

            {linkedInConnected && extractedData ? (
              <>
                <div className="flex items-center gap-2 text-sm text-green-600 font-inter bg-green-50 p-2 rounded">
                  <CheckCircle className="h-4 w-4" />
                  LinkedIn profile imported successfully!
                </div>
                <Button
                  className="w-full bg-[#0067c2] hover:bg-[#0067c2]/90 text-white"
                  onClick={handleContinueWithLinkedIn}
                >
                  Continue with LinkedIn Data
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-[#0067c2] hover:bg-[#0067c2]/90 text-white"
                onClick={handleLinkedInConnect}
                disabled={isConnectingLinkedIn}
              >
                {isConnectingLinkedIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Linkedin className="mr-2 h-4 w-4" />
                    Connect LinkedIn
                  </>
                )}
              </Button>
            )}

            <div className="mt-3 text-xs text-gray-500 text-center font-inter">
              {linkedInConnected ? 'Data imported and ready to use' : 'Secure OAuth connection'}
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