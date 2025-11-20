import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData } from "../../../types/cv-data";

interface ClassicTemplate3Props {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function ClassicTemplate3({ data, isPreview = false }: ClassicTemplate3Props) {
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
    <div className="text-center mb-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-wide">{data.personalInfo.fullName}</h1>
      <p className="text-lg text-gray-600 font-light mb-6">{data.personalInfo.jobTitle}</p>
      <div className="text-sm text-gray-600 space-x-3">
        <span>{data.personalInfo.email}</span>
        <span className="text-gray-400">•</span>
        <span>{data.personalInfo.phone}</span>
        {(data.personalInfo.city || data.personalInfo.country) && (
          <>
            <span className="text-gray-400">•</span>
            <span>
              {data.personalInfo.city && data.personalInfo.country
                ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                : data.personalInfo.city || data.personalInfo.country}
            </span>
          </>
        )}
      </div>
    </div>
  );

  const Divider = () => (
    <div className="border-t-2 border-gray-300 my-8"></div>
  );

  const Summary = ({ summary }: { summary: string }) => (
    <div className="mb-10">
      <p className="text-gray-700 leading-relaxed text-justify italic">"{summary}"</p>
    </div>
  );

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
        <span className="text-sm text-gray-500 font-light">
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      <p className="text-gray-700 font-medium">{exp.companyName}</p>
      {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
      <ul className="text-gray-700 space-y-2 mt-3 ml-4">
        {exp.responsibilities.map((resp, index) => (
          <li key={index} className="list-disc text-sm">
            {resp}
          </li>
        ))}
      </ul>
    </div>
  );

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
        <p className="text-gray-700">{edu.institutionName}</p>
        {edu.location && <p className="text-gray-600 text-sm">{edu.location}</p>}
        {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
      </div>
      {edu.graduationDate && (
        <span className="text-sm text-gray-500 font-light">{formatDate(edu.graduationDate)}</span>
      )}
    </div>
  );

  const Skills = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="mb-10">
      <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6">Skills</h2>
      <div className="space-y-4">
        {skills.technical.length > 0 && (
          <div>
            <p className="font-semibold text-gray-900 mb-2">Technical</p>
            <p className="text-gray-700 text-sm">{skills.technical.join(" • ")}</p>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <p className="font-semibold text-gray-900 mb-2">Professional</p>
            <p className="text-gray-700 text-sm">{skills.soft.join(" • ")}</p>
          </div>
        )}
      </div>
    </div>
  );

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div>
      <h3 className="font-semibold text-gray-900">{project.name}</h3>
      <p className="text-gray-600 text-sm font-light mb-1">{project.role}</p>
      <p className="text-gray-700 text-sm mb-2">{project.description}</p>
      <p className="text-gray-600 text-sm">{project.technologies.join(" • ")}</p>
    </div>
  );

  const LanguageItem = ({ lang }: { lang: CVData["languages"][number] }) => (
    <div className="flex justify-between">
      <span className="text-gray-900">{lang.name}</span>
      <span className="text-gray-600 text-sm">{lang.proficiency}</span>
    </div>
  );

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div>
      <p className="font-semibold text-gray-900">{cert.title}</p>
      <p className="text-gray-600 text-sm">{cert.issuingOrganization}</p>
      <p className="text-gray-500 text-sm font-light">{formatDate(cert.dateObtained)}</p>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6">{title}</h2>
  );

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    
    items.push(<Header key="header" />);
    items.push(<Divider key="divider" />);
    
    if (data.personalInfo.summary) {
      items.push(<Summary key="summary" summary={data.personalInfo.summary} />);
    }

    if (data.experience.length > 0) {
      items.push(<SectionTitle key="exp-title" title="Experience" />);
      data.experience.forEach((exp, index) => {
        const isLast = index === data.experience.length - 1;
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} className="h-8" />);
      });
    }

    if (data.education.length > 0) {
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} className="h-6" />);
      });
    }

    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) {
      items.push(<Skills key="skills" skills={data.skills} />);
    }

    if (data.projects.length > 0) {
      items.push(<SectionTitle key="proj-title" title="Projects" />);
      data.projects.forEach((project, index) => {
        const isLast = index === data.projects.length - 1;
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
        if (!isLast) items.push(<div key={`proj-sp-${project.id}`} className="h-6" />);
      });
    }

    if (data.languages.length > 0) {
      items.push(<SectionTitle key="lang-title" title="Languages" />);
      data.languages.forEach((lang, index) => {
        const isLast = index === data.languages.length - 1;
        items.push(<LanguageItem key={`lang-${lang.id}`} lang={lang} />);
        if (!isLast) items.push(<div key={`lang-sp-${lang.id}`} className="h-2" />);
      });
    }

    if (data.certifications.length > 0) {
      items.push(<SectionTitle key="cert-title" title="Certifications" />);
      data.certifications.forEach((cert, index) => {
        const isLast = index === data.certifications.length - 1;
        items.push(<CertificationItem key={`cert-${cert.id}`} cert={cert} />);
        if (!isLast) items.push(<div key={`cert-sp-${cert.id}`} className="h-3" />);
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
        <div className="w-[210mm] min-h-[297mm] p-12 bg-white font-serif"></div>
      ) : (
        pages.map((pageContent, i) => (
          <div key={i} className="a4-page w-[210mm] min-h-[297mm] p-12 bg-white text-slate-900 font-serif relative print:shadow-none" style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}>
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