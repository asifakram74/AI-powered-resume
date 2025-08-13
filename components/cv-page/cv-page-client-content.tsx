"use client"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Sparkles, TrendingUp, Save, RefreshCw, Edit, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { getPersonaById, type PersonaResponse } from "@/lib/redux/service/pasonaService"
import { CVPreview } from "@/components/resume/CVPreview"
import type { CVData } from "@/types/cv-data"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"
import * as htmlToImage from "html-to-image"
import { jsPDF } from "jspdf"
import { Document, Packer, Paragraph, HeadingLevel } from "docx"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { CreatePersonaPage } from "@/components/persona/PersonaList"
import { ResumePage } from "@/components/resume/ResumeList"
import { CoverLetterPage } from "@/components/cover-letter/CoverLetterList"
import ATSCheckerPage from "@/components/ats/ats-checker-page"
import { ProfilePage } from "@/components/profile/profile-page"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { createCV, getCVById, updateCV, type CreateCVData, type CV } from "@/lib/redux/service/cvService"
import { CVEditPopup } from "./cv-edit-popup"
import { Toaster } from "sonner";

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

const templates: CVTemplate[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, modern design perfect for tech and business professionals",
    category: "modern",
  },
  {
    id: "classic",
    name: "Classic Traditional",
    description: "Traditional format ideal for conservative industries",
    category: "classic",
  },
  {
    id: "creative",
    name: "Creative Designer",
    description: "Eye-catching design for creative professionals",
    category: "creative",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple, clean layout focusing on content",
    category: "minimal",
  },
]

export function CVPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

export function CVPageClientContent() {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [persona, setPersona] = useState<PersonaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(null)
  const [activePage, setActivePage] = useState("create-persona")
  const [existingCV, setExistingCV] = useState<CV | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showEditPopup, setShowEditPopup] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()
  const personaId = searchParams.get("personaId")
  const cvId = searchParams.get("cvId")
  const templateIdFromUrl = searchParams.get("templateId")

  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const cvPreviewRef = useRef<HTMLDivElement>(null)

  const renderActivePage = () => {
    switch (activePage) {
      case "create-persona":
        return <CreatePersonaPage />
      case "resumes":
        return <ResumePage />
      case "cover-letter":
        return <CoverLetterPage />
      case "ats-checker":
        return <ATSCheckerPage />
      case "profile":
        return <ProfilePage />
      default:
        return <CreatePersonaPage />
    }
  }

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/")
  }

  const handleTemplateSelect = (template: CVTemplate) => {
    setSelectedTemplate(template)
    setHasUnsavedChanges(true)
    const url = new URL(window.location.href)
    url.searchParams.set("templateId", template.id)
    router.replace(url.toString())
  }

  const defaultTemplate: CVTemplate = {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, modern design perfect for tech and business professionals",
    category: "modern",
  }

  useEffect(() => {
    if (templateIdFromUrl) {
      const foundTemplate = templates.find((t) => t.id === templateIdFromUrl) || defaultTemplate
      setSelectedTemplate(foundTemplate)
    } else if (!selectedTemplate) {
      setSelectedTemplate(defaultTemplate)
    }
  }, [templateIdFromUrl, selectedTemplate])

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (cvId) {
          // Fetch existing CV data
          const cvData = await getCVById(cvId)
          setExistingCV(cvData)

          // Set template from the CV data
          const template = templates.find((t) => t.id === cvData.layout_id) || defaultTemplate
          setSelectedTemplate(template)

          // Parse the generated content if it exists
          if (cvData.generated_content) {
            const parsedContent = JSON.parse(cvData.generated_content)
            setAiResponse({
              optimizedCV: parsedContent,
              suggestions: [],
              improvementScore: 80, // Default score for existing CVs
            })
          }

          // Fetch persona data if available
          if (cvData.personas_id) {
            const personaData = await getPersonaById(Number.parseInt(cvData.personas_id))
            setPersona(personaData)
          }

          setIsLoading(false)
          return
        }

        if (!personaId) {
          setError("No persona ID provided")
          setIsLoading(false)
          return
        }

        // 1. Fetch persona data
        const personaData = await getPersonaById(Number.parseInt(personaId))
        if (!personaData) {
          setError("Persona not found.")
          setIsLoading(false)
          return
        }
        setPersona(personaData)

        // 2. Set default template if none is selected
        if (!selectedTemplate) {
          const templateToUse = templateIdFromUrl
            ? templates.find((t) => t.id === templateIdFromUrl) || defaultTemplate
            : defaultTemplate
          setSelectedTemplate(templateToUse)
        }

        // 3. Generate AI response only for new CVs
        if (!cvId) {
          const personaText = convertPersonaToText(personaData)
          const response = await fetch("/api/optimize-cv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ extractedText: personaText }),
          })

          if (!response.ok) {
            throw new Error("Failed to optimize CV")
          }
          const aiData = await response.json()
          setAiResponse(aiData)
        }
      } catch (err: any) {
        console.error("Error:", err)
        setError(err.message || "Failed to load CV data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [personaId, cvId])

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

    if (personaData.languages && Array.isArray(personaData.languages)) {
      text += "Languages:\n"
      personaData.languages.forEach((lang: any) => {
        if (lang) {
          text += `${lang.name || ""} - ${lang.proficiency || ""}\n`
        }
      })
      text += "\n"
    }

    if (personaData.certifications && Array.isArray(personaData.certifications)) {
      text += "Certifications:\n"
      personaData.certifications.forEach((cert: any) => {
        text += `${cert.title || ""} from ${cert.issuingOrganization || ""}\n`
        text += `Date: ${cert.dateObtained || ""}\n\n`
      })
    }

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
      id: existingCV?.id || "generated-cv",
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
      createdAt: existingCV?.created_at || new Date().toISOString(),
    }
  }

  const handleEdit = () => {
    router.push(`/dashboard?activePage=create-persona&editId=${personaId}`)
  }

  const handleRegenerateCV = async () => {
    if (!persona) {
      toast("No persona data available for regeneration.")
      return
    }

    setIsRegenerating(true)
    try {
      const personaText = convertPersonaToText(persona)
      const response = await fetch("/api/optimize-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedText: personaText }),
      })

      if (!response.ok) {
        throw new Error("Failed to regenerate CV")
      }

      const aiData = await response.json()
      setAiResponse(aiData)
      setHasUnsavedChanges(true)
      toast("CV regenerated successfully! Don't forget to save your changes.")
    } catch (error: any) {
      console.error("Error regenerating CV:", error)
      toast(`Failed to regenerate CV: ${error.message || "Unknown error"}`)
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleExport = async (format: "pdf" | "docx" | "png") => {
    try {
      const cvElement = document.getElementById("cv-preview-content")
      if (!cvElement) {
        toast("CV preview not found. Please try again.")
        return
      }

      switch (format) {
        case "pdf":
          const printWindow = window.open("", "_blank")
          if (!printWindow) {
            toast("Please allow popups for PDF export")
            return
          }
          const clonedContent = cvElement.cloneNode(true) as HTMLElement
          const styles = Array.from(document.styleSheets)
            .map((sheet) => {
              try {
                return Array.from(sheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join("\n")
              } catch (e) {
                return ""
              }
            })
            .join("\n")
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
                     padding: 2px;
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
        case "docx":
          const cvHTML = cvElement.outerHTML
          const response = await fetch("/api/export-docx", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ html: cvHTML }),
          })
          const result = await response.json()
          if (result.error) {
            toast("DOCX export is not yet implemented. This feature will be available soon.")
          } else {
            toast("DOCX export completed successfully!")
          }
          break
        case "png":
          toast("PNG export requires additional setup. This feature will be available soon.")
          break
      }
    } catch (error) {
      console.error("Export error:", error)
      toast("Export failed. Please try again.")
    }
  }

  const exportAsPDF = async () => {
    try {
      const cvElement = document.getElementById("cv-preview-content")
      if (!cvElement) {
        toast("CV preview not found. Please try again.")
        return
      }

      // Use html-to-image approach for better quality
      const dataUrl = await htmlToImage.toPng(cvElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      })

      const pdf = new jsPDF("p", "mm", "a4")
      const imgProps = pdf.getImageProperties(dataUrl)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      // Handle multiple pages if content is too long
      if (pdfHeight > pdf.internal.pageSize.getHeight()) {
        const pageHeight = pdf.internal.pageSize.getHeight()
        let position = 0

        while (position < pdfHeight) {
          pdf.addImage(dataUrl, "PNG", 0, -position, pdfWidth, pdfHeight)
          position += pageHeight
          if (position < pdfHeight) {
            pdf.addPage()
          }
        }
      } else {
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight)
      }

      pdf.save(`${persona?.full_name || "resume"}-cv.pdf`)
    } catch (error) {
      console.error("Error exporting as PDF:", error)
      // Fallback to print method
      handleExport("pdf")
    }
  }

  const exportAsPNG = async () => {
    try {
      const cvElement = document.getElementById("cv-preview-content")
      if (!cvElement) {
        toast("CV preview not found. Please try again.")
        return
      }

      const dataUrl = await htmlToImage.toPng(cvElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      })

      // Create download link
      const link = document.createElement("a")
      link.download = `${persona?.full_name || "resume"}-cv.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error("Error exporting as PNG:", error)
      toast("PNG export failed. Please try again.")
    }
  }

  const exportAsDOCX = async () => {
    if (!aiResponse || !persona) {
      toast("No CV data available for export.")
      return
    }

    try {
      const children = [
        new Paragraph({
          text: aiResponse.optimizedCV.personalInfo.name || persona.full_name || "Resume",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: persona.job_title || "",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: `Email: ${aiResponse.optimizedCV.personalInfo.email || persona.email || ""}`,
        }),
        new Paragraph({
          text: `Phone: ${aiResponse.optimizedCV.personalInfo.phone || persona.phone || ""}`,
        }),
        new Paragraph({
          text: `Location: ${aiResponse.optimizedCV.personalInfo.location || `${persona.city || ""}, ${persona.country || ""}`}`,
          spacing: { after: 200 },
        }),
      ]

      // Add summary
      if (aiResponse.optimizedCV.summary) {
        children.push(
          new Paragraph({
            text: "Professional Summary",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: aiResponse.optimizedCV.summary,
            spacing: { after: 200 },
          }),
        )
      }

      // Add work experience
      if (aiResponse.optimizedCV.workExperience && aiResponse.optimizedCV.workExperience.length > 0) {
        children.push(
          new Paragraph({
            text: "Work Experience",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
        )

        aiResponse.optimizedCV.workExperience.forEach((exp) => {
          children.push(
            new Paragraph({
              text: `${exp.title} at ${exp.company}`,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: exp.duration,
            }),
            new Paragraph({
              text: exp.description,
              spacing: { after: 200 },
            }),
          )
        })
      }

      // Add education
      if (aiResponse.optimizedCV.education && aiResponse.optimizedCV.education.length > 0) {
        children.push(
          new Paragraph({
            text: "Education",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
        )

        aiResponse.optimizedCV.education.forEach((edu) => {
          children.push(
            new Paragraph({
              text: `${edu.degree} from ${edu.institution}`,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: `Year: ${edu.year}`,
            }),
            new Paragraph({
              text: edu.gpa ? `GPA: ${edu.gpa}` : "",
              spacing: { after: 200 },
            }),
          )
        })
      }

      // Add skills
      if (aiResponse.optimizedCV.skills && aiResponse.optimizedCV.skills.length > 0) {
        children.push(
          new Paragraph({
            text: "Skills",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: aiResponse.optimizedCV.skills.join(", "),
            spacing: { after: 200 },
          }),
        )
      }

      // Add projects
      if (aiResponse.optimizedCV.projects && aiResponse.optimizedCV.projects.length > 0) {
        children.push(
          new Paragraph({
            text: "Projects",
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
          }),
        )

        aiResponse.optimizedCV.projects.forEach((proj) => {
          children.push(
            new Paragraph({
              text: proj.name,
              heading: HeadingLevel.HEADING_3,
            }),
            new Paragraph({
              text: proj.description,
            }),
            new Paragraph({
              text: `Technologies: ${proj.technologies.join(", ")}`,
              spacing: { after: 200 },
            }),
          )
        })
      }

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      })

      Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${aiResponse.optimizedCV.personalInfo.name || persona.full_name || "resume"}-cv.docx`
        a.click()
        URL.revokeObjectURL(url)
      })
    } catch (error) {
      console.error("Error exporting as DOCX:", error)
      toast("DOCX export failed. Please try again.")
    }
  }

  const handleSaveCV = async () => {
    if (!aiResponse || !selectedTemplate || !persona || !user?.id) {
      toast("Cannot save CV: Missing AI response, template, persona, or user info.")
      return
    }

    setIsSaving(true)
    try {
      const cvDataToSave: CreateCVData = {
        user_id: user.id.toString(),
        layout_id: selectedTemplate.id,
        personas_id: persona.id.toString(),
        title: `${persona.full_name}'s AI CV - ${selectedTemplate.name}`,
        job_description: "AI-generated CV based on persona",
        generated_content: JSON.stringify(aiResponse.optimizedCV),
      }

      if (existingCV) {
        // Update existing CV
        const updatedCV = await updateCV(existingCV.id, cvDataToSave)
        setExistingCV(updatedCV)
        setHasUnsavedChanges(false)
        toast("CV updated successfully!")
      } else {
        // Create new CV
        const newCV = await createCV(cvDataToSave)
        setExistingCV(newCV)
        setHasUnsavedChanges(false)

        // Update URL to include the new CV ID
        const url = new URL(window.location.href)
        url.searchParams.set("cvId", newCV.id)
        router.replace(url.toString())

        toast("CV saved successfully!")
      }
    } catch (saveError: any) {
      console.error("Error saving CV:", saveError)
      toast(`Failed to save CV: ${saveError.message || "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTitle = async (newTitle: string) => {
    if (!existingCV || !newTitle.trim()) return

    setIsSaving(true)
    try {
      const updatedCV = await updateCV(existingCV.id, { title: newTitle.trim() })
      setExistingCV(updatedCV)
      toast("CV title updated successfully!")
    } catch (error: any) {
      console.error("Error updating CV title:", error)
      toast(`Failed to update title: ${error.message || "Unknown error"}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCVDataUpdate = async (updatedData: OptimizedCV) => {
    setAiResponse((prev) => (prev ? { ...prev, optimizedCV: updatedData } : null))
    setHasUnsavedChanges(true)
    setShowEditPopup(false)
    toast("CV data updated! Don't forget to save your changes.")
  }

  if (isLoading) {
    const isAIGeneration = searchParams.get("ai") === "true"
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="space-y-2">
            <p className="text-lg font-medium text-gray-700">
              {isAIGeneration ? "Crafting your professional CV..." : "Loading your CV..."}
            </p>
            {isAIGeneration && (
              <p className="text-sm text-gray-500">This may take a moment as we optimize your content</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center p-6">
            <div className="text-gray-500 mb-4">
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

  if ((!persona && !existingCV) || !selectedTemplate) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              <div className="text-gray-500 mb-4">
                <Sparkles className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No CV Data Available</h2>
              <p className="text-gray-600 mb-4">Please ensure a persona and template are selected to generate a CV.</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar
            activePage="cv-export"
            setActivePage={(page) => {
              if (page === 'create-persona') {
                router.push('/dashboard?page=create-persona');
              } else if (page === 'resumes') {
                router.push('/dashboard?page=resumes');
              } else if (page === 'cover-letter') {
                router.push('/dashboard?page=cover-letter');
              } else if (page === 'profile') {
                router.push('/dashboard?page=profile');
              }
            }}
            onExportPDF={exportAsPDF}
            onExportDOCX={exportAsDOCX}
            onExportPNG={exportAsPNG}
            exportMode={true}
          />
          <main className="flex-1 p-6 bg-gray-50">
            <div className="flex flex-col gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {existingCV ? (
                        <input
                          type="text"
                          value={existingCV.title}
                          onChange={(e) => handleUpdateTitle(e.target.value)}
                          className="text-2xl font-bold bg-transparent border-none outline-none focus:bg-white focus:border focus:border-gray-300 focus:rounded px-2 py-1"
                          onBlur={() => setHasUnsavedChanges(false)}
                        />
                      ) : (
                        <h1 className="text-2xl font-bold text-gray-900">Create Your CV</h1>
                      )}
                      {hasUnsavedChanges && (
                        <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded">Unsaved changes</span>
                      )}
                    </div>
                    <p className="text-gray-600">
                      {existingCV
                        ? "Edit your CV details and export when ready"
                        : "Generate a professional CV from your persona data"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {aiResponse && (
                      <>
                        <Button
                          onClick={() => setShowEditPopup(true)}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Details
                        </Button>

                        <Button
                          onClick={handleRegenerateCV}
                          disabled={isRegenerating}
                          variant="outline"
                          className="flex items-center gap-2 bg-transparent"
                        >
                          {isRegenerating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                          {isRegenerating ? "Regenerating..." : "Regenerate"}
                        </Button>
                      </>
                    )}

                    <Button
                      onClick={handleSaveCV}
                      disabled={isSaving || !aiResponse}
                      className="flex items-center gap-2"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {isSaving ? "Saving..." : existingCV ? "Update CV" : "Save CV"}
                    </Button>
                  </div>
                </div>

                {/* Template Selection for Updates */}
                {existingCV && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-3">Change Template</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-all ${
                              selectedTemplate?.id === template.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <h4 className="font-medium text-sm">{template.name}</h4>
                            <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedTemplate && aiResponse && (
                  <CVPreview key={selectedTemplate.id} data={convertToCVData(aiResponse)} template={selectedTemplate} />
                )}
              </div>
              {aiResponse?.improvementScore && (
                <Card className="mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                          <span className="text-white font-bold text-lg">{aiResponse.improvementScore}%</span>
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
              )}
            </div>

            {aiResponse && (
              <CVEditPopup
                isOpen={showEditPopup}
                onClose={() => setShowEditPopup(false)}
                cvData={aiResponse.optimizedCV}
                onSave={handleCVDataUpdate}
                isLoading={isSaving}
              />
            )}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
