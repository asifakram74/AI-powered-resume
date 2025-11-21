"use client"

import React, { useMemo, useRef, useState, useLayoutEffect } from "react"
import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react"
import type { CVData } from "../../../types/cv-data"

interface CreativeTemplateProps {
  data: CVData
  isPreview?: boolean
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function CreativeTemplate({ data, isPreview = false }: CreativeTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);

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
    <div className="mb-8">
      <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-700 mb-6 rounded-full"></div>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-slate-800 mb-2">{data.personalInfo.fullName}</h1>
          <h2 className="text-lg font-semibold text-blue-600 mb-4">
            {data.personalInfo.jobTitle}
          </h2>
        </div>
        {data.personalInfo.profilePicture && (
          <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100">
            <img
              src={data.personalInfo.profilePicture}
              alt={data.personalInfo.fullName}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      <p className="text-slate-600 leading-relaxed text-sm">{data.personalInfo.summary}</p>
    </div>
  )

  const ContactInfo = () => (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center">
        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
        Contact
      </h3>
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center space-x-3">
          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="break-all text-sm">{data.personalInfo.email}</span>
        </div>
        <div className="flex items-center space-x-3">
          <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm">{data.personalInfo.phone}</span>
        </div>
        <div className="flex items-center space-x-3">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm">
            {(data.personalInfo.city || data.personalInfo.country) && (
              <span>
                {data.personalInfo.city && data.personalInfo.country
                  ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                  : data.personalInfo.city || data.personalInfo.country}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  )

  const Skills = () => (
    <div className="mb-8">
      <div className="grid grid-cols-2 gap-6">
        {data.skills.technical.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Technical Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.technical.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.skills.soft.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.skills.soft.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="text-base font-bold text-slate-800">{exp.jobTitle}</h4>
          <p className="text-sm font-semibold text-blue-600 mb-1">{exp.companyName}</p>
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
          {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      <ul className="text-sm text-slate-600 space-y-1.5">
        {exp.responsibilities.map((resp, i) => (
          <li key={i} className="flex items-start">
            <span className="text-blue-500 mr-2 mt-1.5">•</span>
            <span>{resp}</span>
          </li>
        ))}
      </ul>
    </div>
  )

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="p-4 bg-slate-50 rounded-lg mb-4">
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-base font-bold text-slate-800">{project.name}</h4>
        <div className="flex space-x-2">
          {project.liveDemoLink && (
            <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {project.githubLink && (
            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors">
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
      <p className="text-sm font-medium text-slate-600 mb-2">{project.role}</p>
      <p className="text-sm text-slate-600 mb-3">{project.description}</p>
      <div className="flex flex-wrap gap-1.5">
        {project.technologies.map((tech, i) => (
          <span
            key={i}
            className="text-xs text-slate-600 bg-white px-2 py-1 rounded"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  )

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="p-3 bg-blue-50 rounded-lg mb-3">
      <h4 className="text-sm font-bold text-slate-800 mb-1">{edu.degree}</h4>
      <p className="text-sm text-slate-600 mb-1">{edu.institutionName}</p>
      <p className="text-xs text-blue-600 font-medium">{formatDate(edu.graduationDate)}</p>
    </div>
  )

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div className="mb-3">
      <h4 className="text-sm font-bold text-slate-800">{cert.title}</h4>
      <p className="text-sm text-slate-600">{cert.issuingOrganization}</p>
      <p className="text-xs text-blue-600 font-medium">{formatDate(cert.dateObtained)}</p>
    </div>
  )

  const LanguageItem = ({ lang }: { lang: CVData["languages"][number] }) => (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm font-medium text-slate-800">{lang.name}</span>
      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
        {lang.proficiency}
      </span>
    </div>
  )

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center">
      <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
      {title}
    </h3>
  )

  const SideSectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center">
      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
      {title}
    </h3>
  )

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    
    items.push(<Header key="header" />);
    items.push(<ContactInfo key="contact" />);
    items.push(<Skills key="skills" />);

    if (data.experience.length > 0) {
      items.push(<SectionTitle key="exp-title" title="Experience" />);
      data.experience.forEach((exp, index) => {
        const isLast = index === data.experience.length - 1;
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} className="h-4" />);
      });
    }

    if (data.projects.length > 0) {
      items.push(<SectionTitle key="proj-title" title="Projects" />);
      data.projects.forEach((project, index) => {
        const isLast = index === data.projects.length - 1;
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
        if (!isLast) items.push(<div key={`proj-sp-${project.id}`} className="h-4" />);
      });
    }

    if (data.education.length > 0) {
      items.push(<SideSectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} className="h-2" />);
      });
    }

    if (data.certifications.length > 0) {
      items.push(<SideSectionTitle key="cert-title" title="Certifications" />);
      data.certifications.forEach((cert, index) => {
        const isLast = index === data.certifications.length - 1;
        items.push(<CertificationItem key={`cert-${cert.id}`} cert={cert} />);
        if (!isLast) items.push(<div key={`cert-sp-${cert.id}`} className="h-2" />);
      });
    }

    if (data.languages.length > 0) {
      items.push(<SideSectionTitle key="lang-title" title="Languages" />);
      data.languages.forEach((lang, index) => {
        const isLast = index === data.languages.length - 1;
        items.push(<LanguageItem key={`lang-${lang.id}`} lang={lang} />);
        if (!isLast) items.push(<div key={`lang-sp-${lang.id}`} className="h-2" />);
      });
    }

    if (data.additional.interests.length > 0) {
      items.push(<SideSectionTitle key="int-title" title="Interests" />);
      items.push(
        <div key="int-body" className="flex flex-wrap gap-2">
          {data.additional.interests.map((interest, i) => (
            <span
              key={i}
              className="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full"
            >
              {interest}
            </span>
          ))}
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
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      <div ref={containerRef} className="cv-measure fixed top-0 left-0 w-[210mm] p-12 opacity-0 pointer-events-none z-[-999]" style={{ visibility: "hidden" }}>
        {blocks}
      </div>
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm] p-12 bg-white"></div>
      ) : (
        pages.map((pageContent, i) => (
          <div key={i} className="a4-page w-[210mm] min-h-[297mm] p-12 bg-white text-slate-900 relative print:shadow-none" style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}>
            {pageContent}
            {pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] text-slate-400 print:hidden">Page {i + 1} of {pages.length}</div>
            )}
          </div>
        ))
      )}
    </div>
  )
}