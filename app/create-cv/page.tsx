"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Edit, Sparkles, TrendingUp, Award, Target, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { getPersonaById, type PersonaResponse } from "@/lib/redux/service/pasonaService"

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

export default function CreateCVPage() {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [persona, setPersona] = useState<PersonaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const personaId = searchParams.get("personaId")

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

        // Convert persona data to text for AI processing
        const personaText = convertPersonaToText(personaData)

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

    fetchData()
  }, [personaId])

  const convertPersonaToText = (personaData: PersonaResponse) => {
    let text = ""
    
    // Personal Info
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

  const handleDownload = () => {
    // Implementation for downloading the CV
    console.log("Download functionality to be implemented")
  }

  const handleEdit = () => {
    // Navigate back to persona edit page
    router.push(`/dashboard?activePage=create-persona&editId=${personaId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Creating your AI-enhanced CV...</p>
        </div>
      </div>
    )
  }

  if (error) {
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

  if (!aiResponse) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-gray-500 mb-4">
              <Sparkles className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No CV Data</h2>
            <p className="text-gray-600 mb-4">Unable to generate AI CV</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI-Enhanced CV</h1>
                <p className="text-gray-600">Generated from your persona data</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main CV Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Improvement Score */}
            <Card>
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
                      Your CV has been enhanced with AI optimization
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-lg">{aiResponse.optimizedCV.personalInfo.name}</h4>
                    <p className="text-gray-600">{aiResponse.optimizedCV.personalInfo.email}</p>
                    <p className="text-gray-600">{aiResponse.optimizedCV.personalInfo.phone}</p>
                    <p className="text-gray-600">{aiResponse.optimizedCV.personalInfo.location}</p>
                  </div>
                  <div className="space-y-2">
                    {aiResponse.optimizedCV.personalInfo.linkedin && (
                      <p className="text-blue-600">
                        <a href={aiResponse.optimizedCV.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                          LinkedIn Profile
                        </a>
                      </p>
                    )}
                    {aiResponse.optimizedCV.personalInfo.website && (
                      <p className="text-blue-600">
                        <a href={aiResponse.optimizedCV.personalInfo.website} target="_blank" rel="noopener noreferrer">
                          Personal Website
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{aiResponse.optimizedCV.summary}</p>
              </CardContent>
            </Card>

            {/* Work Experience */}
            <Card>
              <CardHeader>
                <CardTitle>Work Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {aiResponse.optimizedCV.workExperience.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-lg">{exp.title}</h4>
                        <p className="text-blue-600">{exp.company}</p>
                      </div>
                      <span className="text-gray-600 text-sm">{exp.duration}</span>
                    </div>
                    <p className="text-gray-700">{exp.description}</p>
                    {index < aiResponse.optimizedCV.workExperience.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiResponse.optimizedCV.education.map((edu, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{edu.degree}</h4>
                      <p className="text-blue-600">{edu.institution}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600">{edu.year}</p>
                      {edu.gpa && <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {aiResponse.optimizedCV.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            {aiResponse.optimizedCV.projects.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiResponse.optimizedCV.projects.map((project, index) => (
                    <div key={index}>
                      <h4 className="font-semibold">{project.name}</h4>
                      <p className="text-gray-700 mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Certifications */}
            {aiResponse.optimizedCV.certifications.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {aiResponse.optimizedCV.certifications.map((cert, index) => (
                      <li key={index} className="text-gray-700">• {cert}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {aiResponse.optimizedCV.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.optimizedCV.languages.map((lang, index) => (
                      <Badge key={index} variant="outline">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interests */}
            {aiResponse.optimizedCV.interests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.optimizedCV.interests.map((interest, index) => (
                      <Badge key={index} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Suggestions Sidebar */}
          <div className="space-y-6">
            <Card>
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Tips for Success
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      Customize this CV for each job application
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      Add specific achievements and metrics
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700">
                      Keep it concise and ATS-friendly
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
