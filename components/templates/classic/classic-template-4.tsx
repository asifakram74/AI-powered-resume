import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData } from "../../../types/cv-data";

interface ClassicTemplate4Props {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function ClassicTemplate4({ data, isPreview = false }: ClassicTemplate4Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);

  const formatDate = (date: string) => {
    if (!date) return "";
    const s = date.trim();
    if (!s) return "";

    // Normalize dash types
    const normalized = s.replace(/[\u2012-\u2015\u2212]/g, "-");

    // Year-only: 2021
    if (/^\d{4}$/.test(normalized)) return normalized;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    // ISO: YYYY-MM or YYYY-MM-DD
    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)));
      return `${monthNames[month - 1]} ${year}`;
    }

    // MM/YYYY
    const slashMatch = normalized.match(/^(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)));
      const year = slashMatch[2];
      return `${monthNames[month - 1]} ${year}`;
    }

    // Already readable like "Jan 2020" or "March 2022"
    if (/^([A-Za-z]{3,9})\s+\d{4}$/.test(normalized)) return normalized;

    // Fallback: return raw string to avoid "undefined"
    return normalized;
  };

  const Header = () => (
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
        {data.personalInfo.fullName}
      </h1>
      <h2 className="text-xl text-gray-700 font-medium mb-4">
        {data.personalInfo.jobTitle}
      </h2>
      <div className="flex flex-wrap justify-center gap-4 text-gray-600 text-sm">
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
          </svg>
          {data.personalInfo.email}
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          {data.personalInfo.phone}
        </span>
        {(data.personalInfo.city || data.personalInfo.country) && (
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {data.personalInfo.city && data.personalInfo.country
              ? `${data.personalInfo.city}, ${data.personalInfo.country}`
              : data.personalInfo.city || data.personalInfo.country}
          </span>
        )}
      </div>
    </div>
  );

  const Summary = ({ summary }: { summary: string }) => (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-300 pb-2">
        Professional Summary
      </h2>
      <p className="text-gray-700 leading-relaxed text-sm">{summary}</p>
    </div>
  );

  const Skills = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
        Skills
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {skills.technical.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.technical.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-2">Soft Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.soft.map((skill, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="pl-4 border-l-4 border-gray-200">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900 text-base">{exp.jobTitle}</h3>
        <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      <div className="flex justify-between items-start mb-3">
        <p className="text-gray-700 font-medium text-sm">
          {exp.companyName}
          {exp.location && ` • ${exp.location}`}
        </p>
      </div>
      <ul className="text-gray-700 text-sm leading-relaxed space-y-2">
        {exp.responsibilities.map((resp, index) => (
          <li key={index} className="flex items-start">
            <span className="text-gray-500 mr-2 mt-1">•</span>
            <span>{resp}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="pl-4 border-l-4 border-gray-200">
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-semibold text-gray-900 text-base">{edu.degree}</h3>
        {edu.graduationDate && (
          <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">
            {formatDate(edu.graduationDate)}
          </span>
        )}
      </div>
      <p className="text-gray-700 font-medium text-sm mb-1">{edu.institutionName}</p>
      {edu.location && <p className="text-gray-600 text-sm mb-1">{edu.location}</p>}
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        {edu.gpa && <span>GPA: {edu.gpa}</span>}
        {edu.honors && <span>{edu.honors}</span>}
      </div>
      {edu.additionalInfo && (
        <p className="text-gray-600 text-sm mt-2">{edu.additionalInfo}</p>
      )}
    </div>
  );

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="pl-4 border-l-4 border-gray-200">
      <h3 className="font-semibold text-gray-900 text-base mb-1">{project.name}</h3>
      <p className="text-gray-600 text-sm mb-2">{project.role}</p>
      <p className="text-gray-700 text-sm mb-3">{project.description}</p>
      <div className="text-gray-600 text-sm mb-2">
        <span className="font-medium">Technologies: </span>
        {project.technologies.join(", ")}
      </div>
      {(project.liveDemoLink || project.githubLink) && (
        <div className="flex gap-4 text-sm">
          {project.liveDemoLink && (
            <a
              href={project.liveDemoLink}
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
              Live Demo
            </a>
          )}
          {project.githubLink && (
            <a
              href={project.githubLink}
              className="text-blue-600 hover:underline flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Source Code
            </a>
          )}
        </div>
      )}
    </div>
  );

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div>
      <div className="font-semibold text-gray-900 text-sm">{cert.title}</div>
      <div className="text-gray-700 text-sm">{cert.issuingOrganization}</div>
      <div className="text-gray-600 text-sm">
        {formatDate(cert.dateObtained)}
        {cert.verificationLink && (
          <a
            href={cert.verificationLink}
            className="text-blue-600 hover:underline ml-2"
          >
            (Verify)
          </a>
        )}
      </div>
    </div>
  );

  const LanguageItem = ({ lang }: { lang: CVData["languages"][number] }) => (
    <div className="flex justify-between items-center">
      <span className="text-gray-700 text-sm font-medium">{lang.name}</span>
      <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded">
        {lang.proficiency}
      </span>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-300 pb-2">
      {title}
    </h2>
  );

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    
    items.push(<Header key="header" />);
    
    if (data.personalInfo.summary) {
      items.push(<Summary key="summary" summary={data.personalInfo.summary} />);
    }

    if (data.experience.length > 0) {
      items.push(<SectionTitle key="exp-title" title="Professional Experience" />);
      data.experience.forEach((exp, index) => {
        const isLast = index === data.experience.length - 1;
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} className="h-6" />);
      });
    }

    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) {
      items.push(<Skills key="skills" skills={data.skills} />);
    }

    if (data.education.length > 0) {
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} className="h-4" />);
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

    if (data.certifications.length > 0 || data.languages.length > 0) {
      items.push(
        <div key="cert-lang-grid" className="grid grid-cols-2 gap-8 mb-8">
          {data.certifications.length > 0 && (
            <div>
              <SectionTitle title="Certifications" />
              <div className="space-y-3">
                {data.certifications.map((cert, index) => {
                  const isLast = index === data.certifications.length - 1;
                  return (
                    <React.Fragment key={`cert-${cert.id}`}>
                      <CertificationItem cert={cert} />
                      {!isLast && <div key={`cert-sp-${cert.id}`} className="h-2" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
          {data.languages.length > 0 && (
            <div>
              <SectionTitle title="Languages" />
              <div className="space-y-2">
                {data.languages.map((lang, index) => {
                  const isLast = index === data.languages.length - 1;
                  return (
                    <React.Fragment key={`lang-${lang.id}`}>
                      <LanguageItem lang={lang} />
                      {!isLast && <div key={`lang-sp-${lang.id}`} className="h-2" />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (data.additional.interests.length > 0) {
      items.push(<SectionTitle key="int-title" title="Interests" />);
      items.push(
        <div key="int-body" className="flex flex-wrap gap-2">
          {data.additional.interests.map((interest, index) => (
            <span
              key={index}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
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
  );
}