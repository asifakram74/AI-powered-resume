"use client"

import React, { useMemo, useRef, useState, useLayoutEffect } from "react"
import { Mail, Phone, MapPin } from "lucide-react"
import type { CVData } from "../../../types/cv-data"

interface CreativeTemplate4Props {
  data: CVData
  isPreview?: boolean
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function CreativeTemplate4({ data, isPreview = false }: CreativeTemplate4Props) {
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

    return date
  }

  const Header = () => (
    <div className="mb-8 border-b-2 border-gray-300 pb-6">
      <h1 className="text-4xl font-bold mb-1">{data.personalInfo.fullName}</h1>
      <p className="text-lg text-gray-600 font-medium mb-3">{data.personalInfo.jobTitle}</p>
      <p className="text-gray-700 leading-relaxed max-w-3xl">{data.personalInfo.summary}</p>
    </div>
  )

  const ContactInfo = () => (
    <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-700">
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4" />
        <span>{data.personalInfo.email}</span>
      </div>
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4" />
        <span>{data.personalInfo.phone}</span>
      </div>
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        <span>
          {data.personalInfo.city && data.personalInfo.country
            ? `${data.personalInfo.city}, ${data.personalInfo.country}`
            : data.personalInfo.city || data.personalInfo.country}
        </span>
      </div>
    </div>
  )

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="mb-6">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
          <p className="text-gray-600">{exp.companyName}</p>
        </div>
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
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
    <div className="mb-4">
      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
      <p className="text-gray-600">{edu.institutionName}</p>
      <p className="text-sm text-gray-600">{formatDate(edu.graduationDate)}</p>
    </div>
  )

  const Skills = () => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Skills</h2>
      {data.skills.technical.length > 0 && (
        <div className="mb-4">
          <p className="font-medium text-gray-900 mb-2">Technical</p>
          <p className="text-gray-700 text-sm">{data.skills.technical.join(", ")}</p>
        </div>
      )}
      {data.skills.soft.length > 0 && (
        <div>
          <p className="font-medium text-gray-900 mb-2">Professional</p>
          <p className="text-gray-700 text-sm">{data.skills.soft.join(", ")}</p>
        </div>
      )}
    </div>
  )

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="mb-4">
      <h3 className="font-semibold text-gray-900">{project.name}</h3>
      <p className="text-gray-600 text-sm">{project.role}</p>
      <p className="text-gray-700 text-sm my-1">{project.description}</p>
      <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
    </div>
  )

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div className="flex justify-between py-1">
      <p className="font-medium text-gray-900">{cert.title}</p>
      <p className="text-gray-600 text-sm">{formatDate(cert.dateObtained)}</p>
    </div>
  )

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">{title}</h2>
  )

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    
    items.push(<Header key="header" />);
    items.push(<ContactInfo key="contact" />);

    if (data.experience.length > 0) {
      items.push(<SectionTitle key="exp-title" title="Experience" />);
      data.experience.forEach((exp, index) => {
        const isLast = index === data.experience.length - 1;
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} className="h-4" />);
      });
    }

    if (data.education.length > 0) {
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} className="h-2" />);
      });
    }

    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) {
      items.push(<Skills key="skills" />);
    }

    if (data.projects.length > 0) {
      items.push(<SectionTitle key="proj-title" title="Projects" />);
      data.projects.forEach((project, index) => {
        const isLast = index === data.projects.length - 1;
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
        if (!isLast) items.push(<div key={`proj-sp-${project.id}`} className="h-3" />);
      });
    }

    if (data.certifications.length > 0) {
      items.push(<SectionTitle key="cert-title" title="Certifications" />);
      data.certifications.forEach((cert, index) => {
        const isLast = index === data.certifications.length - 1;
        items.push(<CertificationItem key={`cert-${cert.id}`} cert={cert} />);
        if (!isLast) items.push(<div key={`cert-sp-${cert.id}`} className="h-2" />);
      });
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
          <div key={i} className="a4-page w-[210mm] min-h-[297mm] p-12 bg-white text-gray-900 relative print:shadow-none" style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}>
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