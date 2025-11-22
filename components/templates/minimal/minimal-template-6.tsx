import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData } from "../../../types/cv-data";

interface MinimalTemplate6Props {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function MinimalTemplate6({ data, isPreview = false }: MinimalTemplate6Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);

  const formatDate = (date: string) => {
    if (!date) return "";
    const s = date.trim();
    if (!s) return "";
    const normalized = s.replace(/[\u2012-\u2015\u2212]/g, "-");
    if (/^\d{4}$/.test(normalized)) return normalized;
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
    ];
    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)));
      return `${monthNames[month - 1]} ${year}`;
    }
    const slashMatch = normalized.match(/^(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)));
      const year = slashMatch[2];
      return `${monthNames[month - 1]} ${year}`;
    }
    if (/^([A-Za-z]{3,9})\s+\d{4}$/.test(normalized)) return normalized;
    return normalized;
  };

  const GoldBar = () => (
    <div className="bg-amber-600 h-2"></div>
  );

  const Header = () => (
    <div className="pt-16 pb-12 px-12 border-b-2 border-amber-600">
      <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">{data.personalInfo.fullName}</h1>
      <p className="text-2xl text-amber-700 font-light mb-8">{data.personalInfo.jobTitle}</p>

      <div className="grid grid-cols-3 gap-6 text-sm text-gray-700">
        <div>
          <p className="text-amber-700 font-semibold text-xs mb-1">EMAIL</p>
          <p className="break-words">{data.personalInfo.email}</p>
        </div>
        <div>
          <p className="text-amber-700 font-semibold text-xs mb-1">PHONE</p>
          <p>{data.personalInfo.phone}</p>
        </div>
        {(data.personalInfo.city || data.personalInfo.country) && (
          <div>
            <p className="text-amber-700 font-semibold text-xs mb-1">LOCATION</p>
            <p>
              {data.personalInfo.city && data.personalInfo.country
                ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                : data.personalInfo.city || data.personalInfo.country}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const Summary = ({ summary }: { summary: string }) => (
    <div className="mb-12">
      <p className="text-lg text-gray-800 leading-relaxed font-light">{summary}</p>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-8 pb-3 border-b-2 border-amber-600">
      {title}
    </h2>
  );

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="mb-10">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{exp.jobTitle}</h3>
          <p className="text-amber-700 font-semibold">{exp.companyName}</p>
        </div>
        <span className="text-sm text-gray-600 font-light">
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      {exp.location && <p className="text-sm text-gray-600 mb-3 font-light">{exp.location}</p>}
      <ul className="text-gray-700 space-y-2 ml-4">
        {exp.responsibilities.map((resp, index) => (
          <li key={index} className="list-disc text-sm font-light">
            {resp}
          </li>
        ))}
      </ul>
    </div>
  );

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
        <p className="text-amber-700">{edu.institutionName}</p>
        {edu.location && <p className="text-sm text-gray-600 font-light">{edu.location}</p>}
        {edu.gpa && <p className="text-sm text-gray-600 font-light">GPA: {edu.gpa}</p>}
      </div>
      {edu.graduationDate && (
        <span className="text-sm text-gray-600 font-light">{formatDate(edu.graduationDate)}</span>
      )}
    </div>
  );

  const SkillsSection = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="mb-12">
      <SectionTitle title="Key Competencies" />
      <div className="space-y-6">
        {skills.technical.length > 0 && (
          <div>
            <p className="font-semibold text-gray-900 mb-3">Technical</p>
            <p className="text-gray-700 font-light">{skills.technical.join(" • ")}</p>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <p className="font-semibold text-gray-900 mb-3">Leadership & Soft Skills</p>
            <p className="text-gray-700 font-light">{skills.soft.join(" • ")}</p>
          </div>
        )}
      </div>
    </div>
  );

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="pl-4 border-l-4 border-amber-200 mb-6">
      <h3 className="font-semibold text-gray-900">{project.name}</h3>
      <p className="text-amber-700 font-light text-sm mb-2">{project.role}</p>
      <p className="text-gray-700 font-light mb-2">{project.description}</p>
      <p className="text-gray-600 text-sm font-light">{project.technologies.join(" • ")}</p>
    </div>
  );

  const LanguagesSection = ({ languages }: { languages: CVData["languages"] }) => (
    <div>
      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-6 pb-3 border-b-2 border-amber-600">
        Languages
      </h2>
      <div className="space-y-3">
        {languages.map((lang) => (
          <div key={lang.id} className="flex justify-between">
            <span className="text-gray-900">{lang.name}</span>
            <span className="text-amber-700 font-semibold">{lang.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const CertificationsSection = ({ certifications }: { certifications: CVData["certifications"] }) => (
    <div>
      <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-6 pb-3 border-b-2 border-amber-600">
        Certifications & Awards
      </h2>
      <div className="space-y-3">
        {certifications.map((cert) => (
          <div key={cert.id}>
            <p className="font-semibold text-gray-900">{cert.title}</p>
            <p className="text-gray-600 text-sm font-light">{cert.issuingOrganization}</p>
            <p className="text-amber-700 text-sm font-light">{formatDate(cert.dateObtained)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    // items.push(<GoldBar key="gold-bar" />);
    items.push(
      <div key="content-wrapper" className="max-w-4xl mx-auto">
        <Header key="header" />
        <div className="px-12 py-12">
          {data.personalInfo.summary && <Summary key="summary" summary={data.personalInfo.summary} />}
          
          {data.experience.length > 0 && (
            <>
              <SectionTitle key="exp-title" title="Professional Experience" />
              {data.experience.map((exp) => (
                <ExperienceItem key={`exp-${exp.id}`} exp={exp} />
              ))}
            </>
          )}

          {data.education.length > 0 && (
            <>
              <SectionTitle key="edu-title" title="Education" />
              {data.education.map((edu) => (
                <EducationItem key={`edu-${edu.id}`} edu={edu} />
              ))}
            </>
          )}

          {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
            <SkillsSection key="skills" skills={data.skills} />
          )}

          {data.projects.length > 0 && (
            <>
              <SectionTitle key="proj-title" title="Notable Projects" />
              {data.projects.map((project) => (
                <ProjectItem key={`proj-${project.id}`} project={project} />
              ))}
            </>
          )}

          {(data.languages.length > 0 || data.certifications.length > 0) && (
            <div key="lang-cert" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {data.languages.length > 0 && <LanguagesSection languages={data.languages} />}
              {data.certifications.length > 0 && <CertificationsSection certifications={data.certifications} />}
            </div>
          )}
        </div>
      </div>
    );

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
    <div className="flex flex-col items-center gap-8 pb-0 print:block print:gap-0 print:pb-0">
      <div ref={containerRef} className="cv-measure fixed top-0 left-0 w-[210mm] opacity-0 pointer-events-none z-[-999]" style={{ visibility: "hidden" }}>
        {blocks}
      </div>
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm] bg-white">
          <div className="bg-amber-600 h-2"></div>
        </div>
      ) : (
        pages.map((pageContent, i) => (
          <div key={i} className="a4-page w-[210mm] min-h-[297mm] bg-white text-gray-900 relative print:shadow-none" style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}>
            {pageContent}
            {pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] text-gray-400 print:hidden">Page {i + 1} of {pages.length}</div>
            )}
          </div>
        ))
      )}
    </div>
  );
}