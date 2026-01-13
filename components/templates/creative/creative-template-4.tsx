"use client"

import React, { useMemo, useRef, useState, useLayoutEffect } from "react"
import { Mail, Phone, MapPin, Linkedin, Github, Home } from "lucide-react"
import type { CVData, CVSectionId, PersonalInfoFieldId } from "../../../types/cv-data"

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

  const PersonalInfoSection = () => {
    const { personalInfo, personalInfoFieldOrder } = data;
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
    ];
    const order =
      personalInfoFieldOrder && personalInfoFieldOrder.length > 0
        ? personalInfoFieldOrder
        : defaultOrder;

    const isContactField = (f: PersonalInfoFieldId) =>
      ["email", "phone", "location", "address", "linkedin", "github"].includes(f);
    
    const contactFields = order.filter(isContactField);
    
    // Determine placement of Summary relative to Contact Info
    const summaryIndex = order.indexOf("summary");
    const firstContactIndex = order.findIndex(isContactField);
    const summaryFirst = summaryIndex !== -1 && (firstContactIndex === -1 || summaryIndex < firstContactIndex);

    const ContactItem = ({ icon: Icon, value }: { icon: any; value: string }) => (
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4" />
        <span>{value}</span>
      </div>
    );

    const ContactRow = () => (
      <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-700">
        {contactFields.map((field) => {
          switch (field) {
            case "email":
              return personalInfo.email ? <ContactItem key="email" icon={Mail} value={personalInfo.email} /> : null;
            case "phone":
              return personalInfo.phone ? <ContactItem key="phone" icon={Phone} value={personalInfo.phone} /> : null;
            case "location":
              if (!personalInfo.city && !personalInfo.country) return null;
              const hasAddress = contactFields.includes("address") && personalInfo.address;
              if (hasAddress) return null;
              return (
                <ContactItem
                  key="location"
                  icon={MapPin}
                  value={
                    personalInfo.city && personalInfo.country
                      ? `${personalInfo.city}, ${personalInfo.country}`
                      : personalInfo.city || personalInfo.country || ""
                  }
                />
              );
            case "address":
              return personalInfo.address ? <ContactItem key="address" icon={Home} value={personalInfo.address} /> : null;
            case "linkedin":
              return personalInfo.linkedin ? <ContactItem key="linkedin" icon={Linkedin} value={personalInfo.linkedin} /> : null;
            case "github":
              return personalInfo.github ? <ContactItem key="github" icon={Github} value={personalInfo.github} /> : null;
            default:
              return null;
          }
        })}
      </div>
    );

    const SummaryBlock = () => (
        <p className="text-gray-700 leading-relaxed max-w-3xl">{personalInfo.summary}</p>
    );

    return (
      <>
        <div className="mb-8 border-b-2 border-gray-300 pb-6">
          <h1 className="text-4xl font-bold mb-1">{personalInfo.fullName}</h1>
          <p className="text-lg text-gray-600 font-medium mb-3">{personalInfo.jobTitle}</p>
          {summaryFirst && personalInfo.summary && <SummaryBlock />}
        </div>
        
        {!summaryFirst && <ContactRow />}
        {!summaryFirst && personalInfo.summary && (
             <div className="mb-8">
                <SummaryBlock />
             </div>
        )}
        {summaryFirst && <ContactRow />}
      </>
    );
  };

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
    const allSections = [
      "personalInfo",
      "skills",
      "experience",
      "projects",
      "education",
      "certifications",
      "languages",
      "interests",
    ] as const satisfies readonly CVSectionId[];
    const requestedOrder: readonly CVSectionId[] =
      data.sectionOrder && data.sectionOrder.length > 0 ? data.sectionOrder : allSections;
    const hidden = data.hiddenSections || [];
    const ordered: CVSectionId[] = [
      ...requestedOrder.filter((s) => allSections.includes(s)),
      ...allSections.filter((s) => !requestedOrder.includes(s)),
    ];
    const finalOrder = ordered.filter((s) => s === "personalInfo" || !hidden.includes(s));

    const addPersonalInfo = () => {
        items.push(<PersonalInfoSection key="personalInfo" />);
    };

    const addSkills = () => {
      if (data.skills.technical.length === 0 && data.skills.soft.length === 0) return;
      items.push(<Skills key="skills" />);
    };

    const addExperience = () => {
      if (data.experience.length === 0) return;
      items.push(<SectionTitle key="exp-title" title="Experience" />);
      data.experience.forEach((exp, index) => {
        const isLast = index === data.experience.length - 1;
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} className="h-4" />);
      });
    };

    const addEducation = () => {
      if (data.education.length === 0) return;
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} className="h-2" />);
      });
    };

    const addProjects = () => {
      if (data.projects.length === 0) return;
      items.push(<SectionTitle key="proj-title" title="Projects" />);
      data.projects.forEach((project, index) => {
        const isLast = index === data.projects.length - 1;
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
        if (!isLast) items.push(<div key={`proj-sp-${project.id}`} className="h-3" />);
      });
    };

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      items.push(<SectionTitle key="lang-title" title="Languages" />);
      items.push(
        <div key="lang-body" className="mb-8 text-sm">
          {data.languages.map((lang, index) => (
            <span key={lang.id} className="text-gray-700">
                <span className="font-semibold text-gray-900">{lang.name}</span>
                {lang.proficiency ? ` (${lang.proficiency})` : ""}
                {index < data.languages.length - 1 ? ", " : ""}
            </span>
          ))}
        </div>
      );
    };

    const addCertifications = () => {
      if (data.certifications.length === 0) return;
      items.push(<SectionTitle key="cert-title" title="Certifications" />);
      data.certifications.forEach((cert, index) => {
        const isLast = index === data.certifications.length - 1;
        items.push(<CertificationItem key={`cert-${cert.id}`} cert={cert} />);
        if (!isLast) items.push(<div key={`cert-sp-${cert.id}`} className="h-2" />);
      });
    };

    const addInterests = () => {
        if (data.additional.interests.length === 0) return;
        items.push(<SectionTitle key="int-title" title="Interests" />);
        items.push(
            <div key="int-body" className="mb-8">
            <p className="text-gray-700 text-sm">{data.additional.interests.join(" • ")}</p>
            </div>
        );
    };

    finalOrder.forEach((section) => {
      switch (section) {
        case "personalInfo": addPersonalInfo(); break;
        case "skills": addSkills(); break;
        case "experience": addExperience(); break;
        case "projects": addProjects(); break;
        case "education": addEducation(); break;
        case "certifications": addCertifications(); break;
        case "languages": addLanguages(); break;
        case "interests": addInterests(); break;
      }
    });

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