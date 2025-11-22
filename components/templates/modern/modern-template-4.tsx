"use client"

import React, { useMemo, useRef, useState, useLayoutEffect } from "react"
import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react"
import type { CVData } from "../../../types/cv-data"

interface ModernTemplate4Props {
  data: CVData
  isPreview?: boolean
}

const PAGE_HEIGHT_PX = 1123;
const PADDING_PX = 48;
const CONTENT_HEIGHT_PX = PAGE_HEIGHT_PX - PADDING_PX * 2;

export function ModernTemplate4({ data, isPreview = false }: ModernTemplate4Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<React.ReactNode[][]>([]);

  const formatDate = (date: string) => {
    if (!date) return ""
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date)
    if (isoMatch) {
      const year = isoMatch[1]
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)))
      return `${monthNames[month - 1]} ${year}`
    }

    const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date)
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)))
      const year = slashMatch[2]
      return `${monthNames[month - 1]} ${year}`
    }

    const monTextMatch = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(date)
    if (monTextMatch) return date

    return date
  }

  const Sidebar = () => (
    <div className="w-1/3 bg-gradient-to-br from-teal-600 to-teal-700 text-white p-7 print:break-inside-avoid sidebar-bg">
      <div className="space-y-6 print:space-y-5 sticky top-0">
        {/* Profile Picture */}
        {data.personalInfo.profilePicture && (
          <div className="text-center print-break-inside-avoid mb-2">
            <img
              src={data.personalInfo.profilePicture || "/placeholder.svg"}
              alt={data.personalInfo.fullName}
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white print:border-white print:w-24 print:h-24"
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="print-break-inside-avoid">
          <h2 className="text-sm font-black mb-3 text-white print:text-white uppercase tracking-wider">Contact</h2>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-white print:text-white flex-shrink-0" />
              <span className="break-all text-xs">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-white print:text-white flex-shrink-0" />
              <span className="text-xs">{data.personalInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-4 h-4 text-white print:text-white flex-shrink-0" />
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
        <div className="print-break-inside-avoid">
          <h2 className="text-sm font-black mb-3 text-white print:text-white uppercase tracking-wider">Skills</h2>
          <div className="space-y-3">
            {data.skills.technical.length > 0 && (
              <div>
                <h3 className="font-bold mb-2 text-xs text-teal-100">Technical</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-white text-teal-700 px-2 py-1 rounded text-xs font-semibold print:bg-white print:text-teal-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h3 className="font-bold mb-2 text-xs text-teal-100">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-teal-500 text-white px-2 py-1 rounded text-xs font-semibold print:bg-teal-500"
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
          <div className="print-break-inside-avoid">
            <h2 className="text-sm font-black mb-3 text-white print:text-white uppercase tracking-wider">
              Languages
            </h2>
            <div className="space-y-2">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between text-xs">
                  <span className="text-teal-100">{lang.name}</span>
                  <span className="font-bold text-white print:text-white">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        <div className="print-break-inside-avoid">
          <h2 className="text-sm font-black mb-3 text-white print:text-white uppercase tracking-wider">Education</h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="text-xs print-break-inside-avoid">
                <h3 className="font-bold text-white print-break-inside-avoid">{edu.degree}</h3>
                <p className="text-teal-100 print:text-teal-100 print-break-inside-avoid">{edu.institutionName}</p>
                {edu.graduationDate && <p className="text-teal-200">{formatDate(edu.graduationDate)}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Interests */}
        {data.additional.interests.length > 0 && (
          <div className="print-break-inside-avoid">
            <h2 className="text-sm font-black mb-3 text-white print:text-white uppercase tracking-wider">
              Interests
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.additional.interests.map((interest, index) => (
                <span
                  key={index}
                  className="bg-teal-500 text-white px-2 py-1 rounded text-xs font-semibold print:bg-teal-500"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const MainContent = ({ content }: { content: React.ReactNode }) => (
    <div className="flex-1 p-8 print:p-6 print:break-inside-avoid bg-gray-50">
      <div className="space-y-6 print:space-y-4">
        {content}
      </div>
    </div>
  )

  const HeaderSection = () => (
    <div className="pb-4 mb-6 print-break-inside-avoid">
      <h1 className="text-4xl font-black text-gray-900 mb-1 print:text-gray-900 print:text-2xl">
        {data.personalInfo.fullName}
      </h1>
      <div className="h-1 w-20 bg-gradient-to-r from-teal-500 to-teal-600 mb-3"></div>
      <h2 className="text-lg text-teal-600 font-bold mb-3 print:text-teal-600">{data.personalInfo.jobTitle}</h2>
      <p className="text-gray-700 leading-relaxed text-sm print:text-gray-700">{data.personalInfo.summary}</p>
    </div>
  )

  const ExperienceSection = () => (
    <div className="print-break-inside-avoid">
      <h2 className="text-lg font-black text-gray-900 mb-4 print:text-gray-900 uppercase tracking-wide print-break-inside-avoid">
        Experience
      </h2>
      <div className="space-y-4 print-break-inside-avoid">
        {data.experience.map((exp) => (
          <div
            key={exp.id}
            className="bg-white rounded-lg p-4 border-l-4 border-teal-500 print-break-inside-avoid print:border-teal-500"
          >
            <div className="flex justify-between items-start mb-2 print-break-inside-avoid">
              <div>
                <h3 className="text-base font-bold text-gray-900 print:text-gray-900 print-break-inside-avoid">{exp.jobTitle}</h3>
                <p className="text-teal-600 font-semibold text-sm print:text-teal-600 print-break-inside-avoid">{exp.companyName}</p>
              </div>
              {(formatDate(exp.startDate) || exp.current || formatDate(exp.endDate)) && (
                <span className="text-gray-500 text-xs print:text-gray-500 whitespace-nowrap">
                  {formatDate(exp.startDate)}
                  {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
                  {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              )}
            </div>
            <ul className="text-gray-700 leading-relaxed space-y-1 text-sm print:text-gray-700">
              {exp.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start print-break-inside-avoid">
                  <span className="text-teal-500 mr-2 print:text-teal-500">●</span>
                  <span className="print-break-inside-avoid">{resp}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )

  const ProjectsSection = () => (
    <div className="print-break-inside-avoid">
      <h2 className="text-lg font-black text-gray-900 mb-4 print:text-gray-900 uppercase tracking-wide">
        Projects
      </h2>
      <div className="space-y-4">
        {data.projects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg p-4 print-break-inside-avoid">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-sm font-bold text-gray-900 print:text-gray-900">{project.name}</h3>
                <p className="text-teal-600 font-medium text-xs print:text-teal-600">{project.role}</p>
              </div>
              <div className="flex space-x-2">
                {project.liveDemoLink && (
                  <a
                    href={project.liveDemoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-500 hover:text-teal-700 print:text-teal-500"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-800 print:text-gray-600"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            <p className="text-gray-700 mb-2 text-xs print:text-gray-700">{project.description}</p>
            <div className="flex flex-wrap gap-1">
              {project.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-xs font-semibold print:bg-teal-50 print:text-teal-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const CertificationsSection = () => (
    <div className="print-break-inside-avoid">
      <h2 className="text-lg font-black text-gray-900 mb-4 print:text-gray-900 uppercase tracking-wide">
        Certifications & Awards
      </h2>
      <div className="bg-white rounded-lg p-4 space-y-3">
        {data.certifications.map((cert) => (
          <div
            key={cert.id}
            className="flex justify-between items-center print-break-inside-avoid border-b border-gray-100 pb-3 last:pb-0 last:border-b-0"
          >
            <div>
              <h3 className="font-semibold text-gray-900 text-sm print:text-gray-900">{cert.title}</h3>
              <p className="text-gray-600 text-xs print:text-gray-600">{cert.issuingOrganization}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-500 text-xs print:text-gray-500">{formatDate(cert.dateObtained)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const TwoColumnLayout = ({ sidebar, main }: { sidebar: React.ReactNode; main: React.ReactNode }) => (
    <div className="flex min-h-[297mm] bg-white w-[210mm]">
      {sidebar}
      {main}
    </div>
  )

  const blocks = useMemo(() => {
    const items: React.ReactNode[] = [];
    
    // First page with sidebar and main content
    items.push(
      <TwoColumnLayout
        key="page-1"
        sidebar={<Sidebar />}
        main={
          <MainContent 
            content={
              <>
                <HeaderSection />
                <ExperienceSection />
              </>
            }
          />
        }
      />
    );

    // Additional pages for remaining content
    const remainingContent = [];
    
    if (data.projects.length > 0) {
      remainingContent.push(<ProjectsSection key="projects-section" />);
    }

    if (data.certifications.length > 0) {
      remainingContent.push(<CertificationsSection key="certifications-section" />);
    }

    // Add remaining content to additional pages if needed
    if (remainingContent.length > 0) {
      items.push(
        <TwoColumnLayout
          key="page-2"
          sidebar={
            <div className="w-1/3 bg-gradient-to-br from-teal-600 to-teal-700 text-white p-7 print:break-inside-avoid sidebar-bg">
              <div className="space-y-6 print:space-y-5 sticky top-0">
                <div className="text-gray-900 text-sm italic hidden">
                  Continued from previous page...
                </div>
              </div>
            </div>
          }
          main={<MainContent content={<div className="space-y-8">{remainingContent}</div>} />}
        />
      );
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
    
    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }
    
    setPages(newPages);
  }, [blocks]);

  return (
    <div className="flex flex-col items-center gap-8 pb-20 print:block print:gap-0 print:pb-0">
      {/* Hidden measurement container */}
      <div 
        ref={containerRef} 
        className="cv-measure fixed top-0 left-0 w-[210mm] p-12 opacity-0 pointer-events-none z-[-999]" 
        style={{ visibility: "hidden" }}
      >
        {blocks}
      </div>
      
      {/* Render actual pages */}
      {pages.length === 0 ? (
        <div className="w-[210mm] min-h-[297mm] bg-white">
          <TwoColumnLayout
            sidebar={<Sidebar />}
            main={
              <MainContent 
                content={
                  <>
                    <HeaderSection />
                    <ExperienceSection />
                    {data.projects.length > 0 && <ProjectsSection />}
                    {data.certifications.length > 0 && <CertificationsSection />}
                  </>
                }
              />
            }
          />
        </div>
      ) : (
        pages.map((pageContent, i) => (
          <div 
            key={i} 
            className="a4-page w-[210mm] min-h-[297mm] bg-white text-slate-900 relative print:shadow-none" 
            style={{ breakAfter: i < pages.length - 1 ? "page" : "auto" }}
          >
            {pageContent}
            {pages.length > 1 && (
              <div className="absolute bottom-4 right-12 text-[10px] text-slate-400 print:hidden">
                Page {i + 1} of {pages.length}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}