import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData } from "../../../types/cv-data";

interface CreativeTemplate3Props {
  data: CVData
  isPreview?: boolean
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function CreativeTemplate3({ data, isPreview = false }: CreativeTemplate3Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);

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

  const Header = () => (
    <div className="bg-white border-b border-gray-200 px-12 py-12">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">{data.personalInfo.fullName}</h1>
        <div className="h-1 w-16 bg-blue-600 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600 mb-8">{data.personalInfo.jobTitle}</p>

        <div className="flex justify-center gap-8 text-sm">
          <div>
            <p className="text-gray-500 font-medium mb-1">Email</p>
            <p className="text-gray-700">{data.personalInfo.email}</p>
          </div>
          <div>
            <p className="text-gray-500 font-medium mb-1">Phone</p>
            <p className="text-gray-700">{data.personalInfo.phone}</p>
          </div>
          {(data.personalInfo.city || data.personalInfo.country) && (
            <div>
              <p className="text-gray-500 font-medium mb-1">Location</p>
              <p className="text-gray-700">
                {data.personalInfo.city && data.personalInfo.country
                  ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                  : data.personalInfo.city || data.personalInfo.country}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const Summary = () => (
    <div className="mb-8 px-12 py-6">
      <p className="text-gray-700 leading-relaxed text-base">{data.personalInfo.summary}</p>
    </div>
  )

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="mb-6 px-12">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
          <p className="text-blue-600 font-medium">{exp.companyName}</p>
        </div>
        <span className="text-sm text-gray-500">
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      {exp.location && <p className="text-sm text-gray-600 mb-3">{exp.location}</p>}
      <ul className="text-gray-700 space-y-1 ml-4">
        {exp.responsibilities.map((resp, index) => (
          <li key={index} className="list-disc text-sm">
            {resp}
          </li>
        ))}
      </ul>
    </div>
  )

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="flex justify-between items-start mb-6 px-12">
      <div>
        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
        <p className="text-blue-600 font-medium">{edu.institutionName}</p>
        {edu.location && <p className="text-sm text-gray-600 mt-1">{edu.location}</p>}
        {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
      </div>
      {edu.graduationDate && (
        <span className="text-sm text-gray-500">{formatDate(edu.graduationDate)}</span>
      )}
    </div>
  )

  const Skills = () => (
    <div className="mb-8 px-12">
      <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
        Core Competencies
      </h2>
      <div className="space-y-4">
        {data.skills.technical.length > 0 && (
          <div>
            <p className="font-medium text-gray-900 mb-2">Technical</p>
            <p className="text-gray-700 text-sm">{data.skills.technical.join(" • ")}</p>
          </div>
        )}
        {data.skills.soft.length > 0 && (
          <div>
            <p className="font-medium text-gray-900 mb-2">Professional</p>
            <p className="text-gray-700 text-sm">{data.skills.soft.join(" • ")}</p>
          </div>
        )}
      </div>
    </div>
  )

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="mb-6 px-12">
      <h3 className="font-semibold text-gray-900">{project.name}</h3>
      <p className="text-blue-600 font-medium text-sm mb-2">{project.role}</p>
      <p className="text-gray-700 text-sm mb-2">{project.description}</p>
      <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
    </div>
  )

  const LanguageItem = ({ lang }: { lang: CVData["languages"][number] }) => (
    <div className="flex justify-between py-1">
      <span className="text-gray-900">{lang.name}</span>
      <span className="text-blue-600">{lang.proficiency}</span>
    </div>
  )

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div className="mb-3 px-12">
      <p className="font-semibold text-gray-900">{cert.title}</p>
      <p className="text-gray-600 text-sm">{cert.issuingOrganization}</p>
      <p className="text-blue-600 text-sm">{formatDate(cert.dateObtained)}</p>
    </div>
  )

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-base px-12 font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
      {title}
    </h2>
  )

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    
    items.push(<Header key="header" />);
    
    if (data.personalInfo.summary) {
      items.push(<Summary key="summary" />);
    }

    if (data.experience.length > 0) {
      items.push(<SectionTitle key="exp-title" title="Professional Experience" />);
      data.experience.forEach((exp, index) => {
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
      });
    }

    if (data.education.length > 0) {
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
      });
    }

    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) {
      items.push(<Skills key="skills" />);
    }

    if (data.projects.length > 0) {
      items.push(<SectionTitle key="proj-title" title="Notable Projects" />);
      data.projects.forEach((project, index) => {
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
      });
    }

    if (data.languages.length > 0 || data.certifications.length > 0) {
      items.push(
        <div key="lang-cert-grid" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {data.languages.length > 0 && (
            <div>
              <h2 className="px-12 text-base font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
                Languages
              </h2>
              <div className="space-y-2 px-12">
                {data.languages.map((lang) => (
                  <LanguageItem key={lang.id} lang={lang} />
                ))}
              </div>
            </div>
          )}
          {data.certifications.length > 0 && (
            <div>
              <h2 className="px-12 text-base font-semibold text-gray-900 uppercase tracking-wide mb-4 pb-2 border-b border-gray-200">
                Certifications
              </h2>
              <div className="space-y-2 px-12">
                {data.certifications.map((cert) => (
                  <CertificationItem key={cert.id} cert={cert} />
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    return items;
  }, [data]);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const newPages: React.ReactNode[][] = [];
    let currentPage: React.ReactNode[] = [];
    let currentHeight = 0;
    const pushPage = () => {
      if (currentPage.length > 0) {
        newPages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
    };
    const elements = Array.from(containerRef.current.children) as HTMLElement[];
    elements.forEach((el, index) => {
      const style = window.getComputedStyle(el);
      const marginTop = parseFloat(style.marginTop) || 0;
      const marginBottom = parseFloat(style.marginBottom) || 0;
      const elementHeight = el.offsetHeight + marginTop + marginBottom;
      if (currentHeight + elementHeight > CONTENT_HEIGHT_PX) {
        pushPage();
      }
      currentPage.push(blocks[index]);
      currentHeight += elementHeight;
    });
    if (currentPage.length > 0) newPages.push(currentPage);
    setPages(newPages);
  }, [blocks]);

  return (
    <div className="flex flex-col items-center gap-8 pb-20">
      <div ref={containerRef} className="cv-measure fixed top-0 left-0 w-[210mm] p-12 opacity-0 pointer-events-none z-[-999]" style={{ visibility: "hidden" }}>
        {blocks}
      </div>
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm] bg-white"></div>
      ) : (
        pages.map((pageContent, i) => (
          <div key={i} className="a4-page w-[210mm] min-h-[297mm] bg-white text-gray-900 relative print:shadow-none pt-12 pb-12" style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}>
            {pageContent}
            {pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] text-gray-400 print:hidden">Page {i + 1} of {pages.length}</div>
            )}
          </div>
        ))
      )}
    </div>
  )
}