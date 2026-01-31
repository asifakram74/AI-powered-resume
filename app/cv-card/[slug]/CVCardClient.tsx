"use client"

import { useEffect, useState } from "react"
import { getCVBySlug, CV } from "../../../lib/redux/service/resumeService"
import { CVPreview } from "../../../pages/resume/CVPreview"
import { Loader2, FileDown, FileText } from "lucide-react"
import { Button } from "../../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "../../../components/ui/dropdown-menu"
import { useCVExport } from "../../../components/cv-page/use-cv-export"
import { PublicPageLoading } from "../../../components/shared/public-page-loading"
import { trackEvent } from "../../../lib/redux/service/analyticsService"



interface CVCardClientProps {
  slug: string
}

export default function CVCardClient({ slug }: CVCardClientProps) {
  const [cv, setCV] = useState<CV | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { handleExport } = useCVExport({
    selectedTemplateId: cv?.layout_id || "modern",
    personaFullName: cv ? (JSON.parse(cv.generated_content || "{}").personalInfo?.fullName || "resume") : "resume",
    resourceKey: slug,
    resourceType: 'cv'
  })

  useEffect(() => {
    const fetchCV = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const data = await getCVBySlug(slug)
        setCV(data)
        
        // Track view
        trackEvent({
          resource_type: 'cv',
          resource_key: slug,
          event_type: 'view',
          referrer: document.referrer,
          meta: { layout: data.layout_id }
        })
      } catch (err) {
        console.error(err)
        setError("Failed to load CV")
      } finally {
        setLoading(false)
      }
    }

    fetchCV()
  }, [slug])

  if (loading) {
    return <PublicPageLoading type="resume" />
  }

  if (error || !cv) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">CV Not Found</h1>
        <p className="text-gray-500">The CV you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  let cvData = null
  try {
    cvData = cv.generated_content ? JSON.parse(cv.generated_content) : null
  } catch (e) {
    console.error("Failed to parse CV content", e)
  }

  if (!cvData) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Empty CV</h1>
        <p className="text-gray-500">This CV has no content.</p>
      </div>
    )
  }

  // Helper to convert OptimizedCV (saved format) to CVData (template format)
  const normalizeCVData = (data: any): any => {
    // If it already looks like CVData (has experience array instead of workExperience), just ensure IDs
    if (data.experience && Array.isArray(data.experience)) {
      const ensureIds = (items: any[], prefix: string) => {
        if (!Array.isArray(items)) return [];
        return items.map((item, index) => ({
          ...item,
          id: item.id || `${prefix}-${index}`
        }));
      };
      
      return {
        ...data,
        experience: ensureIds(data.experience, 'exp'),
        education: ensureIds(data.education, 'edu'),
        projects: ensureIds(data.projects, 'proj'),
        languages: ensureIds(data.languages, 'lang'),
        certifications: ensureIds(data.certifications, 'cert'),
      };
    }

    // Otherwise convert from OptimizedCV format
    const ensureIds = (items: any[], prefix: string) => {
      if (!Array.isArray(items)) return [];
      return items.map((item, index) => ({
        ...item,
        id: item.id || `${prefix}-${index}`
      }));
    };

    // Helper to parse duration
    const parseDuration = (duration: string = "") => {
      const normalized = duration.replace(/[–—]/g, "-");
      const parts = normalized.split("-").map((s) => s.trim());
      const start = parts[0] || "";
      let end = parts[1] || "";
      const current = /present/i.test(end);
      if (current) end = "";
      return { startDate: start, endDate: end, current };
    };

    // Helper to parse location
    const parseLocation = (locationRaw: string = "") => {
       const parts = locationRaw.split(",").map((p) => p.trim()).filter(Boolean);
       let city = "";
       let country = "";
       if (parts.length >= 2) {
         city = parts[0];
         country = parts.slice(1).join(", ");
       } else if (parts.length === 1) {
         city = parts[0];
       }
       return { city, country };
    };

    const { city, country } = parseLocation(data.personalInfo?.location);

    return {
      id: data.id || "generated-cv",
      sectionOrder: data.sectionOrder || ["personalInfo", "skills", "experience", "projects", "education", "certifications", "languages", "interests"],
      hiddenSections: data.hiddenSections || [],
      personalInfoFieldOrder: data.personalInfoFieldOrder || [],
      styleSettings: data.styleSettings || {},
      personalInfo: {
        ...data.personalInfo,
        fullName: data.personalInfo?.fullName || data.personalInfo?.name || "",
        city: data.personalInfo?.city || city,
        country: data.personalInfo?.country || country,
        address: data.personalInfo?.address || data.personalInfo?.location || "",
        summary: data.summary || data.personalInfo?.summary || "",
      },
      experience: ensureIds((data.workExperience || data.experience || []).map((exp: any) => {
        const { startDate, endDate, current } = parseDuration(exp.duration);
        return {
          id: exp.id, // Preserve ID if exists
          jobTitle: exp.jobTitle || exp.title,
          companyName: exp.companyName || exp.company,
          location: exp.location || "",
          startDate: exp.startDate || startDate,
          endDate: exp.endDate || endDate,
          current: exp.current !== undefined ? exp.current : current,
          responsibilities: exp.responsibilities || (exp.description ? [exp.description] : []),
          isHidden: !!exp.isHidden,
        };
      }), 'exp'),
      education: ensureIds((data.education || []).map((edu: any) => ({
        id: edu.id,
        degree: edu.degree,
        institutionName: edu.institutionName || edu.institution,
        location: edu.location || "",
        graduationDate: edu.graduationDate || edu.year,
        gpa: edu.gpa || "",
        honors: edu.honors || "",
        additionalInfo: edu.additionalInfo || "",
        isHidden: !!edu.isHidden,
      })), 'edu'),
      projects: ensureIds((data.projects || []).map((proj: any) => ({
        id: proj.id,
        name: proj.name || proj.title || "",
        role: proj.role || "",
        description: proj.description || "",
        technologies: proj.technologies || [],
        liveDemoLink: proj.liveDemoLink || "",
        githubLink: proj.githubLink || "",
        isHidden: !!proj.isHidden,
      })), 'proj'),
      skills: {
        technical: (data.skills?.technical || data.skills || []).map((s: any) => typeof s === 'string' ? s : s.value || s.title || "").filter(Boolean),
        soft: data.skills?.soft || []
      },
      languages: ensureIds((data.languages || []).map((lang: any) => ({
        id: lang.id,
        name: typeof lang === 'string' ? lang : lang.name || "",
        proficiency: typeof lang === 'string' ? "Fluent" : lang.proficiency || "Fluent",
        isHidden: !!lang?.isHidden,
      })), 'lang'),
      certifications: ensureIds((data.certifications || []).map((cert: any) => ({
        id: cert.id,
        title: typeof cert === 'string' ? cert : cert.title || "",
        issuingOrganization: typeof cert === 'string' ? "" : cert.issuingOrganization || "",
        dateObtained: typeof cert === 'string' ? "" : cert.dateObtained || "",
        isHidden: !!cert?.isHidden,
      })), 'cert'),
      additional: {
        interests: (data.additional?.interests || data.interests || []).map((i: any) => typeof i === 'string' ? i : i.title || "").filter(Boolean)
      }
    };
  };

  const normalizedData = normalizeCVData(cvData);

  // Construct template object required by CVPreview
  const template = {
    id: cv.layout_id || "modern",
    name: cv.layout_id || "Modern",
    description: "",
    category: "modern"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header with Download Button */}
      <div className="w-full bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <h1 className="font-semibold text-gray-900 truncate max-w-[200px] md:max-w-md">
          {cvData.personalInfo.fullName}'s Resume
        </h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="flex items-center gap-2 resumaic-gradient-green hover:opacity-90 text-white rounded-lg px-3 md:px-4 h-9 shadow-sm transition-transform active:scale-95">
              <span className="hidden md:inline font-semibold">Download</span>
              <FileDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-200 dark:border-gray-800">
            <DropdownMenuItem onClick={() => handleExport("pdf")} className="cursor-pointer py-2.5">
              <FileText className="mr-2 h-4 w-4 text-red-500" />
              <span>Export PDF</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("png")} className="cursor-pointer py-2.5">
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              <span>Export PNG</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("docx")} className="cursor-pointer py-2.5">
              <FileText className="mr-2 h-4 w-4 text-blue-500" />
              <span>Export DOCX</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="p-4 md:p-8 w-full flex justify-center">
        <div className="w-full max-w-[210mm] shadow-2xl">
          <CVPreview data={normalizedData} template={template as any} />
        </div>
      </div>
    </div>
  )
}
