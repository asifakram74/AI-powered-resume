import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData } from "../../../types/cv-data";

interface MinimalTemplate8Props {
  data: CVData
  isPreview?: boolean
  profileImage?: string
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function MinimalTemplate8({ data, isPreview = false, profileImage }: MinimalTemplate8Props) {
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
    <div className="mb-10">
      {profileImage && (
        <div className="mb-8">
          <img
            src={profileImage}
            alt={data.personalInfo.fullName}
            className="w-32 h-32 rounded-lg object-cover mx-auto border-4 border-teal-500"
          />
        </div>
      )}
      <h1 className="text-3xl font-bold mb-1">{data.personalInfo.fullName}</h1>
      <div className="h-1 w-12 bg-teal-300 mb-4"></div>
      <p className="text-teal-100">{data.personalInfo.jobTitle}</p>
    </div>
  )

  const ContactInfo = () => (
    <div className="mb-10 pb-10 border-b border-teal-600">
      <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300 mb-4">Contact</h3>
      <div className="space-y-3 text-sm text-teal-100">
        <p className="break-words">{data.personalInfo.email}</p>
        <p>{data.personalInfo.phone}</p>
        {data.personalInfo.city && data.personalInfo.country && (
          <p>
            {data.personalInfo.city}, {data.personalInfo.country}
          </p>
        )}
      </div>
    </div>
  )

  const TechnicalSkills = () => (
    <div className="mb-10 pb-10 border-b border-teal-600">
      <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300 mb-4">Technical</h3>
      <div className="space-y-2 text-sm text-teal-100">
        {data.skills.technical.map((skill, i) => (
          <div key={i} className="flex items-center">
            <span className="w-2 h-2 bg-teal-300 rounded-full mr-2"></span>
            {skill}
          </div>
        ))}
      </div>
    </div>
  )

  const SoftSkills = () => (
    <div className="mb-10 pb-10 border-b border-teal-600">
      <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300 mb-4">Skills</h3>
      <div className="space-y-2 text-sm text-teal-100">
        {data.skills.soft.map((skill, i) => (
          <div key={i} className="flex items-center">
            <span className="w-2 h-2 bg-teal-300 rounded-full mr-2"></span>
            {skill}
          </div>
        ))}
      </div>
    </div>
  )

  const Languages = () => (
    <div>
      <h3 className="text-sm font-bold uppercase tracking-wider text-teal-300 mb-4">Languages</h3>
      <div className="space-y-2 text-sm text-teal-100">
        {data.languages.map((lang) => (
          <div key={lang.id} className="flex justify-between">
            <span>{lang.name}</span>
            <span className="text-teal-300">{lang.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const Summary = () => (
    <div className="mb-10">
      <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
    </div>
  )

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="mb-8">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
          <p className="text-teal-700 font-medium">{exp.companyName}</p>
        </div>
        <span className="text-sm text-gray-600">
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      {exp.location && <p className="text-sm text-gray-600 mb-2">{exp.location}</p>}
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
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
      <p className="text-teal-700">{edu.institutionName}</p>
      <div className="flex justify-between text-sm text-gray-600 mt-1">
        <span>{edu.location}</span>
        <span>{formatDate(edu.graduationDate)}</span>
      </div>
    </div>
  )

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="mb-6">
      <h3 className="font-semibold text-gray-900">{project.name}</h3>
      <p className="text-teal-700 text-sm">{project.role}</p>
      <p className="text-gray-700 text-sm my-2">{project.description}</p>
      <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
    </div>
  )

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="font-semibold text-gray-900">{cert.title}</p>
        <p className="text-gray-600 text-sm">{cert.issuingOrganization}</p>
      </div>
      <span className="text-sm text-gray-600">{formatDate(cert.dateObtained)}</span>
    </div>
  )

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-teal-600">{title}</h2>
  )

  const SidebarSection = ({ children }: { children: React.ReactNode }) => (
    <div className="w-80 bg-teal-700 text-white p-10">
      {children}
    </div>
  )

  const MainContentSection = ({ children }: { children: React.ReactNode }) => (
    <div className="flex-1 p-10">
      {children}
    </div>
  )

  const TwoColumnLayout = ({ sidebar, main }: { sidebar: React.ReactNode; main: React.ReactNode }) => (
    <div className="flex min-h-[297mm] bg-white">
      <SidebarSection>{sidebar}</SidebarSection>
      <MainContentSection>{main}</MainContentSection>
    </div>
  )

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    
    // First page with sidebar and main content
    items.push(
      <TwoColumnLayout
        key="page-1"
        sidebar={
          <>
            <Header />
            <ContactInfo />
            {data.skills.technical.length > 0 && <TechnicalSkills />}
            {data.skills.soft.length > 0 && <SoftSkills />}
            {data.languages.length > 0 && <Languages />}
          </>
        }
        main={
          <>
            <Summary />
            {data.experience.length > 0 && (
              <>
                <SectionTitle title="EXPERIENCE" />
                {data.experience.map((exp, index) => (
                  <React.Fragment key={exp.id}>
                    <ExperienceItem exp={exp} />
                    {index < data.experience.length - 1 && <div className="h-4" />}
                  </React.Fragment>
                ))}
              </>
            )}
          </>
        }
      />
    );

    // Additional pages for remaining content
    const remainingContent = [];
    
    if (data.education.length > 0) {
      remainingContent.push(
        <div key="education-section">
          <SectionTitle title="EDUCATION" />
          {data.education.map((edu, index) => (
            <React.Fragment key={edu.id}>
              <EducationItem edu={edu} />
              {index < data.education.length - 1 && <div className="h-3" />}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (data.projects.length > 0) {
      remainingContent.push(
        <div key="projects-section">
          <SectionTitle title="PROJECTS" />
          {data.projects.map((project, index) => (
            <React.Fragment key={project.id}>
              <ProjectItem project={project} />
              {index < data.projects.length - 1 && <div className="h-3" />}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (data.certifications.length > 0) {
      remainingContent.push(
        <div key="certifications-section">
          <SectionTitle title="CERTIFICATIONS" />
          {data.certifications.map((cert, index) => (
            <React.Fragment key={cert.id}>
              <CertificationItem cert={cert} />
              {index < data.certifications.length - 1 && <div className="h-2" />}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // Add remaining content to additional pages if needed
    if (remainingContent.length > 0) {
      items.push(
        <TwoColumnLayout
          key="page-2"
          sidebar={
            <div className="w-60 bg-teal-700 text-white p-10">
              <div className="text-teal-700 text-sm italic">
                Continued from previous page...
              </div>
            </div>
          }
          main={<div className="space-y-8">{remainingContent}</div>}
        />
      );
    }

    return items;
  }, [data, profileImage]);

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
    
    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }
    
    setPages(newPages);
  }, [blocks]);

  return (
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      {/* Hidden measurement container */}
      <div 
        ref={containerRef} 
        className="cv-measure fixed top-0 left-0 w-[210mm] p-12 opacity-0 pointer-events-none z-[-999]" 
        style={{ visibility: "hidden" }}
      >
        {blocks}
      </div>
      
      {/* Render actual pages */}
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm] bg-white">
          <TwoColumnLayout
            sidebar={
              <>
                <Header />
                <ContactInfo />
                {data.skills.technical.length > 0 && <TechnicalSkills />}
                {data.skills.soft.length > 0 && <SoftSkills />}
                {data.languages.length > 0 && <Languages />}
              </>
            }
            main={
              <>
                <Summary />
                {data.experience.length > 0 && (
                  <>
                    <SectionTitle title="EXPERIENCE" />
                    {data.experience.map((exp) => (
                      <ExperienceItem key={exp.id} exp={exp} />
                    ))}
                  </>
                )}
              </>
            }
          />
        </div>
      ) : (
        pages.map((pageContent, i) => (
          <div 
            key={i} 
            className="a4-page w-[210mm] min-h-[297mm] bg-white text-slate-900 relative print:shadow-none" 
            style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}
          >
            {pageContent}
            {pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] text-slate-400 print:hidden">
                Page {i + 1} of {pages.length}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}