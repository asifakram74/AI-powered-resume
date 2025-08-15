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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
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
      const dataUrl = await htmlToImage.toPng(analysisRef.current);
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("ats-analysis-report.pdf");
    } catch (error) {
      console.error("Error exporting as PDF:", error);
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
    <div className="max-w-7xl mx-auto space-y-8 p-6">=
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
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-teal-500/20 transition-all duration-300"
                >
                  <FileCheck className="h-5 w-5 mr-2" />
                  Check Resume Now
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
                <DialogHeader>
                  <DialogTitle>ATS Resume Analysis</DialogTitle>
                  <DialogDescription>
                    Upload your resume and job description for ATS optimization
                    analysis
                  </DialogDescription>
                </DialogHeader>

                {!analysisResult ? (
                  <div className="space-y-6">
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
                        {extractedText && (
                          <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                            <p>
                              Text extracted from resume ({extractedText.length}{" "}
                              characters)
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Briefcase className="h-5 w-5" />
                          Job Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          className="min-h-[200px]"
                        />
                      </CardContent>
                    </Card>

                    {error && (
                      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                      </div>
                    )}

                    <div className="flex justify-center">
                      <Button
                        onClick={handleAnalyze}
                        disabled={
                          !extractedText || !jobDescription.trim() || isAnalyzing
                        }
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
                          <Progress value={analysisResult.score} className="h-3" />
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
                                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                  <div>
                                    <h4 className="font-medium">{section}</h4>
                                    <p className="text-sm text-gray-600">
                                      {data.feedback}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span
                                      className={`font-bold ${getScoreColor(
                                        data.score
                                      )}`}
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

                    <div className="flex justify-end gap-2 mt-4">
                      {/* Export Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex items-center gap-2"
                          >
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

                      {/* Close Analysis Button */}
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

      {/* Tips Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <TrendingUp className="h-6 w-6 text-teal-600" />
            ATS Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="rounded-full bg-green-100 p-3 flex-shrink-0">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-lg text-gray-900 mb-2">
                  Keyword Optimization
                </h4>
                <p className="text-gray-600">
                  Include relevant keywords from the job description throughout
                  your resume, especially in skills and experience sections.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="rounded-full bg-teal-100 p-3 flex-shrink-0">
                <Award className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h4 className="font-medium text-lg text-gray-900 mb-2">
                  Simple Formatting
                </h4>
                <p className="text-gray-600">
                  Use clean, simple formatting with standard fonts (Arial, Calibri,
                  Times New Roman) and avoid tables, columns, and graphics.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="rounded-full bg-blue-100 p-3 flex-shrink-0">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-lg text-gray-900 mb-2">
                  Quantify Achievements
                </h4>
                <p className="text-gray-600">
                  Include numbers and metrics to show impact (e.g., "Increased
                  sales by 30%" instead of "Increased sales").
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA Section */}
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Optimize Your Resume?
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Get past applicant tracking systems and increase your chances of landing
          interviews with our comprehensive analysis.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-8 py-6 text-lg shadow-lg hover:shadow-teal-500/30"
            >
              <FileCheck className="h-5 w-5 mr-2" />
              Check My Resume Now
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
}