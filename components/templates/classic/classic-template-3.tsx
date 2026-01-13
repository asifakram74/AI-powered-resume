import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData, CVSectionId, PersonalInfoFieldId } from "../../../types/cv-data";

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

  const PersonalInfoSection = () => {
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
      data.personalInfoFieldOrder && data.personalInfoFieldOrder.length > 0
        ? data.personalInfoFieldOrder
        : defaultOrder;
    const allFields: PersonalInfoFieldId[] = [
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
    const finalOrder = [
      ...order.filter((f) => allFields.includes(f)),
      ...allFields.filter((f) => !order.includes(f)),
    ];

    const locationText =
      data.personalInfo.city && data.personalInfo.country
        ? `${data.personalInfo.city}, ${data.personalInfo.country}`
        : data.personalInfo.city || data.personalInfo.country || "";
    const addressText = (data.personalInfo.address || "").trim();
    const locLower = locationText.toLowerCase();
    const addrLower = addressText.toLowerCase();
    const showAddress =
      Boolean(addressText) &&
      (!locLower || (addrLower !== locLower && !addrLower.includes(locLower)));

    const contactValue = (field: PersonalInfoFieldId) => {
      switch (field) {
        case "email":
          return data.personalInfo.email?.trim() ? data.personalInfo.email : "";
        case "phone":
          return data.personalInfo.phone?.trim() ? data.personalInfo.phone : "";
        case "location":
          return locationText || "";
        case "address":
          return data.personalInfo.address?.trim() ? data.personalInfo.address : "";
        case "linkedin":
          return (data.personalInfo.linkedin || "").trim();
        case "github":
          return (data.personalInfo.github || "").trim();
        default:
          return "";
      }
    };

    const pushContactLine = (contactParts: string[], key: string) => {
      const parts = contactParts.map((s) => s.trim()).filter(Boolean);
      if (parts.length === 0) return null;
      return (
        <div key={key} className="text-sm text-gray-600 mb-6">
          {parts.map((p, idx) => (
            <span key={`${key}-${idx}`}>
              {idx > 0 && <span className="mx-2 text-gray-400">•</span>}
              <span>{p}</span>
            </span>
          ))}
        </div>
      );
    };

    const rows: React.ReactNode[] = [];
    let contactBuffer: string[] = [];
    let contactBlockIndex = 0;

    const flushContacts = () => {
      const node = pushContactLine(contactBuffer, `contact-${contactBlockIndex}`);
      if (node) rows.push(node);
      contactBuffer = [];
      contactBlockIndex += 1;
    };

    finalOrder.forEach((field) => {
      if (field === "fullName") {
        flushContacts();
        if (data.personalInfo.fullName) {
          rows.push(
            <h1
              key="pi-fullName"
              className="text-4xl font-bold text-gray-900 mb-1 tracking-wide"
            >
              {data.personalInfo.fullName}
            </h1>
          );
        }
        return;
      }
      if (field === "jobTitle") {
        flushContacts();
        if (data.personalInfo.jobTitle) {
          rows.push(
            <p key="pi-jobTitle" className="text-lg text-gray-600 font-light mb-6">
              {data.personalInfo.jobTitle}
            </p>
          );
        }
        return;
      }
      if (field === "summary") {
        flushContacts();
        if (data.personalInfo.summary) {
          rows.push(
            <div key="pi-summary" className="mb-6">
              <p className="text-gray-700 leading-relaxed text-justify italic">
                "{data.personalInfo.summary}"
              </p>
            </div>
          );
        }
        return;
      }

      const v = contactValue(field);
      if (!v) return;

      if (field === "location" && showAddress && addressText) {
        contactBuffer.push(`${locationText} ${addressText}`.trim());
        return;
      }

      if (field === "address" && (data.personalInfo.city || data.personalInfo.country)) {
        if (!showAddress) return;
      }

      contactBuffer.push(v);
    });

    flushContacts();

    return (
      <div className="text-center mb-8 border-b-2 border-gray-300 pb-8">
        {rows}
      </div>
    );
  };

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
  
  const InterestsSection = () => {
     if (data.additional.interests.length === 0) return null;
     return (
       <div className="mb-10">
         <SectionTitle title="Interests" />
         <p className="text-gray-700 text-sm">{data.additional.interests.join(", ")}</p>
       </div>
     );
  };

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

    const addExperience = () => {
      if (data.experience.length === 0) return;
      items.push(<SectionTitle key="exp-title" title="Experience" />);
      data.experience.forEach((exp, index) => {
        const isLast = index === data.experience.length - 1;
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} className="h-8" />);
      });
    };

    const addEducation = () => {
      if (data.education.length === 0) return;
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} className="h-6" />);
      });
    };

    const addSkills = () => {
      if (data.skills.technical.length === 0 && data.skills.soft.length === 0) return;
      items.push(<Skills key="skills" skills={data.skills} />);
    };

    const addProjects = () => {
      if (data.projects.length === 0) return;
      items.push(<SectionTitle key="proj-title" title="Projects" />);
      data.projects.forEach((project, index) => {
        const isLast = index === data.projects.length - 1;
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
        if (!isLast) items.push(<div key={`proj-sp-${project.id}`} className="h-6" />);
      });
    };

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      items.push(<SectionTitle key="lang-title" title="Languages" />);
      data.languages.forEach((lang, index) => {
        const isLast = index === data.languages.length - 1;
        items.push(<LanguageItem key={`lang-${lang.id}`} lang={lang} />);
        if (!isLast) items.push(<div key={`lang-sp-${lang.id}`} className="h-2" />);
      });
    };

    const addCertifications = () => {
      if (data.certifications.length === 0) return;
      items.push(<SectionTitle key="cert-title" title="Certifications" />);
      data.certifications.forEach((cert, index) => {
        const isLast = index === data.certifications.length - 1;
        items.push(<CertificationItem key={`cert-${cert.id}`} cert={cert} />);
        if (!isLast) items.push(<div key={`cert-sp-${cert.id}`} className="h-3" />);
      });
    };
    
    const addInterests = () => {
      if (data.additional.interests.length === 0) return;
      items.push(<InterestsSection key="interests" />);
    }

    finalOrder.forEach((section) => {
      switch (section) {
        case "personalInfo":
          addPersonalInfo();
          break;
        case "skills":
          addSkills();
          break;
        case "experience":
          addExperience();
          break;
        case "projects":
          addProjects();
          break;
        case "education":
          addEducation();
          break;
        case "certifications":
          addCertifications();
          break;
        case "languages":
          addLanguages();
          break;
        case "interests":
          addInterests();
          break;
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
