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

interface ClassicTemplateProps {
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
      return "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, \"Noto Sans\", sans-serif";
    case "system-serif":
      return "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif";
    case "mono":
      return "ui-monospace, SFMono-Regular, \"SF Mono\", Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace";
    case "roboto":
      return "var(--font-roboto), \"Roboto\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif";
    case "open-sans":
      return "var(--font-open-sans), \"Open Sans\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif";
    case "lato":
      return "var(--font-lato), \"Lato\", ui-sans-serif, system-ui, -apple-system, \"Segoe UI\", Arial, sans-serif";
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
  const common = { flexShrink: 0 as const, display: "inline-flex" as const, alignItems: "center", justifyContent: "center" };
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

export function ClassicTemplate({ data, isPreview = false }: ClassicTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);
  const styleSettings = useMemo(() => ({ ...DEFAULT_STYLE_SETTINGS, ...(data.styleSettings || {}) }), [data.styleSettings]);
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
  const rootStyle = useMemo<React.CSSProperties>(() => ({
    fontFamily: bodyFont,
    fontSize: `${styleSettings.bodyFontSizePx}px`,
    lineHeight: styleSettings.lineHeight,
    color: styleSettings.textColor,
  }), [bodyFont, styleSettings.bodyFontSizePx, styleSettings.lineHeight, styleSettings.textColor]);
  const headingBaseStyle = useMemo<React.CSSProperties>(() => ({
    fontFamily: headingFont,
    color: effectiveHeadingColor,
  }), [headingFont, effectiveHeadingColor]);
  const mutedStyle = useMemo<React.CSSProperties>(() => ({ color: styleSettings.mutedColor }), [styleSettings.mutedColor]);
  const dateStyle = useMemo<React.CSSProperties>(() => ({ ...mutedStyle, opacity: styleSettings.datesOpacity }), [mutedStyle, styleSettings.datesOpacity]);
  const locationStyle = useMemo<React.CSSProperties>(() => ({ ...mutedStyle, opacity: styleSettings.locationOpacity }), [mutedStyle, styleSettings.locationOpacity]);
  const dividerStyle = useMemo<React.CSSProperties>(() => ({ borderColor: styleSettings.borderColor }), [styleSettings.borderColor]);
  const pageStyle = useMemo<React.CSSProperties>(() => ({
    ...rootStyle,
    backgroundColor: styleSettings.backgroundColor,
    padding: `${paddingYpx}px ${paddingXpx}px`,
  }), [paddingXpx, paddingYpx, rootStyle, styleSettings.backgroundColor]);

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
    <div className="pb-6 mb-8" style={{ textAlign: styleSettings.align }}>
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
            <div key={key} style={mutedStyle}>
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
              rows.push(
                <h1
                  key="pi-fullName"
                  className="mb-2"
                  style={{
                    ...headingBaseStyle,
                    fontWeight: styleSettings.nameBold ? 800 : 700,
                    fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.6)}px`,
                    color: styleSettings.applyAccentToName ? styleSettings.accentColor : headingBaseStyle.color,
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
                <h2
                  key="pi-jobTitle"
                  className="mb-4"
                  style={{
                    ...headingBaseStyle,
                    fontWeight: 600,
                    fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.05)}px`,
                    color: styleSettings.applyAccentToJobTitle ? styleSettings.accentColor : styleSettings.textColor,
                  }}
                >
                  {data.personalInfo.jobTitle}
                </h2>
              );
            }
            return;
          }
          if (field === "summary") {
            flushContacts();

            if (data.personalInfo.summary) {
              rows.push(<div key="header-separator" className="w-full border-b-2 mb-6 mt-4" style={dividerStyle}></div>);
              rows.push(
                <h2
                  key="pi-summary-title"
                  className="text-left mb-3 mt-2"
                  style={{ ...headingBaseStyle, fontWeight: 800, fontSize: `${styleSettings.headingFontSizePx}px`, textTransform: styleSettings.capitalization }}
                >
                  PROFESSIONAL SUMMARY
                </h2>
              );
              rows.push(
                <p key="pi-summary" className="text-left" style={{ color: styleSettings.textColor }}>
                  {data.personalInfo.summary}
                </p>
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

        if (!isSummaryRendered) {
          rows.push(<div key="header-separator-end" className="w-full border-b-2 mb-6 mt-4" style={dividerStyle}></div>);
        }

        return <>{rows}</>;
      })()}
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div
      className={`flex items-center gap-2 mb-4 ${styleSettings.headingsLine ? "pb-1 border-b" : ""}`}
      style={styleSettings.headingsLine ? dividerStyle : undefined}
    >
      {sectionIconNode(styleSettings.sectionHeaderIconStyle, styleSettings.accentColor)}
      <h2
        style={{
          ...headingBaseStyle,
          fontWeight: 800,
          fontSize: `${styleSettings.headingFontSizePx}px`,
          margin: 0,
          textTransform: styleSettings.capitalization,
        }}
      >
        {title}
      </h2>
    </div>
  );

  const Summary = ({ summary }: { summary: string }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3 border-gray-300 pb-1">PROFESSIONAL SUMMARY</h2>
      <p className="text-gray-700 leading-relaxed">{summary}</p>
    </div>
  );

  const Skills = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="mb-8">
      <SectionTitle title="SKILLS" />
      <div className="space-y-3">
        {skills.technical.length > 0 && (
          <div>
            <span style={{ ...headingBaseStyle, fontWeight: 700, color: styleSettings.headingColor }}>Technical Skills: </span>
            <span style={{ color: styleSettings.textColor }}>{skills.technical.join(", ")}</span>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <span style={{ ...headingBaseStyle, fontWeight: 700, color: styleSettings.headingColor }}>Soft Skills: </span>
            <span style={{ color: styleSettings.textColor }}>{skills.soft.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );

  const ExperienceHeader = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 style={{ ...headingBaseStyle, fontWeight: 700, fontSize: `${Math.round(styleSettings.bodyFontSizePx * 1.25)}px` }}>{exp.jobTitle}</h3>
        <p style={{ color: styleSettings.textColor, fontWeight: 600 }}>{exp.companyName}</p>
        {exp.location && <p style={locationStyle}>{exp.location}</p>}
      </div>
      {(formatDate(exp.startDate) || exp.current || formatDate(exp.endDate)) && (
        <span style={dateStyle}>
          {formatDate(exp.startDate)}
          {(formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate))) ? " - " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      )}
    </div>
  );

  const ExperienceDescriptionLine = ({ text }: { text: string }) => (
    <div className="flex gap-2" style={{ marginLeft: styleSettings.descriptionIndentPx }}>
      {bulletNode(effectiveBulletStyle, styleSettings.accentColor)}
      <div style={{ color: styleSettings.textColor, flex: 1 }}>{text}</div>
    </div>
  );

  const EducationHeader = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="flex justify-between items-start">
      <div>
        <h3 style={{ ...headingBaseStyle, fontWeight: 700 }}>{edu.degree}</h3>
        <p style={{ color: styleSettings.textColor }}>{edu.institutionName}</p>
        {edu.location && <p style={locationStyle}>{edu.location}</p>}
        {edu.gpa && <p style={mutedStyle}>GPA: {edu.gpa}</p>}
        {edu.honors && <p style={mutedStyle}>{edu.honors}</p>}
        {edu.additionalInfo && <p style={{ ...mutedStyle, fontSize: `${Math.max(10, styleSettings.bodyFontSizePx - 1)}px`, marginTop: 4 }}>{edu.additionalInfo}</p>}
      </div>
      {edu.graduationDate && <span style={dateStyle}>{formatDate(edu.graduationDate)}</span>}
    </div>
  );

  const EducationDetailsLine = ({ text }: { text: string }) => (
    <div className="ml-4" style={{ color: styleSettings.textColor }}>{text}</div>
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
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
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
        if (!isLast) items.push(<div key={`edu-sp-${edu.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
    };

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      items.push(<SectionTitle key="lang-title" title="LANGUAGES" />);
      data.languages.forEach((lang) => {
        items.push(
          <div key={`lang-${lang.id}`} style={{ color: styleSettings.textColor }}>
            <span style={{ ...headingBaseStyle, fontWeight: 700 }}>{lang.name}: </span>
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
            <h3 style={{ ...headingBaseStyle, fontWeight: 700 }}>{project.name}</h3>
            <p style={{ ...mutedStyle, fontWeight: 600 }}>{project.role}</p>
            <p className="mb-2" style={{ color: styleSettings.textColor }}>{project.description}</p>
            <p style={mutedStyle}><span style={{ fontWeight: 600 }}>Technologies: </span>{project.technologies.join(", ")}</p>
          </div>
        );
        if (index < data.projects.length - 1) items.push(<div key={`proj-sp-${project.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
    };

    const addCertifications = () => {
      if (data.certifications.length === 0) return;
      items.push(<SectionTitle key="cert-title" title="CERTIFICATIONS & AWARDS" />);
      data.certifications.forEach((cert, index) => {
        items.push(
          <div key={`cert-${cert.id}`} className="flex justify-between items-center">
            <div>
              <span style={{ ...headingBaseStyle, fontWeight: 700 }}>{cert.title}</span>
              <span style={{ color: styleSettings.textColor }}> - {cert.issuingOrganization}</span>
            </div>
            <span style={mutedStyle}>{formatDate(cert.dateObtained)}</span>
          </div>
        );
        if (index < data.certifications.length - 1) items.push(<div key={`cert-sp-${cert.id}`} style={{ height: Math.max(4, Math.round(styleSettings.spaceBetweenEntriesPx / 2)) }} />);
      });
    };

    const addInterests = () => {
      if (data.additional.interests.length === 0) return;
      items.push(<SectionTitle key="int-title" title="INTERESTS & HOBBIES" />);
      items.push(<div key="int-body" style={{ color: styleSettings.textColor }}>{data.additional.interests.join(", ")}</div>);
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
