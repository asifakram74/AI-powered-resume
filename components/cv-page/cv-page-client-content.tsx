"use client"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Document, Packer, Paragraph } from "docx"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Save,
  RefreshCw,
  Edit,
  Loader2,
  Brain,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getPersonaById, type PersonaResponse } from "@/lib/redux/service/pasonaService"
import { CVPreview } from "@/pages/resume/CVPreview"
import type { CVData } from "@/types/cv-data"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"
import * as htmlToImage from "html-to-image"
import { jsPDF } from "jspdf"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { CreatePersonaPage } from "@/pages/persona/PersonaList"
import { ResumePage } from "@/pages/resume/ResumeList"
import { CoverLetterPage } from "@/pages/cover-letter/CoverLetterList"
import ATSCheckerPage from "@/pages/ats/ats-checker-page"
import { ProfilePage } from "@/pages/profile/profile-page"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { createCV, getCVById, updateCV, type CreateCVData, type CV } from "@/lib/redux/service/resumeService"
import { CVEditPopup } from "./cv-edit-popup"


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

const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
    icon: <CheckCircle className="h-5 w-5 text-green-500" />,
    style: {
      background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}

const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 5000,
    icon: <AlertCircle className="h-5 w-5 text-red-500" />,
    style: {
      background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}

const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
    icon: <Brain className="h-5 w-5 text-blue-500" />,
    style: {
      background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}

const showLoadingToast = (message: string, description?: string) => {
  return toast.loading(message, {
    description,
    icon: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
    style: {
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      color: "#1e293b",
      border: "1px solid #cbd5e1",
      borderRadius: "12px",
      padding: "16px",
      fontSize: "14px",
      fontWeight: "500",
    },
  })
}

export function CVPageLoading({ isEditMode = false }) {
  if (isEditMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          {/* Animated Icon */}
          <div className="relative mb-8">
            <div className="w-20 h-20 mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-blue-600 animate-bounce" />
              </div>
            </div>
            {/* Floating particles */}
            <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
            <div className="absolute -top-1 -right-3 w-2 h-2 bg-purple-400 rounded-full animate-ping animation-delay-300"></div>
            <div className="absolute -bottom-2 -left-1 w-2 h-2 bg-indigo-400 rounded-full animate-ping animation-delay-700"></div>
          </div>

          {/* Loading Text */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
              Loading Your CV
            </h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
              <p className="text-lg font-semibold text-blue-700 mb-2">
                Preparing your CV for editing...
              </p>
              <p className="text-sm text-gray-600">
                We’re getting everything ready so you can edit with ease.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
            </div>

            <p className="text-xs text-gray-500 mt-4">This usually takes just a moment</p>
          </div>
        </div>
      </div>
    );
  }

  const [loadingMessage, setLoadingMessage] = useState("Initializing AI analysis...")
  const [dots, setDots] = useState("")

  useEffect(() => {
    const messages = [
      "Initializing AI analysis...",
      "Analyzing your professional profile...",
      "Optimizing content structure...",
      "Enhancing keyword relevance...",
      "Crafting your perfect CV...",
      "Finalizing AI recommendations...",
    ]

    let messageIndex = 0
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length
      setLoadingMessage(messages[messageIndex])
    }, 2000)

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)

    return () => {
      clearInterval(messageInterval)
      clearInterval(dotsInterval)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-6">
      {/* AI Brain Animation */}
      <div className="relative mb-8">
        <div className="w-20 h-20 mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-blue-600 animate-bounce" />
          </div>
        </div>
        {/* Floating particles */}
        <div className="absolute -top-2 -left-2 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute -top-1 -right-3 w-2 h-2 bg-purple-400 rounded-full animate-ping animation-delay-300"></div>
        <div className="absolute -bottom-2 -left-1 w-2 h-2 bg-indigo-400 rounded-full animate-ping animation-delay-700"></div>
      </div>

      {/* Loading Text */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
          AI is Crafting Your CV
        </h2>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
          <p className="text-lg font-semibold text-blue-700 mb-2">
            Analyzing your details...
          </p>
          <p className="text-sm text-gray-600">
            Our AI is carefully building a personalized, career-ready CV just for you.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>

        <p className="text-xs text-gray-500 mt-4">This usually takes 15–20 seconds</p>
      </div>
    </div>
  </div>
);
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
      showErrorToast("Regeneration Failed", "No persona data available for regeneration.")
      return
    }

    setIsRegenerating(true)
    const loadingToastId = showLoadingToast(
      "AI is regenerating your CV...",
      "Analyzing your profile and creating fresh content",
    )

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

      toast.dismiss(loadingToastId)
      showSuccessToast(
        "CV Regenerated Successfully! ✨",
        "Your CV has been refreshed with new AI insights. Don't forget to save your changes.",
      )
    } catch (error: any) {
      console.error("Error regenerating CV:", error)
      // toast.dismiss(loadingToastId)
      showErrorToast("Regeneration Failed", error.message || "Unable to regenerate CV. Please try again.")
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleExport = async (format: "pdf" | "docx" | "png") => {
    try {
      const cvElement = document.getElementById("cv-preview-content")
      if (!cvElement) {
        showErrorToast("Export Failed", "CV preview not found. Please refresh and try again.")
        return
      }

      const loadingToastId = showLoadingToast(
        `Preparing ${format.toUpperCase()} export...`,
        "Processing your CV for download",
      )

      switch (format) {
        case "pdf":
          const printWindow = window.open("", "_blank")
          if (!printWindow) {
            toast.dismiss(loadingToastId)
            showErrorToast("Export Blocked", "Please allow popups for PDF export")
            return
          }
          const clonedContent = cvElement.cloneNode(true) as HTMLElement
          const styles = Array.from(document.styleSheets)
            .map((sheet) => {
              try {
                return Array.from(sheet.cssRules)
                  .map((rule) => rule.cssText)
                  .join("")
              } catch (e) {
                return ""
              }
            })
            .join("")

          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>CV Export</title>
                <style>${styles}</style>
                <style>
                  body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                  @media print { body { margin: 0; padding: 0; } }
                </style>
              </head>
              <body>${clonedContent.outerHTML}</body>
            </html>
          `)
          printWindow.document.close()
          printWindow.print()

          toast.dismiss(loadingToastId)
          showSuccessToast("PDF Ready! 📄", "Your CV is ready for printing or saving")
          break

        case "png":
          const dataUrl = await htmlToImage.toPng(cvElement, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
          })
          const link = document.createElement("a")
          link.download = `${persona?.full_name || "CV"}_${new Date().toISOString().split("T")[0]}.png`
          link.href = dataUrl
          link.click()

          toast.dismiss(loadingToastId)
          showSuccessToast("PNG Downloaded! 🖼️", "Your CV image has been saved to downloads")
          break

        case "docx":
          await handleDocxExport()
          toast.dismiss(loadingToastId)
          showSuccessToast("DOCX Downloaded! 📝", "Your editable CV document is ready")
          break
      }
    } catch (error: any) {
      console.error("Export error:", error)
      showErrorToast("Export Failed", `Unable to export as ${format.toUpperCase()}. Please try again.`)
    }
  }

  const exportAsPDF = async () => {
    try {
      const cvElement = document.getElementById("cv-preview-content")
      if (!cvElement) {
        showErrorToast("Export Failed", "CV preview not found. Please refresh and try again.")
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
        showErrorToast("Export Failed", "CV preview not found. Please refresh and try again.")
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
      showErrorToast("Export Failed", "PNG export failed. Please try again.")
    }
  }

  const handleDocxExport = async () => {
    try {
      if (!aiResponse || !persona) {
        showErrorToast("Export Failed", "No CV data available for export.");
        return;
      }
  
      // Import docx dynamically to avoid SSR issues
      const { Document, Paragraph, TextRun, HeadingLevel, Packer } = await import("docx");
  
      // Create document sections
      const sections = [
        // Personal Info
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          children: [
            new TextRun({
              text: aiResponse.optimizedCV.personalInfo.name,
              bold: true,
              size: 28,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: aiResponse.optimizedCV.personalInfo.email,
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: aiResponse.optimizedCV.personalInfo.phone,
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: aiResponse.optimizedCV.personalInfo.location,
              size: 22,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: aiResponse.optimizedCV.personalInfo.linkedin,
              size: 22,
            }),
          ],
        }),
        new Paragraph({ text: "" }), // Empty paragraph for spacing
  
        // Summary
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: "Professional Summary",
              bold: true,
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: aiResponse.optimizedCV.summary,
              size: 22,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
  
        // Work Experience
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: "Work Experience",
              bold: true,
              size: 24,
            }),
          ],
        }),
        ...aiResponse.optimizedCV.workExperience.flatMap((exp) => [
          new Paragraph({
            children: [
              new TextRun({
                text: `${exp.title} at ${exp.company}`,
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: exp.duration,
                italics: true,
                size: 20,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: exp.description,
                size: 22,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
        ]),
  
        // Education
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: "Education",
              bold: true,
              size: 24,
            }),
          ],
        }),
        ...aiResponse.optimizedCV.education.flatMap((edu) => [
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.degree} - ${edu.institution}`,
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${edu.year} | GPA: ${edu.gpa}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
        ]),
  
        // Skills
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: "Skills",
              bold: true,
              size: 24,
            }),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: aiResponse.optimizedCV.skills.join(", "),
              size: 22,
            }),
          ],
        }),
        new Paragraph({ text: "" }),
  
        // Projects
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({
              text: "Projects",
              bold: true,
              size: 24,
            }),
          ],
        }),
        ...aiResponse.optimizedCV.projects.flatMap((proj) => [
          new Paragraph({
            children: [
              new TextRun({
                text: proj.name,
                bold: true,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: proj.description,
                size: 22,
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Technologies: ${proj.technologies.join(", ")}`,
                size: 20,
              }),
            ],
          }),
          new Paragraph({ text: "" }),
        ]),
  
        // Certifications
        aiResponse.optimizedCV.certifications.length > 0
          ? new Paragraph({
              heading: HeadingLevel.HEADING_2,
              children: [
                new TextRun({
                  text: "Certifications",
                  bold: true,
                  size: 24,
                }),
              ],
            })
          : null,
        ...aiResponse.optimizedCV.certifications.flatMap((cert) => [
          new Paragraph({
            children: [
              new TextRun({
                text: cert,
                size: 22,
              }),
            ],
          }),
        ]),
      ].filter(Boolean); // Remove null sections
  
      // Filter out any null values from sections and ensure they are Paragraph objects
      const validSections = sections.filter((section): section is InstanceType<typeof Paragraph> => section !== null);
      
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: validSections,
          },
        ],
      });
  
      // Generate blob and download
      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${persona.full_name || "CV"}_${new Date().toISOString().split("T")[0]}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      showErrorToast("Export Failed", "Unable to generate DOCX file. Please try again.");
    }
  };
  const handleSaveCV = async () => {
    if (!aiResponse || !selectedTemplate || !persona || !user?.id) {
      showErrorToast("Save Failed", "Missing required data. Please regenerate your CV and try again.")
      return
    }

    setIsSaving(true)
    const loadingToastId = showLoadingToast(
      existingCV ? "Updating your CV..." : "Saving your CV...",
      "Securing your professional profile",
    )

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

        toast.dismiss(loadingToastId)
        showSuccessToast("CV Updated Successfully! 🎉", "Your changes have been saved and are ready to use")
      } else {
        // Create new CV
        const newCV = await createCV(cvDataToSave)
        setExistingCV(newCV)
        setHasUnsavedChanges(false)

        // Update URL to include the new CV ID
        const url = new URL(window.location.href)
        url.searchParams.set("cvId", newCV.id)
        router.replace(url.toString())

        toast.dismiss(loadingToastId)
        showSuccessToast(
          "CV Created Successfully! 🚀",
          "Your professional CV is now saved and ready to impress employers",
        )
      }
    } catch (saveError: any) {
      console.error("Error saving CV:", saveError)
      toast.dismiss(loadingToastId)
      showErrorToast("Save Failed", saveError.message || "Unable to save CV. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTitle = async (newTitle: string) => {
    if (!existingCV || !newTitle.trim()) return

    setIsSaving(true)
    const loadingToastId = showLoadingToast("Updating title...", "Saving your changes")

    try {
      const updatedCV = await updateCV(existingCV.id, { title: newTitle.trim() })
      setExistingCV(updatedCV)

      toast.dismiss(loadingToastId)
      showSuccessToast("Title Updated! ✏️", "Your CV title has been successfully changed")
    } catch (error: any) {
      console.error("Error updating CV title:", error)
      toast.dismiss(loadingToastId)
      showErrorToast("Update Failed", error.message || "Unable to update title. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCVDataUpdate = async (updatedData: OptimizedCV) => {
    setAiResponse((prev) => (prev ? { ...prev, optimizedCV: updatedData } : null))
    setHasUnsavedChanges(true)
    setShowEditPopup(false)
    showInfoToast("CV Updated! 📝", "Your changes look great! Remember to save to keep them permanent.")
  }

  if (isLoading) {
    return <CVPageLoading isEditMode={!!cvId} />
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
              if (page === "create-persona") {
                router.push("/dashboard?page=create-persona")
              } else if (page === "resumes") {
                router.push("/dashboard?page=resumes")
              } else if (page === "cover-letter") {
                router.push("/dashboard?page=cover-letter")
              } else if (page === "profile") {
                router.push("/dashboard?page=profile")
              }
            }}
            onExportPDF={exportAsPDF}
            onExportDOCX={handleDocxExport}
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
                        // <input
                        //   type="text"
                        //   value={existingCV.title}
                        //   onChange={(e) => handleUpdateTitle(e.target.value)}
                        //   className="text-2xl font-bold bg-transparent border-none outline-none focus:bg-white focus:border focus:border-gray-300 focus:rounded px-2 py-1"
                        //   onBlur={() => setHasUnsavedChanges(false)}
                        // />
                        <h1 className="text-2xl font-bold text-gray-900">Update Your CV</h1>
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
