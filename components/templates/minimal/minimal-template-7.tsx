import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData } from "../../../types/cv-data";

interface MinimalTemplate7Props {
  data: CVData
  isPreview?: boolean
  profileImage?: string
}

// A4 dimensions in millimeters
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const A4_HEIGHT_PX = 1123; // Equivalent to 297mm in pixels at 96 DPI
const PADDING_PX = 32; // Increased padding for better spacing
const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - PADDING_PX * 2;

export function MinimalTemplate7({ data, isPreview = false, profileImage }: MinimalTemplate7Props) {
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
    <div className="mb-8">
      {profileImage && (
        <div className="mb-6">
          <img
            src={profileImage}
            alt={data.personalInfo.fullName}
            className="w-28 h-28 rounded-full object-cover mx-auto border-4 border-emerald-400"
          />
        </div>
      )}
      <h1 className="text-2xl font-bold mb-1 text-center">{data.personalInfo.fullName}</h1>
      <div className="h-1 w-12 bg-emerald-400 mb-3 mx-auto"></div>
      <p className="text-emerald-100 text-center text-sm">{data.personalInfo.jobTitle}</p>
    </div>
  )

  const ContactInfo = () => (
    <div className="mb-8 pb-8 border-b border-emerald-800">
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">Contact</h3>
      <div className="space-y-2 text-xs text-emerald-100">
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
    <div className="mb-8 pb-8 border-b border-emerald-800">
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">Technical</h3>
      <div className="space-y-2 text-xs text-emerald-100">
        {data.skills.technical.map((skill, i) => (
          <div key={i} className="flex items-center">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>
            {skill}
          </div>
        ))}
      </div>
    </div>
  )

  const SoftSkills = () => (
    <div className="mb-8 pb-8 border-b border-emerald-800">
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">Skills</h3>
      <div className="space-y-2 text-xs text-emerald-100">
        {data.skills.soft.map((skill, i) => (
          <div key={i} className="flex items-center">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></span>
            {skill}
          </div>
        ))}
      </div>
    </div>
  )

  const Languages = () => (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-300 mb-3">Languages</h3>
      <div className="space-y-2 text-xs text-emerald-100">
        {data.languages.map((lang) => (
          <div key={lang.id} className="flex justify-between">
            <span>{lang.name}</span>
            <span className="text-emerald-300">{lang.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const Summary = () => (
    <div className="mb-8">
      <p className="text-gray-700 leading-relaxed text-sm">{data.personalInfo.summary}</p>
    </div>
  )

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="experience-item mb-6">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">{exp.jobTitle}</h3>
          <p className="text-emerald-700 font-medium text-sm">{exp.companyName}</p>
        </div>
        <span className="text-xs text-gray-600 whitespace-nowrap ml-2">
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      {exp.location && <p className="text-xs text-gray-600 mb-2">{exp.location}</p>}
      <ul className="text-gray-700 space-y-1 ml-4">
        {exp.responsibilities.map((resp, index) => (
          <li key={index} className="list-disc text-xs leading-relaxed">
            {resp}
          </li>
        ))}
      </ul>
    </div>
  )

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="education-item mb-4">
      <h3 className="font-semibold text-gray-900 text-sm">{edu.degree}</h3>
      <p className="text-emerald-700 text-sm">{edu.institutionName}</p>
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{edu.location}</span>
        <span>{formatDate(edu.graduationDate)}</span>
      </div>
    </div>
  )

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="project-item mb-4">
      <h3 className="font-semibold text-gray-900 text-sm">{project.name}</h3>
      <p className="text-emerald-700 text-xs">{project.role}</p>
      <p className="text-gray-700 text-xs my-1 leading-relaxed">{project.description}</p>
      <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
    </div>
  )

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div className="certification-item flex justify-between items-start mb-3">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">{cert.title}</p>
        <p className="text-gray-600 text-xs">{cert.issuingOrganization}</p>
      </div>
      <span className="text-xs text-gray-600 whitespace-nowrap ml-2">{formatDate(cert.dateObtained)}</span>
    </div>
  )

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="section-title text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-emerald-600">{title}</h2>
  )

  const SidebarSection = ({ children, isContinued = false }: { children: React.ReactNode; isContinued?: boolean }) => (
    <div className="w-72 bg-emerald-900 text-white p-8 print:bg-emerald-900">
      {isContinued && (
        <div className="text-emerald-200 text-xs italic mb-6 hidden">
          Continued from previous page...
        </div>
      )}
      {children}
    </div>
  )

  const EmptySidebarSection = () => (
    <div className="w-72 bg-emerald-900 text-white p-8 print:bg-emerald-900">
      {/* Empty sidebar - only background color remains */}
    </div>
  )

  const MainContentSection = ({ children }: { children: React.ReactNode }) => (
    <div className="flex-1 p-8">
      {children}
    </div>
  )

  const TwoColumnLayout = ({ 
    sidebar, 
    main, 
    isContinued = false,
    hideSidebarContent = false
  }: { 
    sidebar: React.ReactNode; 
    main: React.ReactNode;
    isContinued?: boolean;
    hideSidebarContent?: boolean;
  }) => (
    <div className="flex min-h-[297mm] bg-white print:min-h-0">
      {hideSidebarContent ? <EmptySidebarSection /> : <SidebarSection isContinued={isContinued}>{sidebar}</SidebarSection>}
      <MainContentSection>{main}</MainContentSection>
    </div>
  )

  // Create page content with proper A4 sizing
  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    
    // First page with complete sidebar and initial main content
    const firstPageMainContent: React.ReactNode[] = [];
    
    if (data.personalInfo.summary) {
      firstPageMainContent.push(<Summary key="summary" />);
    }
    
    if (data.experience.length > 0) {
      firstPageMainContent.push(
        <div key="experience-section">
          <SectionTitle title="EXPERIENCE" />
          {data.experience.map((exp, index) => (
            <React.Fragment key={exp.id}>
              <ExperienceItem exp={exp} />
              {index < data.experience.length - 1 && <div className="h-3" />}
            </React.Fragment>
          ))}
        </div>
      );
    }

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
        main={<div className="space-y-6">{firstPageMainContent}</div>}
      />
    );

    // Additional content for subsequent pages
    const additionalContent: React.ReactNode[] = [];
    
    if (data.education.length > 0) {
      additionalContent.push(
        <div key="education-section">
          <SectionTitle title="EDUCATION" />
          {data.education.map((edu, index) => (
            <React.Fragment key={edu.id}>
              <EducationItem edu={edu} />
              {index < data.education.length - 1 && <div className="h-2" />}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (data.projects.length > 0) {
      additionalContent.push(
        <div key="projects-section">
          <SectionTitle title="PROJECTS" />
          {data.projects.map((project, index) => (
            <React.Fragment key={project.id}>
              <ProjectItem project={project} />
              {index < data.projects.length - 1 && <div className="h-2" />}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (data.certifications.length > 0) {
      additionalContent.push(
        <div key="certifications-section">
          <SectionTitle title="CERTIFICATIONS" />
          {data.certifications.map((cert, index) => (
            <React.Fragment key={cert.id}>
              <CertificationItem cert={cert} />
              {index < data.certifications.length - 1 && <div className="h-1" />}
            </React.Fragment>
          ))}
        </div>
      );
    }

    // Add additional pages if there's more content
    if (additionalContent.length > 0) {
      items.push(
        <TwoColumnLayout
          key="page-2"
          isContinued={true}
          hideSidebarContent={true} // This hides the sidebar content on second page
          sidebar={
            <>
              <ContactInfo />
              {data.skills.technical.length > 0 && <TechnicalSkills />}
            </>
          }
          main={<div className="space-y-6">{additionalContent}</div>}
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
      
      // If adding this element would exceed page height, start a new page
      if (currentHeight > 0 && currentHeight + elementHeight > CONTENT_HEIGHT_PX) {
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
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0 print:bg-white">
      {/* Hidden measurement container */}
      <div 
        ref={containerRef} 
        className="cv-measure fixed top-0 left-0 w-[210mm] opacity-0 pointer-events-none z-[-999]" 
        style={{ visibility: "hidden" }}
      >
        {blocks}
      </div>
      
      {/* Render actual pages */}
      {pages.length === 0 ? (
        <div className={`a4-page w-[210mm] h-[297mm] bg-white text-slate-900 relative print:shadow-none print:h-[297mm] print:overflow-hidden`}>
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
            className={`a4-page w-[210mm] h-[297mm] bg-white text-slate-900 relative print:shadow-none print:h-[297mm] print:overflow-hidden ${
              isPreview ? 'shadow-lg border border-gray-200' : ''
            }`}
            style={{ 
              breakAfter: i < pages.length - 1 ? 'page' : 'auto',
              breakInside: 'avoid',
              pageBreakAfter: i < pages.length - 1 ? 'always' : 'auto'
            }}
          >
            {pageContent}
            {pages.length > 1 && (
              <div className="absolute bottom-4 right-8 text-[10px] text-slate-400 print:hidden">
                Page {i + 1} of {pages.length}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}