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
import { SidebarProvider, SidebarInset } from "../../components/ui/sidebar"
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
import { CVPreviewSection } from "./cv-preview-section"
import jsPDF from "jspdf"
import * as htmlToImage from "html-to-image"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"
import { CVTemplates } from "../../pages/resume/ChooseResumeTemplte"

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

interface CVFormData {
  user_id: string;
  layout_id: string;
  personas_id: string;
  title: string;
  job_description: string;
  persona?: PersonaResponse | null;
}

const templates: CVTemplate[] = [
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

  {
    id: "creative",
    name: "Creative SOFIA",
    description: "Clean layout with name positioned on left side",
    category: "creative",
  },
  {
    id: "creative-2",
    name: "Creative Minimal Clean",
    description: "Simple, clean layout focusing on content",
    category: "creative",
  },
  {
    id: "creative-3",
    name: "Creative Designer",
    description: "Eye-catching design for creative professionals",
    category: "creative",
  },
  {
    id: "creative-4",
    name: "Creative JAY",
    description: "Gray sidebar with clean white main content",
    category: "creative",
  },

  {
    id: "minimal-2",
    name: "Minimal Clean 2",
    description: "An updated minimal layout focusing on content",
    category: "minimal",
  },
  {
    id: "minimal-3",
    name: "Minimal Clean 3",
    description: "Another variation of the minimal layout",
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

export function CVPageClientContent() {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [persona, setPersona] = useState<PersonaResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<CVTemplate | null>(null)
  const [activePage, setActivePage] = useState("persona")
  const [existingCV, setExistingCV] = useState<CV | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showEditPopup, setShowEditPopup] = useState(false)
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [formData, setFormData] = useState<CVFormData | null>(null)

  const searchParams = useSearchParams()
  const router = useRouter()
  const personaId = searchParams?.get("personaId") ?? ""
  const cvId = searchParams?.get("cvId") ?? ""
  const templateIdFromUrl = searchParams?.get("templateId") ?? ""
  const viewMode = searchParams?.get("view") === "true"

  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const cvPreviewRef = useRef<HTMLDivElement>(null)

  const defaultTemplate: CVTemplate = {
    id: "classic",
    name: "Classic Traditional",
    description: "Traditional format ideal for conservative industries",
    category: "classic",
  }

  // Sync selected template with URL only when the URL changes.
  useEffect(() => {
    if (templateIdFromUrl) {
      const foundTemplate = templates.find((t) => t.id === templateIdFromUrl) || defaultTemplate
      setSelectedTemplate((prev) => (prev?.id === foundTemplate.id ? prev : foundTemplate))
    } else {
      setSelectedTemplate((prev) => prev ?? defaultTemplate)
    }
  }, [templateIdFromUrl])

  useEffect(() => {
    // Set view mode based on URL parameter
    setIsViewMode(viewMode)
  }, [viewMode])

  useEffect(() => {
    // Load form data from sessionStorage on component mount
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("cv_form_data");
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setFormData(parsedData);
          console.log("Loaded form data from sessionStorage:", parsedData);
        } catch (error) {
          console.error("Failed to parse cv_form_data:", error);
        }
      }
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // FIRST: Check for existing CV (editing mode)
        if (cvId) {
          console.log("Loading existing CV with ID:", cvId);
          const cvData = await getCVById(cvId)
          setExistingCV(cvData)
          setJobDescription(cvData.job_description || "")

          const template = templates.find((t) => t.id === cvData.layout_id) || defaultTemplate
          setSelectedTemplate(template)

          let personaData: PersonaResponse | null = null
          if (cvData.personas_id) {
            personaData = await getPersonaById(Number.parseInt(cvData.personas_id))
            setPersona(personaData)
          }

          if (cvData.generated_content) {
            const parsedContent = JSON.parse(cvData.generated_content)
            setAiResponse({
              optimizedCV: parsedContent,
              suggestions: [],
              improvementScore: 80,
            })
          } else if (personaData) {
            const personaText = convertPersonaToText(personaData)
            const response = await fetch("https://stagingnode.resumaic.com/api/optimize-cv", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                extractedText: personaText,
                jobDescription: cvData.job_description || ""
              }),
            })
            if (response.ok) {
              const aiData = await response.json()
              setAiResponse(aiData)
              setHasUnsavedChanges(true)
            } else {
              console.error("Failed to regenerate AI content for existing CV:", response.status)
            }
          }

          setIsLoading(false)
          return
        }

        // SECOND: Check if we have form data from CVWizard (NEW CV creation)
        if (formData) {
          console.log("Creating new CV from form data:", formData);
          
          // Set job description from form data
          setJobDescription(formData.job_description || "")

          // Store title for later use
          if (typeof window !== "undefined") {
            sessionStorage.setItem("cv_wizard_title", formData.title || "");
          }

          // Set template from form data
          const templateToUse = formData.layout_id
            ? templates.find((t) => t.id === formData.layout_id) || defaultTemplate
            : defaultTemplate
          setSelectedTemplate(templateToUse)

          // Use persona from form data if available, otherwise fetch it
          let personaData: PersonaResponse | null = null;
          if (formData.persona) {
            personaData = formData.persona;
            setPersona(personaData);
          } else if (formData.personas_id) {
            personaData = await getPersonaById(Number.parseInt(formData.personas_id));
            setPersona(personaData);
          } else {
            setError("No persona data provided");
            setIsLoading(false);
            return;
          }

          if (!personaData) {
            setError("Failed to load persona data");
            setIsLoading(false);
            return;
          }

          // Generate AI response with combined data
          const personaText = convertPersonaToText(personaData)
          console.log("Making AI request with persona text and job description");

          try {
            const response = await fetch("https://stagingnode.resumaic.com/api/optimize-cv", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                extractedText: personaText,
                jobDescription: formData.job_description || ""
              }),
            })

            if (response.ok) {
              const aiData = await response.json()
              setAiResponse(aiData)
              setHasUnsavedChanges(true)
              
              // Clear form data from sessionStorage after successful generation
              setTimeout(() => {
                if (typeof window !== "undefined") {
                  sessionStorage.removeItem("cv_form_data");
                  console.log("Cleared cv_form_data from sessionStorage");
                }
              }, 1000);
            } else {
              throw new Error(`AI API responded with status: ${response.status}`);
            }
          } catch (aiError) {
            console.error("AI API error:", aiError);
            setError("Failed to generate AI content. Please try again.");
          }

          setIsLoading(false)
          return
        }

        // THIRD: Fallback to old flow (direct navigation with personaId in URL)
        console.log("Falling back to old flow with personaId:", personaId);
        if (!personaId) {
          setError("No form data or persona ID provided. Please go back and create a resume from the wizard.");
          setIsLoading(false)
          return
        }

        // Old flow (from URL params)
        const personaData = await getPersonaById(Number.parseInt(personaId))
        if (!personaData) {
          setError("Persona not found.")
          setIsLoading(false)
          return
        }
        setPersona(personaData)

        // Check for job description from sessionStorage (old way)
        if (typeof window !== "undefined") {
          const wizardJobDesc = sessionStorage.getItem("cv_wizard_job_description")
          if (wizardJobDesc) {
            setJobDescription(wizardJobDesc)
          }
        }

        const templateToUse = templateIdFromUrl
          ? templates.find((t) => t.id === templateIdFromUrl) || defaultTemplate
          : defaultTemplate
        setSelectedTemplate(templateToUse)

        // Generate AI response
        const personaText = convertPersonaToText(personaData)
        const response = await fetch("https://stagingnode.resumaic.com/api/optimize-cv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            extractedText: personaText,
            jobDescription: jobDescription || ""
          }),
        })

        if (response.ok) {
          const aiData = await response.json()
          setAiResponse(aiData)
          setHasUnsavedChanges(true)
        }

      } catch (err: any) {
        console.error("Error in fetchData:", err)
        setError(err.message || "Failed to load CV data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [cvId, formData, personaId]) // Remove templateIdFromUrl from dependencies to prevent re-fetching

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
        role: "",
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
    router.push(`/dashboard?activePage=persona&editId=${personaId}`)
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

      console.log("Making request to:", "https://stagingnode.resumaic.com/api/optimize-cv")
      console.log("Request payload size:", JSON.stringify({ extractedText: personaText }).length)

      const response = await fetch("https://stagingnode.resumaic.com/api/optimize-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extractedText: personaText,
          jobDescription: jobDescription || ""
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
            const pdf = new jsPDF({
              orientation: 'p',
              unit: 'mm',
              format: 'a4',
              compress: true
            })
            const pageWidth = pdf.internal.pageSize.getWidth()

            for (let i = 0; i < pageEls.length; i++) {
              const pageEl = pageEls[i]
              const dataUrl = await htmlToImage.toJpeg(pageEl, {
                quality: 0.8,
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
              pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, imgHeightMm)
              if (i < pageEls.length - 1) pdf.addPage()
            }

            pdf.save(filename)
          } else {
            const dataUrl = await htmlToImage.toJpeg(cvElement, {
              quality: 0.95,
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
            pdf.addImage(dataUrl, 'JPEG', 0, 0, pageWidth, imgHeightMm)
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
          const response = await fetch(`https://stagingnode.resumaic.com/api/cv-export/docx`, {
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

  const handleSaveCV = async (isAutoSave: boolean = false) => {
    if (!aiResponse || !selectedTemplate || !persona || !user?.id) {
      if (!isAutoSave) {
        showErrorToast("Save Failed", "Missing required data. Please regenerate your CV and try again.");
      }
      return;
    }

    // Get title from sessionStorage or state
    let titleToUse = existingCV?.title || "";
    if (!existingCV) {
      if (typeof window !== "undefined") {
        const wizardTitle = sessionStorage.getItem("cv_wizard_title");
        titleToUse = wizardTitle || `${persona.full_name}'s AI CV - ${selectedTemplate.name}`;
      }
    }

    const cvDataToSave: CreateCVData = {
      user_id: user.id.toString(),
      layout_id: selectedTemplate.id,
      personas_id: persona.id.toString(),
      title: titleToUse,
      job_description: jobDescription || "AI-generated CV based on persona",
      generated_content: JSON.stringify(aiResponse.optimizedCV),
    };

    setIsSaving(true)
    let loadingToastId: string | number | undefined
    
    if (!isAutoSave) {
      loadingToastId = showLoadingToast(
        existingCV ? "Updating your CV..." : "Saving your CV...",
        "Securing your professional profile",
      )
    }

    try {
      if (existingCV) {
        // Update existing CV
        const updatedCV = await updateCV(existingCV.id, cvDataToSave)
        setExistingCV(updatedCV)
        setHasUnsavedChanges(false)

        if (!isAutoSave && loadingToastId) {
          toast.dismiss(loadingToastId)
          showSuccessToast("CV Updated Successfully! 🎉", "Your changes have been saved and are ready to use")
          
          // Redirect back to resume list
          router.push("/dashboard/resumes")
        }
      } else {
        // Create new CV
        const newCV = await createCV(cvDataToSave)
        setExistingCV(newCV)
        setHasUnsavedChanges(false)

        if (!isAutoSave && loadingToastId) {
          toast.dismiss(loadingToastId)
          showSuccessToast(
            "CV Created Successfully! 🚀",
            "Your professional CV is now saved and ready to impress employers",
          )
          
          // Redirect back to resume list after creation
          setTimeout(() => {
            router.push("/dashboard/resumes");
          }, 1500);
        }
      }
    } catch (saveError: any) {
      if (!isAutoSave && loadingToastId) {
        toast.dismiss(loadingToastId)
        showErrorToast("Save Failed", saveError?.message || "Unable to save CV. Please try again.")
      } else {
        console.error("Auto-save failed:", saveError)
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges && aiResponse && selectedTemplate && persona && !isSaving && !isRegenerating) {
      const timer = setTimeout(() => {
        handleSaveCV(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [hasUnsavedChanges, aiResponse, selectedTemplate, persona, isSaving, isRegenerating, jobDescription])

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
    showInfoToast("CV Updated! 📝", "Your changes have been applied successfully.")
  }

  const handleTemplateSelect = (template: CVTemplate) => {
    setSelectedTemplate(template)
    setHasUnsavedChanges(true)
    setShowTemplateSelector(false)
    const url = new URL(window.location.href)
    url.searchParams.set("templateId", template.id)
    router.replace(url.toString())
  }

  if (isLoading) {
    return <CVPageLoading isEditMode={!!cvId} />
  }

  if (error) {
    return (
      <div className="min-h-screen max-w-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className=" max-w-full">
          <CardContent className="text-center p-6">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <TrendingUp className="h-12 w-12 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard/resumes")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back to Resumes
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if ((!persona && !existingCV) || !selectedTemplate) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="text-center p-6">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                <Sparkles className="h-12 w-12 mx-auto" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No CV Data Available</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Please ensure a persona and template are selected to generate a CV.</p>
              <Button onClick={() => router.push("/dashboard/resumes")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back to Resumes
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
        <Sidebar
          user={user}
          activePage="cv-export"
          setActivePage={(page) => {
            try {
              if (typeof window !== "undefined") {
                window.localStorage.setItem('dashboardActivePage', page)
              }
            } catch { }

            if (
              page === "persona" ||
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
        <SidebarInset className="p-6 bg-gray-50 dark:bg-gray-950 overflow-y-auto flex flex-col items-center">
          <div className="flex flex-col gap-6 max-w-full w-full">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{existingCV?.title || "Create Your CV"}</h1>
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
                  onChangeTemplate={() => setShowTemplateSelector(true)}
                />
              </div>
              {selectedTemplate && aiResponse && (
                <CVPreviewSection
                  selectedTemplate={selectedTemplate}
                  aiResponse={aiResponse}
                  convertToCVData={convertToCVData}
                  isRegenerating={isRegenerating}
                />
              )}
              {selectedTemplate && !aiResponse && (
                <Card className="mt-4">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No preview available</h3>
                        <p className="text-gray-600 dark:text-gray-300">Generate the CV preview from your persona to continue.</p>
                      </div>
                      <Button onClick={handleRegenerateCV} disabled={isRegenerating}>
                        {isRegenerating ? (
                          <span className="flex items-center"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating</span>
                        ) : (
                          "Generate Preview"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <Dialog
            open={showTemplateSelector}
            onOpenChange={setShowTemplateSelector}
          >
            <DialogContent className="w-[80vw] !max-w-none h-[90vh] flex flex-col">
              <DialogHeader className="px-6 flex flex-row items-center justify-between">
                <div className="flex flex-col gap-1">
                  <DialogTitle className="text-2xl font-bold">
                    Choose a Template
                  </DialogTitle>
                  <DialogDescription>
                    Select a template to update your resume layout.
                  </DialogDescription>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto min-h-0 -mx-3 px-6">
                <CVTemplates
                  onTemplateSelect={handleTemplateSelect}
                  selectedTemplate={selectedTemplate?.id || ""}
                />
              </div>
            </DialogContent>
          </Dialog>

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
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
