// app/(dashboard)/ats-checker/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Upload, FileText, Search, AlertTriangle, Target, BarChart3 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { PDFUploader } from "./PDFUploader";

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
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      // Validate the response matches our expected format
      if (!data || typeof data !== 'object' || !('score' in data)) {
        throw new Error("Invalid response format from server");
      }

      setAnalysisResult(data);
    } catch (err: any) {
      console.error("ATS Analysis Error:", err);
      setError(err.message || "Failed to analyze resume. Please try again later.");
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-600 to-teal-600 text-white">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ATS Resume Checker</h1>
            <p className="text-gray-600">Optimize your resume for Applicant Tracking Systems</p>
          </div>
        </div>
      </div>

      {/* Analysis Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <p>Text extracted from resume ({extractedText.length} characters)</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
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
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-center">
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
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  ATS Compatibility Score
                </span>
                <Badge variant={getScoreBadgeVariant(analysisResult.score)} className="text-lg px-3 py-1">
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
                {Object.entries(analysisResult.sections).map(([section, data]) => (
                  <div key={section} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{section}</h4>
                      <p className="text-sm text-gray-600">{data.feedback}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${getScoreColor(data.score)}`}>{data.score}/100</span>
                    </div>
                  </div>
                ))}
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
                    <Badge key={keyword} variant="default" className="bg-green-100 text-green-800">
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
                    <Badge key={keyword} variant="destructive" className="bg-red-100 text-red-800">
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
      )}
    </div>
  );
}