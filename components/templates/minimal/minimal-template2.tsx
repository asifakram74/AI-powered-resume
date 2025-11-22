import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData } from "../../../types/cv-data";

interface MinimalTemplate2Props {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function MinimalTemplate2({ data, isPreview = false }: MinimalTemplate2Props) {
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

  const Header = () => (
    <div className="border-b border-slate-200 pb-8 mb-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-1 text-slate-900">
          {data.personalInfo.fullName}
        </h1>
        <p className="text-lg text-slate-700 font-medium mb-8">
          {data.personalInfo.jobTitle}
        </p>

        <div className="grid grid-cols-3 gap-8 text-sm">
          <div>
            <p className="text-slate-600 font-semibold mb-2 uppercase tracking-wide">Email</p>
            <p className="text-slate-800 break-words">{data.personalInfo.email}</p>
          </div>
          <div>
            <p className="text-slate-600 font-semibold mb-2 uppercase tracking-wide">Phone</p>
            <p className="text-slate-800">{data.personalInfo.phone}</p>
          </div>
          {(data.personalInfo.city || data.personalInfo.country) && (
            <div>
              <p className="text-slate-600 font-semibold mb-2 uppercase tracking-wide">Location</p>
              <p className="text-slate-800">
                {data.personalInfo.city && data.personalInfo.country
                  ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                  : data.personalInfo.city || data.personalInfo.country}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const Summary = ({ summary }: { summary: string }) => (
    <div className="mb-8 pb-8 border-b border-slate-200">
      <p className="text-base text-slate-700 leading-relaxed">{summary}</p>
    </div>
  );

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div key={exp.id} className="border-l-2 border-blue-500 pl-6 mb-6">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{exp.jobTitle}</h3>
          <p className="text-slate-700 font-medium">{exp.companyName}</p>
        </div>
        <span className="text-sm text-slate-500">
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      {exp.location && <p className="text-sm text-slate-600 mb-3">{exp.location}</p>}
      <ul className="text-slate-700 space-y-2 ml-0">
        {exp.responsibilities.map((resp, index) => (
          <li key={index} className="list-disc list-inside text-sm">
            {resp}
          </li>
        ))}
      </ul>
    </div>
  );

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div key={edu.id} className="flex justify-between items-start mb-6">
      <div>
        <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
        <p className="text-slate-700">{edu.institutionName}</p>
        {edu.location && <p className="text-sm text-slate-600">{edu.location}</p>}
        {edu.gpa && <p className="text-sm text-slate-600">GPA: {edu.gpa}</p>}
      </div>
      {edu.graduationDate && <span className="text-sm text-slate-500">{formatDate(edu.graduationDate)}</span>}
    </div>
  );

  const SkillsSection = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Core Competencies</h2>
      <div className="space-y-6">
        {skills.technical.length > 0 && (
          <div>
            <p className="font-semibold text-slate-800 mb-4">Technical Skills</p>
            <div className="flex flex-wrap gap-3">
              {skills.technical.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <p className="font-semibold text-slate-800 mb-4">Professional Skills</p>
            <div className="flex flex-wrap gap-3">
              {skills.soft.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm"
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

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div key={project.id} className="bg-slate-50 border border-slate-200 p-6 rounded mb-6">
      <h3 className="font-semibold text-slate-900 mb-2">{project.name}</h3>
      <p className="text-slate-700 text-sm mb-2">{project.role}</p>
      <p className="text-slate-700 text-sm mb-3">{project.description}</p>
      <p className="text-slate-600 text-xs">{project.technologies.join(" • ")}</p>
    </div>
  );

  const LanguagesSection = ({ languages }: { languages: CVData["languages"] }) => (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Languages</h2>
      <div className="space-y-3">
        {languages.map((lang) => (
          <div key={lang.id} className="flex justify-between">
            <span className="text-slate-700">{lang.name}</span>
            <span className="text-blue-700 font-semibold">{lang.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const CertificationsSection = ({ certifications }: { certifications: CVData["certifications"] }) => (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Certifications</h2>
      <div className="space-y-3">
        {certifications.map((cert) => (
          <div key={cert.id}>
            <p className="font-semibold text-slate-900">{cert.title}</p>
            <p className="text-slate-600 text-sm">{cert.issuingOrganization}</p>
            <p className="text-blue-700 text-sm">{formatDate(cert.dateObtained)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-2xl font-bold mb-6 text-slate-900">{title}</h2>
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
      items.push(<SkillsSection key="skills" skills={data.skills} />);
    }

    if (data.projects.length > 0) {
      items.push(<SectionTitle key="proj-title" title="Key Projects" />);
      data.projects.forEach((project, index) => {
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
      });
    }

    if (data.languages.length > 0 || data.certifications.length > 0) {
      items.push(
        <div key="lang-cert" className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {data.languages.length > 0 && <LanguagesSection languages={data.languages} />}
          {data.certifications.length > 0 && <CertificationsSection certifications={data.certifications} />}
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