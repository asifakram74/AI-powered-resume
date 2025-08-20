"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Sparkles, FileText } from "lucide-react"
import { useAppSelector } from "@/lib/redux/hooks"
import {
  getAllCVs,
  getCVs,
  type CV
} from "@/lib/redux/service/resumeService"
import Select from 'react-select'

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
    const fetchCVs = async () => {
      try {
        setIsLoading(true);

        let data;
        if (user?.role?.toLowerCase() === 'admin') {
          data = await getAllCVs();
        } else {
          data = await getCVs(userId?.toString() || "");
        }

        setCVs(data);
      } catch (error) {
        console.error("Error fetching CVs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCVs();
  }, [userId, user?.role]);

  const handleGenerate = () => {
    if (!jobDescription.trim() || !selectedTone || !selectedCVId || !userId) {
      alert("Please fill in all required fields and select a CV")
      return
    }
    onGenerate(jobDescription, selectedTone, selectedCVId, userId.toString())
  }

  const handleCVChange = (option: { value: string; label: string } | null) => {
    if (option) {
      setSelectedCVId(option.value)
      const selectedCVData = cvs.find((cv) => cv.id.toString() === option.value)
      if (selectedCVData?.job_description) {
        setJobDescription(selectedCVData.job_description)
      }
    }
  }

  const selectedToneData = tones.find((tone) => tone.id === selectedTone)
  const selectedCVData = cvs.find((cv) => cv.id.toString() === selectedCVId)

  return (
    <div className="space-y-6">
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
            <Select
              options={cvs.map((cv) => ({
                value: cv.id.toString(),
                label: cv.title || `CV ${cv.id}`,
              }))}
              value={
                cvs
                  .map((cv) => ({
                    value: cv.id.toString(),
                    label: cv.title || `CV ${cv.id}`,
                  }))
                  .find((option) => option.value === selectedCVId) || null
              }
              onChange={handleCVChange}
              isLoading={isLoading}
              isSearchable
              placeholder="Search or select CV..."
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: 40,
                  borderRadius: 6,
                  borderColor: "#d1d5db",
                  paddingLeft: 4,
                  paddingRight: 4,
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: 6,
                  marginTop: 4,
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? "#eff6ff"
                    : state.isFocused
                      ? "#f3f4f6"
                      : "white",
                  color: "#1f2937",
                }),
              }}
            />
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
            <p className="text-sm text-gray-500">
              Include as much detail as possible for a more tailored cover letter
            </p>

            {/* Validation errors */}
            {jobDescription.trim() && (() => {
              const input = jobDescription.trim();

              if (input.length < 30) {
                return (
                  <p className="text-sm text-red-600">
                    Job description must be at least 30 characters.
                  </p>
                );
              }

              if (input.split(/\s+/).length < 3) {
                return (
                  <p className="text-sm text-red-600">
                    Please provide at least 3 words.
                  </p>
                );
              }

              if (/^[0-9\s]+$/.test(input)) {
                return (
                  <p className="text-sm text-red-600">
                    Job description cannot be only numbers.
                  </p>
                );
              }

              if (/^[^a-zA-Z0-9]+$/.test(input)) {
                return (
                  <p className="text-sm text-red-600">
                    Job description cannot be only special characters.
                  </p>
                );
              }

              return null; // ✅ valid
            })()}
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
              <Select
                options={tones.map((tone) => ({
                  value: tone.id,
                  label: tone.name,
                  description: tone.description,
                }))}
                value={
                  tones
                    .map((tone) => ({
                      value: tone.id,
                      label: tone.name,
                      description: tone.description,
                    }))
                    .find((option) => option.value === selectedTone) || null
                }
                onChange={(option) => option && setSelectedTone(option.value)}
                isSearchable
                placeholder="Search or select tone..."
                formatOptionLabel={(option) => (
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-sm text-gray-500">{option.description}</span>
                  </div>
                )}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: 40,
                    borderRadius: 6,
                    borderColor: "#d1d5db",
                    paddingLeft: 4,
                    paddingRight: 4,
                  }),
                  menu: (base) => ({
                    ...base,
                    borderRadius: 6,
                    marginTop: 4,
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#eff6ff"
                      : state.isFocused
                        ? "#f3f4f6"
                        : "white",
                    color: "#1f2937",
                  }),
                }}
              />
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
          className="resumaic-gradient-green hover:opacity-90  button-press px-4 py-3 text-lg"
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