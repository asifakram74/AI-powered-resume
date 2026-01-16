"use client"

import React, { useMemo, useRef, useState, useLayoutEffect } from "react"
import { Mail, Phone, MapPin, ExternalLink, Github, Linkedin } from "lucide-react"
import type {
  CVBulletStyle,
  CVData,
  CVFontFamilyId,
  CVSectionHeaderIconStyle,
  CVSectionId,
  CVStyleSettings,
  PersonalInfoFieldId,
} from "../../../types/cv-data"

interface ClassicTemplate2Props {
  data: CVData
  isPreview?: boolean
}

const PAGE_HEIGHT_PX = 1123
const MM_TO_PX = 3.7795275591

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
  nameBold: true,
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
  sectionHeaderIconStyle: "none",
  bulletStyle: "disc",
}

const fontFamilyCss = (id: CVFontFamilyId) => {
  switch (id) {
    case "inter":
      return "var(--font-inter)"
    case "serif":
      return "var(--font-rubik)"
    case "system-sans":
      return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif'
    case "system-serif":
      return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
    case "mono":
      return 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    case "roboto":
      return '"Roboto", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif'
    case "open-sans":
      return '"Open Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif'
    case "lato":
      return '"Lato", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif'
  }
}

const sectionIconNode = (style: CVSectionHeaderIconStyle, color: string) => {
  const common = { flexShrink: 0 as const, display: "inline-block" as const }
  switch (style) {
    case "none":
      return null
    case "dot":
      return <span style={{ ...common, width: 8, height: 8, borderRadius: 999, background: color }} />
    case "bar":
      return <span style={{ ...common, width: 18, height: 4, borderRadius: 999, background: color }} />
    case "square":
      return <span style={{ ...common, width: 8, height: 8, background: color }} />
    case "circle-outline":
      return <span style={{ ...common, width: 9, height: 9, borderRadius: 999, border: `2px solid ${color}` }} />
  }
}

const bulletNode = (style: CVBulletStyle, color: string) => {
  const common = {
    flexShrink: 0 as const,
    display: "inline-flex" as const,
    alignItems: "center",
    justifyContent: "center",
  }
  switch (style) {
    case "none":
      return null
    case "hyphen":
      return <span style={{ ...common, width: 10, color, fontWeight: 700, lineHeight: 1 }}>-</span>
    case "disc":
      return <span style={{ ...common, width: 7, height: 7, borderRadius: 999, background: color, marginTop: 6 }} />
    case "circle":
      return <span style={{ ...common, width: 8, height: 8, borderRadius: 999, border: `2px solid ${color}`, marginTop: 6 }} />
    case "square":
      return <span style={{ ...common, width: 7, height: 7, background: color, marginTop: 6 }} />
  }
}

const getIconSize = (size: string) => {
  switch (size) {
    case "xs":
      return "w-2.5 h-2.5"
    case "sm":
      return "w-3.5 h-3.5"
    case "md":
      return "w-4.5 h-4.5"
    case "lg":
      return "w-5.5 h-5.5"
    default:
      return "w-3.5 h-3.5"
  }
}

const getIconFrameClasses = (frame: string) => {
  switch (frame) {
    case "circle":
      return "rounded-full p-1"
    case "square":
      return "rounded p-1"
    case "rounded":
      return "rounded-md p-1"
    default:
      return ""
  }
}

export function ClassicTemplate2({ data, isPreview = false }: ClassicTemplate2Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pages, setPages] = useState<React.ReactNode[][]>([])
  const styleSettings = useMemo(
    () => ({ ...DEFAULT_STYLE_SETTINGS, ...(data.styleSettings || {}) }),
    [data.styleSettings],
  )
  const bodyFont = useMemo(() => fontFamilyCss(styleSettings.bodyFontFamily), [styleSettings.bodyFontFamily])
  const headingFont = useMemo(() => fontFamilyCss(styleSettings.headingFontFamily), [styleSettings.headingFontFamily])
  const paddingXpx = useMemo(() => styleSettings.marginLeftRightMm * MM_TO_PX, [styleSettings.marginLeftRightMm])
  const paddingYpx = useMemo(() => styleSettings.marginTopBottomMm * MM_TO_PX, [styleSettings.marginTopBottomMm])
  const contentHeightPx = useMemo(() => PAGE_HEIGHT_PX - paddingYpx * 2, [paddingYpx])
  const effectiveHeadingColor = useMemo(
    () => (styleSettings.applyAccentToHeadings ? styleSettings.accentColor : styleSettings.headingColor),
    [styleSettings.accentColor, styleSettings.applyAccentToHeadings, styleSettings.headingColor],
  )
  const effectiveBulletStyle: CVBulletStyle = useMemo(
    () => (styleSettings.entryListStyle === "hyphen" ? "hyphen" : styleSettings.bulletStyle),
    [styleSettings.bulletStyle, styleSettings.entryListStyle],
  )
  const rootStyle = useMemo<React.CSSProperties>(
    () => ({
      fontFamily: bodyFont,
      fontSize: `${styleSettings.bodyFontSizePx}px`,
      lineHeight: styleSettings.lineHeight,
      color: styleSettings.textColor,
    }),
    [bodyFont, styleSettings.bodyFontSizePx, styleSettings.lineHeight, styleSettings.textColor],
  )
  const headingBaseStyle = useMemo<React.CSSProperties>(
    () => ({
      fontFamily: headingFont,
      color: effectiveHeadingColor,
    }),
    [headingFont, effectiveHeadingColor],
  )
  const mutedStyle = useMemo<React.CSSProperties>(() => ({ color: styleSettings.mutedColor }), [styleSettings.mutedColor])
  const dateStyle = useMemo<React.CSSProperties>(
    () => ({ ...mutedStyle, opacity: styleSettings.datesOpacity }),
    [mutedStyle, styleSettings.datesOpacity],
  )
  const locationStyle = useMemo<React.CSSProperties>(
    () => ({ ...mutedStyle, opacity: styleSettings.locationOpacity }),
    [mutedStyle, styleSettings.locationOpacity],
  )
  const dividerStyle = useMemo<React.CSSProperties>(
    () => ({ borderColor: styleSettings.borderColor }),
    [styleSettings.borderColor],
  )
  const pageStyle = useMemo<React.CSSProperties>(
    () => ({
      ...rootStyle,
      backgroundColor: styleSettings.backgroundColor,
      padding: `${paddingYpx}px ${paddingXpx}px`,
    }),
    [paddingXpx, paddingYpx, rootStyle, styleSettings.backgroundColor],
  )

  const formatDate = (date: string) => {
    if (!date) return ""
    const s = date.trim()
    if (!s) return ""
    const normalized = s.replace(/[\u2012-\u2015\u2212]/g, "-")
    if (/^\d{4}$/.test(normalized)) return normalized
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/)
    if (isoMatch) {
      const year = isoMatch[1]
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)))
      return `${monthNames[month - 1]} ${year}`
    }
    const slashMatch = normalized.match(/^(\d{1,2})\/(\d{4})$/)
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)))
      const year = slashMatch[2]
      return `${monthNames[month - 1]} ${year}`
    }
    if (/^([A-Za-z]{3,9})\s+\d{4}$/.test(normalized)) return normalized
    return normalized
  }

  const locationText =
    data.personalInfo.city && data.personalInfo.country
      ? `${data.personalInfo.city}, ${data.personalInfo.country}`
      : data.personalInfo.city || data.personalInfo.country || ""

  const addressText = (data.personalInfo.address || "").trim()
  const locLower = locationText.toLowerCase()
  const addrLower = addressText.toLowerCase()
  const showAddress = Boolean(addressText) && (!locLower || (addrLower !== locLower && !addrLower.includes(locLower)))

  // Header with contact grid (Template 2 style)
  const Header = () => {
    const defaultOrder: PersonalInfoFieldId[] = [
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
    const order =
      data.personalInfoFieldOrder && data.personalInfoFieldOrder.length > 0
        ? data.personalInfoFieldOrder
        : defaultOrder

    const rows: React.ReactNode[] = []

    order.forEach((field) => {
      if (field === "fullName") {
        const v = (data.personalInfo.fullName || "").trim()
        if (!v) return null
        rows.push(
          <h1
            key="pi-fullName"
            className="font-bold mb-1"
            style={{
              color: styleSettings.applyAccentToName ? styleSettings.accentColor : styleSettings.headingColor,
              fontWeight: styleSettings.nameBold ? 800 : 700,
              fontFamily: headingFont,
              fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.6)}px`,
            }}
          >
            {v}
          </h1>,
        )
        return
      }
      if (field === "jobTitle") {
        const v = (data.personalInfo.jobTitle || "").trim()
        if (!v) return null
        rows.push(
          <h2
            key="pi-jobTitle"
            className="font-semibold mb-3"
            style={{
              color: styleSettings.applyAccentToJobTitle ? styleSettings.accentColor : styleSettings.textColor,
              fontFamily: headingFont,
              fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.05)}px`,
            }}
          >
            {v}
          </h2>,
        )
        return
      }
      if (field === "summary") {
        const v = (data.personalInfo.summary || "").trim()
        if (!v) return null
        rows.push(
          <div key="summary-container" className="mt-3">
            <div className="w-full border-b-2 mb-3" style={dividerStyle}></div>
            <h3
              className="font-bold uppercase tracking-wide mb-2"
              style={{
                ...headingBaseStyle,
                fontSize: `${styleSettings.headingFontSizePx}px`,
                textTransform: styleSettings.capitalization,
              }}
            >
              PROFESSIONAL SUMMARY
            </h3>
            <p className="leading-relaxed" style={{ color: styleSettings.textColor }}>
              {v}
            </p>
          </div>,
        )
        return
      }
    })

    return (
      <div className="pb-4 mb-6" style={{ borderBottomColor: styleSettings.borderColor, borderBottomWidth: 2 }}>
        {rows}
      </div>
    )
  }

  // Contact Section with icons (Template 2 style)
  const Contact = () => {
    const contactItems: React.ReactNode[] = []
    const iconSize = getIconSize(styleSettings.iconSize)
    const frameClasses = getIconFrameClasses(styleSettings.iconFrame)
    const iconColor = styleSettings.applyAccentToHeaderIcons ? styleSettings.accentColor : styleSettings.headingColor

    const fields = ["email", "phone", "location", "address", "linkedin", "github"] as const

    fields.forEach((field) => {
      let value = ""
      let Icon: React.ElementType | null = null

      switch (field) {
        case "email":
          value = data.personalInfo.email || ""
          if (!value || !styleSettings.showEmail) return
          Icon = Mail
          break
        case "phone":
          value = data.personalInfo.phone || ""
          if (!value) return
          Icon = Phone
          break
        case "location":
          value = locationText
          if (!value) return
          Icon = MapPin
          break
        case "address":
          if (!showAddress || !addressText) return
          value = addressText
          Icon = MapPin
          break
        case "linkedin":
          value = data.personalInfo.linkedin || ""
          if (!value) return
          Icon = Linkedin
          break
        case "github":
          value = data.personalInfo.github || ""
          if (!value) return
          Icon = Github
          break
      }

      if (value && Icon) {
        contactItems.push(
          <div key={field} className="flex items-center space-x-2 mb-1">
            {styleSettings.headerIcons !== "none" && (
              <div className={frameClasses}>
                <Icon className={`${iconSize} flex-shrink-0`} style={{ color: iconColor }} />
              </div>
            )}
            <span className="break-all" style={{ color: styleSettings.textColor }}>
              {value}
            </span>
          </div>,
        )
      }
    })

    if (contactItems.length === 0) return null

    return (
      <div className="mb-6">
        <h3
          className="font-bold uppercase tracking-wide mb-2"
          style={{
            ...headingBaseStyle,
            fontSize: `${styleSettings.headingFontSizePx}px`,
            textTransform: styleSettings.capitalization,
          }}
        >
          Contact
        </h3>
        <div className="space-y-1">{contactItems}</div>
      </div>
    )
  }

  // Skills Section (Template 2 style)
  const Skills = () => (
    <div className="mb-6">
      <h3
        className="font-bold uppercase tracking-wide mb-2"
        style={{
          ...headingBaseStyle,
          fontSize: `${styleSettings.headingFontSizePx}px`,
          textTransform: styleSettings.capitalization,
        }}
      >
        Skills
      </h3>
      {data.skills.technical.length > 0 && (
        <div className="mb-3">
          <h4 className="font-semibold mb-1" style={{ color: styleSettings.headingColor }}>
            Technical
          </h4>
          <div className="flex flex-wrap gap-1">
            {data.skills.technical.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded"
                style={{
                  color: styleSettings.textColor,
                  backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
                    ? `${styleSettings.accentColor}15`
                    : "#f3f4f6",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      {data.skills.soft.length > 0 && (
        <div>
          <h4 className="font-semibold mb-1" style={{ color: styleSettings.headingColor }}>
            Soft Skills
          </h4>
          <div className="flex flex-wrap gap-1">
            {data.skills.soft.map((skill, index) => (
              <span
                key={index}
                className="px-2 py-0.5 rounded"
                style={{
                  color: styleSettings.textColor,
                  backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
                    ? `${styleSettings.accentColor}15`
                    : "#f3f4f6",
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  // Experience Section (Template 2 style)
  const ExperienceHeader = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="relative pl-6 mb-3">
      <div
        className="absolute left-1 top-0 w-1 h-full"
        style={{
          backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
            ? styleSettings.accentColor
            : styleSettings.borderColor,
        }}
      ></div>
      <div
        className="absolute left-0 top-1 w-3 h-3 rounded-full border-2"
        style={{
          backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
            ? styleSettings.accentColor
            : styleSettings.headingColor,
          borderColor: styleSettings.backgroundColor,
        }}
      ></div>
      <div>
        <h4 className="font-bold" style={{ color: styleSettings.headingColor, fontSize: `${Math.round(styleSettings.bodyFontSizePx * 1.25)}px` }}>
          {exp.jobTitle}
        </h4>
        <p className="font-semibold" style={{ color: styleSettings.textColor }}>
          {exp.companyName}
        </p>
        <p style={dateStyle}>
          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
        </p>
      </div>
    </div>
  )

  const ExperienceLine = ({ text }: { text: string }) => (
    <div className="relative pl-6 mb-1">
      <div className="flex items-start" style={{ color: styleSettings.textColor }}>
        <span className="mr-2" style={{ color: styleSettings.accentColor }}>—</span>
        <span>{text}</span>
      </div>
    </div>
  )

  // Project Section (Template 2 style)
  const ProjectBlock = ({ project }: { project: CVData["projects"][number] }) => {
    const iconSize = getIconSize(styleSettings.iconSize)
    const iconColor = styleSettings.applyAccentToLinkIcons ? styleSettings.accentColor : styleSettings.headingColor

    return (
      <div className="mb-4">
        <div className="flex justify-between items-start mb-1">
          <div>
            <h4 className="font-bold" style={{ color: styleSettings.headingColor, fontSize: `${Math.round(styleSettings.bodyFontSizePx * 1.25)}px` }}>
              {project.name}
            </h4>
            <p className="font-semibold" style={{ color: styleSettings.textColor }}>
              {project.role}
            </p>
          </div>
          <div className="flex space-x-1">
            {project.liveDemoLink && (
              <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className={iconSize} style={{ color: iconColor }} />
              </a>
            )}
            {project.githubLink && (
              <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                <Github className={iconSize} style={{ color: iconColor }} />
              </a>
            )}
          </div>
        </div>
        <p className="mb-1" style={{ color: styleSettings.textColor }}>
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1">
          {project.technologies.map((tech, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded"
              style={{
                color: styleSettings.textColor,
                backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
                  ? `${styleSettings.accentColor}15`
                  : "#f3f4f6",
              }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    )
  }

  // Education Section (Template 2 style)
  const EducationBlock = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="mb-3">
      <h4 className="font-bold" style={{ color: styleSettings.headingColor }}>
        {edu.degree}
      </h4>
      <p style={{ color: styleSettings.textColor }}>
        {edu.institutionName}
      </p>
      <p style={dateStyle}>
        {formatDate(edu.graduationDate)}
      </p>
      {edu.gpa && (
        <p style={mutedStyle}>
          GPA: {edu.gpa}
        </p>
      )}
    </div>
  )

  // Certification Section (Template 2 style)
  const CertificationBlock = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div className="mb-2">
      <h4 className="font-bold" style={{ color: styleSettings.headingColor }}>
        {cert.title}
      </h4>
      <p style={{ color: styleSettings.textColor }}>
        {cert.issuingOrganization}
      </p>
      <p style={dateStyle}>
        {formatDate(cert.dateObtained)}
      </p>
    </div>
  )

  // Language Section (Template 2 style)
  const LanguageLine = ({ lang }: { lang: CVData["languages"][number] }) => (
    <p style={{ color: styleSettings.textColor }}>
      <span className="font-semibold" style={{ color: styleSettings.headingColor }}>
        {lang.name}
      </span>{" "}
      — {lang.proficiency}
    </p>
  )

  // Interest Section (Template 2 style)
  const InterestTag = ({ text }: { text: string }) => (
    <span
      className="px-2 py-0.5 rounded mr-1 mb-1 inline-block"
      style={{
        color: styleSettings.textColor,
        backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
          ? `${styleSettings.accentColor}15`
          : "#f3f4f6",
      }}
    >
      {text}
    </span>
  )

  // Main content blocks
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
    }

    const addSkills = () => {
      if (data.skills.technical.length === 0 && data.skills.soft.length === 0) return
      items.push(<Skills key="skills" />)
    }

    const addContactSkillsGrid = () => {
      items.push(
        <div key="pi-skills-grid" className="grid grid-cols-2 gap-6 mb-6">
          <Contact />
          <Skills />
        </div>,
      )
    }

    const addExperience = () => {
      if (data.experience.length === 0) return
      items.push(
        <h3
          key="exp-title"
          className="font-bold uppercase tracking-wide mb-4"
          style={{
            ...headingBaseStyle,
            fontSize: `${styleSettings.headingFontSizePx}px`,
            textTransform: styleSettings.capitalization,
          }}
        >
          Experience
        </h3>,
      )
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
      items.push(
        <h3
          key="proj-title"
          className="font-bold uppercase tracking-wide mb-4"
          style={{
            ...headingBaseStyle,
            fontSize: `${styleSettings.headingFontSizePx}px`,
            textTransform: styleSettings.capitalization,
          }}
        >
          Projects
        </h3>,
      )
      data.projects.forEach((p, idx) => {
        items.push(<ProjectBlock key={`proj-${p.id}`} project={p} />)
        if (idx < data.projects.length - 1) items.push(<div key={`proj-sp-${p.id}`} className="h-3" />)
      })
    }

    const addEducation = () => {
      if (data.education.length === 0) return
      items.push(
        <h3
          key="edu-title"
          className="font-bold uppercase tracking-wide mb-4"
          style={{
            ...headingBaseStyle,
            fontSize: `${styleSettings.headingFontSizePx}px`,
            textTransform: styleSettings.capitalization,
          }}
        >
          Education
        </h3>,
      )
      data.education.forEach((e, idx) => {
        items.push(<EducationBlock key={`edu-${e.id}`} edu={e} />)
        if (idx < data.education.length - 1) items.push(<div key={`edu-sp-${e.id}`} className="h-2" />)
      })
    }

    const addCertifications = () => {
      if (data.certifications.length === 0) return
      items.push(
        <h3
          key="cert-title"
          className="font-bold uppercase tracking-wide mb-4"
          style={{
            ...headingBaseStyle,
            fontSize: `${styleSettings.headingFontSizePx}px`,
            textTransform: styleSettings.capitalization,
          }}
        >
          Certifications
        </h3>,
      )
      data.certifications.forEach((c, idx) => {
        items.push(<CertificationBlock key={`cert-${c.id}`} cert={c} />)
        if (idx < data.certifications.length - 1) items.push(<div key={`cert-sp-${c.id}`} className="h-2" />)
      })
    }

    const addLanguages = () => {
      if (data.languages.length === 0) return
      items.push(
        <h3
          key="lang-title"
          className="font-bold uppercase tracking-wide mb-4"
          style={{
            ...headingBaseStyle,
            fontSize: `${styleSettings.headingFontSizePx}px`,
            textTransform: styleSettings.capitalization,
          }}
        >
          Languages
        </h3>,
      )
      data.languages.forEach((l) => items.push(<LanguageLine key={`lang-${l.id}`} lang={l} />))
    }

    const addInterests = () => {
      if (data.additional.interests.length === 0) return
      items.push(
        <h3
          key="int-title"
          className="font-bold uppercase tracking-wide mb-4"
          style={{
            ...headingBaseStyle,
            fontSize: `${styleSettings.headingFontSizePx}px`,
            textTransform: styleSettings.capitalization,
          }}
        >
          Interests
        </h3>,
      )
      items.push(
        <div key="int-body" className="flex flex-wrap">
          {data.additional.interests.map((t, i) => (
            <InterestTag key={`int-${i}`} text={t} />
          ))}
        </div>,
      )
    }

    // Process sections in order
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
        if (styleSettings.headerIcons !== "none") {
          addContactSkillsGrid()
        }
        continue
      }

      switch (section) {
        case "skills":
          if (styleSettings.headerIcons === "none" || finalOrder[0] !== "personalInfo") {
            addSkills()
          }
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
  }, [data, headingBaseStyle, mutedStyle, styleSettings, dividerStyle])

  // Pagination effect
  useLayoutEffect(() => {
    if (!containerRef.current) return
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
    const elements = Array.from(containerRef.current.children) as HTMLElement[]
    elements.forEach((el, index) => {
      const style = window.getComputedStyle(el)
      const marginTop = parseFloat(style.marginTop) || 0
      const marginBottom = parseFloat(style.marginBottom) || 0
      const elementHeight = el.offsetHeight + marginTop + marginBottom
      if (currentHeight + elementHeight > contentHeightPx) {
        pushPage()
      }
      currentPage.push(blocks[index])
      currentHeight += elementHeight
    })
    if (currentPage.length > 0) newPages.push(currentPage)
    setPages(newPages)
  }, [blocks, contentHeightPx])

  return (
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      <div
        ref={containerRef}
        className="cv-measure fixed top-0 left-0 w-[210mm] opacity-0 pointer-events-none z-[-999]"
        style={{ ...pageStyle, visibility: "hidden" }}
      >
        {blocks}
      </div>
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm]" style={pageStyle}></div>
      ) : (
        pages.map((pageContent, i) => (
          <div
            key={i}
            className="a4-page w-[210mm] min-h-[297mm] relative print:shadow-none"
            style={{ ...pageStyle, breakAfter: i < pages.length - 1 ? "page" : "auto" }}
          >
            {pageContent}
            {styleSettings.showPageNumbers && pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] print:hidden" style={mutedStyle}>
                Page {i + 1} of {pages.length}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}