import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData } from "../../../types/cv-data";

interface MinimalTemplate3Props {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 24;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function MinimalTemplate3({ data, isPreview = false }: MinimalTemplate3Props) {
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
    <div className="bg-slate-900 text-white py-12 px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-baseline gap-4 mb-4">
          <h1 className="text-5xl font-bold">{data.personalInfo.fullName}</h1>
          <div className="w-1 h-12 bg-emerald-500"></div>
        </div>
        <p className="text-xl text-slate-300 mb-8">{data.personalInfo.jobTitle}</p>

        <div className="grid grid-cols-3 gap-8 text-sm">
          <div>
            <p className="text-emerald-400 font-semibold mb-1 uppercase text-xs">Email</p>
            <p className="text-slate-200 break-words">{data.personalInfo.email}</p>
          </div>
          <div>
            <p className="text-emerald-400 font-semibold mb-1 uppercase text-xs">Phone</p>
            <p className="text-slate-200">{data.personalInfo.phone}</p>
          </div>
          {(data.personalInfo.city || data.personalInfo.country) && (
            <div>
              <p className="text-emerald-400 font-semibold mb-1 uppercase text-xs">Location</p>
              <p className="text-slate-200">
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
    <div className="py-12 px-12">
      <p className="text-gray-700 leading-relaxed">{summary}</p>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="px-12">
      <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-8 pb-4 border-b-2 border-emerald-500">
        {title}
      </h2>
    </div>
  );

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="px-12 py-6">
      <div className="relative pl-6">
        <div className="absolute left-0 top-2 w-3 h-3 bg-emerald-500 rounded-full"></div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{exp.jobTitle}</h3>
            <p className="text-emerald-700 font-semibold">{exp.companyName}</p>
          </div>
          <span className="text-sm text-gray-600">
            {formatDate(exp.startDate)}
            {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
            {exp.current ? "Present" : formatDate(exp.endDate)}
          </span>
        </div>
        {exp.location && <p className="text-sm text-gray-600 mb-4">{exp.location}</p>}
        <ul className="text-gray-700 space-y-2 ml-0">
          {exp.responsibilities.map((resp, index) => (
            <li key={index} className="list-disc list-inside text-sm">
              {resp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="px-12 py-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
          <p className="text-emerald-700 font-semibold text-sm">{edu.institutionName}</p>
          {edu.location && <p className="text-sm text-gray-600 mt-2">{edu.location}</p>}
          {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
        </div>
        {edu.graduationDate && <span className="text-sm text-gray-600">{formatDate(edu.graduationDate)}</span>}
      </div>
    </div>
  );

  const SkillsSection = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="py-12 px-12">
      <SectionTitle title="Key Skills" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
        {skills.technical.length > 0 && (
          <div>
            <p className="font-semibold text-slate-900 mb-4">Technical</p>
            <div className="flex flex-wrap gap-3">
              {skills.technical.map((skill, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-slate-100 text-gray-700 px-3 py-1 text-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <p className="font-semibold text-slate-900 mb-4">Professional</p>
            <div className="flex flex-wrap gap-3">
              {skills.soft.map((skill, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-slate-100 text-gray-700 px-3 py-1 text-sm">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
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
    <div className="px-12 py-6">
      <div className="bg-slate-50 p-6 rounded border-l-4 border-emerald-500">
        <h3 className="font-semibold text-slate-900">{project.name}</h3>
        <p className="text-emerald-700 text-sm font-semibold mb-3">{project.role}</p>
        <p className="text-gray-700 text-sm mb-4">{project.description}</p>
        <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
      </div>
    </div>
  );

  const LanguagesSection = ({ languages }: { languages: CVData["languages"] }) => (
    <div className="py-6 px-12">
      <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b-2 border-emerald-500">
        Languages
      </h2>
      <div className="space-y-4">
        {languages.map((lang) => (
          <div key={lang.id} className="flex justify-between">
            <span className="text-gray-900">{lang.name}</span>
            <span className="text-emerald-700 font-semibold">{lang.proficiency}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const CertificationsSection = ({ certifications }: { certifications: CVData["certifications"] }) => (
    <div className="py-6 px-12">
      <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b-2 border-emerald-500">
        Certifications
      </h2>
      <div className="space-y-4">
        {certifications.map((cert) => (
          <div key={cert.id}>
            <p className="font-semibold text-slate-900">{cert.title}</p>
            <p className="text-gray-600 text-sm mt-1">{cert.issuingOrganization}</p>
            <p className="text-emerald-700 text-sm mt-1">{formatDate(cert.dateObtained)}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    items.push(<Header key="header" />);
    
    if (data.personalInfo.summary) {
      items.push(<Summary key="summary" summary={data.personalInfo.summary} />);
    }

    if (data.experience.length > 0) {
      items.push(<SectionTitle key="exp-title" title="Professional Experience" />);
      data.experience.forEach((exp) => {
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
      });
    }

    if (data.education.length > 0) {
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu) => {
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
      });
    }

    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) {
      items.push(<SkillsSection key="skills" skills={data.skills} />);
    }

    if (data.projects.length > 0) {
      items.push(<SectionTitle key="proj-title" title="Notable Projects" />);
      data.projects.forEach((project) => {
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
      });
    }

    if (data.languages.length > 0 || data.certifications.length > 0) {
      items.push(
        <div key="lang-cert" className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-8">
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
          <div key={i} className="a4-page w-[210mm] min-h-[297mm] bg-white text-slate-900 relative print:shadow-none" style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}>
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