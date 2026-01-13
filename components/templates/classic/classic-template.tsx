import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData, CVSectionId, PersonalInfoFieldId } from "../../../types/cv-data";

interface ClassicTemplateProps {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function ClassicTemplate({ data, isPreview = false }: ClassicTemplateProps) {
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

  const locationText = data.personalInfo.city && data.personalInfo.country
    ? `${data.personalInfo.city}, ${data.personalInfo.country}`
    : (data.personalInfo.city || data.personalInfo.country || "");
  const addressText = (data.personalInfo.address || "").trim();
  const locLower = locationText.toLowerCase();
  const addrLower = addressText.toLowerCase();
  const showAddress = Boolean(addressText) && (!locLower || (addrLower !== locLower && !addrLower.includes(locLower)));

  const Header = () => (
    <div className="text-center pb-6 mb-8">
      {(() => {
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
        const order = (data.personalInfoFieldOrder && data.personalInfoFieldOrder.length > 0) ? data.personalInfoFieldOrder : defaultOrder;
        const allFields: PersonalInfoFieldId[] = ["fullName", "jobTitle", "email", "phone", "location", "address", "linkedin", "github", "summary"];
        const finalOrder = [...order.filter((f) => allFields.includes(f)), ...allFields.filter((f) => !order.includes(f))];

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
            <div key={key} className="text-gray-600">
              {parts.map((p, idx) => (
                <span key={`${key}-${idx}`}>
                  {idx > 0 && <span className="mx-2">•</span>}
                  <span>{p}</span>
                </span>
              ))}
            </div>
          );
        };

        const rows: React.ReactNode[] = [];
        let contactBuffer: string[] = [];
        let contactBlockIndex = 0;
        let isSummaryRendered = false;

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
              rows.push(<h1 key="pi-fullName" className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>);
            }
            return;
          }
          if (field === "jobTitle") {
            flushContacts();
            if (data.personalInfo.jobTitle) {
              rows.push(<h2 key="pi-jobTitle" className="text-xl text-gray-700 mb-4">{data.personalInfo.jobTitle}</h2>);
            }
            return;
          }
          if (field === "summary") {
            flushContacts();

            if (data.personalInfo.summary) {
              rows.push(<div key="header-separator" className="w-full border-b-2 border-gray-800 mb-6 mt-4"></div>);
              rows.push(<h2
                key="pi-summary-title"
                className="text-xl text-left font-bold text-gray-900 mb-3 border-gray-300  mt-2"
              >
                PROFESSIONAL SUMMARY
              </h2>);
              rows.push(<p key="pi-summary" className="text-gray-700 text-left leading-relaxed ">{data.personalInfo.summary}</p>);
              isSummaryRendered = true;
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

        if (!isSummaryRendered) {
          rows.push(<div key="header-separator-end" className="w-full border-b-2 border-gray-800 mb-6 mt-4"></div>);
        }

        return <>{rows}</>;
      })()}
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-xl font-bold text-gray-900 mb-4 border-gray-300 pb-1">{title}</h2>
  );

  const Summary = ({ summary }: { summary: string }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3 border-gray-300 pb-1">PROFESSIONAL SUMMARY</h2>
      <p className="text-gray-700 leading-relaxed">{summary}</p>
    </div>
  );

  const Skills = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-4 border-gray-300 pb-1">SKILLS</h2>
      <div className="space-y-3">
        {skills.technical.length > 0 && (
          <div>
            <span className="font-semibold text-gray-900">Technical Skills: </span>
            <span className="text-gray-700">{skills.technical.join(", ")}</span>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <span className="font-semibold text-gray-900">Soft Skills: </span>
            <span className="text-gray-700">{skills.soft.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );

  const ExperienceHeader = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
        <p className="text-gray-700 font-medium">{exp.companyName}</p>
        {exp.location && <p className="text-gray-600">{exp.location}</p>}
      </div>
      {(formatDate(exp.startDate) || exp.current || formatDate(exp.endDate)) && (
        <span className="text-gray-600">
          {formatDate(exp.startDate)}
          {(formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate))) ? " - " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      )}
    </div>
  );

  const ExperienceDescriptionLine = ({ text }: { text: string }) => (
    <div className="ml-4">
      <div className="list-disc marker:text-gray-700 pl-1 text-gray-700">{text}</div>
    </div>
  );

  const EducationHeader = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
        <p className="text-gray-700">{edu.institutionName}</p>
        {edu.location && <p className="text-gray-600">{edu.location}</p>}
        {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
        {edu.honors && <p className="text-gray-600">{edu.honors}</p>}
        {edu.additionalInfo && <p className="text-gray-600 text-sm mt-1">{edu.additionalInfo}</p>}
      </div>
      {edu.graduationDate && <span className="text-gray-600">{formatDate(edu.graduationDate)}</span>}
    </div>
  );

  const EducationDetailsLine = ({ text }: { text: string }) => (
    <div className="ml-4 text-gray-700">{text}</div>
  );

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
      items.push(<Header key="header" />);
    };

    const addSkills = () => {
      if (data.skills.technical.length === 0 && data.skills.soft.length === 0) return;
      items.push(<Skills key="skills" skills={data.skills} />);
    };

    const addExperience = () => {
      if (data.experience.length === 0) return;
      items.push(<SectionTitle key="exp-title" title="PROFESSIONAL EXPERIENCE" />);
      data.experience.forEach((exp, index) => {
        const isLast = index === data.experience.length - 1;
        items.push(<ExperienceHeader key={`exp-h-${exp.id}`} exp={exp} />);
        exp.responsibilities.forEach((resp, i) => {
          const t = resp.trim();
          if (t) items.push(<ExperienceDescriptionLine key={`exp-l-${exp.id}-${i}`} text={t} />);
        });
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} className="h-5" />);
      });
    };

    const addEducation = () => {
      if (data.education.length === 0) return;
      items.push(<SectionTitle key="edu-title" title="EDUCATION" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        items.push(<EducationHeader key={`edu-h-${edu.id}`} edu={edu} />);
        const details = (edu.additionalInfo || "").split("\n").map((s) => s.trim()).filter(Boolean);
        details.forEach((line, i) => items.push(<EducationDetailsLine key={`edu-l-${edu.id}-${i}`} text={line} />));
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} className="h-4" />);
      });
    };

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      items.push(<SectionTitle key="lang-title" title="LANGUAGES" />);
      data.languages.forEach((lang) => {
        items.push(
          <div key={`lang-${lang.id}`} className="text-gray-700">
            <span className="font-semibold text-gray-900">{lang.name}: </span>
            <span>{lang.proficiency}</span>
          </div>
        );
      });
    };

    const addProjects = () => {
      if (data.projects.length === 0) return;
      items.push(<SectionTitle key="proj-title" title="PROJECTS" />);
      data.projects.forEach((project, index) => {
        items.push(
          <div key={`proj-${project.id}`}>
            <h3 className="font-semibold text-gray-900">{project.name}</h3>
            <p className="text-gray-600 font-medium">{project.role}</p>
            <p className="text-gray-700 mb-2">{project.description}</p>
            <p className="text-gray-600"><span className="font-medium">Technologies: </span>{project.technologies.join(", ")}</p>
          </div>
        );
        if (index < data.projects.length - 1) items.push(<div key={`proj-sp-${project.id}`} className="h-4" />);
      });
    };

    const addCertifications = () => {
      if (data.certifications.length === 0) return;
      items.push(<SectionTitle key="cert-title" title="CERTIFICATIONS & AWARDS" />);
      data.certifications.forEach((cert, index) => {
        items.push(
          <div key={`cert-${cert.id}`} className="flex justify-between items-center">
            <div>
              <span className="font-semibold text-gray-900">{cert.title}</span>
              <span className="text-gray-700"> - {cert.issuingOrganization}</span>
            </div>
            <span className="text-gray-600">{formatDate(cert.dateObtained)}</span>
          </div>
        );
        if (index < data.certifications.length - 1) items.push(<div key={`cert-sp-${cert.id}`} className="h-2" />);
      });
    };

    const addInterests = () => {
      if (data.additional.interests.length === 0) return;
      items.push(<SectionTitle key="int-title" title="INTERESTS & HOBBIES" />);
      items.push(<div key="int-body" className="text-gray-700">{data.additional.interests.join(", ")}</div>);
    };

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
