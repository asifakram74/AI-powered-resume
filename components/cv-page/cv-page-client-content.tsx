"use client"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { ArrowLeft, Sparkles, TrendingUp, Loader2, Brain, CheckCircle, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { getPersonaById, type PersonaResponse } from "../../lib/redux/service/pasonaService"
import type { CVData } from "../../types/cv-data"
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks"
import { logoutUser } from "../../lib/redux/slices/authSlice"
import { SidebarProvider } from "../../components/ui/sidebar"
import { Sidebar } from "../../components/dashboard/sidebar"
import CreatePersonaPage from "../../pages/persona/PersonaList"
import { ResumePage } from "../../pages/resume/ResumeList"
import { CoverLetterPage } from "../../pages/cover-letter/CoverLetterList"
import ATSCheckerPage from "../../pages/ats/ats-checker-page"
import { ProfilePage } from "../../pages/profile/profile-page"
import ProtectedRoute from "../../components/auth/ProtectedRoute"
import { createCV, getCVById, updateCV, type CreateCVData, type CV } from "../../lib/redux/service/resumeService"
import { CVEditPopup } from "./cv-edit-popup"

import { CVPageLoading } from "./cv-page-loading"
import { CVHeaderActions } from "./cv-header-actions"
import { CVTemplateSelector } from "./cv-template-selector"
import { CVPreviewSection } from "./cv-preview-section"
import jsPDF from "jspdf"
import * as htmlToImage from "html-to-image"

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
//  {
//   id: "modern",
//   name: "Modern Professional",
//   description: "Clean, modern design perfect for tech and business professionals",
//   category: "modern",
// },
// {
//   id: "modern-2",
//   name: "Modern LOREN",
//   description: "Dark blue curved sidebar with elegant design",
//   category: "modern",
// },
// {
//   id: "modern-3",
//   name: "Modern LILLY",
//   description: "Light blue sidebar with rounded contact section",
//   category: "modern",
// },
// {
//   id: "modern-4",
//   name: "Modern MIKE",
//   description: "Blue sidebar with professional white layout",
//   category: "modern",
// },

{
  id: "classic",
  name: "Classic Traditional",
  description: "Traditional format ideal for conservative industries",
  category: "classic",
},
{
  id: "classic-2",
  name: "Classic Traditional 2",
  description: "An updated classic format for conservative industries",
  category: "classic",
},
{
  id: "classic-3",
  name: "Classic Traditional 3",
  description: "Another variation of the classic format",
  category: "classic",
},
{
  id: "classic-4",
  name: "Classic Traditional 4",
  description: "Premium classic format with enhanced layout",
  category: "classic",
},

// {
//   id: "creative",
//   name: "Creative SOFIA",
//   description: "Clean layout with name positioned on left side",
//   category: "creative",
// },
// {
//   id: "creative-2",
//   name: "Creative Minimal Clean",
//   description: "Simple, clean layout focusing on content",
//   category: "creative",
// },
// {
//   id: "creative-3",
//   name: "Creative Designer",
//   description: "Eye-catching design for creative professionals",
//   category: "creative",
// },
// {
//   id: "creative-4",
//   name: "Creative JAY",
//   description: "Gray sidebar with clean white main content",
//   category: "creative",
// },

// {
//   id: "minimal",
//   name: "Minimal",
//   description: "A new creative design for professionals",
//   category: "minimal",
// },
// {
//   id: "minimal-2",
//   name: "Minimal Clean 2",
//   description: "An updated minimal layout focusing on content",
//   category: "minimal",
// },
// {
//   id: "minimal-3",
//   name: "Minimal Clean 3",
//   description: "Another variation of the minimal layout",
//   category: "minimal",
// },
// {
//   id: "minimal-4",
//   name: "Minimal Clean 4",
//   description: "Ultra-clean minimal design focusing on content",
//   category: "minimal",
// },
// {
//   id: "minimal-5",
//   name: "Minimal 5",
//   description: "Another creative design option",
//   category: "minimal",
// },
// {
//   id: "minimal-6",
//   name: "Minimal 6",
//   description: "Another modern design option",
//   category: "minimal",
// },
// {
//   id: "minimal-7",
//   name: "Minimal 7",
//   description: "Advanced modern design for professionals",
//   category: "minimal",
// },
// {
//   id: "minimal-8",
//   name: "Minimal 8",
//   description: "Premium creative design for professionals",
//   category: "minimal",
// },


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
  const [isViewMode, setIsViewMode] = useState(false) // Add this state
  const [filter, setFilter] = useState<"all" | "modern" | "classic" | "creative" | "minimal">("all")

  const searchParams = useSearchParams()
  const router = useRouter()
  const personaId = searchParams?.get("personaId") ?? ""
  const cvId = searchParams?.get("cvId") ?? ""
  const templateIdFromUrl = searchParams?.get("templateId") ?? ""
  const viewMode = searchParams?.get("view") === "true" // Check for view mode parameter

  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const cvPreviewRef = useRef<HTMLDivElement>(null)
  const filteredTemplates = templates.filter((template) => {
    if (filter === "all") return true
    return template.category === filter
  })

  const renderActivePage = () => {
    switch (activePage) {
      case "create-persona":
        return <CreatePersonaPage user={user} />
      case "resumes":
        return <ResumePage user={user} />
      case "cover-letter":
        return <CoverLetterPage user={user} />
      case "ats-checker":
        return <ATSCheckerPage />
      case "profile":
        return <ProfilePage />
      default:
        return <CreatePersonaPage user={user} />
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

  // Sync selected template with URL only when the URL changes.
  // Avoid reverting to the previous template during a local selection update.
  useEffect(() => {
    if (templateIdFromUrl) {
      const foundTemplate = templates.find((t) => t.id === templateIdFromUrl) || defaultTemplate
      // Only update if different to prevent duplicate re-renders
      setSelectedTemplate((prev) => (prev?.id === foundTemplate.id ? prev : foundTemplate))
    } else {
      // Initialize default template once when no URL param is present
      setSelectedTemplate((prev) => prev ?? defaultTemplate)
    }
  }, [templateIdFromUrl])

  useEffect(() => {
    // Set view mode based on URL parameter
    setIsViewMode(viewMode)
  }, [viewMode])

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

          console.log("Making request to:", "https://backendserver.resumaic.com/api/optimize-cv")
          console.log("Request payload size:", JSON.stringify({ extractedText: personaText }).length)

          try {
            const testResponse = await fetch("https://backendserver.resumaic.com/", { method: "HEAD" })

            console.log("Server reachable:", testResponse.ok)
          } catch (testError) {
            console.error("Server not reachable:", testError)
          }

          const response = await fetch("https://backendserver.resumaic.com/api/optimize-cv", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              extractedText: personaText,
            }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const aiData = await response.json()

          if (aiData.error) {
            throw new Error(aiData.error)
          }

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
    // Derive location pieces from persona or AI location string
    const locationRaw = aiResponse.optimizedCV.personalInfo.location || ""
    const personaCity = persona?.city || ""
    const personaCountry = persona?.country || ""

    let derivedCity = personaCity
    let derivedCountry = personaCountry

    if (!derivedCity && !derivedCountry && locationRaw) {
      const parts = locationRaw.split(",").map((p) => p.trim()).filter(Boolean)
      if (parts.length >= 2) {
        derivedCity = parts[0]
        derivedCountry = parts.slice(1).join(", ")
      } else if (parts.length === 1) {
        // If only one token, treat it as city by default
        derivedCity = parts[0]
      }
    }

    return {
      id: existingCV?.id || "generated-cv",
      personalInfo: {
        fullName: aiResponse.optimizedCV.personalInfo.name,
        jobTitle: persona?.job_title || "",
        email: aiResponse.optimizedCV.personalInfo.email,
        phone: aiResponse.optimizedCV.personalInfo.phone,
        address: persona?.address || locationRaw,
        city: derivedCity,
        country: derivedCountry,
        profilePicture: persona?.profile_picture || "",
        summary: aiResponse.optimizedCV.summary,
        linkedin: aiResponse.optimizedCV.personalInfo.linkedin,
        github: "",
      },
      experience: aiResponse.optimizedCV.workExperience.map((exp, index) => {
        const normalizedDuration = (exp.duration || "").replace(/[–—]/g, "-")
        const parts = normalizedDuration.split("-").map((s) => s.trim())
        const start = parts[0] || ""
        let end = parts[1] || ""
        const current = /present/i.test(end)
        if (current) end = ""
        return {
          id: `exp-${index}`,
          jobTitle: exp.title,
          companyName: exp.company,
          location: "",
          startDate: start,
          endDate: end,
          current,
          responsibilities: [exp.description],
        }
      }),
      education: aiResponse.optimizedCV.education.map((edu, index) => ({
        id: `edu-${index}`,
        degree: edu.degree,
        institutionName: edu.institution,
        location: "",
        graduationDate: edu.year,
        gpa: edu.gpa || "",
        honors: (edu as any).honors || "",
        additionalInfo: (edu as any).additionalInfo || "",
      })),
      skills: {
        technical: aiResponse.optimizedCV.skills || [],
        soft: [],
      },
      languages: (aiResponse.optimizedCV.languages || []).map((lang, index) => ({
        id: `lang-${index}`,
        name: lang,
        proficiency: "Fluent" as const,
      })),
      certifications: [],
      projects: (aiResponse.optimizedCV.projects || []).map((proj, index) => ({
        id: `proj-${index}`,
        name: proj.name || "",
        role: "", // proj.role does not exist on the type, defaulting to empty string
        description: proj.description || "",
        technologies: proj.technologies || [],
        liveDemoLink: (proj as any).liveDemoLink || "",
        githubLink: (proj as any).githubLink || "",
      })),
      additional: {
        interests: aiResponse.optimizedCV.interests || [],
      },
      createdAt: new Date().toISOString(),
      generatedPersona: persona?.generatedPersona || "",
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

      console.log("Making request to:", "https://backendserver.resumaic.com/api/optimize-cv")
      console.log("Request payload size:", JSON.stringify({ extractedText: personaText }).length)

      try {
        const testResponse = await fetch("https://backendserver.resumaic.com", { method: "HEAD" })
        console.log("Server reachable:", testResponse.ok)
      } catch (testError) {
        console.error("Server not reachable:", testError)
      }

      const response = await fetch("https://backendserver.resumaic.com/api/optimize-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText: personaText,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const aiData = await response.json()

      if (aiData.error) {
        throw new Error(aiData.error)
      }

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

      try {
        const filename =
          format === "png"
            ? `${selectedTemplate?.id || "resume"}.png`
            : `${persona?.full_name || "resume"}-cv.${format}`

        if (format === "pdf") {
          const pageEls = Array.from(cvElement.querySelectorAll('.a4-page')) as HTMLElement[]
          if (pageEls.length > 0) {
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()

            for (let i = 0; i < pageEls.length; i++) {
              const pageEl = pageEls[i]
              const dataUrl = await htmlToImage.toPng(pageEl, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                skipFonts: true,
              })
              const img = new Image()
              await new Promise<void>((resolve) => {
                img.onload = () => resolve()
                img.src = dataUrl
              })
              const mmPerPx = pageWidth / img.width
              const imgHeightMm = img.height * mmPerPx
              pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, imgHeightMm)
              if (i < pageEls.length - 1) pdf.addPage()
            }

            pdf.save(filename)
          } else {
            const dataUrl = await htmlToImage.toPng(cvElement, {
              quality: 1,
              pixelRatio: 2,
              backgroundColor: '#ffffff',
              skipFonts: true,
            })
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pageWidth = pdf.internal.pageSize.getWidth()
            const img = new Image()
            await new Promise<void>((resolve) => {
              img.onload = () => resolve()
              img.src = dataUrl
            })
            const mmPerPx = pageWidth / img.width
            const imgHeightMm = img.height * mmPerPx
            pdf.addImage(dataUrl, 'PNG', 0, 0, pageWidth, imgHeightMm)
            pdf.save(filename)
          }
        } else if (format === "png") {
          const dataUrl = await htmlToImage.toPng(cvElement, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            skipFonts: true,
          })
          const link = document.createElement('a')
          link.href = dataUrl
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else if (format === "docx") {
          // Keep existing DOCX export flow via backend
          const response = await fetch(`https://backendserver.resumaic.com/api/cv-export/docx`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ html: cvElement.outerHTML, filename }),
          })
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to export ${format.toUpperCase()}`)
          }
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }

        toast.dismiss(loadingToastId)
        showSuccessToast(
          `${format.toUpperCase()} Downloaded! 📄`,
          `Your CV has been downloaded as ${format.toUpperCase()}`,
        )
      } catch (error) {
        console.error(`Error exporting as ${format}:`, error)
        toast.dismiss(loadingToastId)
        showErrorToast("Export Failed", `${format.toUpperCase()} export failed. Please try again.`)
      }
    } catch (error: any) {
      console.error("Export error:", error)
      showErrorToast("Export Failed", `Unable to export as ${format.toUpperCase()}. Please try again.`)
    }
  }

  const exportAsPNG = async () => {
    await handleExport("png")
  }

  const handleDocxExport = async () => {
    await handleExport("docx")
  }
  const handleSaveCV = async () => {
    if (!aiResponse || !selectedTemplate || !persona || !user?.id) {
      showErrorToast("Save Failed", "Missing required data. Please regenerate your CV and try again.")
      return
    }

    // Check CV limit for free plan users (only for new CVs); allow admin unlimited
    if (!existingCV && user?.plan === "free" && (user as any)?.profile?.cvs_count >= 3 && (user?.role?.toLowerCase() !== 'admin')) {
      showErrorToast(
        "CV Limit Reached",
        "Free plan allows only 3 resumes. Upgrade to pro for unlimited.",
      )
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
      toast.dismiss(loadingToastId)
      showErrorToast("Save Failed", saveError?.message || "Unable to save CV. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTitle = async (newTitle: string) => {
    if (!existingCV || !newTitle.trim()) return

    setIsSaving(true)
    const loadingToastId = showLoadingToast("Updating title...", "Saving your changes")

    try {
      const updatedCV = await updateCV(existingCV.id, {
        title: newTitle.trim(),
      })
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
            user={user}
            activePage="cv-export"
            setActivePage={(page) => {
              try {
                if (typeof window !== "undefined") {
                  window.localStorage.setItem('dashboardActivePage', page)
                }
              } catch {}

              // Navigate to dashboard for all sidebar pages including ATS Checker and Users
              if (
                page === "create-persona" ||
                page === "resumes" ||
                page === "cover-letter" ||
                page === "profile" ||
                page === "ats-checker" ||
                page === "users"
              ) {
                router.push("/dashboard")
              }
            }}
            onExportPDF={() => handleExport("pdf")}
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
                      <h1 className="text-2xl font-bold text-gray-900">{existingCV?.title || "Create Your CV"}</h1>
                    </div>
                  </div>

                  <CVHeaderActions
                    isViewMode={isViewMode}
                    aiResponse={aiResponse}
                    isRegenerating={isRegenerating}
                    isSaving={isSaving}
                    existingCV={existingCV}
                    onEdit={() => setShowEditPopup(true)}
                    onRegenerate={handleRegenerateCV}
                    onSave={handleSaveCV}
                  />
                </div>

                {/* Template Selection with Category Filter (mirrors ChooseResumeTemplte) */}
                {!isViewMode && (
                  <div className="mt-2">
                    <CVTemplateSelector
                      templates={templates}
                      selectedTemplate={selectedTemplate}
                      hasUnsavedChanges={hasUnsavedChanges}
                      onSelect={handleTemplateSelect}
                    />
                  </div>
                )}

                {selectedTemplate && aiResponse && (
                  <CVPreviewSection
                    selectedTemplate={selectedTemplate}
                    aiResponse={aiResponse}
                    convertToCVData={convertToCVData}
                    isRegenerating={isRegenerating}
                  />
                )}
              </div>

              {/* {aiResponse?.improvementScore && (
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
              )} */}
            </div>

            {aiResponse && (
              <CVEditPopup
                isOpen={showEditPopup}
                onClose={() => setShowEditPopup(false)}
                cvData={aiResponse.optimizedCV}
                onSave={handleCVDataUpdate}
                isLoading={isSaving}
                personaId={personaId || undefined}
                currentImageUrl={persona?.profile_picture}
                onProfilePictureUpdated={(newUrl) => {
                  setPersona((prev) => (prev ? { ...prev, profile_picture: newUrl } : prev))
                }}
              />
            )}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
