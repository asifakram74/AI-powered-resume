
"use client"

import React, { useMemo, useRef, useState, useLayoutEffect } from "react"
import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react"
import type { CVData, CVSectionId, PersonalInfoFieldId } from "../../../types/cv-data"

interface ClassicTemplate2Props {
  data: CVData
  isPreview?: boolean
}

const PAGE_HEIGHT_PX = 1123
const PADDING_PX = 48
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2

export function ClassicTemplate2({ data, isPreview = false }: ClassicTemplate2Props) {
  const measureRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<React.ReactNode[][]>([])

  const locationText =
    data.personalInfo.city && data.personalInfo.country
      ? `${data.personalInfo.city}, ${data.personalInfo.country}`
      : data.personalInfo.city || data.personalInfo.country || ""

  const addressText = (data.personalInfo.address || "").trim()
  const locLower = locationText.toLowerCase()
  const addrLower = addressText.toLowerCase()
  const showAddress = Boolean(addressText) && (!locLower || (addrLower !== locLower && !addrLower.includes(locLower)))

  const defaultPersonalInfoOrder: PersonalInfoFieldId[] = [
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

  const allPersonalInfoFields: PersonalInfoFieldId[] = [
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

  const requestedPersonalInfoOrder =
    data.personalInfoFieldOrder && data.personalInfoFieldOrder.length > 0 ? data.personalInfoFieldOrder : defaultPersonalInfoOrder

  const finalPersonalInfoOrder: PersonalInfoFieldId[] = [
    ...requestedPersonalInfoOrder.filter((f) => allPersonalInfoFields.includes(f)),
    ...allPersonalInfoFields.filter((f) => !requestedPersonalInfoOrder.includes(f)),
  ]

  const formatDate = (date: string) => {
    if (!date) return ""
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date)
    if (isoMatch) {
      const year = isoMatch[1]
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)))
      return `${monthNames[month - 1]} ${year}`
    }
    const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date)
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)))
      const year = slashMatch[2]
      return `${monthNames[month - 1]} ${year}`
    }
    const monTextMatch = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(date)
    if (monTextMatch) return date
    return date
  }

  const Header = () => (
    <div className="border-b-2 border-gray-900 pb-4 mb-6">
      {finalPersonalInfoOrder.map((field) => {
        switch (field) {
          case "fullName": {
            const v = (data.personalInfo.fullName || "").trim()
            if (!v) return null
            return (
              <h1 key="pi-fullName" className="text-3xl font-bold text-gray-900 mb-1">
                {v}
              </h1>
            )
          }
          case "jobTitle": {
            const v = (data.personalInfo.jobTitle || "").trim()
            if (!v) return null
            return (
              <h2 key="pi-jobTitle" className="text-lg font-semibold text-gray-700 mb-3">
                {v}
              </h2>
            )
          }
          case "summary": {
            const v = (data.personalInfo.summary || "").trim()
            if (!v) return null
            return (
              <p key="pi-summary" className="text-gray-600 leading-relaxed text-sm">
                {v}
              </p>
            )
          }
          default:
            return null
        }
      })}
    </div>
  )

  const Contact = () => (
    <div>
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Contact</h3>
      <div className="space-y-1 text-sm text-gray-600">
        {finalPersonalInfoOrder.map((field) => {
          if (field === "email") {
            const v = (data.personalInfo.email || "").trim()
            if (!v) return null
            return (
              <div key="pi-email" className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                <span className="break-all text-xs">{v}</span>
              </div>
            )
          }
          if (field === "phone") {
            const v = (data.personalInfo.phone || "").trim()
            if (!v) return null
            return (
              <div key="pi-phone" className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                <span className="text-xs">{v}</span>
              </div>
            )
          }
          if (field === "location") {
            const v = locationText.trim()
            if (!v) return null
            return (
              <div key="pi-location" className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                <span className="text-xs">{v}</span>
              </div>
            )
          }
          if (field === "address") {
            const v = addressText
            if (!showAddress || !v) return null
            return (
              <div key="pi-address" className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                <span className="text-xs">{v}</span>
              </div>
            )
          }
          if (field === "linkedin") {
            const v = (data.personalInfo.linkedin || "").trim()
            if (!v) return null
            return (
              <div key="pi-linkedin" className="flex items-center space-x-2">
                <ExternalLink className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                <span className="break-all text-xs">{v}</span>
              </div>
            )
          }
          if (field === "github") {
            const v = (data.personalInfo.github || "").trim()
            if (!v) return null
            return (
              <div key="pi-github" className="flex items-center space-x-2">
                <Github className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                <span className="break-all text-xs">{v}</span>
              </div>
            )
          }
          return null
        })}
      </div>
    </div>
  )

  const Skills = () => (
    <div>
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Skills</h3>
      {data.skills.technical.length > 0 && (
        <div className="mb-2">
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Technical</h4>
          <div className="flex flex-wrap gap-1">
            {data.skills.technical.map((skill, index) => (
              <span key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.skills.soft.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-gray-700 mb-1">Soft Skills</h4>
          <div className="flex flex-wrap gap-1">
            {data.skills.soft.map((skill, index) => (
              <span key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">{title}</h3>
  )

  const ExperienceHeader = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="relative pl-6">
      <div className="absolute left-1 top-0 w-1 h-full bg-gray-300"></div>
      <div className="absolute left-0 top-1 w-3 h-3 bg-gray-900 rounded-full border-2 border-white"></div>
      <div>
        <h4 className="text-sm font-bold text-gray-900">{exp.jobTitle}</h4>
        <p className="text-xs font-semibold text-gray-700">{exp.companyName}</p>
        <p className="text-xs text-gray-500 mb-1">
          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
        </p>
      </div>
    </div>
  )

  const ExperienceLine = ({ text }: { text: string }) => (
    <div className="relative pl-6">
      <div className="text-xs text-gray-600 flex items-start"><span className="mr-2">—</span><span>{text}</span></div>
    </div>
  )

  const ProjectBlock = ({ project }: { project: CVData["projects"][number] }) => (
    <div>
      <div className="flex justify-between items-start mb-1">
        <div>
          <h4 className="text-sm font-bold text-gray-900">{project.name}</h4>
          <p className="text-xs font-semibold text-gray-700">{project.role}</p>
        </div>
        <div className="flex space-x-1">
          {project.liveDemoLink && (
            <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3 h-3 text-gray-600" />
            </a>
          )}
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
              <Github className="w-3 h-3 text-gray-600" />
            </a>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-600 mb-1">{project.description}</p>
      <div className="flex flex-wrap gap-1">
        {project.technologies.map((tech, i) => (
          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">{tech}</span>
        ))}
      </div>
    </div>
  )

  const EducationBlock = ({ edu }: { edu: CVData["education"][number] }) => (
    <div>
      <h4 className="text-xs font-bold text-gray-900">{edu.degree}</h4>
      <p className="text-xs text-gray-700">{edu.institutionName}</p>
      <p className="text-xs text-gray-500">{formatDate(edu.graduationDate)}</p>
    </div>
  )

  const CertificationBlock = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div>
      <h4 className="text-xs font-bold text-gray-900">{cert.title}</h4>
      <p className="text-xs text-gray-700">{cert.issuingOrganization}</p>
      <p className="text-xs text-gray-500">{formatDate(cert.dateObtained)}</p>
    </div>
  )

  const LanguageLine = ({ lang }: { lang: CVData["languages"][number] }) => (
    <p className="text-xs text-gray-600"><span className="font-semibold text-gray-900">{lang.name}</span> — {lang.proficiency}</p>
  )

  const InterestTag = ({ text }: { text: string }) => (
    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{text}</span>
  )

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = []

    const allSections = [
      "personalInfo",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "languages",
      "interests",
    ] as const satisfies readonly CVSectionId[]

    const requestedOrder: readonly CVSectionId[] =
      data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : allSections

    const hidden = data.hiddenSections || []

    const ordered: CVSectionId[] = [
      ...requestedOrder.filter((s) => allSections.includes(s)),
      ...allSections.filter((s) => !requestedOrder.includes(s)),
    ]

    const finalOrder = ordered.filter((s) => s === "personalInfo" || !hidden.includes(s))

    const addPersonalInfo = () => {
      items.push(<Header key="hdr" />)
      items.push(<Contact key="contact" />)
    }

    const addSkills = () => {
      if (data.skills.technical.length === 0 && data.skills.soft.length === 0) return
      items.push(<Skills key="skills" />)
    }

    const addContactSkillsGrid = () => {
      if (
        !data.personalInfo.email &&
        !data.personalInfo.phone &&
        !data.personalInfo.city &&
        !data.personalInfo.country &&
        data.skills.technical.length === 0 &&
        data.skills.soft.length === 0
      ) {
        return
      }

      items.push(
        <div key="pi-skills-grid" className="grid grid-cols-2 gap-6">
          <Contact />
          <Skills />
        </div>,
      )
    }

    const addExperience = () => {
      if (data.experience.length === 0) return
      items.push(<SectionTitle key="exp-title" title="Experience" />)
      data.experience.forEach((exp, idx) => {
        items.push(<ExperienceHeader key={`exp-h-${exp.id}`} exp={exp} />)
        exp.responsibilities.forEach((r, i) => {
          const t = r.trim()
          if (t) items.push(<ExperienceLine key={`exp-l-${exp.id}-${i}`} text={t} />)
        })
        if (idx < data.experience.length - 1) items.push(<div key={`exp-sp-${exp.id}`} className="h-4" />)
      })
    }

    const addProjects = () => {
      if (data.projects.length === 0) return
      items.push(<SectionTitle key="proj-title" title="Projects" />)
      data.projects.forEach((p, idx) => {
        items.push(<ProjectBlock key={`proj-${p.id}`} project={p} />)
        if (idx < data.projects.length - 1) items.push(<div key={`proj-sp-${p.id}`} className="h-3" />)
      })
    }

    const addEducation = () => {
      if (data.education.length === 0) return
      items.push(<SectionTitle key="edu-title" title="Education" />)
      data.education.forEach((e, idx) => {
        items.push(<EducationBlock key={`edu-${e.id}`} edu={e} />)
        if (idx < data.education.length - 1) items.push(<div key={`edu-sp-${e.id}`} className="h-2" />)
      })
    }

    const addCertifications = () => {
      if (data.certifications.length === 0) return
      items.push(<SectionTitle key="cert-title" title="Certifications" />)
      data.certifications.forEach((c, idx) => {
        items.push(<CertificationBlock key={`cert-${c.id}`} cert={c} />)
        if (idx < data.certifications.length - 1) items.push(<div key={`cert-sp-${c.id}`} className="h-2" />)
      })
    }

    const addLanguages = () => {
      if (data.languages.length === 0) return
      items.push(<SectionTitle key="lang-title" title="Languages" />)
      data.languages.forEach((l) => items.push(<LanguageLine key={`lang-${l.id}`} lang={l} />))
    }

    const addInterests = () => {
      if (data.additional.interests.length === 0) return
      items.push(<SectionTitle key="int-title" title="Interests" />)
      data.additional.interests.forEach((t, i) => items.push(<InterestTag key={`int-${i}`} text={t} />))
    }

    for (let i = 0; i < finalOrder.length; i += 1) {
      const section = finalOrder[i]

      if (section === "personalInfo") {
        const next = finalOrder[i + 1]
        if (next === "skills") {
          items.push(<Header key="hdr" />)
          addContactSkillsGrid()
          i += 1
          continue
        }
        addPersonalInfo()
        continue
      }

      switch (section) {
        case "skills":
          addSkills()
          break
        case "experience":
          addExperience()
          break
        case "projects":
          addProjects()
          break
        case "education":
          addEducation()
          break
        case "certifications":
          addCertifications()
          break
        case "languages":
          addLanguages()
          break
        case "interests":
          addInterests()
          break
      }
    }

    return items
  }, [data])

  useLayoutEffect(() => {
    if (!measureRef.current) return
    const newPages: React.ReactNode[][] = []
    let currentPage: React.ReactNode[] = []
    let currentHeight = 0
    const pushPage = () => {
      if (currentPage.length > 0) {
        newPages.push(currentPage)
        currentPage = []
        currentHeight = 0
      }
    }
    const elements = Array.from(measureRef.current.children) as HTMLElement[]
    elements.forEach((el, index) => {
      const style = window.getComputedStyle(el)
      const marginTop = parseFloat(style.marginTop) || 0
      const marginBottom = parseFloat(style.marginBottom) || 0
      const elementHeight = el.offsetHeight + marginTop + marginBottom
      if (currentHeight + elementHeight > CONTENT_HEIGHT_PX) {
        pushPage()
      }
      currentPage.push(blocks[index])
      currentHeight += elementHeight
    })
    if (currentPage.length > 0) newPages.push(currentPage)
    setPages(newPages)
  }, [blocks])

  return (
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      <div ref={measureRef} className="cv-measure fixed top-0 left-0 w-[210mm] p-12 opacity-0 pointer-events-none z-[-999]" style={{ visibility: "hidden" }}>
        {blocks}
      </div>
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm] p-12 bg-white"></div>
      ) : (
        pages.map((pageContent, i) => (
          <div key={i} className="a4-page w-[210mm] min-h-[297mm] p-12 bg-white text-slate-900 relative print:shadow-none" style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}>
            {pageContent}
          </div>
        ))
      )}
    </div>
  )
}


