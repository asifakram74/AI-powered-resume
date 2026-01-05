"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  CheckCircle,
  FileText,
  Search,
  AlertTriangle,
  Target,
  BarChart3,
  Download,
  Briefcase,
  Save,
  FileCheck,
  Crown,
} from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Progress } from "../../components/ui/progress";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../components/ui/dropdown-menu";
import { toast } from "sonner";
import { PDFUploader } from "./PDFUploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { createATSResume, CreateATSResumeData } from "../../lib/redux/service/atsResumeService";
import { useAppSelector } from "../../lib/redux/hooks";
import { createCheckoutSession } from "../../lib/redux/service/paymentService";

interface ATSAnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  keywords: {
    matched: string[];
    missing: string[];
  };
  sections: {
    [key: string]: {
      score: number;
      feedback: string;
    };
  };
}

export default function ATSCheckerPage() {
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const planType = useAppSelector((state) => state.auth.profile?.plan_type || state.auth.user?.plan_type);
  const userRole = useAppSelector((state) => state.auth.user?.role);
  const isAdmin = String(userRole || '').toLowerCase() === 'admin';
  const [freeChecksUsed, setFreeChecksUsed] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const countRaw = window.localStorage.getItem("atsChecksUsed");
      const count = countRaw ? Number(countRaw) : 0;
      setFreeChecksUsed(Number.isNaN(count) ? 0 : count);
    }
  }, []);

  const handleDialogOpenChange = async (open: boolean) => {
    // Allow free users to open the dialog; gating happens on analyze after 3 checks
    setIsDialogOpen(open);
  };

  const handleAnalyze = async () => {
    if (!extractedText || !jobDescription.trim()) {
      setError("Please upload a resume and provide a job description");
      return;
    }

    const isFree = !planType || String(planType).toLowerCase() === "free";
    if (isFree && freeChecksUsed >= 3 && !isAdmin) {
      setIsUpgradeDialogOpen(true);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    console.log('Making request to:', 'https://backendserver.resumaic.com/api/ats-analysis');
    // console.log('Making request to:', 'https://stagingnode.resumaic.com/api/ats-analysis');
    console.log('Request payload size:', JSON.stringify({ extractedText, jobDescription }).length);
    try {
      const testResponse = await fetch('https://backendserver.resumaic.com', { method: 'HEAD' });
      // const testResponse = await fetch('https://stagingnode.resumaic.com', { method: 'HEAD' });
      console.log('Server reachable:', testResponse.ok);
    } catch (testError) {
      console.error('Server not reachable:', testError);
    }
    try {
      const response = await fetch('https://backendserver.resumaic.com/api/ats-analysis', {
      // const response = await fetch('https://stagingnode.resumaic.com/api/ats-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          extractedText,
          jobDescription,
        }),
      });

      // Check if the response is OK
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the response contains an error
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data || typeof data !== "object" || !("score" in data)) {
        throw new Error("Invalid response format from server");
      }

      setAnalysisResult(data);

      // Increment free usage after successful analysis (skip for admins)
      if (isFree && !isAdmin) {
        const newCount = freeChecksUsed + 1;
        setFreeChecksUsed(newCount);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("atsChecksUsed", String(newCount));
        }
      }
    } catch (err: any) {
      console.error("ATS Analysis Error:", err);
      setError(
        err.message || "Failed to analyze resume. Please try again later."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-[#70E4A8]";
    if (score >= 60) return "text-[#EA580C]";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const exportAsPDF = async () => {
    if (!analysisRef.current) return;

    try {
      const element = analysisRef.current;
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // 15mm margins
      const padding = 10; // 10mm padding on each page
      const contentWidth = pageWidth - 2 * margin - 2 * padding;

      // Get the actual height of the content
      const originalHeight = element.scrollHeight;
      const originalWidth = element.scrollWidth;

      // Calculate scale to fit content width
      const scale = contentWidth / originalWidth;
      const scaledHeight = originalHeight * scale;

      // Use html-to-image with better options
      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true,
        width: originalWidth,
        height: originalHeight
      });

      // Calculate available height per page (accounting for margins and padding)
      const availableHeight = pageHeight - 2 * margin - 2 * padding;

      let currentPage = 1;
      let position = 0;

      while (position < scaledHeight) {
        if (currentPage > 1) {
          pdf.addPage();
        }

        // Calculate the crop parameters for this page
        const cropY = (position / scale) * 2; // Convert back to original image coordinates
        const cropHeight = Math.min(availableHeight / scale, originalHeight - cropY / 2) * 2;

        // Create a canvas for this specific page
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = originalWidth * 2;
        pageCanvas.height = cropHeight;
        const pageCtx = pageCanvas.getContext('2d');

        if (!pageCtx) return;

        // Draw only the portion for this page
        const img = new Image();
        img.src = dataUrl;

        await new Promise((resolve) => {
          img.onload = () => {
            pageCtx.drawImage(
              img,
              0, cropY, // source x, y
              originalWidth * 2, cropHeight, // source width, height
              0, 0, // destination x, y
              originalWidth * 2, cropHeight // destination width, height
            );
            resolve(void 0);
          };
        });
        const pageDataUrl = pageCanvas.toDataURL('image/png', 1.0);

        // Add the cropped image to the PDF page
        pdf.addImage(
          pageDataUrl,
          'PNG',
          margin + padding,
          margin + padding,
          contentWidth,
          Math.min(availableHeight, scaledHeight - position),
          undefined,
          'FAST'
        );
        position += availableHeight;
        currentPage++;
      }

      pdf.save("ats-analysis-report.pdf");
      console.log("exported Pdf");

    } catch (error) {
      console.error("Error exporting as PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    }
  };

  const exportAsDOCX = async () => {
    if (!analysisResult) return;

    try {
      const children = [
        new Paragraph({
          text: "ATS Resume Analysis Report",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `Overall ATS Compatibility Score: ${analysisResult.score}/100`,
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text:
                analysisResult.score >= 80
                  ? "Excellent! Your resume is well-optimized for ATS systems."
                  : analysisResult.score >= 60
                    ? "Good! Your resume has room for improvement."
                    : "Needs work. Consider implementing the suggestions below.",
              bold: true,
            }),
          ],
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: "Section Analysis",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        }),
        ...Object.entries(analysisResult.sections).flatMap(
          ([section, data]) => [
            new Paragraph({
              text: section,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: `Score: ${data.score}/100`,
            }),
            new Paragraph({
              text: data.feedback,
              spacing: { after: 100 },
            }),
          ]
        ),
        new Paragraph({
          text: "Keywords Analysis",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "Matched Keywords:",
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          text: analysisResult.keywords.matched.join(", "),
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "Missing Keywords:",
          heading: HeadingLevel.HEADING_3,
        }),
        new Paragraph({
          text: analysisResult.keywords.missing.join(", "),
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: "Improvement Suggestions",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        }),
        ...analysisResult.suggestions.map(
          (suggestion) =>
            new Paragraph({
              text: suggestion,
              bullet: { level: 0 },
            })
        ),
      ];

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ats-analysis-report.docx";
        a.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error("Error exporting as DOCX:", error);
    }
  };

  const handleSaveAnalysis = async () => {
    if (!analysisResult || !resumeFile) return;

    setIsSaving(true);
    try {
      const saveData: CreateATSResumeData = {
        resume_file_path: resumeFile.name, // You might want to handle file upload separately
        job_description: jobDescription,
        analysis_result: JSON.stringify(analysisResult),
      };

      const savedResume = await createATSResume(saveData);
      toast.success("Analysis saved successfully!");
      console.log("Saved ATS resume:", savedResume);
    } catch (error) {
      console.error("Error saving analysis:", error);
      toast.error("Failed to save analysis. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-4 shadow-sm">
            <CheckCircle className="h-5 w-5 text-teal-600 mr-2" />
            <span className="font-medium text-teal-800">
              Professional ATS Optimization Tool
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Optimize Your Resume for <span className="text-teal-600">ATS</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get past applicant tracking systems and land more interviews with our
            AI-powered resume analyzer
          </p>

          <div className="flex justify-center">
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-teal-500/20 transition-all duration-300"
                >
                  <FileCheck className="h-5 w-5 mr-2" />
                  Check Resume Now
                </Button>
              </DialogTrigger>

              <DialogContent
                className="
        w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw]
        !max-w-none max-h-[90vh] overflow-x-auto
      "
              >
                <DialogHeader>
                  <DialogTitle>ATS Resume Analysis</DialogTitle>
                  <DialogDescription>
                    Upload your resume and job description for ATS optimization analysis
                  </DialogDescription>
                </DialogHeader>

                {!analysisResult ? (
                  <div className="space-y-6">
                    {/* Upload Resume */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Upload Resume
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PDFUploader
                          onExtractedText={setExtractedText}
                          onFileUploaded={setResumeFile}
                        />
                      </CardContent>
                    </Card>

                    {/* Job Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Job Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label>Paste the job description here *</Label>
                          <Textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the complete job description, including requirements, responsibilities, and company information..."
                            className="min-h-[200px] resize-none"
                            style={{ wordBreak: "break-all" }}
                          />
                          <p className="text-sm text-gray-500">
                            Include as much detail as possible for a more tailored analysis
                          </p>

                          {/* Validation */}
                          {jobDescription.trim().length > 0 && (() => {
                            const input = jobDescription.trim();

                            if (input.length < 30) {
                              return <p className="text-sm text-red-600">Job description must be at least 30 characters long.</p>;
                            }

                            if (input.split(/\s+/).length < 3) {
                              return <p className="text-sm text-red-600">Please provide at least 3 words.</p>;
                            }

                            if (/^\d+$/.test(input)) {
                              return <p className="text-sm text-red-600">Job description cannot be only numbers.</p>;
                            }

                            if (/^[^a-zA-Z0-9]+$/.test(input)) {
                              return <p className="text-sm text-red-600">Job description cannot be only special characters.</p>;
                            }

                            return null;
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Error */}
                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}

                    {/* Analyze Button */}
                    <div className="flex flex-col items-center">
                      <Button
                        onClick={handleAnalyze}
                        disabled={!extractedText || !jobDescription.trim() || isAnalyzing}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-8 py-3"
                        size="lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Analyzing Resume...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 mr-2" />
                            Analyze Resume
                          </>
                        )}
                      </Button>
                      {(!planType || String(planType).toLowerCase() === "free") && !isAdmin && (
                        <p className="text-sm text-gray-500 mt-2">
                          Free checks remaining: {Math.max(0, 3 - freeChecksUsed)} of 3
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div ref={analysisRef} className="space-y-6">
                      {/* Overall Score */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <BarChart3 className="h-5 w-5" />
                              ATS Compatibility Score
                            </span>
                            <Badge
                              variant={getScoreBadgeVariant(analysisResult.score)}
                              className="text-lg px-3 py-1"
                            >
                              {analysisResult.score}/100
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <Progress value={analysisResult.score} className="h-3">
                            <div
                              className="h-full bg-gradient-to-r from-green-600 to-teal-600 transition-all duration-300"
                              style={{ width: `${analysisResult.score}%` }}
                            />
                          </Progress>
                          <p className="text-sm text-gray-600 mt-2">
                            {analysisResult.score >= 80
                              ? "Excellent! Your resume is well-optimized for ATS systems."
                              : analysisResult.score >= 60
                                ? "Good! Your resume has room for improvement."
                                : "Needs work. Consider implementing the suggestions below."}
                          </p>
                        </CardContent>
                      </Card>

                      {/* Section Scores */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Section Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {Object.entries(analysisResult.sections).map(
                              ([section, data]) => (
                                <div
                                  key={section}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                  <div>
                                    <h4 className="font-medium">{section}</h4>
                                    <p className="text-sm text-gray-600">{data.feedback}</p>
                                  </div>
                                  <div className="text-right">
                                    <span className={`font-bold ${getScoreColor(data.score)}`}>
                                      {data.score}/100
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Keywords */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              Matched Keywords
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.keywords.matched.map((keyword) => (
                                <Badge
                                  key={keyword}
                                  variant="default"
                                  className="bg-green-100 text-green-800"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                              <AlertTriangle className="h-5 w-5" />
                              Missing Keywords
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {analysisResult.keywords.missing.map((keyword) => (
                                <Badge
                                  key={keyword}
                                  variant="destructive"
                                  className="bg-red-100 text-red-800"
                                >
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Suggestions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Improvement Suggestions
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {analysisResult.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-600 mt-1">•</span>
                                <span className="text-sm">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-wrap justify-end gap-2 mt-4">
                      {/* Save */}
                      <Button
                        onClick={handleSaveAnalysis}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                      >
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Analysis
                          </>
                        )}
                      </Button>

                      {/* Export */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={exportAsPDF}>
                            Export as PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportAsDOCX}>
                            Export as DOCX
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Close */}
                      <Button
                        onClick={() => {
                          setAnalysisResult(null);
                          setResumeFile(null);
                          setJobDescription("");
                          setExtractedText("");
                          setIsDialogOpen(false);
                        }}
                      >
                        Close Analysis
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>


      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                <FileCheck className="h-6 w-6" />
              </div>
              <CardTitle>ATS Compatibility</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Get a detailed score showing how well your resume will perform in
              Applicant Tracking Systems.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600">
                <Search className="h-6 w-6" />
              </div>
              <CardTitle>Keyword Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              See which keywords from the job description are missing from your
              resume.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle>Actionable Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Receive personalized suggestions to improve your resume's ATS
              performance.
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Upgrade Dialog for Free Users */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-[520px] border-0 shadow-2xl overflow-hidden">
          <div className="relative">
            <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full blur-3xl opacity-30" />
            <Card className="border-0">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl resumaic-gradient-green flex items-center justify-center text-white shadow-md">
                    <Crown className="h-5 w-5" />
                  </div>
                  <DialogTitle className="text-2xl font-bold text-[#1F2937]">
                    Upgrade to Pro
                  </DialogTitle>
                </div>
                <DialogDescription className="text-[#4B5563]">
                  You have reached the limit of 3 free ATS checks. Upgrade to Pro for unlimited analyses and advanced insights.
                </DialogDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[#70E4A8]/10">
                    <p className="text-sm font-medium text-[#2D3639]">Unlimited ATS analyses</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[#EA580C]/10">
                    <p className="text-sm font-medium text-[#2D3639]">Priority scoring engine</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-100">
                    <p className="text-sm font-medium text-[#2D3639]">Advanced suggestions</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-100">
                    <p className="text-sm font-medium text-[#2D3639]">Keyword matching</p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 resumaic-gradient-orange hover:opacity-90 hover-lift button-press text-white"
                    onClick={async () => {
                      try {
                        await createCheckoutSession();
                      } catch (err) {
                        toast.error("Failed to start checkout. Please try again.");
                      }
                    }}
                  >
                    Upgrade Now
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-[#70E4A8] text-[#2D3639]"
                    onClick={() => setIsUpgradeDialogOpen(false)}
                  >
                    Not Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}