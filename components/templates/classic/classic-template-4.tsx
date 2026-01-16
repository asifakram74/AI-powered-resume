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

interface ClassicTemplate4Props {
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

const getIconSize = (size: string) => {
  switch (size) {
    case "xs":
      return "w-2.5 h-2.5";
    case "sm":
      return "w-3.5 h-3.5";
    case "md":
      return "w-4.5 h-4.5";
    case "lg":
      return "w-5.5 h-5.5";
    default:
      return "w-3.5 h-3.5";
  }
};

const getIconFrameClasses = (frame: string) => {
  switch (frame) {
    case "circle":
      return "rounded-full p-1";
    case "square":
      return "rounded p-1";
    case "rounded":
      return "rounded-md p-1";
    default:
      return "";
  }
};

export function ClassicTemplate4({ data, isPreview = false }: ClassicTemplate4Props) {
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
        <div key={key} className="mb-4" style={{ ...mutedStyle, fontSize: `${styleSettings.bodyFontSizePx}px` }}>
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
              className="mb-2 tracking-tight"
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
            <h2
              key="pi-jobTitle"
              className="mb-4"
              style={{
                fontSize: `${Math.round(styleSettings.headingFontSizePx * 1.05)}px`,
                color: styleSettings.applyAccentToJobTitle ? styleSettings.accentColor : styleSettings.textColor,
                fontFamily: headingFont,
                fontWeight: 600,
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
            <div key="pi-summary" className="mb-8 text-left w-full">
              <h2
                className="mb-3 uppercase tracking-wide pb-2"
                style={{
                  ...headingBaseStyle,
                  fontSize: `${styleSettings.headingFontSizePx}px`,
                  fontWeight: 800,
                  textTransform: styleSettings.capitalization,
                  borderBottomWidth: 1,
                  borderBottomColor: styleSettings.borderColor,
                }}
              >
                Professional Summary
              </h2>
              <p className="leading-relaxed" style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>
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

    if (!isSummaryRendered) {
      rows.push(
        <div key="header-separator-end" className="w-full border-b mb-6" style={dividerStyle}></div>
      );
    }

    return (
      <div className="text-center mb-8" style={{ textAlign: styleSettings.align as any }}>
        {rows}
      </div>
    );
  };

  const Skills = ({ skills }: { skills: CVData["skills"] }) => (
    <div className="mb-8">
      <SectionTitle title="Skills" />
      <div className="grid grid-cols-2 gap-4">
        {skills.technical.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2" style={{ color: styleSettings.headingColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>Technical Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.technical.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full"
                  style={{
                    fontSize: `${styleSettings.bodyFontSizePx}px`,
                    color: styleSettings.textColor,
                    backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
                      ? `${styleSettings.accentColor}15`
                      : "#f3f4f6",
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        {skills.soft.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2" style={{ color: styleSettings.headingColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>Soft Skills</h4>
            <div className="flex flex-wrap gap-2">
              {skills.soft.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full"
                  style={{
                    fontSize: `${styleSettings.bodyFontSizePx}px`,
                    color: styleSettings.textColor,
                    backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
                      ? `${styleSettings.accentColor}15`
                      : "#f3f4f6",
                  }}
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

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="pl-4" style={{ borderLeftWidth: 4, borderLeftColor: styleSettings.applyAccentToDotsBarsBubbles ? styleSettings.accentColor : "#e5e7eb" }}>
      <div className="flex justify-between items-start mb-1">
        <h3 style={{ ...headingBaseStyle, fontSize: `${Math.round(styleSettings.bodyFontSizePx * 1.25)}px`, fontWeight: 700 }}>
          {exp.jobTitle}
        </h3>
        <span
          className="px-2 py-1 rounded"
          style={{
            ...dateStyle,
            fontSize: `${styleSettings.bodyFontSizePx}px`,
            backgroundColor: styleSettings.applyAccentToDates ? `${styleSettings.accentColor}15` : "#f3f4f6",
          }}
        >
          {formatDate(exp.startDate)}
          {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
          {exp.current ? "Present" : formatDate(exp.endDate)}
        </span>
      </div>
      <div className="flex justify-between items-start mb-3">
        <p className="font-medium" style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>
          {exp.companyName}
          {exp.location && ` • ${exp.location}`}
        </p>
      </div>
      <ul className="leading-relaxed space-y-2" style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>
        {exp.responsibilities.map((resp, index) => {
          const t = resp.trim();
          if (!t) return null;
          return (
            <li key={index} className="flex items-start" style={{ marginLeft: styleSettings.descriptionIndentPx }}>
              {bulletNode(effectiveBulletStyle, styleSettings.accentColor)}
              <span className="ml-2">{t}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );

  const EducationItem = ({ edu }: { edu: CVData["education"][number] }) => (
    <div className="pl-4" style={{ borderLeftWidth: 4, borderLeftColor: styleSettings.applyAccentToDotsBarsBubbles ? styleSettings.accentColor : "#e5e7eb" }}>
      <div className="flex justify-between items-start mb-1">
        <h3 style={{ ...headingBaseStyle, fontSize: `${styleSettings.bodyFontSizePx}px`, fontWeight: 700 }}>{edu.degree}</h3>
        {edu.graduationDate && (
          <span
            className="px-2 py-1 rounded"
            style={{
              ...dateStyle,
              fontSize: `${styleSettings.bodyFontSizePx}px`,
              backgroundColor: styleSettings.applyAccentToDates ? `${styleSettings.accentColor}15` : "#f3f4f6",
            }}
          >
            {formatDate(edu.graduationDate)}
          </span>
        )}
      </div>
      <p className="font-medium mb-1" style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>{edu.institutionName}</p>
      {edu.location && <p className="mb-1" style={{ ...locationStyle, fontSize: `${styleSettings.bodyFontSizePx}px` }}>{edu.location}</p>}
      <div className="flex flex-wrap gap-4" style={{ ...mutedStyle, fontSize: `${styleSettings.bodyFontSizePx}px` }}>
        {edu.gpa && <span>GPA: {edu.gpa}</span>}
        {edu.honors && <span>{edu.honors}</span>}
      </div>
      {edu.additionalInfo && (
        <p className="mt-2" style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>{edu.additionalInfo}</p>
      )}
    </div>
  );

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => {
    const iconSize = getIconSize(styleSettings.iconSize);
    const frameClasses = getIconFrameClasses(styleSettings.iconFrame);
    const iconColor = styleSettings.applyAccentToLinkIcons ? styleSettings.accentColor : styleSettings.headingColor;

    return (
      <div className="pl-4" style={{ borderLeftWidth: 4, borderLeftColor: styleSettings.applyAccentToDotsBarsBubbles ? styleSettings.accentColor : "#e5e7eb" }}>
        <h3 style={{ ...headingBaseStyle, fontSize: `${styleSettings.bodyFontSizePx}px`, fontWeight: 700 }}>{project.name}</h3>
        <p className="mb-2" style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>{project.role}</p>
        <p className="mb-3" style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>{project.description}</p>
        <div className="mb-2" style={{ color: styleSettings.mutedColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>
          <span style={{ fontWeight: 600 }}>Technologies: </span>
          {project.technologies.join(", ")}
        </div>
        {(project.liveDemoLink || project.githubLink) && (
          <div className="flex gap-4" style={{ fontSize: `${styleSettings.bodyFontSizePx}px` }}>
            {project.liveDemoLink && (
              <a
                href={project.liveDemoLink}
                className="flex items-center hover:underline"
                style={{ color: iconColor }}
              >
                <div className={frameClasses}>
                  <svg className={`${iconSize} mr-1`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                Live Demo
              </a>
            )}
            {project.githubLink && (
              <a
                href={project.githubLink}
                className="flex items-center hover:underline"
                style={{ color: iconColor }}
              >
                <div className={frameClasses}>
                  <svg className={`${iconSize} mr-1`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </div>
                Source Code
              </a>
            )}
          </div>
        )}
      </div>
    );
  };

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div>
      <div style={{ ...headingBaseStyle, fontSize: `${styleSettings.bodyFontSizePx}px`, fontWeight: 700 }}>{cert.title}</div>
      <div style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>{cert.issuingOrganization}</div>
      <div style={{ ...dateStyle, fontSize: `${styleSettings.bodyFontSizePx}px` }}>
        {formatDate(cert.dateObtained)}
        {cert.verificationLink && (
          <a
            href={cert.verificationLink}
            className="ml-2 hover:underline"
            style={{ color: styleSettings.applyAccentToLinkIcons ? styleSettings.accentColor : "#3b82f6" }}
          >
            (Verify)
          </a>
        )}
      </div>
    </div>
  );

  const LanguageItem = ({ lang }: { lang: CVData["languages"][number] }) => (
    <div className="flex justify-between items-center">
      <span className="font-medium" style={{ color: styleSettings.textColor, fontSize: `${styleSettings.bodyFontSizePx}px` }}>{lang.name}</span>
      <span
        className="px-2 py-1 rounded"
        style={{
          fontSize: `${styleSettings.bodyFontSizePx}px`,
          color: styleSettings.textColor,
          backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
            ? `${styleSettings.accentColor}15`
            : "#f3f4f6",
        }}
      >
        {lang.proficiency}
      </span>
    </div>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <div
      className={`flex items-center gap-2 mb-4 ${styleSettings.headingsLine ? "pb-2 border-b" : ""}`}
      style={styleSettings.headingsLine ? dividerStyle : undefined}
    >
      {sectionIconNode(styleSettings.sectionHeaderIconStyle, styleSettings.accentColor)}
      <h2
        className="uppercase tracking-wide"
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
      <div className="mb-8">
        <SectionTitle title="Interests" />
        <div className="flex flex-wrap gap-2">
          {data.additional.interests.map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full"
              style={{
                fontSize: `${styleSettings.bodyFontSizePx}px`,
                color: styleSettings.textColor,
                backgroundColor: styleSettings.applyAccentToDotsBarsBubbles
                  ? `${styleSettings.accentColor}15`
                  : "#f3f4f6",
              }}
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
        const isLast = index === data.experience.length - 1;
        items.push(<ExperienceItem key={`exp-${exp.id}`} exp={exp} />);
        if (!isLast) items.push(<div key={`exp-sp-${exp.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
      });
    };

    const addSkills = () => {
      if (data.skills.technical.length === 0 && data.skills.soft.length === 0) return;
      items.push(<Skills key="skills" skills={data.skills} />);
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

    const addProjects = () => {
      if (data.projects.length === 0) return;
      items.push(<SectionTitle key="proj-title" title="Projects" />);
      data.projects.forEach((project, index) => {
        const isLast = index === data.projects.length - 1;
        items.push(<ProjectItem key={`proj-${project.id}`} project={project} />);
        if (!isLast) items.push(<div key={`proj-sp-${project.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
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

    const addLanguages = () => {
      if (data.languages.length === 0) return;
      items.push(<SectionTitle key="lang-title" title="Languages" />);
      data.languages.forEach((lang, index) => {
        const isLast = index === data.languages.length - 1;
        items.push(<LanguageItem key={`lang-${lang.id}`} lang={lang} />);
        if (!isLast) items.push(<div key={`lang-sp-${lang.id}`} style={{ height: styleSettings.spaceBetweenEntriesPx }} />);
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