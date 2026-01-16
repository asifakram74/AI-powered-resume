import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import type {
  CVBulletStyle,
  CVData,
  CVFontFamilyId,
  CVSectionHeaderIconStyle,
  CVSectionId,
  CVStyleSettings,
  PersonalInfoFieldId,
} from "../../../types/cv-data";

interface ClassicTemplate3Props {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const MM_TO_PX = 3.7795275591;

const DEFAULT_STYLE_SETTINGS: CVStyleSettings = {
  bodyFontFamily: "inter",
  headingFontFamily: "inter",
  bodyFontSizePx: 12,
  headingFontSizePx: 20,
  lineHeight: 1.35,
  marginLeftRightMm: 16,
  marginTopBottomMm: 16,
  spaceBetweenEntriesPx: 12,
  textColor: "#374151",
  headingColor: "#111827",
  mutedColor: "#4b5563",
  accentColor: "#111827",
  borderColor: "#1f2937",
  backgroundColor: "#ffffff",
  backgroundImageUrl: "",
  colorMode: "basic",
  borderMode: "single",
  applyAccentToName: false,
  applyAccentToJobTitle: false,
  applyAccentToHeadings: false,
  applyAccentToHeadingsLine: false,
  applyAccentToHeaderIcons: false,
  applyAccentToDotsBarsBubbles: false,
  applyAccentToDates: false,
  applyAccentToLinkIcons: false,
  datesOpacity: 0.7,
  nameBold: true,
  locationOpacity: 0.7,
  align: "left",
  capitalization: "uppercase",
  headingsLine: true,
  headerIcons: "none",
  linkIcons: "none",
  iconFrame: "none",
  iconSize: "sm",
  dotsBarsBubbles: "dots",
  descriptionIndentPx: 16,
  entryListStyle: "bullet",
  showPageNumbers: true,
  showEmail: false,
  sectionHeaderIconStyle: "none",
  bulletStyle: "disc",
};

const fontFamilyCss = (id: CVFontFamilyId) => {
  switch (id) {
    case "inter":
      return "var(--font-inter)";
    case "serif":
      return "var(--font-rubik)";
    case "system-sans":
      return 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';
    case "system-serif":
      return 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif';
    case "mono":
      return 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace';
    case "roboto":
      return '"Roboto", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
    case "open-sans":
      return '"Open Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
    case "lato":
      return '"Lato", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
  }
};

const sectionIconNode = (style: CVSectionHeaderIconStyle, color: string) => {
  const common = { flexShrink: 0 as const, display: "inline-block" as const };
  switch (style) {
    case "none":
      return null;
    case "dot":
      return <span style={{ ...common, width: 8, height: 8, borderRadius: 999, background: color }} />;
    case "bar":
      return <span style={{ ...common, width: 18, height: 4, borderRadius: 999, background: color }} />;
    case "square":
      return <span style={{ ...common, width: 8, height: 8, background: color }} />;
    case "circle-outline":
      return <span style={{ ...common, width: 9, height: 9, borderRadius: 999, border: `2px solid ${color}` }} />;
  }
};

const bulletNode = (style: CVBulletStyle, color: string) => {
  const common = {
    flexShrink: 0 as const,
    display: "inline-flex" as const,
    alignItems: "center",
    justifyContent: "center",
  };
  switch (style) {
    case "none":
      return null;
    case "hyphen":
      return <span style={{ ...common, width: 10, color, fontWeight: 700, lineHeight: 1 }}>-</span>;
    case "disc":
      return <span style={{ ...common, width: 7, height: 7, borderRadius: 999, background: color, marginTop: 6 }} />;
    case "circle":
      return <span style={{ ...common, width: 8, height: 8, borderRadius: 999, border: `2px solid ${color}`, marginTop: 6 }} />;
    case "square":
      return <span style={{ ...common, width: 7, height: 7, background: color, marginTop: 6 }} />;
  }
};

export function ClassicTemplate3({ data, isPreview = false }: ClassicTemplate3Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);
  const styleSettings = useMemo(
    () => ({ ...DEFAULT_STYLE_SETTINGS, ...(data.styleSettings || {}) }),
    [data.styleSettings],
  );
  const bodyFont = useMemo(() => fontFamilyCss(styleSettings.bodyFontFamily), [styleSettings.bodyFontFamily]);
  const headingFont = useMemo(() => fontFamilyCss(styleSettings.headingFontFamily), [styleSettings.headingFontFamily]);
  const paddingXpx = useMemo(() => styleSettings.marginLeftRightMm * MM_TO_PX, [styleSettings.marginLeftRightMm]);
  const paddingYpx = useMemo(() => styleSettings.marginTopBottomMm * MM_TO_PX, [styleSettings.marginTopBottomMm]);
  const contentHeightPx = useMemo(() => PAGE_HEIGHT_PX - paddingYpx * 2, [paddingYpx]);
  const effectiveHeadingColor = useMemo(
    () => (styleSettings.applyAccentToHeadings ? styleSettings.accentColor : styleSettings.headingColor),
    [styleSettings.accentColor, styleSettings.applyAccentToHeadings, styleSettings.headingColor],
  );
  const effectiveBulletStyle: CVBulletStyle = useMemo(
    () => (styleSettings.entryListStyle === "hyphen" ? "hyphen" : styleSettings.bulletStyle),
    [styleSettings.bulletStyle, styleSettings.entryListStyle],
  );
  const rootStyle = useMemo<React.CSSProperties>(
    () => ({
      fontFamily: bodyFont,
      fontSize: `${styleSettings.bodyFontSizePx}px`,
      lineHeight: styleSettings.lineHeight,
      color: styleSettings.textColor,
    }),
    [bodyFont, styleSettings.bodyFontSizePx, styleSettings.lineHeight, styleSettings.textColor],
  );
  const headingBaseStyle = useMemo<React.CSSProperties>(
    () => ({
      fontFamily: headingFont,
      color: effectiveHeadingColor,
    }),
    [headingFont, effectiveHeadingColor],
  );
  const mutedStyle = useMemo<React.CSSProperties>(() => ({ color: styleSettings.mutedColor }), [styleSettings.mutedColor]);
  const dateStyle = useMemo<React.CSSProperties>(
    () => ({ ...mutedStyle, opacity: styleSettings.datesOpacity }),
    [mutedStyle, styleSettings.datesOpacity],
  );
  const locationStyle = useMemo<React.CSSProperties>(
    () => ({ ...mutedStyle, opacity: styleSettings.locationOpacity }),
    [mutedStyle, styleSettings.locationOpacity],
  );
  const dividerStyle = useMemo<React.CSSProperties>(
    () => ({ borderColor: styleSettings.borderColor }),
    [styleSettings.borderColor],
  );
  const pageStyle = useMemo<React.CSSProperties>(
    () => ({
      ...rootStyle,
      backgroundColor: styleSettings.backgroundColor,
      padding: `${paddingYpx}px ${paddingXpx}px`,
    }),
    [paddingXpx, paddingYpx, rootStyle, styleSettings.backgroundColor],
  );

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
        <div key={key} className="text-sm mb-6" style={mutedStyle}>
          {parts.map((p, idx) => (
            <span key={`${key}-${idx}`}>
              {idx > 0 && <span className="mx-2" style={{ color: styleSettings.mutedColor }}>•</span>}
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
          rows.push(
            <h1
              key="pi-fullName"
              className="mb-1 tracking-wide"
              style={{
                ...headingBaseStyle,
                fontWeight: styleSettings.nameBold ? 800 : 700,
                fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.6)}px`,
                color: styleSettings.applyAccentToName ? styleSettings.accentColor : styleSettings.headingColor,
              }}
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
            <p
              key="pi-jobTitle"
              className="mb-6 font-light"
              style={{
                fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.05)}px`,
                color: styleSettings.applyAccentToJobTitle ? styleSettings.accentColor : styleSettings.textColor,
              }}
            >
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
              <p className="leading-relaxed text-justify italic" style={{ color: styleSettings.textColor }}>
                "{data.personalInfo.summary}"
              </p>
            </div>
          );
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

    // Add separator if summary wasn't rendered
    if (!isSummaryRendered) {
      rows.push(
        <div key="header-separator-end" className="w-full border-b-2 mb-6" style={dividerStyle}></div>
      );
    }

    return (
      <div className="text-center mb-8 pb-8" style={{ textAlign: styleSettings.align as any, borderBottomWidth: 2, borderBottomColor: styleSettings.borderColor }}>
        {rows}
      </div>
    );
  };

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <h3 style={{ ...headingBaseStyle, fontSize: `${Math.round(styleSettings.bodyFontSizePx * 1.25)}px`, fontWeight: 700 }}>
          {exp.jobTitle}
        </h3>
        <span className="text-sm font-light" style={dateStyle}>
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      <p style={{ color: styleSettings.textColor, fontWeight: 600 }}>{exp.companyName}</p>
      {exp.location && <p className="text-sm" style={locationStyle}>{exp.location}</p>}
      <ul className="space-y-2 mt-3 ml-4">
        {exp.responsibilities.map((resp, index) => {
          const t = resp.trim();
          if (!t) return null;
          return (
            <li key={index} className="flex gap-2">
              {bulletNode(effectiveBulletStyle, styleSettings.accentColor)}
              <span style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>
                {t}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="flex justify-between items-start">
      <div>
        <h3 style={{ ...headingBaseStyle, fontWeight: 700 }}>{edu.degree}</h3>
        <p style={{ color: styleSettings.textColor }}>{edu.institutionName}</p>
        {edu.location && <p className="text-sm" style={locationStyle}>{edu.location}</p>}
        {edu.gpa && <p className="text-sm" style={mutedStyle}>GPA: {edu.gpa}</p>}
        {edu.honors && <p className="text-sm" style={mutedStyle}>{edu.honors}</p>}
      </div>
      {edu.graduationDate && (
        <span className="text-sm font-light" style={dateStyle}>{formatDate(edu.graduationDate)}</span>
      )}
    </div>
  );

  const Skills = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="mb-10">
      <h2
        className="uppercase tracking-wider mb-6"
        style={{
          ...headingBaseStyle,
          fontSize: `${styleSettings.headingFontSizePx}px`,
          textTransform: styleSettings.capitalization,
          fontWeight: 800,
        }}
      >
        Skills
      </h2>
      <div className="space-y-4">
        {skills.technical.length > 0 && (
          <div>
            <p className="font-semibold mb-2" style={{ color: styleSettings.headingColor }}>Technical</p>
            <p className="text-sm" style={{ color: styleSettings.textColor }}>{skills.technical.join(" • ")}</p>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <p className="font-semibold mb-2" style={{ color: styleSettings.headingColor }}>Professional</p>
            <p className="text-sm" style={{ color: styleSettings.textColor }}>{skills.soft.join(" • ")}</p>
          </div>
        )}
      </div>
    </div>
  );

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div>
      <h3 style={{ ...headingBaseStyle, fontWeight: 700 }}>{project.name}</h3>
      <p className="text-sm font-light mb-1" style={{ color: styleSettings.textColor }}>{project.role}</p>
      <p className="text-sm mb-2" style={{ color: styleSettings.textColor }}>{project.description}</p>
      <p className="text-sm" style={{ color: styleSettings.mutedColor }}>
        <span style={{ fontWeight: 600 }}>Technologies: </span>
        {project.technologies.join(" • ")}
      </p>
    </div>
  );

  const LanguageItem = ({ lang }: { lang: CVData["languages"][number] }) => (
    <div className="flex justify-between">
      <span style={{ ...headingBaseStyle, fontWeight: 700 }}>{lang.name}</span>
      <span className="text-sm" style={{ color: styleSettings.textColor }}>{lang.proficiency}</span>
    </div>
  );

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div>
      <p style={{ ...headingBaseStyle, fontWeight: 700 }}>{cert.title}</p>
      <p className="text-sm" style={{ color: styleSettings.textColor }}>{cert.issuingOrganization}</p>
      <p className="text-sm font-light" style={dateStyle}>{formatDate(cert.dateObtained)}</p>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div
      className={`flex items-center gap-2 mb-6 ${styleSettings.headingsLine ? "pb-1 border-b" : ""}`}
      style={styleSettings.headingsLine ? dividerStyle : undefined}
    >
      {sectionIconNode(styleSettings.sectionHeaderIconStyle, styleSettings.accentColor)}
      <h2
        className="uppercase tracking-wider"
        style={{
          ...headingBaseStyle,
          fontSize: `${styleSettings.headingFontSizePx}px`,
          textTransform: styleSettings.capitalization,
          fontWeight: 800,
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );

  const InterestsSection = () => {
    if (data.additional.interests.length === 0) return null;
    return (
      <div className="mb-10">
        <SectionTitle title="Interests" />
        <p className="text-sm" style={{ color: styleSettings.textColor }}>
          {data.additional.interests.join(", ")}
        </p>
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
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
    };

    const addEducation = () => {
      if (data.education.length === 0) return;
      items.push(<SectionTitle key="edu-title" title="Education" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        items.push(<EducationItem key={`edu-${edu.id}`} edu={edu} />);
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
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
        if (!isLast) items.push(<div key={`proj-sp-${project.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
    };

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      items.push(<SectionTitle key="lang-title" title="Languages" />);
      data.languages.forEach((lang, index) => {
        const isLast = index === data.languages.length - 1;
        items.push(<LanguageItem key={`lang-${lang.id}`} lang={lang} />);
        if (!isLast) items.push(<div key={`lang-sp-${lang.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
    };

    const addCertifications = () => {
      if (data.certifications.length === 0) return;
      items.push(<SectionTitle key="cert-title" title="Certifications" />);
      data.certifications.forEach((cert, index) => {
        const isLast = index === data.certifications.length - 1;
        items.push(<CertificationItem key={`cert-${cert.id}`} cert={cert} />);
        if (!isLast) items.push(<div key={`cert-sp-${cert.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
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
  }, [data, headingBaseStyle, mutedStyle, styleSettings, dividerStyle]);

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
      if (currentHeight + elementHeight > contentHeightPx) {
        pushPage();
      }
      currentPage.push(blocks[index]);
      currentHeight += elementHeight;
    });
    if (currentPage.length > 0) newPages.push(currentPage);
    setPages(newPages);
  }, [blocks, contentHeightPx]);

  return (
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      <div
        ref={containerRef}
        className="cv-measure fixed top-0 left-0 w-[210mm] opacity-0 pointer-events-none z-[-999]"
        style={{ ...pageStyle, visibility: "hidden" }}
      >
        {blocks}
      </div>
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm]" style={pageStyle}></div>
      ) : (
        pages.map((pageContent, i) => (
          <div
            key={i}
            className="a4-page w-[210mm] min-h-[297mm] relative print:shadow-none"
            style={{ ...pageStyle, breakAfter: i < pages.length - 1 ? "page" : "auto" }}
          >
            {pageContent}
            {styleSettings.showPageNumbers && pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] print:hidden" style={mutedStyle}>
                Page {i + 1} of {pages.length}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}