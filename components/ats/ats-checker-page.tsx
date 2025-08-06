"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  Upload,
  FileText,
  Search,
  TrendingUp,
  AlertTriangle,
  Target,
  Award,
  BarChart3,
  Eye,
  Trash2,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getATSResumes,
  createATSResume,
  deleteATSResume,
  type ATSResume,
  type CreateATSResumeData,
} from "@/lib/redux/service/atsResumeService"
import { useAppSelector } from "@/lib/redux/hooks"

interface ATSAnalysisResult {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  keywords: {
    matched: string[]
    missing: string[]
  }
  sections: {
    [key: string]: {
      score: number
      feedback: string
    }
  }
}

export function ATSCheckerPage() {
  const [atsResumes, setATSResumes] = useState<ATSResume[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ATSAnalysisResult | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const fetchATSResumes = async () => {
      try {
        if (!user?.id) {
          console.log("No user ID available - user might not be logged in")
          return
        }
        setIsLoading(true)
        const data = await getATSResumes()
        console.log("Fetched ATS resumes:", data)
        setATSResumes(data)
      } catch (error) {
        console.error("Error fetching ATS resumes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchATSResumes()
  }, [user?.id])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setResumeFile(file)
    } else {
      alert("Please upload a PDF file")
    }
  }

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      alert("Please upload a resume and provide a job description")
      return
    }

    setIsAnalyzing(true)

    // Simulate file upload and analysis
    setTimeout(async () => {
      const mockAnalysis: ATSAnalysisResult = {
        score: Math.floor(Math.random() * 30) + 70, // Score between 70-100
        strengths: [
          "Strong technical skills section",
          "Relevant work experience",
          "Clear contact information",
          "Professional formatting",
          "Quantified achievements",
        ],
        weaknesses: [
          "Missing some key industry keywords",
          "Could improve skills section organization",
          "Limited use of action verbs",
        ],
        suggestions: [
          "Add more industry-specific keywords from the job description",
          "Include metrics and numbers to quantify achievements",
          "Use stronger action verbs like 'implemented', 'optimized', 'led'",
          "Consider adding a professional summary section",
          "Ensure consistent formatting throughout",
        ],
        keywords: {
          matched: ["JavaScript", "React", "Node.js", "Python", "SQL", "Git"],
          missing: ["TypeScript", "AWS", "Docker", "Kubernetes", "CI/CD", "Agile"],
        },
        sections: {
          "Contact Information": { score: 95, feedback: "Complete and professional" },
          "Professional Summary": { score: 80, feedback: "Good but could be more targeted" },
          "Work Experience": { score: 85, feedback: "Relevant experience with good details" },
          Skills: { score: 75, feedback: "Missing some key technologies" },
          Education: { score: 90, feedback: "Well presented" },
          Formatting: { score: 88, feedback: "Clean and ATS-friendly" },
        },
      }

      setAnalysisResult(mockAnalysis)

      // Save to backend
      try {
        const resumeData: CreateATSResumeData = {
          resume_file_path: `uploads/${resumeFile.name}`,
          job_description: jobDescription,
          analysis_result: JSON.stringify(mockAnalysis),
        }

        const response = await createATSResume(resumeData)
        setATSResumes((prev) => [response, ...prev])
      } catch (error) {
        console.error("Error saving ATS analysis:", error)
      }

      setIsAnalyzing(false)
    }, 4000)
  }

  const handleDelete = async (atsResume: ATSResume) => {
    if (confirm("Are you sure you want to delete this ATS analysis?")) {
      try {
        await deleteATSResume(atsResume.id)
        setATSResumes((prev) => prev.filter((item) => item.id !== atsResume.id))
      } catch (error) {
        console.error("Error deleting ATS resume:", error)
        alert("Failed to delete ATS analysis")
      }
    }
  }

  const handleView = (atsResume: ATSResume) => {
    if (atsResume.analysis_result) {
      try {
        const analysis = JSON.parse(atsResume.analysis_result)
        setAnalysisResult(analysis)
      } catch (error) {
        console.error("Error parsing analysis result:", error)
      }
    }
  }

  const filteredResumes = atsResumes.filter((resume) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      resume.job_description.toLowerCase().includes(searchLower) ||
      resume.resume_file_path.toLowerCase().includes(searchLower)
    )
  })

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default"
    if (score >= 60) return "secondary"
    return "destructive"
  }

  if (isLoading && atsResumes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700">
              <Upload className="h-4 w-4 mr-2" />
              Check Resume
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
            <DialogHeader>
              <DialogTitle>ATS Resume Analysis</DialogTitle>
              <DialogDescription>
                Upload your resume and job description for ATS optimization analysis
              </DialogDescription>
            </DialogHeader>

            {!analysisResult ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Resume
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Resume File (PDF only) *</Label>
                        <Input type="file" accept=".pdf" onChange={handleFileUpload} className="mt-2" />
                        {resumeFile && (
                          <p className="text-sm text-green-600 mt-2">✓ {resumeFile.name} uploaded successfully</p>
                        )}
                      </div>
                    </div>
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
                    <div className="space-y-2">
                      <Label>Paste the job description here *</Label>
                      <Textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the complete job description including requirements, responsibilities, and qualifications..."
                        className="min-h-[200px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!resumeFile || !jobDescription.trim() || isAnalyzing}
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

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setAnalysisResult(null)
                      setResumeFile(null)
                      setJobDescription("")
                      setIsDialogOpen(false)
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

      {/* Analysis History 
      {atsResumes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Analysis History ({filteredResumes.length})</span>
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search analyses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resume File</TableHead>
                  <TableHead>Job Description</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Analyzed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResumes.map((resume) => {
                  let score = 0
                  try {
                    if (resume.analysis_result) {
                      const analysis = JSON.parse(resume.analysis_result)
                      score = analysis.score
                    }
                  } catch (error) {
                    console.error("Error parsing analysis result:", error)
                  }

                  return (
                    <TableRow key={resume.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{resume.resume_file_path.split("/").pop() || "Resume"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate">{resume.job_description.substring(0, 100)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {score > 0 && (
                          <Badge variant={getScoreBadgeVariant(score)} className="font-bold">
                            {score}/100
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(resume.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(resume)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(resume)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}*/}

      {/* Empty State 
      {atsResumes.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <CheckCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ATS analyses yet</h3>
            <p className="text-gray-500 mb-4">Upload your first resume to get started with ATS optimization</p>
          </CardContent>
        </Card>
      )}*/}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ATS Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Target className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Use Keywords</h4>
                <p className="text-sm text-gray-600">Include relevant keywords from the job description</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-teal-100 p-2">
                <Award className="h-4 w-4 text-teal-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Simple Formatting</h4>
                <p className="text-sm text-gray-600">Use clean, simple formatting that ATS can parse</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Quantify Results</h4>
                <p className="text-sm text-gray-600">Include numbers and metrics to show impact</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
