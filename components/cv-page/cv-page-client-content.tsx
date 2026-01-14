"use client"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { ArrowLeft, Sparkles, TrendingUp, Loader2, GripVertical, RotateCcw, ChevronDown, Trash2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { getPersonaById, type PersonaResponse } from "../../lib/redux/service/pasonaService"
import type { CVData, CVSectionId, CVStyleSettings, PersonalInfoFieldId } from "../../types/cv-data"
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
import { useCVExport } from "./use-cv-export"
import { showSuccessToast, showErrorToast, showInfoToast, showLoadingToast } from "./cv-toasts"
import { TemplateSelectorDialog } from "./template-selector-dialog"
import { SettingsPanelDialog } from "./settings-panel-dialog"
import { DesignPanelDialog } from "./design-panel-dialog"

const DEFAULT_SECTION_ORDER: CVSectionId[] = ["personalInfo", "skills", "experience", "projects", "education", "certifications", "languages", "interests"]
const SECTION_LABELS: Record<CVSectionId, string> = {
  personalInfo: "Personal Info",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  interests: "Interests",
}

const DEFAULT_PERSONAL_INFO_FIELD_ORDER: PersonalInfoFieldId[] = [
  "fullName",
  "jobTitle",
  "email",
  "phone",
  "location",
  "address",
  "linkedin",
  "github",
  "summary",
]

const PERSONAL_INFO_FIELD_LABELS: Record<PersonalInfoFieldId, string> = {
  fullName: "Full Name",
  jobTitle: "Job Title",
  email: "Email",
  phone: "Phone",
  address: "Address",
  location: "City / Country",
  linkedin: "LinkedIn",
  github: "GitHub",
  summary: "Summary",
}

const DEFAULT_STYLE_SETTINGS: CVStyleSettings = {
  bodyFontFamily: "inter",
  headingFontFamily: "inter",
  bodyFontSizePx: 12,
  headingFontSizePx: 20,
  lineHeight: 1.35,
  marginLeftRightMm: 16,
  marginTopBottomMm: 16,
  spaceBetweenEntriesPx: 12,
  textColor: "#374151",
  headingColor: "#111827",
  mutedColor: "#4b5563",
  accentColor: "#111827",
  borderColor: "#1f2937",
  backgroundColor: "#ffffff",
  backgroundImageUrl: "",
  colorMode: "basic",
  borderMode: "single",
  applyAccentToName: false,
  applyAccentToJobTitle: false,
  applyAccentToHeadings: false,
  applyAccentToHeadingsLine: false,
  applyAccentToHeaderIcons: false,
  applyAccentToDotsBarsBubbles: false,
  applyAccentToDates: false,
  applyAccentToLinkIcons: false,
  datesOpacity: 0.7,
  locationOpacity: 0.7,
  align: "left",
  capitalization: "uppercase",
  headingsLine: true,
  headerIcons: "none",
  linkIcons: "none",
  iconFrame: "none",
  iconSize: "sm",
  dotsBarsBubbles: "dots",
  descriptionIndentPx: 16,
  entryListStyle: "bullet",
  showPageNumbers: true,
  showEmail: false,
  nameBold: true,
  sectionHeaderIconStyle: "none",
  bulletStyle: "disc",
}

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
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [showDesignPanel, setShowDesignPanel] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [formData, setFormData] = useState<CVFormData | null>(null)
  const [sectionOrder, setSectionOrder] = useState<CVSectionId[]>(DEFAULT_SECTION_ORDER)
  const [hiddenSections, setHiddenSections] = useState<CVSectionId[]>([])
  const [personalInfoFieldOrder, setPersonalInfoFieldOrder] = useState<PersonalInfoFieldId[]>(DEFAULT_PERSONAL_INFO_FIELD_ORDER)
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(true)
  const [styleSettings, setStyleSettings] = useState<CVStyleSettings>(DEFAULT_STYLE_SETTINGS)

  const searchParams = useSearchParams()
  const router = useRouter()
  const personaId = searchParams?.get("personaId") ?? ""
  const cvId = searchParams?.get("cvId") ?? ""
  const templateIdFromUrl = searchParams?.get("templateId") ?? ""
  const viewMode = searchParams?.get("view") === "true"

  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const cvPreviewRef = useRef<HTMLDivElement>(null)

  const { handleExport, exportAsPNG, handleDocxExport } = useCVExport({
    selectedTemplateId: selectedTemplate?.id,
    personaFullName: persona?.full_name
  })

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
            const parsedSectionOrder = Array.isArray(parsedContent?.sectionOrder)
              ? (parsedContent.sectionOrder as unknown[]).filter((id): id is CVSectionId =>
                typeof id === "string" && Object.prototype.hasOwnProperty.call(SECTION_LABELS, id),
              )
              : undefined
            const parsedPersonalInfoOrder = Array.isArray(parsedContent?.personalInfoFieldOrder)
              ? (parsedContent.personalInfoFieldOrder as unknown[]).filter((id): id is PersonalInfoFieldId =>
                typeof id === "string" && Object.prototype.hasOwnProperty.call(PERSONAL_INFO_FIELD_LABELS, id),
              )
              : undefined
            const parsedHiddenSections = Array.isArray(parsedContent?.hiddenSections)
              ? (parsedContent.hiddenSections as unknown[]).filter((id): id is CVSectionId =>
                typeof id === "string" && Object.prototype.hasOwnProperty.call(SECTION_LABELS, id),
              )
              : undefined
            const parsedStyleSettings = parsedContent?.styleSettings
            const { sectionOrder: _ignored, personalInfoFieldOrder: _ignored2, hiddenSections: _ignored3, styleSettings: _ignored4, ...optimizedCV } = parsedContent || {}
            if (parsedSectionOrder && parsedSectionOrder.length > 0) setSectionOrder(parsedSectionOrder)
            if (parsedPersonalInfoOrder && parsedPersonalInfoOrder.length > 0) setPersonalInfoFieldOrder(parsedPersonalInfoOrder)
            if (parsedHiddenSections && parsedHiddenSections.length > 0) setHiddenSections(parsedHiddenSections)
            if (parsedStyleSettings && typeof parsedStyleSettings === "object") {
              setStyleSettings({ ...DEFAULT_STYLE_SETTINGS, ...(parsedStyleSettings as Partial<CVStyleSettings>) })
            }
            setAiResponse({
              optimizedCV,
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
      sectionOrder,
      personalInfoFieldOrder,
      hiddenSections,
      styleSettings,
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
      generated_content: JSON.stringify({ ...aiResponse.optimizedCV, sectionOrder, personalInfoFieldOrder, hiddenSections, styleSettings }),
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

  const previewCVData = aiResponse ? convertToCVData(aiResponse) : null
  const availableSectionIds: CVSectionId[] = []
  if (previewCVData) availableSectionIds.push("personalInfo")
  if (previewCVData && (previewCVData.skills.technical.length > 0 || previewCVData.skills.soft.length > 0)) availableSectionIds.push("skills")
  if (previewCVData?.experience?.length) availableSectionIds.push("experience")
  if (previewCVData?.projects?.length) availableSectionIds.push("projects")
  if (previewCVData?.education?.length) availableSectionIds.push("education")
  if (previewCVData?.certifications?.length) availableSectionIds.push("certifications")
  if (previewCVData?.languages?.length) availableSectionIds.push("languages")
  if (previewCVData?.additional?.interests?.length) availableSectionIds.push("interests")

  const visibleSectionOrder = (() => {
    const unique: CVSectionId[] = []
    sectionOrder.forEach((id) => {
      if (availableSectionIds.includes(id) && !hiddenSections.includes(id) && !unique.includes(id)) unique.push(id)
    })
    availableSectionIds.forEach((id) => {
      if (!hiddenSections.includes(id) && !unique.includes(id)) unique.push(id)
    })
    return unique
  })()

  const moveSection = (from: CVSectionId, to: CVSectionId) => {
    if (from === to) return
    const current = visibleSectionOrder
    const fromIndex = current.indexOf(from)
    const toIndex = current.indexOf(to)
    if (fromIndex === -1 || toIndex === -1) return
    const next = [...current]
    next.splice(fromIndex, 1)
    next.splice(toIndex, 0, from)
    const remaining = sectionOrder.filter((id) => !availableSectionIds.includes(id))
    setSectionOrder([...next, ...remaining])
    setHasUnsavedChanges(true)
  }

  const resetSectionOrder = () => {
    const remaining = sectionOrder.filter((id) => !availableSectionIds.includes(id))
    const next = DEFAULT_SECTION_ORDER.filter((id) => availableSectionIds.includes(id))
    availableSectionIds.forEach((id) => {
      if (!next.includes(id)) next.push(id)
    })
    setSectionOrder([...next, ...remaining])
    setHasUnsavedChanges(true)
  }

  const hideSection = (id: CVSectionId) => {
    if (id === "personalInfo") return
    setHiddenSections((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setHasUnsavedChanges(true)
  }

  const unhideSection = (id: CVSectionId) => {
    setHiddenSections((prev) => prev.filter((s) => s !== id))
    setSectionOrder((prev) => (prev.includes(id) ? prev : [...prev, id]))
    setHasUnsavedChanges(true)
  }

  const resetAllSettings = () => {
    setHiddenSections([])
    resetPersonalInfoOrder()
    resetSectionOrder()
    setStyleSettings(DEFAULT_STYLE_SETTINGS)
    setHasUnsavedChanges(true)
  }

  const resetStyleSettings = () => {
    setStyleSettings(DEFAULT_STYLE_SETTINGS)
    setHasUnsavedChanges(true)
  }

  const visiblePersonalInfoFieldOrder = (() => {
    const all = Object.keys(PERSONAL_INFO_FIELD_LABELS) as PersonalInfoFieldId[]
    const unique: PersonalInfoFieldId[] = []
    personalInfoFieldOrder.forEach((id) => {
      if (all.includes(id) && !unique.includes(id)) unique.push(id)
    })
    all.forEach((id) => {
      if (!unique.includes(id)) unique.push(id)
    })
    return unique
  })()

  const movePersonalInfoField = (from: PersonalInfoFieldId, to: PersonalInfoFieldId) => {
    if (from === to) return
    const current = visiblePersonalInfoFieldOrder
    const fromIndex = current.indexOf(from)
    const toIndex = current.indexOf(to)
    if (fromIndex === -1 || toIndex === -1) return
    const next = [...current]
    next.splice(fromIndex, 1)
    next.splice(toIndex, 0, from)
    setPersonalInfoFieldOrder(next)
    setHasUnsavedChanges(true)
  }

  const resetPersonalInfoOrder = () => {
    setPersonalInfoFieldOrder(DEFAULT_PERSONAL_INFO_FIELD_ORDER)
    setHasUnsavedChanges(true)
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
                  onChangeSettings={() => setShowSettingsPanel(true)}
                  onChangeDesign={() => setShowDesignPanel(true)}
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
          <TemplateSelectorDialog
            open={showTemplateSelector}
            onOpenChange={setShowTemplateSelector}
            onTemplateSelect={handleTemplateSelect}
            selectedTemplateId={selectedTemplate?.id || ""}
          />

          <SettingsPanelDialog
            open={showSettingsPanel}
            onOpenChange={setShowSettingsPanel}
            hiddenSections={hiddenSections}
            setHiddenSections={setHiddenSections}
            setHasUnsavedChanges={setHasUnsavedChanges}
            resetAllSettings={resetAllSettings}
            availableSectionIds={availableSectionIds}
            visibleSectionOrder={visibleSectionOrder}
            moveSection={moveSection}
            hideSection={hideSection}
            unhideSection={unhideSection}
            isPersonalInfoOpen={isPersonalInfoOpen}
            setIsPersonalInfoOpen={setIsPersonalInfoOpen}
            resetPersonalInfoOrder={resetPersonalInfoOrder}
            visiblePersonalInfoFieldOrder={visiblePersonalInfoFieldOrder}
            movePersonalInfoField={movePersonalInfoField}
          />

          <DesignPanelDialog
            open={showDesignPanel}
            onOpenChange={setShowDesignPanel}
            value={styleSettings}
            onChange={(next: CVStyleSettings) => {
              setStyleSettings(next)
              setHasUnsavedChanges(true)
            }}
            onReset={resetStyleSettings}
          />
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
