"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Mail,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  Plus,
  TrendingUp,
  Target,
  Sparkles,
  FileText,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CoverLetterGenerator } from "./cover-letter-generator"
import {
  getCoverLetters,
  createCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
  type CoverLetter,
  type CreateCoverLetterData,
} from "@/lib/api/cover-letter"
import { useAppSelector } from "@/lib/redux/hooks"

export function CoverLetterPage() {
  const [coverLetters, setCoverLetters] = useState<CoverLetter[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingLetter, setEditingLetter] = useState<CoverLetter | null>(null)
  const [showGenerator, setShowGenerator] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetter, setGeneratedLetter] = useState("")
  const [currentJobDescription, setCurrentJobDescription] = useState("")
  const [currentTone, setCurrentTone] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const fetchCoverLetters = async () => {
      try {
        if (!user?.id) {
          console.log("No user ID available - user might not be logged in")
          return
        }
        setIsLoading(true)
        const data = await getCoverLetters()
        console.log("Fetched cover letters:", data)
        setCoverLetters(data)
      } catch (error) {
        console.error("Error fetching cover letters:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCoverLetters()
  }, [user?.id])

  const handleGenerate = async (jobDescription: string, tone: string) => {
    setIsGenerating(true)
    setCurrentJobDescription(jobDescription)
    setCurrentTone(tone)

    // Simulate AI generation
    setTimeout(() => {
      const sampleLetter = `Dear Hiring Manager,

I am writing to express my strong interest in the position described in your job posting. After carefully reviewing the requirements and responsibilities, I am confident that my background and skills make me an ideal candidate for this role.

${
  tone === "enthusiastic"
    ? "I am thrilled about the opportunity to contribute to your team and bring my passion for excellence to this position."
    : tone === "confident"
      ? "With my proven track record and expertise in this field, I am well-positioned to make an immediate impact."
      : tone === "creative"
        ? "Your company's innovative approach and commitment to creativity align perfectly with my professional values and aspirations."
        : "I believe my professional experience and dedication to quality work would be valuable assets to your organization."
}

Based on the job description, I understand you are looking for someone who can:
• Deliver high-quality results in a fast-paced environment
• Collaborate effectively with cross-functional teams
• Demonstrate strong problem-solving and analytical skills
• Adapt quickly to new technologies and methodologies

Throughout my career, I have consistently demonstrated these capabilities. My experience includes:
• Successfully managing complex projects from conception to completion
• Building strong relationships with stakeholders at all levels
• Implementing innovative solutions that drive business results
• Mentoring team members and fostering collaborative work environments

I am particularly drawn to this opportunity because it aligns with my career goals and offers the chance to work with a forward-thinking organization. I am excited about the possibility of contributing to your team's continued success.

Thank you for considering my application. I would welcome the opportunity to discuss how my skills and experience can benefit your organization. I look forward to hearing from you soon.

Sincerely,
${user?.name || "[Your Name]"}`

      setGeneratedLetter(sampleLetter)
      setShowGenerator(false)
      setIsGenerating(false)
    }, 3000)
  }

  const handleSaveLetter = async () => {
    if (!generatedLetter.trim()) {
      alert("No letter to save")
      return
    }

    try {
      setIsLoading(true)
      const letterData: CreateCoverLetterData = {
        job_description: currentJobDescription,
        tone: currentTone,
        generated_letter: generatedLetter,
      }

      let response: CoverLetter
      if (editingLetter) {
        response = await updateCoverLetter(editingLetter.id, letterData)
        setCoverLetters((prev) => prev.map((letter) => (letter.id === editingLetter.id ? response : letter)))
      } else {
        response = await createCoverLetter(letterData)
        setCoverLetters((prev) => [response, ...prev])
      }

      setIsDialogOpen(false)
      setShowGenerator(true)
      setGeneratedLetter("")
      setCurrentJobDescription("")
      setCurrentTone("")
      setEditingLetter(null)
    } catch (error) {
      console.error("Error saving cover letter:", error)
      alert("Failed to save cover letter")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (letter: CoverLetter) => {
    setEditingLetter(letter)
    setCurrentJobDescription(letter.job_description)
    setCurrentTone(letter.tone)
    setGeneratedLetter(letter.generated_letter)
    setShowGenerator(false)
    setIsDialogOpen(true)
  }

  const handleView = (letter: CoverLetter) => {
    alert(`Cover Letter Preview:\n\n${letter.generated_letter.substring(0, 500)}...`)
  }

  const handleDownload = (letter: CoverLetter) => {
    const element = document.createElement("a")
    const file = new Blob([letter.generated_letter], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `cover_letter_${letter.id}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDelete = async (letter: CoverLetter) => {
    if (confirm("Are you sure you want to delete this cover letter?")) {
      try {
        await deleteCoverLetter(letter.id)
        setCoverLetters((prev) => prev.filter((l) => l.id !== letter.id))
      } catch (error) {
        console.error("Error deleting cover letter:", error)
        alert("Failed to delete cover letter")
      }
    }
  }

  const filteredLetters = coverLetters.filter((letter) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      letter.job_description.toLowerCase().includes(searchLower) ||
      letter.tone.toLowerCase().includes(searchLower) ||
      letter.generated_letter.toLowerCase().includes(searchLower)
    )
  })

  if (isLoading && coverLetters.length === 0) {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cover Letter Generator</h1>
            <p className="text-gray-600">Create personalized cover letters with AI assistance</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="h-4 w-4 mr-2" />
              Generate Cover Letter
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
            <DialogHeader>
              <DialogTitle>{editingLetter ? "Edit Cover Letter" : "Generate New Cover Letter"}</DialogTitle>
              <DialogDescription>
                {showGenerator
                  ? "Provide job details to generate a personalized cover letter"
                  : "Review and edit your generated cover letter"}
              </DialogDescription>
            </DialogHeader>

            {showGenerator ? (
              <CoverLetterGenerator onGenerate={handleGenerate} isGenerating={isGenerating} />
            ) : (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Cover Letter Generated Successfully!</h4>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Review the generated content below and make any necessary edits before saving.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Tone: {currentTone}</Label>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Generated Cover Letter</Label>
                    <Textarea
                      value={generatedLetter}
                      onChange={(e) => setGeneratedLetter(e.target.value)}
                      className="min-h-[400px] mt-2"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowGenerator(true)
                      setGeneratedLetter("")
                    }}
                  >
                    Back to Generator
                  </Button>
                  <Button onClick={handleSaveLetter} className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <FileText className="h-4 w-4 mr-2" />
                    Save Cover Letter
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Cover Letters Display */}
      {coverLetters.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Your Cover Letters ({filteredLetters.length})</h3>
                  <p className="text-sm text-gray-600">Manage your AI-generated cover letters</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search cover letters..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {viewMode === "table" ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Description</TableHead>
                      <TableHead>Tone</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLetters.map((letter) => (
                      <TableRow key={letter.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm font-medium truncate">
                              {letter.job_description.substring(0, 100)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            {letter.tone}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-600 truncate">
                              {letter.generated_letter.substring(0, 80)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(letter.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(letter)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(letter)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(letter)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(letter)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLetters.map((letter) => (
                <Card key={letter.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Cover Letter
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="capitalize">
                        {letter.tone} tone
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Job Description Preview</Label>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {letter.job_description.substring(0, 150)}...
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Letter Preview</Label>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                          {letter.generated_letter.substring(0, 150)}...
                        </p>
                      </div>

                      <div className="text-xs text-gray-500">
                        Created: {new Date(letter.created_at).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleView(letter)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleEdit(letter)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleDownload(letter)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(letter)}
                          className="text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {coverLetters.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Mail className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cover letters created yet</h3>
            <p className="text-gray-500 mb-4">Generate your first AI-powered cover letter to get started</p>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cover Letter Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Be Specific</h4>
                <p className="text-sm text-gray-600">Include detailed job requirements for better personalization</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-pink-100 p-2">
                <Sparkles className="h-4 w-4 text-pink-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Choose the Right Tone</h4>
                <p className="text-sm text-gray-600">Match your tone to the company culture and industry</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Review and Edit</h4>
                <p className="text-sm text-gray-600">Always review and customize the generated content</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
