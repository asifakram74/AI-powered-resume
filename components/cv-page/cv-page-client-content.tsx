"use client"
import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Loader2,
  GripVertical,
  RotateCcw,
  ChevronDown,
  Trash2,
  Eye,
  Plus,
  User,
  Edit2,
  Mail,
  Phone,
  MapPin,
  LayoutGrid,
  Briefcase,
  GraduationCap,
  Folder,
  Languages,
  Award,
  Heart,
  Wrench
} from "lucide-react"
import { useRouter } from "next/navigation"
import { getPersonaById, type PersonaResponse } from "../../lib/redux/service/pasonaService"
import type { CVData, CVSectionId, CVStyleSettings, PersonalInfoFieldId } from "../../types/cv-data"
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks"
import ProtectedRoute from "../../components/auth/ProtectedRoute"
import { createCV, getCVById, updateCV, type CreateCVData, type CV } from "../../lib/redux/service/resumeService"
import { CVPageLoading } from "./cv-page-loading"
import { CVHeaderActions } from "./cv-header-actions"
import { CVPreviewSection } from "./cv-preview-section"
import { useCVExport } from "./use-cv-export"
import { showSuccessToast, showErrorToast, showInfoToast, showLoadingToast } from "./cv-toasts"
import { TemplateSelectorDialog } from "./template-selector-dialog"
import { SettingsPanelDialog } from "./settings-panel-dialog"
import { DesignPanel } from "./design-panel-dialog"
import { CVSidebarEditForm, CVSidebarSection, type SectionItem } from "./cv-sidebar-section"
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
      fullName: string
      name?: string // Added name as optional field since API returns it
      jobTitle: string
      email: string
      phone: string
    location: string
    linkedin: string
    website: string
    profilePicture?: string
  }
  summary: string
  workExperience: Array<{
    title: string
    company: string
    duration: string
    description: string
    isHidden?: boolean
  }>
  education: Array<{
    degree: string
    institution: string
    year: string
    gpa: string
    isHidden?: boolean
  }>
  skills: Array<string | { title: string; isHidden?: boolean }>
  projects: Array<{
    name: string
    description: string
    technologies: string[]
    isHidden?: boolean
  }>
  certifications: Array<string | { title: string; isHidden?: boolean }>
  languages: Array<string | { name: string; isHidden?: boolean }>
  interests: Array<string | { title: string; isHidden?: boolean }>
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
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [formData, setFormData] = useState<CVFormData | null>(null)
  const [sectionOrder, setSectionOrder] = useState<CVSectionId[]>(DEFAULT_SECTION_ORDER)
  const [hiddenSections, setHiddenSections] = useState<CVSectionId[]>([])
  const [personalInfoFieldOrder, setPersonalInfoFieldOrder] = useState<PersonalInfoFieldId[]>(DEFAULT_PERSONAL_INFO_FIELD_ORDER)
  const [isPersonalInfoOpen, setIsPersonalInfoOpen] = useState(false)
  const [styleSettings, setStyleSettings] = useState<CVStyleSettings>(DEFAULT_STYLE_SETTINGS)
  const [activeTab, setActiveTab] = useState("content")
  const [expandedSectionId, setExpandedSectionId] = useState<CVSectionId | null>("personalInfo")
  const [editingItem, setEditingItem] = useState<{ sectionId: CVSectionId; index: number } | null>(null)
  const [activeSection, setActiveSection] = useState<CVSectionId | null>(null)

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
    personaFullName: persona?.full_name,
    resourceId: cvId ? parseInt(cvId) : undefined,
    resourceType: 'cv'
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

            // Map name to fullName for consistency if needed
            if (optimizedCV.personalInfo && optimizedCV.personalInfo.name && !optimizedCV.personalInfo.fullName) {
              optimizedCV.personalInfo.fullName = optimizedCV.personalInfo.name;
            }
            if (optimizedCV.personalInfo && !optimizedCV.personalInfo.jobTitle && personaData) {
              optimizedCV.personalInfo.jobTitle = personaData.job_title || "";
            }

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
              // Map name to fullName for consistency
              if (aiData.optimizedCV?.personalInfo && aiData.optimizedCV.personalInfo.name) {
                aiData.optimizedCV.personalInfo.fullName = aiData.optimizedCV.personalInfo.name;
                aiData.optimizedCV.personalInfo.jobTitle = personaData.job_title || "";
              }
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

    const visibleWorkExperience = (aiResponse.optimizedCV.workExperience || []).filter((exp) => !exp?.isHidden)
    const visibleEducation = (aiResponse.optimizedCV.education || []).filter((edu) => !edu?.isHidden)
    const visibleProjects = (aiResponse.optimizedCV.projects || []).filter((proj) => !proj?.isHidden)

    const visibleSkills = (aiResponse.optimizedCV.skills || [])
      .map((skill) =>
        typeof skill === "string" ? { value: skill, isHidden: false } : { value: skill?.title || "", isHidden: !!skill?.isHidden },
      )
      .filter((skill) => !skill.isHidden)
      .map((skill) => skill.value)
      .map((skill) => skill.trim())
      .filter(Boolean)

    const visibleLanguages = (aiResponse.optimizedCV.languages || [])
      .map((lang) =>
        typeof lang === "string" ? { value: lang, isHidden: false } : { value: lang?.name || "", isHidden: !!lang?.isHidden },
      )
      .filter((lang) => !lang.isHidden)
      .map((lang) => lang.value)
      .map((lang) => lang.trim())
      .filter(Boolean)

    const visibleCertifications = (aiResponse.optimizedCV.certifications || [])
      .map((cert) =>
        typeof cert === "string" ? { value: cert, isHidden: false } : { value: cert?.title || "", isHidden: !!cert?.isHidden },
      )
      .filter((cert) => !cert.isHidden)
      .map((cert) => cert.value)
      .map((cert) => cert.trim())
      .filter(Boolean)

    const visibleInterests = (aiResponse.optimizedCV.interests || [])
      .map((interest) =>
        typeof interest === "string"
          ? { value: interest, isHidden: false }
          : { value: interest?.title || "", isHidden: !!interest?.isHidden },
      )
      .filter((interest) => !interest.isHidden)
      .map((interest) => interest.value)
      .map((interest) => interest.trim())
      .filter(Boolean)

    return {
      id: existingCV?.id || "generated-cv",
      sectionOrder,
      personalInfoFieldOrder,
      hiddenSections,
      styleSettings,
      personalInfo: {
        fullName: aiResponse.optimizedCV.personalInfo.fullName || aiResponse.optimizedCV.personalInfo.name || "",
        jobTitle: aiResponse.optimizedCV.personalInfo.jobTitle || persona?.job_title || "",
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
      experience: visibleWorkExperience.map((exp, index) => {
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
      education: visibleEducation.map((edu, index) => ({
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
        technical: visibleSkills,
        soft: [],
      },
      languages: visibleLanguages.map((lang, index) => ({
        id: `lang-${index}`,
        name: lang,
        proficiency: "Fluent" as const,
      })),
      certifications: visibleCertifications.map((title, index) => ({
        id: `cert-${index}`,
        title,
        issuingOrganization: "",
        dateObtained: "",
        verificationLink: "",
      })),
      projects: visibleProjects.map((proj, index) => ({
        id: `proj-${index}`,
        name: proj.name || "",
        role: "",
        description: proj.description || "",
        technologies: proj.technologies || [],
        liveDemoLink: (proj as any).liveDemoLink || "",
        githubLink: (proj as any).githubLink || "",
      })),
      additional: {
        interests: visibleInterests,
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

      // Map name to fullName for consistency
      if (aiData.optimizedCV?.personalInfo && aiData.optimizedCV.personalInfo.name) {
        aiData.optimizedCV.personalInfo.fullName = aiData.optimizedCV.personalInfo.name;
        aiData.optimizedCV.personalInfo.jobTitle = persona?.job_title || "";
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
      job_description: jobDescription,
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

        if (typeof window !== "undefined") {
          const url = new URL(window.location.href)
          url.searchParams.set("cvId", String(newCV.id))
          url.searchParams.set("templateId", selectedTemplate.id)
          url.searchParams.delete("personaId")
          router.replace(url.toString())
        }

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

  const applyOptimizedCV = (updater: (prev: OptimizedCV) => OptimizedCV) => {
    setAiResponse((prev) => (prev ? { ...prev, optimizedCV: updater(prev.optimizedCV) } : prev))
    setHasUnsavedChanges(true)
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
  const availableSectionIds: CVSectionId[] = aiResponse ? [...DEFAULT_SECTION_ORDER] : []

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
    setActiveSection(from)
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
    setActiveSection(id)
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

  const SECTION_ICONS: Record<CVSectionId, any> = {
    personalInfo: User,
    skills: Wrench,
    experience: Briefcase,
    projects: Folder,
    education: GraduationCap,
    certifications: Award,
    languages: Languages,
    interests: Heart,
  }

  const asString = (value: unknown): string => (typeof value === "string" ? value : "")
  const asStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [])

  const getSectionItems = (sectionId: CVSectionId): SectionItem[] => {
    if (!aiResponse) return []
    const cv = aiResponse.optimizedCV

    if (sectionId === "personalInfo") return [{ ...cv.personalInfo, summary: cv.summary }]
    if (sectionId === "skills") return (cv.skills || []).map((s) => (typeof s === "string" ? { title: s } : { title: asString(s.title), isHidden: !!s.isHidden }))
    if (sectionId === "languages") return (cv.languages || []).map((s) => (typeof s === "string" ? { name: s } : { name: asString(s.name), isHidden: !!s.isHidden }))
    if (sectionId === "certifications") return (cv.certifications || []).map((s) => (typeof s === "string" ? { title: s } : { title: asString(s.title), isHidden: !!s.isHidden }))
    if (sectionId === "interests") return (cv.interests || []).map((s) => (typeof s === "string" ? { title: s } : { title: asString(s.title), isHidden: !!s.isHidden }))
    if (sectionId === "experience") return (cv.workExperience || []) as unknown as SectionItem[]
    if (sectionId === "education") return (cv.education || []) as unknown as SectionItem[]
    if (sectionId === "projects") return (cv.projects || []) as unknown as SectionItem[]
    return []
  }

  const updateSectionItems = (sectionId: CVSectionId, items: SectionItem[]) => {
    applyOptimizedCV((prev) => {
      if (sectionId === "personalInfo") {
        const item = items[0] || {}
        return {
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName: asString(item.fullName) || prev.personalInfo.fullName,
            jobTitle: asString(item.jobTitle) || prev.personalInfo.jobTitle,
            email: asString(item.email) || prev.personalInfo.email,
            phone: asString(item.phone) || prev.personalInfo.phone,
            location: asString(item.location) || prev.personalInfo.location,
            linkedin: asString(item.linkedin) || prev.personalInfo.linkedin,
            website: asString(item.website) || prev.personalInfo.website,
            profilePicture: asString(item.profilePicture) || prev.personalInfo.profilePicture,
          },
          summary: asString(item.summary) || prev.summary,
        }
      }

      if (sectionId === "skills") {
        return {
          ...prev,
          skills: items
            .map((i) => ({ title: asString(i.title || i.name).trim(), isHidden: !!i.isHidden }))
            .filter((i) => i.title.length > 0),
        }
      }
      if (sectionId === "languages") {
        return {
          ...prev,
          languages: items
            .map((i) => ({ name: asString(i.name || i.title).trim(), isHidden: !!i.isHidden }))
            .filter((i) => i.name.length > 0),
        }
      }
      if (sectionId === "certifications") {
        return {
          ...prev,
          certifications: items
            .map((i) => ({ title: asString(i.title || i.name).trim(), isHidden: !!i.isHidden }))
            .filter((i) => i.title.length > 0),
        }
      }
      if (sectionId === "interests") {
        return {
          ...prev,
          interests: items
            .map((i) => ({ title: asString(i.title || i.name).trim(), isHidden: !!i.isHidden }))
            .filter((i) => i.title.length > 0),
        }
      }
      if (sectionId === "experience") {
        return {
          ...prev,
          workExperience: items.map((i) => ({
            title: asString(i.title || i.jobTitle),
            company: asString(i.company || i.companyName),
            duration: asString(i.duration),
            description: asString(i.description),
            isHidden: !!i.isHidden,
          })),
        }
      }
      if (sectionId === "education") {
        return {
          ...prev,
          education: items.map((i) => ({
            degree: asString(i.degree),
            institution: asString(i.institution || i.institutionName),
            year: asString(i.year || i.graduationDate),
            gpa: asString(i.gpa),
            isHidden: !!i.isHidden,
          })),
        }
      }
      if (sectionId === "projects") {
        return {
          ...prev,
          projects: items.map((i) => ({
            name: asString(i.name || i.title),
            description: asString(i.description),
            technologies: asStringArray(i.technologies),
            isHidden: !!i.isHidden,
          })),
        }
      }

      return prev
    })
  }

  const createNewItem = (sectionId: CVSectionId): SectionItem => {
    if (sectionId === "skills") return { title: "" }
    if (sectionId === "languages") return { name: "", proficiency: "" }
    if (sectionId === "certifications") return { title: "" }
    if (sectionId === "interests") return { title: "" }
    if (sectionId === "experience") return { title: "New Role", company: "", duration: "", description: "" }
    if (sectionId === "education") return { degree: "", institution: "", year: "", gpa: "" }
    if (sectionId === "projects") return { name: "New Project", description: "", technologies: [] }
    return { title: "" }
  }

  return (
    <ProtectedRoute>
      <div className="h-screen bg-[#f4f4f2] dark:bg-gray-950 overflow-hidden flex flex-col px-2 lg:px-6">
        <CVHeaderActions
          isViewMode={isViewMode}
          aiResponse={aiResponse}
          isRegenerating={isRegenerating}
          isSaving={isSaving}
          existingCV={existingCV}
          onEdit={() => {
            setActiveTab("content")
            setExpandedSectionId("personalInfo")
            setEditingItem({ sectionId: "personalInfo", index: 0 })
          }}
          onRegenerate={handleRegenerateCV}
          onSave={handleSaveCV}
          onChangeTemplate={() => setShowTemplateSelector(true)}
          onChangeSettings={() => setShowSettingsPanel(true)}
          onChangeDesign={() => setActiveTab("design")}
          onExportPDF={() => handleExport("pdf")}
          onExportDOCX={handleDocxExport}
          activeTab={(activeTab === "design" ? "customize" : activeTab) as any}
          onTabChange={setActiveTab as any}
        />

        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-y-auto lg:overflow-hidden mt-6 gap-6">
          {/* Left Sidebar - Content Editor */}
          {activeTab === 'content' && (
            <div className="w-full lg:w-[480px] flex-shrink-0 flex flex-col overflow-y-auto gap-6 no-scrollbar scroll-smooth">
              {editingItem ? (
                (() => {
                  const items = getSectionItems(editingItem.sectionId)
                  const currentItem = items[editingItem.index] || {}
                  return (
                    <CVSidebarEditForm
                      sectionId={editingItem.sectionId}
                      item={currentItem}
                      onSave={(updatedItem: SectionItem) => {
                        const next = [...items]
                        next[editingItem.index] = updatedItem
                        updateSectionItems(editingItem.sectionId, next)
                        setEditingItem(null)
                        setActiveSection(editingItem.sectionId)
                      }}
                      onCancel={() => setEditingItem(null)}
                      onDelete={() => {
                        if (editingItem.sectionId === "personalInfo") {
                          setEditingItem(null)
                          return
                        }
                        const next = items.filter((_, i) => i !== editingItem.index)
                        updateSectionItems(editingItem.sectionId, next)
                        setEditingItem(null)
                        setActiveSection(editingItem.sectionId)
                      }}
                    />
                  )
                })()
              ) : (
                <>
                  <div className="space-y-6 mb-20">
                    {availableSectionIds.map((sectionId) => {
                      const Icon = SECTION_ICONS[sectionId] || LayoutGrid
                      const label = SECTION_LABELS[sectionId]
                      const items = getSectionItems(sectionId)
                      const isExpanded = expandedSectionId === sectionId

                      return (
                        <CVSidebarSection
                          key={sectionId}
                          sectionId={sectionId}
                          title={label}
                          icon={Icon}
                          items={items}
                          isExpanded={isExpanded}
                          onToggleExpand={() => {
                            setExpandedSectionId(isExpanded ? null : sectionId)
                            if (!isExpanded) setActiveSection(sectionId)
                          }}
                          onUpdateItems={(nextItems: SectionItem[]) => {
                            updateSectionItems(sectionId, nextItems)
                            setActiveSection(sectionId)
                          }}
                          onEditItem={(index: number) => {
                            setExpandedSectionId(sectionId)
                            setEditingItem({ sectionId, index })
                            setActiveSection(sectionId)
                          }}
                          onAddItem={() => {
                            setExpandedSectionId(sectionId)
                            if (sectionId === "personalInfo") {
                              setEditingItem({ sectionId, index: 0 })
                              setActiveSection(sectionId)
                              return
                            }
                            const nextItems = [...items, createNewItem(sectionId)]
                            updateSectionItems(sectionId, nextItems)
                            setEditingItem({ sectionId, index: nextItems.length - 1 })
                            setActiveSection(sectionId)
                          }}
                        />
                      )
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Left Sidebar - Design Panel */}
          {activeTab === 'design' && (
            <div className="w-full lg:w-[480px] flex-shrink-0 flex flex-col overflow-hidden bg-white border-r border-gray-200 dark:border-gray-800">
              <DesignPanel
                value={styleSettings}
                onChange={(next) => {
                  setStyleSettings(next)
                  setHasUnsavedChanges(true)
                }}
                onReset={resetStyleSettings}

                // Arrange Section Props
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
            </div>
          )}

          {/* Main Content - Preview */}
          <div className={`
            mx-auto w-full lg:w-auto mx-auto min-w-0 bg-transparent overflow-y-auto flex justify-center no-scrollbar cursor-pointer scroll-smooth focus:outline-none outline-none border-none ring-0 !border-0 !outline-0 !shadow-none
            ${activeTab === 'overview' ? 'block' : 'hidden lg:flex'}
          `}>
            <div className="w-full max-w-[210mm] shadow-2xl bg-white rounded-sm overflow-hidden h-fit">
              {selectedTemplate && aiResponse && (
                <CVPreviewSection
                  selectedTemplate={selectedTemplate}
                  aiResponse={aiResponse}
                  convertToCVData={convertToCVData}
                  isRegenerating={isRegenerating}
                  activeSection={activeSection}
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


      </div>
    </ProtectedRoute>
  )
}
