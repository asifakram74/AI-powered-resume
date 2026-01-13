import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type { CVData, CVSectionId, PersonalInfoFieldId } from "../../../types/cv-data";

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

    const rows: React.ReactNode[] = [];
    let contactBuffer: React.ReactNode[] = [];
    let contactBlockIndex = 0;

    const flushContacts = () => {
      if (contactBuffer.length > 0) {
        rows.push(
          <div key={`contacts-${contactBlockIndex}`} className="grid grid-cols-3 gap-8 text-sm mb-8">
            {contactBuffer}
          </div>
        );
        contactBuffer = [];
        contactBlockIndex++;
      }
    };

    finalOrder.forEach((field) => {
      if (field === "fullName") {
        flushContacts();
        if (data.personalInfo.fullName) {
          rows.push(
            <h1 key="pi-fullName" className="text-4xl font-bold mb-1 text-slate-900">
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
            <p key="pi-jobTitle" className="text-lg text-slate-700 font-medium mb-8">
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
            <div key="pi-summary" className="mb-8 pb-8 border-b border-slate-200">
              <p className="text-base text-slate-700 leading-relaxed">{data.personalInfo.summary}</p>
            </div>
          );
        }
        return;
      }

      const v = contactValue(field);
      if (!v) return;

      if (field === "location" && showAddress && addressText) {
        contactBuffer.push(
          <div key={`${field}-combined`}>
            <p className="text-slate-600 font-semibold mb-2 uppercase tracking-wide">Location & Address</p>
            <p className="text-slate-800">
              {locationText}
              {locationText && addressText ? ", " : ""}
              {addressText}
            </p>
          </div>
        );
        return;
      }

      if (field === "address" && (data.personalInfo.city || data.personalInfo.country)) {
        if (!showAddress) return;
      }

      contactBuffer.push(
        <div key={field}>
          <p className="text-slate-600 font-semibold mb-2 uppercase tracking-wide">
            {field === "linkedin" ? "LinkedIn" : field === "github" ? "GitHub" : field.charAt(0).toUpperCase() + field.slice(1)}
          </p>
          <p className="text-slate-800 break-words">{v}</p>
        </div>
      );
    });

    flushContacts();

    return (
      <div className="border-b border-slate-200 pb-8 mb-8">
        <div className="max-w-5xl mx-auto">
          {rows}
        </div>
      </div>
    );
  };

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

  const InterestsSection = () => {
    if (data.additional.interests.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-slate-900">Interests</h2>
        <div className="flex flex-wrap gap-3">
          {data.additional.interests.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
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
      items.push(<SectionTitle key="exp-title" title="Professional Experience" />);
      data.experience.forEach((exp, index) => {
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
      });
    };

    const addEducation = () => {
      if (data.education.length === 0) return;
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
      });
    };

    const addSkills = () => {
      if (data.skills.technical.length === 0 && data.skills.soft.length === 0) return;
      items.push(<SkillsSection key="skills" skills={data.skills} />);
    };

    const addProjects = () => {
      if (data.projects.length === 0) return;
      items.push(<SectionTitle key="proj-title" title="Key Projects" />);
      data.projects.forEach((project, index) => {
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
      });
    };

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      items.push(<LanguagesSection key="languages" languages={data.languages} />);
    };

    const addCertifications = () => {
      if (data.certifications.length === 0) return;
      items.push(<CertificationsSection key="certifications" certifications={data.certifications} />);
    };
    
    const addInterests = () => {
       if (data.additional.interests.length === 0) return;
       items.push(<InterestsSection key="interests" />);
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