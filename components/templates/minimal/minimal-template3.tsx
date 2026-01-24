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

interface MinimalTemplate3Props {
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
  accentColor: "#10b981", // Emerald accent for this template
  borderColor: "#1f2937",
  backgroundColor: "#ffffff",
  backgroundImageUrl: "",
  colorMode: "basic",
  borderMode: "single",
  applyAccentToName: false,
  applyAccentToJobTitle: false,
  applyAccentToHeadings: true,
  applyAccentToHeadingsLine: true,
  applyAccentToHeaderIcons: true,
  applyAccentToDotsBarsBubbles: true,
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

interface PageSection {
  type: "full" | "partial";
  sectionId: string;
  content: React.ReactNode[];
  isFirstInSection?: boolean;
}

export function MinimalTemplate3({ data, isPreview = false }: MinimalTemplate3Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageSection[][]>([]);
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
  const dividerStyle = useMemo<React.CSSProperties>(() => ({ borderColor: styleSettings.applyAccentToHeadingsLine ? styleSettings.accentColor : styleSettings.borderColor }), [styleSettings.accentColor, styleSettings.applyAccentToHeadingsLine, styleSettings.borderColor]);
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
    <div data-section-id="personalInfo" className="pb-6 mb-6" style={{ textAlign: styleSettings.align }}>
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

        const rows: React.ReactNode[] = [];
        let contactBuffer: string[] = [];
        let contactBlockIndex = 0;
        let isSummaryRendered = false;

        const flushContacts = () => {
          const parts = contactBuffer.map((s) => s.trim()).filter(Boolean);
          if (parts.length === 0) return;
          
          rows.push(
            <div key={`contacts-${contactBlockIndex}`} className="mb-6">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {parts.map((p, idx) => (
                  <div key={`contact-${idx}`}>
                    <p style={{ 
                      color: styleSettings.accentColor, 
                      fontWeight: 600, 
                      fontSize: `${Math.max(10, styleSettings.bodyFontSizePx)}px`,
                      textTransform: 'uppercase',
                      marginBottom: 4 
                    }}>
                      {(() => {
                        const field = finalOrder.find(f => contactValue(f) === p);
                        if (!field) return '';
                        return field === "linkedin" ? "LinkedIn" : 
                               field === "github" ? "GitHub" : 
                               field.charAt(0).toUpperCase() + field.slice(1);
                      })()}
                    </p>
                    <p style={{ color: '#ffffff' }}>{p}</p>
                  </div>
                ))}
              </div>
            </div>
          );
          contactBuffer = [];
          contactBlockIndex += 1;
        };

        finalOrder.forEach((field) => {
          if (field === "fullName") {
            flushContacts();
            if (data.personalInfo.fullName) {
              rows.push(
                <div key="pi-fullName" className="flex items-baseline gap-4 mb-4" style={{ color: '#ffffff' }}>
                  <h1 style={{
                    ...headingBaseStyle,
                    fontWeight: styleSettings.nameBold ? 900 : 700,
                    fontSize: `${Math.round(styleSettings.headingFontSizePx * 2.5)}px`,
                    color: styleSettings.applyAccentToName ? styleSettings.accentColor : '#ffffff',
                    margin: 0,
                  }}>
                    {data.personalInfo.fullName}
                  </h1>
                  <div style={{ width: '4px', height: '48px', background: styleSettings.accentColor }}></div>
                </div>
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
                  className="mb-6"
                  style={{
                    ...headingBaseStyle,
                    fontWeight: 400,
                    fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.1)}px`,
                    color: styleSettings.applyAccentToJobTitle ? styleSettings.accentColor : '#d1d5db',
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
              rows.push(
                <div key="pi-summary" style={{ 
                  padding: '48px', 
                  backgroundColor: styleSettings.backgroundColor,
                  marginTop: -paddingYpx,
                  marginLeft: -paddingXpx,
                  marginRight: -paddingXpx,
                }}>
                  <p style={{ color: styleSettings.textColor, lineHeight: 1.6 }}>
                    {data.personalInfo.summary}
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

        return (
          <div style={{ 
            backgroundColor: '#1e293b', 
            padding: `${paddingYpx}px ${paddingXpx}px`,
            marginLeft: -paddingXpx,
            marginRight: -paddingXpx,
            marginTop: -paddingYpx,
            color: '#ffffff'
          }}>
            {rows}
          </div>
        );
      })()}
    </div>
  );

  const SectionTitle = ({ title, sectionId }: { title: string; sectionId?: string }) => (
    <div
      data-section-id={sectionId}
      className={`flex items-center gap-2 mb-6 ${styleSettings.headingsLine ? "pb-2 border-b-2" : ""}`}
      style={styleSettings.headingsLine ? dividerStyle : undefined}
    >
      {sectionIconNode(styleSettings.sectionHeaderIconStyle, styleSettings.accentColor)}
      <h2
        style={{
          ...headingBaseStyle,
          fontWeight: 700,
          fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.1)}px`,
          margin: 0,
          textTransform: styleSettings.capitalization,
          letterSpacing: '0.1em',
        }}
      >
        {title}
      </h2>
    </div>
  );

  const ExperienceHeader = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="flex justify-between items-start mb-2">
      <div>
        <h3 style={{ ...headingBaseStyle, fontWeight: 700, fontSize: `${Math.round(styleSettings.bodyFontSizePx * 1.25)}px` }}>{exp.jobTitle}</h3>
        <p style={{ color: styleSettings.accentColor, fontWeight: 600, fontSize: `${styleSettings.bodyFontSizePx}px` }}>{exp.companyName}</p>
        {exp.location && <p style={locationStyle}>{exp.location}</p>}
      </div>
      {(formatDate(exp.startDate) || exp.current || formatDate(exp.endDate)) && (
        <span style={dateStyle}>
          {formatDate(exp.startDate)}
          {(formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate))) ? " – " : ""}
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
        <p style={{ color: styleSettings.accentColor, fontWeight: 600 }}>{edu.institutionName}</p>
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
    interface SectionBlock {
      type: "section";
      id: string;
      children: React.ReactNode[];
    }
    const items: (React.ReactNode | SectionBlock)[] = [];
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
      const children: React.ReactNode[] = [];
      children.push(<SectionTitle key="skills-title" title="KEY SKILLS" sectionId="skills" />);
      
      children.push(
        <div key="skills-content" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {data.skills.technical.length > 0 && (
            <div>
              <p style={{ ...headingBaseStyle, fontWeight: 700, fontSize: `${styleSettings.bodyFontSizePx}px`, marginBottom: 12 }}>Technical</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.skills.technical.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: 999,
                      backgroundColor: '#f1f5f9',
                      color: styleSettings.textColor,
                      padding: '4px 12px',
                      fontSize: `${Math.max(10, styleSettings.bodyFontSizePx - 2)}px`,
                    }}
                  >
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: 999, 
                      backgroundColor: styleSettings.accentColor,
                      marginRight: 6 
                    }}></span>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {data.skills.soft.length > 0 && (
            <div>
              <p style={{ ...headingBaseStyle, fontWeight: 700, fontSize: `${styleSettings.bodyFontSizePx}px`, marginBottom: 12 }}>Professional</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {data.skills.soft.map((skill, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      borderRadius: 999,
                      backgroundColor: '#f1f5f9',
                      color: styleSettings.textColor,
                      padding: '4px 12px',
                      fontSize: `${Math.max(10, styleSettings.bodyFontSizePx - 2)}px`,
                    }}
                  >
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: 999, 
                      backgroundColor: styleSettings.accentColor,
                      marginRight: 6 
                    }}></span>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      );
      
      items.push({ type: "section", id: "skills", children });
    };

    const addExperience = () => {
      if (data.experience.length === 0) return;
      const children: React.ReactNode[] = [];
      children.push(<SectionTitle key="exp-title" title="PROFESSIONAL EXPERIENCE" sectionId="experience" />);
      data.experience.forEach((exp, index) => {
        const isLast = index === data.experience.length - 1;
        children.push(
          <div key={`exp-container-${exp.id}`} className="relative pl-6 mb-6">
            <div style={{ 
              position: 'absolute', 
              left: 0, 
              top: '8px', 
              width: '12px', 
              height: '12px', 
              borderRadius: 999, 
              backgroundColor: styleSettings.accentColor 
            }}></div>
            <ExperienceHeader exp={exp} />
            {exp.responsibilities.map((resp, i) => {
              const t = resp.trim();
              if (t) return <ExperienceDescriptionLine key={`exp-l-${exp.id}-${i}`} text={t} />;
              return null;
            })}
          </div>
        );
        if (!isLast) children.push(<div key={`exp-sp-${exp.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
      items.push({ type: "section", id: "experience", children });
    };

    const addEducation = () => {
      if (data.education.length === 0) return;
      const children: React.ReactNode[] = [];
      children.push(<SectionTitle key="edu-title" title="EDUCATION" sectionId="education" />);
      data.education.forEach((edu, index) => {
        const isLast = index === data.education.length - 1;
        children.push(<EducationHeader key={`edu-h-${edu.id}`} edu={edu} />);
        const details = (edu.additionalInfo || "").split("\n").map((s) => s.trim()).filter(Boolean);
        details.forEach((line, i) => children.push(<EducationDetailsLine key={`edu-l-${edu.id}-${i}`} text={line} />));
        if (!isLast) children.push(<div key={`edu-sp-${edu.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
      items.push({ type: "section", id: "education", children });
    };

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      const children: React.ReactNode[] = [];
      children.push(<SectionTitle key="lang-title" title="LANGUAGES" sectionId="languages" />);
      data.languages.forEach((lang) => {
        children.push(
          <div key={`lang-${lang.id}`} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: styleSettings.textColor }}>{lang.name}</span>
            <span style={{ color: styleSettings.accentColor, fontWeight: 600 }}>{lang.proficiency}</span>
          </div>
        );
      });
      items.push({ type: "section", id: "languages", children });
    };

    const addProjects = () => {
      if (data.projects.length === 0) return;
      const children: React.ReactNode[] = [];
      children.push(<SectionTitle key="proj-title" title="NOTABLE PROJECTS" sectionId="projects" />);
      data.projects.forEach((project, index) => {
        const isLast = index === data.projects.length - 1;
        children.push(
          <div key={`proj-${project.id}`} style={{
            backgroundColor: '#f8fafc',
            borderLeft: `4px solid ${styleSettings.accentColor}`,
            borderRadius: '0 8px 8px 0',
            padding: 16,
            marginBottom: isLast ? 0 : 16,
          }}>
            <h3 style={{ ...headingBaseStyle, fontWeight: 700, marginBottom: 4 }}>{project.name}</h3>
            <p style={{ color: styleSettings.accentColor, fontWeight: 600, fontSize: `${styleSettings.bodyFontSizePx}px`, marginBottom: 8 }}>{project.role}</p>
            <p style={{ color: styleSettings.textColor, marginBottom: 12, lineHeight: 1.5 }}>{project.description}</p>
            <p style={mutedStyle}><span style={{ fontWeight: 600 }}>Technologies: </span>{project.technologies.join(" • ")}</p>
          </div>
        );
      });
      items.push({ type: "section", id: "projects", children });
    };

    const addCertifications = () => {
      if (data.certifications.length === 0) return;
      const children: React.ReactNode[] = [];
      children.push(<SectionTitle key="cert-title" title="CERTIFICATIONS" sectionId="certifications" />);
      data.certifications.forEach((cert, index) => {
        const isLast = index === data.certifications.length - 1;
        children.push(
          <div key={`cert-${cert.id}`} style={{ marginBottom: 12 }}>
            <p style={{ ...headingBaseStyle, fontWeight: 700 }}>{cert.title}</p>
            <p style={{ color: styleSettings.textColor, fontSize: `${Math.max(10, styleSettings.bodyFontSizePx - 1)}px` }}>{cert.issuingOrganization}</p>
            <p style={{ color: styleSettings.accentColor, fontSize: `${Math.max(10, styleSettings.bodyFontSizePx - 1)}px` }}>{formatDate(cert.dateObtained)}</p>
          </div>
        );
        if (!isLast) children.push(<div key={`cert-sp-${cert.id}`} style={{ height: Math.max(4, Math.round(styleSettings.spaceBetweenEntriesPx / 2)) }} />);
      });
      items.push({ type: "section", id: "certifications", children });
    };

    const addInterests = () => {
      if (data.additional.interests.length === 0) return;
      const children: React.ReactNode[] = [];
      children.push(<SectionTitle key="int-title" title="INTERESTS" sectionId="interests" />);
      children.push(
        <div key="int-body" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.additional.interests.map((interest, index) => (
            <span
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 999,
                backgroundColor: '#f1f5f9',
                color: styleSettings.textColor,
                padding: '4px 12px',
                fontSize: `${Math.max(10, styleSettings.bodyFontSizePx - 2)}px`,
              }}
            >
              <span style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: 999, 
                backgroundColor: styleSettings.accentColor,
                marginRight: 6 
              }}></span>
              {interest}
            </span>
          ))}
        </div>
      );
      items.push({ type: "section", id: "interests", children });
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
  }, [data, headingBaseStyle, mutedStyle, dateStyle, locationStyle, styleSettings, effectiveBulletStyle, paddingXpx, paddingYpx]);

  // FIXED PAGINATION - With intelligent splitting of sections
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const newPages: PageSection[][] = [];
    let currentPage: PageSection[] = [];
    let currentHeight = 0;

    const pushPage = () => {
      if (currentPage.length > 0) {
        newPages.push(currentPage);
        currentPage = [];
        currentHeight = 0;
      }
    };

    const elements = Array.from(containerRef.current.children) as HTMLElement[];

    // Type guard for SectionBlock
    const isSectionBlock = (block: any): block is { type: "section"; id: string; children: React.ReactNode[] } => {
      return block && typeof block === 'object' && block.type === 'section' && 'id' in block && Array.isArray(block.children);
    };

    elements.forEach((el, index) => {
      const block = blocks[index];

      if (isSectionBlock(block)) {
        const sectionId = block.id;
        const children = Array.from(el.children) as HTMLElement[];
        
        // Check if this is the start of a new section
        const isSectionStart = currentPage.length === 0 || 
          currentPage[currentPage.length - 1].sectionId !== sectionId;
        
        let sectionBuffer: React.ReactNode[] = [];
        let sectionHeight = 0;
        
        // Process each child within the section
        children.forEach((childEl, childIndex) => {
          const style = window.getComputedStyle(childEl);
          const marginTop = parseFloat(style.marginTop) || 0;
          const marginBottom = parseFloat(style.marginBottom) || 0;
          const childHeight = childEl.offsetHeight + marginTop + marginBottom;
          
          // Check if adding this child would overflow the page
          if (currentHeight + childHeight > contentHeightPx) {
            // If we already have some content in the buffer, push it
            if (sectionBuffer.length > 0) {
              currentPage.push({
                type: sectionHeight > 0 ? "partial" : "full",
                sectionId,
                content: [...sectionBuffer],
                isFirstInSection: isSectionStart && newPages.length === 0
              });
              pushPage();
              sectionBuffer = [];
              sectionHeight = 0;
              
              // Start new page with continuation if needed
              if (childHeight > contentHeightPx) {
                // If even a single child is too tall, we have to split it
                currentPage.push({
                  type: "partial",
                  sectionId,
                  content: [
                    <div key="continuation" className="text-xs italic mb-2" style={mutedStyle}>
                      (Continued from previous page)
                    </div>,
                    block.children[childIndex]
                  ],
                  isFirstInSection: false
                });
                currentHeight = childHeight;
                pushPage();
              } else {
                // Add to buffer for new page
                sectionBuffer.push(block.children[childIndex]);
                sectionHeight = childHeight;
                currentHeight = childHeight;
              }
            } else {
              // No buffer yet, start new page
              pushPage();
              sectionBuffer.push(block.children[childIndex]);
              sectionHeight = childHeight;
              currentHeight = childHeight;
            }
          } else {
            // Child fits on current page
            sectionBuffer.push(block.children[childIndex]);
            sectionHeight += childHeight;
            currentHeight += childHeight;
          }
        });
        
        // Push remaining buffer content
        if (sectionBuffer.length > 0) {
          currentPage.push({
            type: "full",
            sectionId,
            content: sectionBuffer,
            isFirstInSection: isSectionStart && newPages.length === 0
          });
        }
      } else {
        // Handle standalone blocks (like header)
        const style = window.getComputedStyle(el);
        const marginTop = parseFloat(style.marginTop) || 0;
        const marginBottom = parseFloat(style.marginBottom) || 0;
        const elementHeight = el.offsetHeight + marginTop + marginBottom;
        
        if (currentHeight + elementHeight > contentHeightPx) {
          pushPage();
        }
        
        currentPage.push({
          type: "full",
          sectionId: "personalInfo",
          content: [block as React.ReactNode],
          isFirstInSection: true
        });
        currentHeight += elementHeight;
      }
    });

    if (currentPage.length > 0) newPages.push(currentPage);
    setPages(newPages);
  }, [blocks, contentHeightPx, mutedStyle]);

  return (
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      <div
        ref={containerRef}
        className="cv-measure fixed top-0 left-0 w-[210mm] opacity-0 pointer-events-none z-[-999]"
        style={{ ...pageStyle, visibility: "hidden" }}
      >
        {blocks.map((block, i) => {
           if (block && typeof block === 'object' && 'type' in block && block.type === 'section' && 'children' in block) {
             return (
               <div key={i}>
                 {(block as { children: React.ReactNode[] }).children}
               </div>
             );
           }
           return <div key={i}>{block as React.ReactNode}</div>;
        })}
      </div>
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm]" style={pageStyle}></div>
      ) : (
        pages.map((pageContent, pageIndex) => (
          <div
            key={pageIndex}
            className="a4-page w-[210mm] min-h-[297mm] relative print:shadow-none"
            style={{ ...pageStyle, breakAfter: pageIndex < pages.length - 1 ? "page" : "auto" }}
          >
            {pageContent.map((section, sectionIndex) => (
              <div 
                key={`${section.sectionId}-${sectionIndex}`}
                className={section.isFirstInSection ? "" : "mt-2"}
              >
                {section.type === "partial" && !section.isFirstInSection && (
                  <div className="text-xs italic mb-2" style={mutedStyle}>
                    (Continued from previous page)
                  </div>
                )}
                {section.content}
              </div>
            ))}
            
            {styleSettings.showPageNumbers && pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] print:hidden" style={mutedStyle}>
                Page {pageIndex + 1} of {pages.length}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}