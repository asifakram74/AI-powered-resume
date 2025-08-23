"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  Upload,
  FileText,
  Search,
  AlertTriangle,
  Target,
  BarChart3,
  TrendingUp,
  Award,
  Eye,
  Trash2,
  Download,
  Sparkles,
  Briefcase,
  FileCheck,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

import { PDFUploader } from "./PDFUploader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as htmlToImage from "html-to-image";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

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
  const analysisRef = useRef<HTMLDivElement>(null);

  const handleAnalyze = async () => {
    if (!extractedText || !jobDescription.trim()) {
      setError("Please upload a resume and provide a job description");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/ats-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText,
          jobDescription,
        }),
      });

      const data = await response.json().catch(() => {
        throw new Error("Invalid JSON response from server");
      });

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      if (!data || typeof data !== "object" || !("score" in data)) {
        throw new Error("Invalid response format from server");
      }

      setAnalysisResult(data);
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
      const contentWidth = pageWidth - 2 * margin;
      
      // Get the actual height of the content
      const originalHeight = element.scrollHeight;
      const originalWidth = element.scrollWidth;
      
      // Calculate scale to fit content width
      const scale = contentWidth / originalWidth;
      const scaledHeight = originalHeight * scale;
      
      // Create canvas with proper dimensions
      const canvas = document.createElement('canvas');
      canvas.width = originalWidth * 2; // Higher resolution
      canvas.height = originalHeight * 2;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // Scale the context for high resolution
      ctx.scale(2, 2);
      
      // Use html-to-image with better options
      const dataUrl = await htmlToImage.toPng(element, {
        // canvas: canvas,
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        skipFonts: true
      });
      
      // Add first page
      let position = 0;
      let currentPage = 1;
      
      while (position < scaledHeight) {
        if (currentPage > 1) {
          pdf.addPage();
        }
        
        // Calculate how much of the image to show on this page with 4px bottom margin
        const bottomMargin = 4; // 4px bottom margin
        const pageContentHeight = Math.min(pageHeight - 2 * margin - bottomMargin, scaledHeight - position);
        
        pdf.addImage(
          dataUrl,
          'PNG',
          margin,
          margin - position,
          contentWidth,
          scaledHeight,
          undefined,
          'MEDIUM'
        );
        
        position += pageHeight - 2 * margin - bottomMargin;
        currentPage++;
      }
      
      pdf.save("ats-analysis-report.pdf");
      
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#2D3639] font-rubik">
              ATS Resume Checker
            </h1>
            <p className="text-gray-600 font-inter">
              Optimize your resume for Applicant Tracking Systems and land more interviews
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="resumaic-gradient-green hover:opacity-90 hover-lift button-press"
              onClick={() => {
                setIsDialogOpen(true);
                setAnalysisResult(null);
              }}
            >
              <FileCheck className="h-5 w-5 mr-2" />
              Check Resume Now
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
            <DialogHeader>
              <DialogTitle className="font-rubik text-[#2D3639]">
                ATS Resume Analysis
              </DialogTitle>
              <DialogDescription className="font-inter">
                Upload your resume and job description for ATS optimization analysis
              </DialogDescription>
            </DialogHeader>

            {!analysisResult ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-rubik text-[#2D3639]">
                      <FileText className="h-5 w-5 text-[#70E4A8]" />
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

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-rubik text-[#2D3639]">
                      <Briefcase className="h-5 w-5 text-[#70E4A8]" />
                      Job Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label className="font-inter">Paste the job description here *</Label>
                      <Textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the complete job description, including requirements, responsibilities, and company information..."
                        className="min-h-[200px] resize-none font-inter" style={{ wordBreak: 'break-all' }}
                      />
                      <p className="text-sm text-gray-500 font-inter">
                        Include as much detail as possible for a more tailored analysis
                      </p>

                      {jobDescription.trim().length > 0 && (() => {
                        const input = jobDescription.trim();

                        if (input.length < 30) {
                          return <p className="text-sm text-red-600 font-inter">Job description must be at least 30 characters long.</p>;
                        }

                        if (input.split(/\s+/).length < 3) {
                          return <p className="text-sm text-red-600 font-inter">Please provide at least 3 words.</p>;
                        }

                        if (/^\d+$/.test(input)) {
                          return <p className="text-sm text-red-600 font-inter">Job description cannot be only numbers.</p>;
                        }

                        if (/^[^a-zA-Z0-9]+$/.test(input)) {
                          return <p className="text-sm text-red-600 font-inter">Job description cannot be only special characters.</p>;
                        }

                        return null;
                      })()}
                    </div>
                  </CardContent>
                </Card>

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded font-inter">
                    {error}
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={
                      !extractedText || !jobDescription.trim() || isAnalyzing
                    }
                    className="resumaic-gradient-green hover:opacity-90 button-press px-8 py-3"
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
                </div>
              </div>
            ) : (
              <div>
                <div ref={analysisRef} className="space-y-6">
                  {/* Overall Score */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between font-rubik text-[#2D3639]">
                        <span className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-[#70E4A8]" />
                          ATS Compatibility Score
                        </span>
                        <Badge
                          variant={getScoreBadgeVariant(analysisResult.score)}
                          className="text-lg px-3 py-1 font-inter"
                        >
                          {analysisResult.score}/100
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={analysisResult.score} className="h-3 bg-gray-200">
                        <div 
                          className="h-full resumaic-gradient-green transition-all duration-300" 
                          style={{ width: `${analysisResult.score}%` }}
                        />
                      </Progress>
                      <p className="text-sm text-gray-600 mt-2 font-inter">
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
                      <CardTitle className="font-rubik text-[#2D3639]">Section Analysis</CardTitle>
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
                                <h4 className="font-medium font-rubik text-[#2D3639]">{section}</h4>
                                <p className="text-sm text-gray-600 font-inter">
                                  {data.feedback}
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`font-bold font-rubik ${getScoreColor(data.score)}`}
                                >
                                  {data.score}/100
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#70E4A8] font-rubik">
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
                              className="bg-[#70E4A8]/20 text-[#2D3639] hover:bg-[#70E4A8]/30 font-inter"
                            >
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-[#EA580C] font-rubik">
                          <AlertTriangle className="h-5 w-5" />
                          Missing Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.keywords.missing.map((keyword) => (
                            <Badge
                              key={keyword}
                              variant="outline"
                              className="bg-[#EA580C]/10 text-[#EA580C] border-[#EA580C]/20 hover:bg-[#EA580C]/20 font-inter"
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
                      <CardTitle className="flex items-center gap-2 font-rubik text-[#2D3639]">
                        <Target className="h-5 w-5 text-[#70E4A8]" />
                        Improvement Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {analysisResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-3 p-3 bg-[#70E4A8]/5 rounded-lg">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#70E4A8] text-white text-xs font-bold mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-sm font-inter text-[#2D3639]">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 font-inter border-[#70E4A8]/30 hover:border-[#70E4A8]/50"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="font-inter">
                      <DropdownMenuItem onClick={exportAsPDF}>
                        Export as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportAsDOCX}>
                        Export as DOCX
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    className="resumaic-gradient-green hover:opacity-90 button-press font-inter"
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

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#70E4A8]/20 text-[#70E4A8]">
                <FileCheck className="h-6 w-6" />
              </div>
              <CardTitle className="font-rubik text-[#2D3639]">ATS Compatibility</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-inter">
              Get a detailed score showing how well your resume will perform in
              Applicant Tracking Systems.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#70E4A8]/20 text-[#70E4A8]">
                <Search className="h-6 w-6" />
              </div>
              <CardTitle className="font-rubik text-[#2D3639]">Keyword Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-inter">
              See which keywords from the job description are missing from your
              resume.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#70E4A8]/20 text-[#70E4A8]">
                <Target className="h-6 w-6" />
              </div>
              <CardTitle className="font-rubik text-[#2D3639]">Actionable Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 font-inter">
              Receive personalized suggestions to improve your resume's ATS
              performance.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tips */}
      <Card className="animate-slide-up-delay-3 hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-[#70E4A8]/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-rubik text-[#2D3639]">
            <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Pro Tips for ATS Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "100ms" }}>
              <div className="rounded-full bg-[#70E4A8]/20 p-3 animate-float" style={{ animationDelay: "0s" }}>
                <FileText className="h-5 w-5 text-[#70E4A8]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">Use Standard Sections</h4>
                <p className="text-sm text-gray-600 font-inter">Stick to common section headers like "Experience," "Education," and "Skills"</p>
              </div>
            </div>

            <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "200ms" }}>
              <div className="rounded-full bg-[#EA580C]/20 p-3 animate-float" style={{ animationDelay: "0.5s" }}>
                <Search className="h-5 w-5 text-[#EA580C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">Keyword Optimization</h4>
                <p className="text-sm text-gray-600 font-inter">Include relevant keywords from the job description throughout your resume</p>
              </div>
            </div>

            <div className="flex items-start gap-4 animate-fade-in-stagger" style={{ animationDelay: "300ms" }}>
              <div className="rounded-full bg-[#70E4A8]/20 p-3 animate-float" style={{ animationDelay: "1s" }}>
                <Briefcase className="h-5 w-5 text-[#70E4A8]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] font-rubik">Quantify Achievements</h4>
                <p className="text-sm text-gray-600 font-inter">Use numbers and metrics to demonstrate your impact and accomplishments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
