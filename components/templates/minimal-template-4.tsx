"use client";

import { Mail, Phone, MapPin, ExternalLink, Github, Award, Globe } from "lucide-react";
import type { CVData } from "../../types/cv-data";

interface  MinimalTemplate4Props {
  data: CVData;
  isPreview?: boolean;
}

export function  MinimalTemplate4({
  data,
  isPreview = false,
}:  MinimalTemplate4Props) {
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

  return (
    <div className="flex max-w-full mx-auto min-h-screen bg-white print:min-h-0 print:shadow-none print:bg-white">
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
          .print-break-after-auto {
            break-after: auto;
          }
          .print-break-before-auto {
            break-before: auto;
          }
          
          /* Fix for sidebar background on all pages */
          .sidebar-bg {
            background: #0f172a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Ensure sidebar appears on every page */
          .sidebar-container {
            position: relative;
            background: #0f172a !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          /* Fix for page breaks */
          .main-content-section {
            break-inside: avoid;
          }
          
          /* Ensure content uses full page height */
          .page-content {
            min-height: calc(100vh - 1in);
          }
          
          /* Force colors in print */
          .print-slate-900 {
            background-color: #0f172a !important;
          }
          .print-emerald-600 {
            background-color: #059669 !important;
          }
          .print-slate-700 {
            background-color: #334155 !important;
          }
          .print-emerald-500 {
            background-color: #10b981 !important;
          }
        }
        
        /* Additional CSS for multi-page layout */
        @media print {
          .cv-container {
            display: flex;
            width: 100%;
          }
          .sidebar-print {
            width: 33.333%;
            background: #0f172a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .main-content-print {
            width: 66.667%;
          }
        }
      `}</style>

      {/* Sidebar - Professional dark theme */}
      <div className="w-1/3 bg-slate-900 text-white p-6 print:break-inside-avoid print:bg-slate-900 sidebar-container sidebar-bg print-slate-900 sidebar-print">
        <div className="space-y-4 print:space-y-3 sticky top-0">
          {/* Profile Picture with emerald accent */}
          {data.personalInfo.profilePicture && (
            <div className="text-center print-break-inside-avoid mb-4 print:mb-3">
              <div className="relative inline-block">
                <img
                  src={data.personalInfo.profilePicture || "/placeholder.svg"}
                  alt={data.personalInfo.fullName}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-emerald-400 print:border-emerald-400 print:w-20 print:h-20"
                />
                {/* Decorative element */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 print:bg-emerald-500"></div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="print-break-inside-avoid mb-4 print:mb-3">
            <h2 className="text-lg font-bold mb-2 text-emerald-400 print:text-emerald-400 print:text-base flex items-center">
              <div className="w-1 h-4 bg-emerald-500 mr-2 rounded-full"></div>
              Contact
            </h2>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center space-x-2 group">
                <Mail className="w-3 h-3 text-emerald-400 print:text-emerald-400 flex-shrink-0 group-hover:text-emerald-300 transition-colors" />
                <span className="break-all text-xs group-hover:text-emerald-50 transition-colors">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2 group">
                <Phone className="w-3 h-3 text-emerald-400 print:text-emerald-400 flex-shrink-0 group-hover:text-emerald-300 transition-colors" />
                <span className="text-xs group-hover:text-emerald-50 transition-colors">{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2 group">
                <MapPin className="w-3 h-3 text-emerald-400 print:text-emerald-400 flex-shrink-0 group-hover:text-emerald-300 transition-colors" />
                <span className="text-xs group-hover:text-emerald-50 transition-colors">
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

          {/* Skills - Professional styling */}
          <div className="print-break-inside-avoid mb-4 print:mb-3">
            <h2 className="text-lg font-bold mb-2 text-emerald-400 print:text-emerald-400 print:text-base flex items-center">
              <div className="w-1 h-4 bg-emerald-500 mr-2 rounded-full"></div>
              Skills
            </h2>
            <div className="space-y-2">
              {data.skills.technical.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1 text-xs text-emerald-200">Technical Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {data.skills.technical.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-xs print:bg-emerald-600 print-emerald-600 hover:bg-emerald-500 transition-colors cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-1 text-xs text-emerald-200">Soft Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {data.skills.soft.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-slate-700 text-white px-1.5 py-0.5 rounded text-xs print:bg-slate-700 print-slate-700 hover:bg-slate-600 transition-colors cursor-default"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Languages with proficiency bars */}
          {data.languages.length > 0 && (
            <div className="print-break-inside-avoid mb-4 print:mb-3">
              <h2 className="text-lg font-bold mb-2 text-emerald-400 print:text-emerald-400 print:text-base flex items-center">
                <div className="w-1 h-4 bg-emerald-500 mr-2 rounded-full"></div>
                Languages
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-emerald-300 print:text-emerald-300">{lang.proficiency}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-1.5">
                      <div 
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{
                          width: lang.proficiency === 'Native' ? '100%' : 
                                 lang.proficiency === 'Fluent' ? '90%' :
                                 lang.proficiency === 'Advanced' ? '80%' :
                                 lang.proficiency === 'Intermediate' ? '60%' : '40%'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education - Professional styling */}
          <div className="print-break-inside-avoid mb-4 print:mb-3">
            <h2 className="text-lg font-bold mb-2 text-emerald-400 print:text-emerald-400 print:text-base flex items-center">
              <div className="w-1 h-4 bg-emerald-500 mr-2 rounded-full"></div>
              Education
            </h2>
            <div className="space-y-2">
              {data.education.map((edu) => (
                <div key={edu.id} className="text-xs print-break-inside-avoid group hover:bg-slate-800 p-1 rounded transition-colors">
                  <h3 className="font-semibold group-hover:text-emerald-50 transition-colors">{edu.degree}</h3>
                  <p className="text-emerald-300 print:text-emerald-300 group-hover:text-emerald-200 transition-colors">{edu.institutionName}</p>
                  {edu.graduationDate && (
                    <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {formatDate(edu.graduationDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interests with icons */}
          {data.additional.interests.length > 0 && (
            <div className="print-break-inside-avoid">
              <h2 className="text-lg font-bold mb-2 text-emerald-400 print:text-emerald-400 print:text-base flex items-center">
                <div className="w-1 h-4 bg-emerald-500 mr-2 rounded-full"></div>
                Interests
              </h2>
              <div className="flex flex-wrap gap-1">
                {data.additional.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-slate-700 text-white px-1.5 py-0.5 rounded text-xs print:bg-slate-700 print-slate-700 hover:bg-emerald-600 transition-colors cursor-default group relative"
                  >
                    {interest}
                    <span className="absolute -top-1 -right-1 w-1 h-1 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Professional light theme */}
      <div className="flex-1 p-6 print:p-4 print:break-inside-avoid page-content main-content-print bg-gradient-to-br from-white to-slate-50 print:from-white print:to-white">
        <div className="space-y-4 print:space-y-3">
          {/* Header - Professional styling */}
          <div className="border-b border-emerald-200 pb-3 mb-3 print-break-inside-avoid print:border-emerald-200 main-content-section">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1 print:text-slate-900 print:text-xl">
                  {data.personalInfo.fullName}
                </h1>
                <h2 className="text-base text-emerald-600 font-medium mb-1 print:text-emerald-600 flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  {data.personalInfo.jobTitle}
                </h2>
              </div>
              {/* Professional badge */}
              <div className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-medium print:bg-emerald-100 print:text-emerald-800">
                <Globe className="w-3 h-3 inline mr-1" />
                Available
              </div>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs print:text-slate-600 mt-2 border-l-2 border-emerald-400 pl-2">
              {data.personalInfo.summary}
            </p>
          </div>

          {/* Experience - Professional timeline */}
          <div className="print-break-inside-avoid main-content-section">
            <h2 className="text-lg font-bold text-slate-900 mb-3 print:text-slate-900 flex items-center">
              <div className="w-2 h-5 bg-emerald-500 mr-2 rounded-full"></div>
              Professional Experience
            </h2>
            <div className="space-y-3">
              {data.experience.map((exp, index) => (
                <div
                  key={exp.id}
                  className="relative pl-4 print-break-inside-avoid group hover:bg-emerald-50 p-2 rounded transition-colors"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-2 w-2 h-2 bg-emerald-500 rounded-full group-hover:bg-emerald-600 transition-colors"></div>
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 print:text-slate-900 group-hover:text-emerald-900 transition-colors">
                        {exp.jobTitle}
                      </h3>
                      <p className="text-emerald-600 font-medium text-xs print:text-emerald-600 group-hover:text-emerald-700 transition-colors">
                        {exp.companyName}
                      </p>
                    </div>
                    {(formatDate(exp.startDate) || exp.current || formatDate(exp.endDate)) && (
                      <span className="text-slate-500 text-xs print:text-slate-500 whitespace-nowrap bg-slate-100 px-2 py-1 rounded-full group-hover:bg-emerald-100 transition-colors">
                        {formatDate(exp.startDate)}
                        {(formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate))) ? " - " : ""}
                        {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    )}
                  </div>
                  <ul className="text-slate-700 leading-relaxed space-y-0.5 text-xs print:text-slate-700">
                    {exp.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start group-hover:text-slate-800 transition-colors">
                        <span className="text-emerald-500 mr-1 print:text-emerald-500 flex-shrink-0">▸</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Projects - Professional cards */}
          {data.projects.length > 0 && (
            <div className="print-break-inside-avoid main-content-section">
              <h2 className="text-lg font-bold text-slate-900 mb-3 print:text-slate-900 flex items-center">
                <div className="w-2 h-5 bg-emerald-500 mr-2 rounded-full"></div>
                Key Projects
              </h2>
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="border border-emerald-200 rounded p-3 print-break-inside-avoid print:border-emerald-200 bg-white hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 print:text-slate-900 group-hover:text-emerald-900 transition-colors">
                          {project.name}
                        </h3>
                        <p className="text-emerald-600 font-medium text-xs print:text-emerald-600 group-hover:text-emerald-700 transition-colors">
                          {project.role}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        {project.liveDemoLink && (
                          <a
                            href={project.liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-500 hover:text-emerald-700 print:text-emerald-500 p-1 hover:bg-emerald-100 rounded transition-colors"
                            title="Live Demo"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-600 hover:text-slate-800 print:text-slate-600 p-1 hover:bg-slate-100 rounded transition-colors"
                            title="GitHub Repository"
                          >
                            <Github className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-700 mb-2 text-xs print:text-slate-700 group-hover:text-slate-800 transition-colors">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-xs print:bg-emerald-100 print:text-emerald-800 hover:bg-emerald-200 transition-colors cursor-default"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications with icons */}
          {data.certifications.length > 0 && (
            <div className="print-break-inside-avoid main-content-section">
              <h2 className="text-lg font-bold text-slate-900 mb-3 print:text-slate-900 flex items-center">
                <div className="w-2 h-5 bg-emerald-500 mr-2 rounded-full"></div>
                Certifications & Awards
              </h2>
              <div className="space-y-2">
                {data.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-center print-break-inside-avoid group hover:bg-emerald-50 p-2 rounded transition-colors"
                  >
                    <div className="flex items-start space-x-2">
                      <Award className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-slate-900 text-xs print:text-slate-900 group-hover:text-emerald-900 transition-colors">
                          {cert.title}
                        </h3>
                        <p className="text-slate-600 text-xs print:text-slate-600 group-hover:text-slate-700 transition-colors">
                          {cert.issuingOrganization}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-xs print:text-slate-500 bg-slate-100 px-2 py-1 rounded-full group-hover:bg-emerald-100 transition-colors">
                        {formatDate(cert.dateObtained)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}