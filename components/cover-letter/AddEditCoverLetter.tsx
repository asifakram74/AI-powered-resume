"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, FileText, Wand2 } from "lucide-react"
import { useAppSelector } from "@/lib/redux/hooks"
import { getCVs, type CV } from "@/lib/redux/service/cvService"

interface CoverLetterGeneratorProps {
  onGenerate: (jobDescription: string, tone: string, cvId: string, userId: string) => void
  isGenerating: boolean
  cvs: CV[]
}

const tones = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal and business-appropriate tone",
    example: "I am writing to express my strong interest in the position...",
  },
  {
    id: "enthusiastic",
    name: "Enthusiastic",
    description: "Energetic and passionate tone",
    example: "I am thrilled to apply for this exciting opportunity...",
  },
  {
    id: "confident",
    name: "Confident",
    description: "Assertive and self-assured tone",
    example: "With my proven track record and expertise...",
  },
  {
    id: "friendly",
    name: "Friendly",
    description: "Warm and approachable tone",
    example: "I would love the opportunity to contribute to your team...",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Innovative and unique tone",
    example: "Your company's innovative approach resonates with my creative vision...",
  },
]
export function CoverLetterGenerator({ onGenerate, isGenerating }: CoverLetterGeneratorProps) {
  const [jobDescription, setJobDescription] = useState("")
  const [selectedTone, setSelectedTone] = useState("")
  const [selectedCVId, setSelectedCVId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [cvs, setCVs] = useState<CV[]>([])
  const { user } = useAppSelector((state) => state.auth)
  const userId = user?.id
  useEffect(() => {
    const loadCVs = async () => {
      if (!user?.id) return
      setIsLoading(true)
      try {
        const data = await getCVs(user.id.toString())
        console.log("Fetched CVs:", data)
        setCVs(data)
      } catch (error) {
        console.error("Error loading CVs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCVs()
  }, [user?.id])

  const handleGenerate = () => {
    if (!jobDescription.trim() || !selectedTone || !selectedCVId || !userId) {
      alert("Please fill in all required fields and select a CV")
      return
    }
    onGenerate(jobDescription, selectedTone, selectedCVId, userId.toString())
  }

  const handleCVChange = (value: string) => {
    setSelectedCVId(value)
    const selectedCVData = cvs.find(cv => cv.id.toString() === value)
    if (selectedCVData?.job_description) {
      setJobDescription(selectedCVData.job_description)
    }
  }

  const selectedToneData = tones.find((tone) => tone.id === selectedTone)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 p-3">
            <Wand2 className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">AI Cover Letter Generator</h3>
        </div>
        <p className="text-gray-600">
          Paste the job description and select your preferred tone to generate a personalized cover letter
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select CV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Choose a CV to pre-fill job description *</Label>
            <Select value={selectedCVId} onValueChange={handleCVChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a CV..." />
              </SelectTrigger>
              <SelectContent>
                {cvs.map((cv) => (
                  <SelectItem key={cv.id} value={cv.id.toString()}>
                    {cv.title || `CV ${cv.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              placeholder="Paste the complete job description, including requirements, responsibilities, and company information..."
              className="min-h-[200px] resize-none"
            />
            <p className="text-sm text-gray-500">Include as much detail as possible for a more tailored cover letter</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Writing Tone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select your preferred tone *</Label>
              <Select value={selectedTone} onValueChange={setSelectedTone}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a writing tone..." />
                </SelectTrigger>
                <SelectContent>
                  {tones.map((tone) => (
                    <SelectItem key={tone.id} value={tone.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{tone.name}</span>
                        <span className="text-sm text-gray-500">{tone.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedToneData && (
              <div className="p-4 bg-gray-50 rounded-lg border">
                <Label className="text-sm font-medium text-gray-700">Example opening:</Label>
                <p className="text-sm text-gray-600 italic mt-1">"{selectedToneData.example}"</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleGenerate}
          disabled={!jobDescription.trim() || !selectedTone || !selectedCVId || isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 text-lg"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating Cover Letter...
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 mr-2" />
              Generate Cover Letter
            </>
          )}
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 p-1">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">AI-Powered Personalization</h4>
            <p className="text-sm text-blue-700">
              Our AI analyzes the job description and creates a tailored cover letter that highlights your relevant
              skills and experience while matching the company's requirements and culture.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}