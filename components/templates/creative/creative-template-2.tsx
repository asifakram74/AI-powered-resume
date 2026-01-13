import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { Mail, Phone, MapPin, Github, Linkedin } from "lucide-react";
import type { CVData, CVSectionId, PersonalInfoFieldId } from "../../../types/cv-data";

interface CreativeTemplate2Props {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function CreativeTemplate2({
  data,
  isPreview = false,
}: CreativeTemplate2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);

  const formatDate = (date: string) => {
    if (!date) return "";
    const s = date.trim();
    if (!s) return "";

    const normalized = s.replace(/[\u2012-\u2015\u2212]/g, "-");

    if (/^\d{4}$/.test(normalized)) return normalized;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
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

  // Simplified color scheme - using only blue for highlights
  const colors = {
    primary: "#2563eb", // Professional blue
    background: "#ffffff",
    text: {
      primary: "#1f2937",
      secondary: "#4b5563",
      light: "#6b7280"
    }
  };

  const PersonalInfoSection = () => {
    const { personalInfo, personalInfoFieldOrder } = data;
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
      personalInfoFieldOrder && personalInfoFieldOrder.length > 0
        ? personalInfoFieldOrder
        : defaultOrder;

    const isContactField = (f: PersonalInfoFieldId) =>
      ["email", "phone", "location", "address", "linkedin", "github"].includes(f);
    const contactFields = order.filter(isContactField);

    return (
      <>
        <div className="p-8 text-white relative overflow-hidden" style={{ backgroundColor: colors.primary }}>
          <div className="flex items-center gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                {personalInfo.profilePicture ? (
                  <img
                    src={personalInfo.profilePicture}
                    alt={personalInfo.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Header Content */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-1">{personalInfo.fullName}</h1>
              <h2 className="text-lg font-light opacity-90 mb-4">{personalInfo.jobTitle}</h2>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-sm opacity-90">
                {contactFields.map((field) => {
                  switch (field) {
                    case "email":
                      return personalInfo.email ? (
                        <span key="email" className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {personalInfo.email}
                        </span>
                      ) : null;
                    case "phone":
                      return personalInfo.phone ? (
                        <span key="phone" className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {personalInfo.phone}
                        </span>
                      ) : null;
                    case "location":
                      if (!personalInfo.city && !personalInfo.country) return null;
                      const hasAddress = contactFields.includes("address") && personalInfo.address;
                      if (hasAddress) return null;
                      return (
                        <span key="location" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {personalInfo.city}
                          {personalInfo.city && personalInfo.country ? ", " : ""}
                          {personalInfo.country}
                        </span>
                      );
                    case "address":
                      return personalInfo.address ? (
                        <span key="address" className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {personalInfo.address}
                        </span>
                      ) : null;
                    case "linkedin":
                      return personalInfo.linkedin ? (
                        <span key="linkedin" className="flex items-center gap-1">
                          <Linkedin className="w-3 h-3" />
                          {personalInfo.linkedin}
                        </span>
                      ) : null;
                    case "github":
                      return personalInfo.github ? (
                        <span key="github" className="flex items-center gap-1">
                          <Github className="w-3 h-3" />
                          {personalInfo.github}
                        </span>
                      ) : null;
                    default:
                      return null;
                  }
                })}
              </div>
            </div>
          </div>
        </div>
        {personalInfo.summary && (
          <div className="mt-6 px-8">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Professional Summary</h3>
            <p className="text-gray-700 text-sm leading-relaxed">{personalInfo.summary}</p>
          </div>
        )}
      </>
    );
  };

  const Skills = () => (
    <div className="mb-6 px-8">
      <h3 className="text-base font-semibold text-gray-900 mb-3">Skills</h3>
      <div className="space-y-3">
        {data.skills.technical.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 text-sm mb-2">Technical</h4>
            <p className="text-gray-700 text-sm">{data.skills.technical.join(" • ")}</p>
          </div>
        )}
        {data.skills.soft.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 text-sm mb-2">Professional</h4>
            <p className="text-gray-700 text-sm">{data.skills.soft.join(" • ")}</p>
          </div>
        )}
      </div>
    </div>
  )

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="mb-4 px-8">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{exp.jobTitle}</h4>
          <p className="text-gray-700 font-medium text-sm" style={{ color: colors.primary }}>
            {exp.companyName}
            {exp.location && ` • ${exp.location}`}
          </p>
        </div>
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      <ul className="text-gray-700 text-sm space-y-1 ml-4">
        {exp.responsibilities.map((resp, index) => (
          <li key={index} className="list-disc">
            {resp}
          </li>
        ))}
      </ul>
    </div>
  )

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="mb-4 px-8">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{edu.degree}</h4>
          <p className="text-gray-700 font-medium text-sm" style={{ color: colors.primary }}>
            {edu.institutionName}
          </p>
          {edu.location && (
            <p className="text-gray-600 text-xs">{edu.location}</p>
          )}
        </div>
        {edu.graduationDate && (
          <span className="text-xs text-gray-500">
            {formatDate(edu.graduationDate)}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
        {edu.gpa && (
          <span>GPA: {edu.gpa}</span>
        )}
        {edu.honors && (
          <span>{edu.honors}</span>
        )}
      </div>
    </div>
  )

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="mb-4 px-8">
      <h4 className="font-semibold text-gray-900 text-sm mb-1">{project.name}</h4>
      <p className="text-gray-700 text-sm mb-2" style={{ color: colors.primary }}>{project.role}</p>
      <p className="text-gray-700 text-sm mb-2">{project.description}</p>
      <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
    </div>
  )

  const LanguageItem = ({ lang }: { lang: CVData["languages"][number] }) => (
    <div className="mb-2">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-900 text-sm">{lang.name}</span>
        <span className="text-gray-600 text-xs">{lang.proficiency}</span>
      </div>
    </div>
  )

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div className="mb-3 px-8">
      <div className="font-semibold text-gray-900 text-sm">{cert.title}</div>
      <div className="text-gray-600 text-sm">{cert.issuingOrganization}</div>
      <div className="text-gray-500 text-xs" style={{ color: colors.primary }}>
        {formatDate(cert.dateObtained)}
      </div>
    </div>
  )

  const SectionTitle = ({ title }: { title: string }) => (
    <h3 className="text-base font-semibold text-gray-900 mb-3 px-8 border-b pb-2" style={{ borderColor: colors.primary }}>
      {title}
    </h3>
  )

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

    const addSkills = () => {
      if (data.skills.technical.length === 0 && data.skills.soft.length === 0) return;
      items.push(<Skills key="skills" />);
    };

    const addExperience = () => {
      if (data.experience.length === 0) return;
      items.push(<SectionTitle key="exp-title" title="Professional Experience" />);
      data.experience.forEach((exp) => {
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
      });
    };

    const addEducation = () => {
      if (data.education.length === 0) return;
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu) => {
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
      });
    };

    const addProjects = () => {
      if (data.projects.length === 0) return;
      items.push(<SectionTitle key="proj-title" title="Projects" />);
      data.projects.forEach((project) => {
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
      });
    };

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      items.push(<SectionTitle key="lang-title" title="Languages" />);
      data.languages.forEach((lang) => {
        items.push(<LanguageItem key={`lang-${lang.id}`} lang={lang} />);
      });
    };

    const addCertifications = () => {
      if (data.certifications.length === 0) return;
      items.push(<SectionTitle key="cert-title" title="Certifications" />);
      data.certifications.forEach((cert) => {
        items.push(<CertificationItem key={`cert-${cert.id}`} cert={cert} />);
      });
    };

    const addInterests = () => {
      if (data.additional.interests.length === 0) return;
      items.push(<SectionTitle key="int-title" title="Interests" />);
      items.push(
        <div key="int-body" className="px-8">
          <p className="text-gray-700 text-sm">{data.additional.interests.join(" • ")}</p>
        </div>
      );
    };

    finalOrder.forEach((section) => {
      switch (section) {
        case "personalInfo": addPersonalInfo(); break;
        case "skills": addSkills(); break;
        case "experience": addExperience(); break;
        case "projects": addProjects(); break;
        case "education": addEducation(); break;
        case "certifications": addCertifications(); break;
        case "languages": addLanguages(); break;
        case "interests": addInterests(); break;
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
          <div key={i} className="a4-page w-[210mm] min-h-[297mm] p-12 bg-white text-gray-900 relative print:shadow-none" style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}>
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