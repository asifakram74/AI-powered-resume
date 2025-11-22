"use client";

import React, { useMemo, useRef, useState, useLayoutEffect } from "react";
import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react";
import type { CVData } from "../../../types/cv-data";

interface ModernTemplateProps {
  data: CVData;
  isPreview?: boolean;
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 24;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function ModernTemplate({
  data,
  isPreview = false,
}: ModernTemplateProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);

  const formatDate = (date: string) => {
    if (!date) return "";
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    
    const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)));
      return `${monthNames[month - 1]} ${year}`;
    }
    
    const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date);
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)));
      const year = slashMatch[2];
      return `${monthNames[month - 1]} ${year}`;
    }
    
    const monTextMatch = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(date);
    if (monTextMatch) return date;
    
    return date;
  };

  const Sidebar = () => (
    <div className="w-1/3 bg-slate-800 text-white p-6 print:break-inside-avoid print:bg-slate-800 sidebar-container sidebar-bg print-slate-800 sidebar-print">
      <div className="space-y-4 print:space-y-3 sticky top-0">
        {/* Profile Picture */}
        {data.personalInfo.profilePicture && (
          <div className="text-center print-break-inside-avoid mb-4 print:mb-3">
            <img
              src={data.personalInfo.profilePicture || "/placeholder.svg"}
              alt={data.personalInfo.fullName}
              className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-blue-300 print:border-blue-300 print:w-20 print:h-20"
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="print-break-inside-avoid mb-4 print:mb-3">
          <h2 className="text-lg font-bold mb-2 text-blue-300 print:text-blue-300 print:text-base">Contact</h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center space-x-2">
              <Mail className="w-3 h-3 text-blue-300 print:text-blue-300 flex-shrink-0" />
              <span className="break-all text-xs">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-3 h-3 text-blue-300 print:text-blue-300 flex-shrink-0" />
              <span className="text-xs">{data.personalInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-blue-300 print:text-blue-300 flex-shrink-0" />
              <span className="text-xs">
                {(data.personalInfo.city || data.personalInfo.country) && (
                  <span>
                    {data.personalInfo.city && data.personalInfo.country
                      ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                      : data.personalInfo.city || data.personalInfo.country}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="print-break-inside-avoid mb-4 print:mb-3">
          <h2 className="text-lg font-bold mb-2 text-blue-300 print:text-blue-300 print:text-base">Skills</h2>
          <div className="space-y-2">
            {data.skills.technical.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1 text-xs">Technical Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {data.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs print:bg-blue-600 print-blue-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h3 className="font-semibold mb-1 text-xs">Soft Skills</h3>
                <div className="flex flex-wrap gap-1">
                  {data.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-slate-600 text-white px-1.5 py-0.5 rounded text-xs print:bg-slate-600 print-slate-600"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Languages */}
        {data.languages.length > 0 && (
          <div className="print-break-inside-avoid mb-4 print:mb-3">
            <h2 className="text-lg font-bold mb-2 text-blue-300 print:text-blue-300 print:text-base">Languages</h2>
            <div className="space-y-1">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between text-xs">
                  <span>{lang.name}</span>
                  <span className="text-blue-200 print:text-blue-200">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        <div className="print-break-inside-avoid mb-4 print:mb-3">
          <h2 className="text-lg font-bold mb-2 text-blue-300 print:text-blue-300 print:text-base">Education</h2>
          <div className="space-y-2">
            {data.education.map((edu) => (
              <div key={edu.id} className="text-xs print-break-inside-avoid">
                <h3 className="font-semibold">{edu.degree}</h3>
                <p className="text-blue-200 print:text-blue-200">{edu.institutionName}</p>
                {edu.graduationDate && (
                  <p className="text-gray-400">
                    {formatDate(edu.graduationDate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        {data.additional.interests.length > 0 && (
          <div className="print-break-inside-avoid">
            <h2 className="text-lg font-bold mb-2 text-blue-300 print:text-blue-300 print:text-base">Interests</h2>
            <div className="flex flex-wrap gap-1">
              {data.additional.interests.map((interest, index) => (
                <span
                  key={index}
                  className="bg-slate-600 text-white px-1.5 py-0.5 rounded text-xs print:bg-slate-600 print-slate-600"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const MainContent = ({ content }: { content: React.ReactNode }) => (
    <div className="flex-1 p-6 print:p-4 print:break-inside-avoid page-content main-content-print">
      <div className="space-y-4 print:space-y-3">
        {content}
      </div>
    </div>
  );

  const HeaderSection = () => (
    <div className="border-b border-gray-200 pb-3 mb-3 print-break-inside-avoid print:border-gray-200 main-content-section">
      <h1 className="text-2xl font-bold text-gray-900 mb-1 print:text-gray-900 print:text-xl">
        {data.personalInfo.fullName}
      </h1>
      <h2 className="text-base text-blue-600 font-medium mb-1 print:text-blue-600">
        {data.personalInfo.jobTitle}
      </h2>
      <p className="text-gray-600 leading-relaxed text-xs print:text-gray-600">
        {data.personalInfo.summary}
      </p>
    </div>
  );

  const ExperienceItem = ({ exp }: { exp: CVData["experience"][number] }) => (
    <div className="border-l-2 border-blue-500 pl-3 print:border-blue-500">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-base font-semibold text-gray-900 print:text-gray-900">
            {exp.jobTitle}
          </h3>
          <p className="text-blue-600 font-medium text-xs print:text-blue-600">
            {exp.companyName}
          </p>
        </div>
        {(formatDate(exp.startDate) || exp.current || formatDate(exp.endDate)) && (
          <span className="text-gray-500 text-xs print:text-gray-500 whitespace-nowrap">
            {formatDate(exp.startDate)}
            {(formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate))) ? " - " : ""}
            {exp.current ? "Present" : formatDate(exp.endDate)}
          </span>
        )}
      </div>
      <ul className="text-gray-700 leading-relaxed space-y-0.5 text-xs print:text-gray-700">
        {exp.responsibilities.map((resp, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-500 mr-1 print:text-blue-500">•</span>
            <span>{resp}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const ProjectItem = ({ project }: { project: CVData["projects"][number] }) => (
    <div className="border rounded p-2 print:border-gray-300">
      <div className="flex justify-between items-start mb-1">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 print:text-gray-900">
            {project.name}
          </h3>
          <p className="text-blue-600 font-medium text-xs print:text-blue-600">
            {project.role}
          </p>
        </div>
        <div className="flex space-x-1">
          {project.liveDemoLink && (
            <a
              href={project.liveDemoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 print:text-blue-500"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-800 print:text-gray-600"
            >
              <Github className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
      <p className="text-gray-700 mb-1 text-xs print:text-gray-700">{project.description}</p>
      <div className="flex flex-wrap gap-1">
        {project.technologies.map((tech, index) => (
          <span
            key={index}
            className="bg-gray-100 text-gray-700 px-1 py-0.5 rounded text-xs print:bg-gray-100 print:text-gray-700"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );

  const CertificationItem = ({ cert }: { cert: CVData["certifications"][number] }) => (
    <div className="flex justify-between items-center">
      <div>
        <h3 className="font-semibold text-gray-900 text-xs print:text-gray-900">
          {cert.title}
        </h3>
        <p className="text-gray-600 text-xs print:text-gray-600">
          {cert.issuingOrganization}
        </p>
      </div>
      <div className="text-right">
        <span className="text-gray-500 text-xs print:text-gray-500">
          {formatDate(cert.dateObtained)}
        </span>
      </div>
    </div>
  );

  const TwoColumnLayout = ({ sidebar, main }: { sidebar: React.ReactNode; main: React.ReactNode }) => (
    <div className="flex min-h-[297mm] bg-white w-[210mm]">
      {sidebar}
      {main}
    </div>
  );

  const measureItems = useMemo(() => {
    const items: React.ReactNode[] = [];
    items.push(<HeaderSection key="header" />);
    if (data.experience.length > 0) {
      items.push(
        <div key="exp-title" className="mb-3">
          <h2 className="text-lg font-bold text-gray-900 print:text-gray-900">Experience</h2>
        </div>
      );
      data.experience.forEach((exp, idx) => {
        items.push(
          <div key={`exp-${exp.id}-${idx}`} className="mb-3">
            <ExperienceItem exp={exp} />
          </div>
        );
      });
    }
    if (data.projects.length > 0) {
      items.push(
        <div key="proj-title" className="mb-3">
          <h2 className="text-lg font-bold text-gray-900 print:text-gray-900">Projects</h2>
        </div>
      );
      data.projects.forEach((project, idx) => {
        items.push(
          <div key={`proj-${project.id}-${idx}`} className="mb-3">
            <ProjectItem project={project} />
          </div>
        );
      });
    }
    if (data.certifications.length > 0) {
      items.push(
        <div key="cert-title" className="mb-3">
          <h2 className="text-lg font-bold text-gray-900 print:text-gray-900">Certifications & Awards</h2>
        </div>
      );
      data.certifications.forEach((cert, idx) => {
        items.push(
          <div key={`cert-${cert.id}-${idx}`} className="mb-2">
            <CertificationItem cert={cert} />
          </div>
        );
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
      if (currentHeight > 0 && currentHeight + elementHeight > CONTENT_HEIGHT_PX) {
        pushPage();
      }
      currentPage.push(measureItems[index]);
      currentHeight += elementHeight;
    });
    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }
    setPages(newPages);
  }, [measureItems]);

  return (
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      {/* Hidden measurement container */}
      <div 
        ref={containerRef} 
        className="cv-measure fixed top-0 left-0 w-[140mm] p-6 opacity-0 pointer-events-none z-[-999]" 
        style={{ visibility: "hidden" }}
      >
        {measureItems}
      </div>
      
      {/* Render actual pages */}
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm] bg-white">
          <TwoColumnLayout
            sidebar={<Sidebar />}
            main={<MainContent content={<div className="space-y-4">{measureItems}</div>} />}
          />
        </div>
      ) : (
        pages.map((pageContent, i) => (
          <div 
            key={i} 
            className="a4-page w-[210mm] min-h-[297mm] bg-white text-slate-900 relative print:shadow-none" 
            style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}
          >
            <TwoColumnLayout
              sidebar={
                i === 0 ? (
                  <Sidebar />
                ) : (
                  <div className="w-1/3 bg-slate-800 text-white p-6">
                    <div className="text-slate-200 text-xs">Continued...</div>
                  </div>
                )
              }
              main={<MainContent content={<div className="space-y-4">{pageContent}</div>} />}
            />
            {pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] text-slate-400 print:hidden">
                Page {i + 1} of {pages.length}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}