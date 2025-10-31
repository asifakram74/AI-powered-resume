"use client";

import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react";
import type { CVData } from "../../types/cv-data";

interface ModernTemplateProps {
  data: CVData;
  isPreview?: boolean;
}

export function ModernTemplate({
  data,
  isPreview = false,
}: ModernTemplateProps) {
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
          @page {
            size: A4;
            margin: 0.5in;
          }
          @page :first {
            margin-top: 0.5in;
            margin-bottom: 0.3in; /* Reduced bottom margin on first page */
          }
          @page :not(:first) {
            margin-top: 0.5in;
            margin-bottom: 0.5in;
          }
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
          .sidebar-container {
            height: fit-content !important;
            min-height: auto !important;
            background: #1e293b !important; /* Force sidebar color on all pages */
          }
          /* Fix for page breaks */
          .main-content-section {
            break-inside: avoid;
          }
          /* Ensure content uses full page height */
          .page-content {
            min-height: calc(100vh - 1in);
          }
          /* Force sidebar background color on all pages */
          .sidebar-bg {
            background: #1e293b !important;
          }
        }
      `}</style>

      {/* Sidebar - Made more compact */}
      <div className="w-1/3 bg-slate-800 text-white p-6 print:break-inside-avoid print:bg-slate-800 sidebar-container sidebar-bg">
        <div className="space-y-4 print:space-y-3"> {/* Reduced spacing for print */}
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

          {/* Skills - Made more compact */}
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
                        className="bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs print:bg-blue-600"
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
                        className="bg-slate-600 text-white px-1.5 py-0.5 rounded text-xs print:bg-slate-600"
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

          {/* Education - Made more compact */}
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
                    className="bg-slate-600 text-white px-1.5 py-0.5 rounded text-xs print:bg-slate-600"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Adjusted spacing */}
      <div className="flex-1 p-6 print:p-4 print:break-inside-avoid page-content">
        <div className="space-y-4 print:space-y-3"> {/* Reduced spacing */}
          {/* Header - Made more compact */}
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

          {/* Experience - Made more compact */}
          <div className="print-break-inside-avoid main-content-section">
            <h2 className="text-lg font-bold text-gray-900 mb-3 print:text-gray-900">Experience</h2>
            <div className="space-y-3">
              {data.experience.map((exp, index) => (
                <div
                  key={exp.id}
                  className="border-l-2 border-blue-500 pl-3 print-break-inside-avoid print:border-blue-500"
                >
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
              ))}
            </div>
          </div>

          {/* Projects - Made more compact */}
          {data.projects.length > 0 && (
            <div className="print-break-inside-avoid main-content-section">
              <h2 className="text-lg font-bold text-gray-900 mb-3 print:text-gray-900">Projects</h2>
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="border rounded p-2 print-break-inside-avoid print:border-gray-300"
                  >
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
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div className="print-break-inside-avoid main-content-section">
              <h2 className="text-lg font-bold text-gray-900 mb-3 print:text-gray-900">Certifications & Awards</h2>
              <div className="space-y-1">
                {data.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-center print-break-inside-avoid"
                  >
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}