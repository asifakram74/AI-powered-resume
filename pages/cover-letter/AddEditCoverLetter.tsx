"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { Sparkles } from "lucide-react"
import { useAppSelector } from "../../lib/redux/hooks"
import {
  getAllCVs,
  getCVs,
  type CV
} from "../../lib/redux/service/resumeService"
import { Input } from "../../components/ui/input"
import Select from 'react-select'

interface CoverLetterGeneratorProps {
  onGenerate: (title: string, jobDescription: string, tone: string, cvId: string, userId: string) => void
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
  const [title, setTitle] = useState("")
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
    if (!title.trim() || !jobDescription.trim() || !selectedTone || !selectedCVId || !userId) {
      alert("Please fill in all required fields (including Title) and select a CV")
      return
    }
    onGenerate(title, jobDescription, selectedTone, selectedCVId, userId.toString())
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Software Engineer Application"
          />
        </div>

        <div className="space-y-2">
          <Label>Tone *</Label>
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
            placeholder="Select tone..."
            classNames={{
              control: (state) => 
                `!min-h-[40px] !rounded-md !border !border-gray-300 dark:!border-gray-700 !bg-white dark:!bg-gray-950 !text-gray-900 dark:!text-gray-100 ${state.isFocused ? '!ring-1 !ring-blue-500 !border-blue-500' : ''}`,
              menu: () => 
                "!bg-white dark:!bg-gray-950 !border !border-gray-200 dark:!border-gray-700 !rounded-md !shadow-lg !mt-1 !z-50",
              option: (state) => 
                `!cursor-pointer !px-3 !py-2 ${state.isSelected ? '!bg-blue-500 !text-white' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100' : '!bg-transparent !text-gray-900 dark:!text-gray-100'}`,
              singleValue: () => "!text-gray-900 dark:!text-gray-100",
              input: () => "!text-gray-900 dark:!text-gray-100",
              placeholder: () => "!text-gray-500 dark:!text-gray-400",
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Resume Source *</Label>
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
          placeholder="Select a CV to use as a base..."
          classNames={{
            control: (state) => 
              `!min-h-[40px] !rounded-md !border !border-gray-300 dark:!border-gray-700 !bg-white dark:!bg-gray-950 !text-gray-900 dark:!text-gray-100 ${state.isFocused ? '!ring-1 !ring-blue-500 !border-blue-500' : ''}`,
            menu: () => 
              "!bg-white dark:!bg-gray-950 !border !border-gray-200 dark:!border-gray-700 !rounded-md !shadow-lg !mt-1 !z-50",
            option: (state) => 
              `!cursor-pointer !px-3 !py-2 ${state.isSelected ? '!bg-blue-500 !text-white' : state.isFocused ? '!bg-gray-100 dark:!bg-gray-800 !text-gray-900 dark:!text-gray-100' : '!bg-transparent !text-gray-900 dark:!text-gray-100'}`,
            singleValue: () => "!text-gray-900 dark:!text-gray-100",
            input: () => "!text-gray-900 dark:!text-gray-100",
            placeholder: () => "!text-gray-500 dark:!text-gray-400",
          }}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="job_description">Job Description *</Label>
        <Textarea
          id="job_description"
          rows={8}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the complete job description here..."
          className="min-h-[150px] w-full resize-none bg-white dark:bg-gray-950"
          style={{ wordBreak: 'break-all' }}
        />
        
        {/* Validation errors */}
        {jobDescription.trim() && (() => {
          const input = jobDescription.trim();
          if (input.length < 30) return <p className="text-sm text-red-600">Job description must be at least 30 characters.</p>;
          if (input.split(/\s+/).length < 3) return <p className="text-sm text-red-600">Please provide at least 3 words.</p>;
          if (/^[0-9\s]+$/.test(input)) return <p className="text-sm text-red-600">Job description cannot be only numbers.</p>;
          if (/^[^a-zA-Z0-9]+$/.test(input)) return <p className="text-sm text-red-600">Job description cannot be only special characters.</p>;
          return null;
        })()}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!jobDescription.trim() || !selectedTone || !selectedCVId || isGenerating}
        className="w-full resumaic-gradient-green hover:opacity-90 button-press h-12 text-base font-medium shadow-lg shadow-emerald-500/20"
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

      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 rounded-lg p-4 mb-12">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-1">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          <div className="">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">AI-Powered Personalization</h4>
            <p className="text-sm text-blue-700 dark:text-blue-200">
              Our AI analyzes the job description and creates a tailored cover letter that highlights your relevant
              skills and experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CoverLetterGenerator;
