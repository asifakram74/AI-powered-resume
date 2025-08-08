"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Edit, Sparkles, TrendingUp, Award, Target, Users, FileText, FileOutput, FileInput, FilePlus2, LayoutTemplate, Palette, Settings } from "lucide-react"
import { useRouter } from "next/navigation"
import { getPersonaById, type PersonaResponse } from "@/lib/redux/service/pasonaService"
import { CVTemplates } from "@/components/resume/ChooseResumeTemplte"
import { CVPreview } from "@/components/resume/CVPreview"
import type { CVData } from "@/types/cv-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"
import { Crown } from "lucide-react"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/dashboard/sidebar"

interface OptimizedCV {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
    linkedin: string
    website: string
  }
  summary: string
  workExperience: Array<{
    title: string
    company: string
    duration: string
    description: string
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
    gpa: string
  }>
  skills: string[]
  projects: Array<{
    name: string
    description: string
    technologies: string[]
  }>
  certifications: string[]
  languages: string[]
  interests: string[]
}

interface AIResponse {
  optimizedCV: OptimizedCV
  suggestions: string[]
  improvementScore: number
}

interface CVTemplate {
  id: string
  name: string
  description: string
  category: "modern" | "classic" | "creative" | "minimal"
}

export default function CreateCVPage() {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [persona, setPersona] = useState<PersonaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(null)
  const [step, setStep] = useState<"template" | "ai-response">("template")
  const [activePage, setActivePage] = useState("create-persona")
  const searchParams = useSearchParams()
  const router = useRouter()
  const personaId = searchParams.get("personaId")
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/")
  }

  // Default template
  const defaultTemplate: CVTemplate = {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, modern design perfect for tech and business professionals",
    category: "modern",
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!personaId) {
        setError("No persona ID provided")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        
        // Fetch persona data
        const personaData = await getPersonaById(parseInt(personaId))
        if (!personaData) {
          setError("Persona not found.")
          setIsLoading(false)
          return
        }
        setPersona(personaData)
        setIsLoading(false)
      } catch (err: any) {
        console.error("Error:", err)
        setError(err.message || "Failed to fetch persona data")
        setIsLoading(false)
      }
    }

    fetchData()
  }, [personaId])

  const convertPersonaToText = (personaData: PersonaResponse) => {
    let text = ""
    text += `Name: ${personaData.full_name || ""}\n`
    text += `Job Title: ${personaData.job_title || ""}\n`
    text += `Email: ${personaData.email || ""}\n`
    text += `Phone: ${personaData.phone || ""}\n`
    text += `Address: ${personaData.address || ""}\n`
    text += `City: ${personaData.city || ""}\n`
    text += `Country: ${personaData.country || ""}\n`
    text += `Summary: ${personaData.summary || ""}\n`
    text += `LinkedIn: ${personaData.linkedin || ""}\n`
    text += `GitHub: ${personaData.github || ""}\n\n`

    // Experience
    if (personaData.experience && Array.isArray(personaData.experience)) {
      text += "Work Experience:\n"
      personaData.experience.forEach((exp: any) => {
        text += `${exp.jobTitle || ""} at ${exp.companyName || ""}\n`
        text += `${exp.startDate || ""} - ${exp.endDate || ""}\n`
        text += `Location: ${exp.location || ""}\n`
        if (exp.responsibilities && Array.isArray(exp.responsibilities)) {
          exp.responsibilities.forEach((resp: string) => {
            text += `- ${resp}\n`
          })
        }
        text += "\n"
      })
    }

    // Education
    if (personaData.education && Array.isArray(personaData.education)) {
      text += "Education:\n"
      personaData.education.forEach((edu: any) => {
        text += `${edu.degree || ""} from ${edu.institutionName || ""}\n`
        text += `Graduation: ${edu.graduationDate || ""}\n`
        text += `GPA: ${edu.gpa || ""}\n`
        text += `Honors: ${edu.honors || ""}\n`
        text += `Additional Info: ${edu.additionalInfo || ""}\n\n`
      })
    }

    // Skills
    if (personaData.skills) {
      text += "Skills:\n"
      if (Array.isArray(personaData.skills.technical)) {
        text += `Technical: ${personaData.skills.technical.join(", ")}\n`
      }
      if (Array.isArray(personaData.skills.soft)) {
        text += `Soft Skills: ${personaData.skills.soft.join(", ")}\n`
      }
      text += "\n"
    }

    // Languages
    if (personaData.languages && Array.isArray(personaData.languages)) {
      text += "Languages:\n"
      personaData.languages.forEach((lang: any) => {
        if (lang) {
          text += `${lang.name || ""} - ${lang.proficiency || ""}\n`
        }
      })
      text += "\n"
    }

    // Certifications
    if (personaData.certifications && Array.isArray(personaData.certifications)) {
      text += "Certifications:\n"
      personaData.certifications.forEach((cert: any) => {
        text += `${cert.title || ""} from ${cert.issuingOrganization || ""}\n`
        text += `Date: ${cert.dateObtained || ""}\n\n`
      })
    }

    // Projects
    if (personaData.projects && Array.isArray(personaData.projects)) {
      text += "Projects:\n"
      personaData.projects.forEach((proj: any) => {
        text += `${proj.name || ""}\n`
        text += `Role: ${proj.role || ""}\n`
        text += `Description: ${proj.description || ""}\n`
        if (proj.technologies && Array.isArray(proj.technologies)) {
          text += `Technologies: ${proj.technologies.join(", ")}\n`
        }
        text += `Live Demo: ${proj.liveDemoLink || ""}\n`
        text += `GitHub: ${proj.githubLink || ""}\n\n`
      })
    }

    return text
  }

  const convertToCVData = (aiResponse: AIResponse): CVData => {
    return {
      id: "generated-cv",
      personalInfo: {
        fullName: aiResponse.optimizedCV.personalInfo.name,
        jobTitle: persona?.job_title || "",
        email: aiResponse.optimizedCV.personalInfo.email,
        phone: aiResponse.optimizedCV.personalInfo.phone,
        address: aiResponse.optimizedCV.personalInfo.location,
        city: "",
        country: "",
        profilePicture: "",
        summary: aiResponse.optimizedCV.summary,
        linkedin: aiResponse.optimizedCV.personalInfo.linkedin,
        github: "",
      },
      experience: aiResponse.optimizedCV.workExperience.map((exp, index) => ({
        id: `exp-${index}`,
        jobTitle: exp.title,
        companyName: exp.company,
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: [exp.description],
      })),
      education: aiResponse.optimizedCV.education.map((edu, index) => ({
        id: `edu-${index}`,
        degree: edu.degree,
        institutionName: edu.institution,
        location: "",
        graduationDate: edu.year,
        gpa: edu.gpa,
        honors: "",
        additionalInfo: "",
      })),
      skills: {
        technical: aiResponse.optimizedCV.skills,
        soft: [],
      },
      languages: aiResponse.optimizedCV.languages.map((lang, index) => ({
        id: `lang-${index}`,
        name: lang,
        proficiency: "Intermediate" as const,
      })),
      certifications: aiResponse.optimizedCV.certifications.map((cert, index) => ({
        id: `cert-${index}`,
        title: cert,
        issuingOrganization: "",
        dateObtained: "",
        verificationLink: "",
      })),
      projects: aiResponse.optimizedCV.projects.map((proj, index) => ({
        id: `proj-${index}`,
        name: proj.name,
        role: "",
        description: proj.description,
        technologies: proj.technologies,
        liveDemoLink: "",
        githubLink: "",
      })),
      additional: {
        interests: aiResponse.optimizedCV.interests,
      },
      createdAt: new Date().toISOString(),
    }
  }

  const handleTemplateSelect = async (template: CVTemplate) => {
    setSelectedTemplate(template)
    setStep("ai-response")
    
    // Generate AI response after template selection
    if (persona) {
      try {
        setIsLoading(true)
        
        // Convert persona data to text for AI processing
        const personaText = convertPersonaToText(persona)

        // Call AI optimization API
        const response = await fetch("/api/optimize-cv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            extractedText: personaText,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to optimize CV")
        }

        const aiData = await response.json()
        setAiResponse(aiData)
      } catch (err: any) {
        console.error("Error:", err)
        setError(err.message || "Failed to create AI CV")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEdit = () => {
    // Navigate back to persona edit page
    router.push(`/dashboard?activePage=create-persona&editId=${personaId}`)
  }

  const handleBackToTemplate = () => {
    setStep("template")
    setAiResponse(null)
    setError(null)
  }

  const handleExport = async (format: 'pdf' | 'docx' | 'png') => {
    try {
      // Get the CV preview element
      const cvElement = document.getElementById('cv-preview-content')
      if (!cvElement) {
        alert('CV preview not found. Please try again.')
        return
      }

      switch (format) {
        case 'pdf':
          // Use browser's print functionality for PDF
          const printWindow = window.open('', '_blank')
          if (!printWindow) {
            alert('Please allow popups for PDF export')
            return
          }

          // Clone content and styles
          const clonedContent = cvElement.cloneNode(true) as HTMLElement
          const styles = Array.from(document.styleSheets)
            .map(sheet => {
              try {
                return Array.from(sheet.cssRules)
                  .map(rule => rule.cssText)
                  .join('\n')
              } catch (e) {
                return ''
              }
            })
            .join('\n')

          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>CV Export</title>
                <style>
                  ${styles}
                  body { 
                    margin: 0; 
                    padding: 20px; 
                    font-family: Arial, sans-serif;
                    background: white;
                  }
                  @media print {
                    body { 
                      margin: 0; 
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                    }
                  }
                </style>
              </head>
              <body>
                ${clonedContent.innerHTML}
              </body>
            </html>
          `

          printWindow.document.write(htmlContent)
          printWindow.document.close()

          setTimeout(() => {
            printWindow.print()
            printWindow.close()
          }, 500)
          break

        case 'docx':
          // Use the existing DOCX export API
          const cvHTML = cvElement.outerHTML
          const response = await fetch('/api/export-docx', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ html: cvHTML }),
          })

          const result = await response.json()
          
          if (result.error) {
            alert('DOCX export is not yet implemented. This feature will be available soon.')
          } else {
            alert('DOCX export completed successfully!')
          }
          break

        case 'png':
          alert('PNG export requires additional setup. This feature will be available soon.')
          break
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('Export failed. Please try again.')
    }
  }

  if (isLoading && step === "template") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading persona data...</p>
        </div>
      </div>
    )
  }

  if (error && step === "template") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-red-500 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!persona && step === "template") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-gray-500 mb-4">
              <Sparkles className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Persona Data</h2>
            <p className="text-gray-600 mb-4">Unable to find persona data</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="flex-1 p-6 bg-gray-50">
            {step === "template" ? (
              // Template Selection View
              <div className="space-y-8">
                {/* Persona Info */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {persona?.full_name?.charAt(0) || "P"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{persona?.full_name}</h3>
                        <p className="text-gray-600">{persona?.job_title}</p>
                        <p className="text-sm text-gray-500">Choose a template to generate your AI-enhanced CV</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Template Selection */}
                <CVTemplates
                  onTemplateSelect={handleTemplateSelect}
                  selectedTemplate={selectedTemplate?.id}
                />
              </div>
            ) : (
              // AI Response View
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Left sidebar - Resume controls */}
                <div className="w-full lg:w-64 flex-shrink-0">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Resume Controls</h3>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <Download className="h-4 w-4" />
                          Export Resume
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => handleExport('pdf')}
                        >
                          <FileText className="h-4 w-4" />
                          PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => handleExport('docx')}
                        >
                          <FileOutput className="h-4 w-4" />
                          DOCX
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 cursor-pointer"
                          onClick={() => handleExport('png')}
                        >
                          <FileInput className="h-4 w-4" />
                          PNG
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" className="w-full justify-start gap-2">
                      <FilePlus2 className="h-4 w-4" />
                      New Section
                    </Button>

                    <Button variant="outline" className="w-full justify-start gap-2">
                      <LayoutTemplate className="h-4 w-4" />
                      Change Template
                    </Button>

                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Palette className="h-4 w-4" />
                      Customize Colors
                    </Button>

                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Settings className="h-4 w-4" />
                      Layout Options
                    </Button>
                  </div>

                  {/* AI Suggestions */}
                  {aiResponse && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="h-5 w-5" />
                          AI Suggestions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {aiResponse.suggestions.map((suggestion, index) => (
                            <div key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <p className="text-sm text-gray-700">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Main content area */}
                <div className="flex-1">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Creating your AI-enhanced CV...</p>
                      </div>
                    </div>
                  ) : error ? (
                    <Card className="w-full max-w-md mx-auto">
                      <CardContent className="text-center p-6">
                        <div className="text-red-500 mb-4">
                          <TrendingUp className="h-12 w-12 mx-auto" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <Button onClick={handleBackToTemplate}>
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Back to Template Selection
                        </Button>
                      </CardContent>
                    </Card>
                  ) : aiResponse ? (
                    <>
                      {/* Improvement Score */}
                      <Card className="mb-6">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {aiResponse.improvementScore}%
                                </span>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold">Improvement Score</h3>
                              <p className="text-gray-600">
                                Your CV has been enhanced with AI optimization using the {selectedTemplate?.name} template.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* CV Preview */}
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-xl font-semibold">CV Preview</h2>
                            <p className="text-gray-600">Template: {selectedTemplate?.name}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" onClick={handleBackToTemplate}>
                              Change Template
                            </Button>
                            <Button variant="outline" onClick={handleEdit}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        {selectedTemplate && (
                          <CVPreview
                            data={convertToCVData(aiResponse)}
                            template={selectedTemplate}
                          />
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}