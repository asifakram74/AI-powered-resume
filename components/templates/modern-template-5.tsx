"use client";

import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react";
import type { CVData } from "../../types/cv-data";

interface ModernTemplate5Props {
  data: CVData;
  isPreview?: boolean;
}

export function ModernTemplate5({
  data,
  isPreview = false,
}: ModernTemplate5Props) {
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
    <div className="bg-white min-h-screen" style={{fontFamily: 'Arial, sans-serif'}}>
      {/* Print Styles */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 0.3in;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>

      {/* Main Container */}
      <div className="flex">
        {/* Left Sidebar - Fixed width with reduced padding */}
        <div className="w-1/3 bg-gray-100 text-gray-800 p-6 print-break-inside-avoid">
          {/* Add top space inside the sidebar content */}
          <div className="pt-6 space-y-6">
            {/* Profile Picture */}
            {data.personalInfo.profilePicture && (
              <div className="text-center">
                <img
                  src={data.personalInfo.profilePicture || "/placeholder.svg"}
                  alt={data.personalInfo.fullName}
                  className="w-28 h-28 rounded-full mx-auto object-cover border-4 border-gray-300"
                />
              </div>
            )}

            {/* Name */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {data.personalInfo.fullName}
              </h1>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-lg font-bold mb-3 text-gray-700">CONTACT</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-600" />
                  <span>{data.personalInfo.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-600" />
                  <span className="break-all">{data.personalInfo.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <span>
                    {data.personalInfo.city} {data.personalInfo.country}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-lg font-bold mb-3 text-gray-700">SKILLS</h2>
              <div className="space-y-1">
                {data.skills.technical.map((skill, index) => (
                  <div key={index} className="text-xs">
                    <span className="text-gray-800">• {skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Languages */}
            {data.languages.length > 0 && (
              <div>
                <h2 className="text-lg font-bold mb-3 text-gray-700">LANGUAGES</h2>
                <div className="space-y-1">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-800">{lang.name}</span>
                        <span className="text-gray-600">{lang.proficiency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div>
              <h2 className="text-lg font-bold mb-3 text-gray-700">EDUCATION</h2>
              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institutionName}</p>
                    {edu.graduationDate && (
                      <p className="text-gray-500 text-xs">
                        {formatDate(edu.graduationDate)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content - Reduced padding */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="print-break-inside-avoid">
              <div className="flex items-center mb-3">
                <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">👤</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">PROFILE</h2>
              </div>
              <div className="border-b-2 border-gray-300 mb-3"></div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {data.personalInfo.summary}
              </p>
            </div>

            {/* Work Experience */}
            <div className="print-break-inside-avoid">
              <div className="flex items-center mb-3">
                <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center mr-2">
                  <span className="text-white text-xs font-bold">💼</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">WORK EXPERIENCE</h2>
              </div>
              <div className="border-b-2 border-gray-300 mb-4"></div>
              <div className="space-y-4">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="print-break-inside-avoid">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">
                          {exp.jobTitle} - {exp.companyName}
                        </h3>
                        {exp.location && (
                          <p className="text-gray-600 text-xs">{exp.location}</p>
                        )}
                      </div>
                      <span className="text-gray-600 text-xs font-medium">
                        {formatDate(exp.startDate)} -{" "}
                        {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <ul className="text-gray-700 leading-relaxed space-y-0.5 ml-3 text-sm">
                      {exp.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-gray-500 mr-1">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            {data.projects.length > 0 && (
              <div className="print-break-inside-avoid">
                <div className="flex items-center mb-3">
                  <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">🚀</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">PROJECTS</h2>
                </div>
                <div className="border-b-2 border-gray-300 mb-4"></div>
                <div className="space-y-4">
                  {data.projects.map((project) => (
                    <div key={project.id} className="print-break-inside-avoid">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-base font-bold text-gray-900">
                            {project.name}
                          </h3>
                          <p className="text-gray-600 font-medium text-sm">
                            {project.role}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          {project.liveDemoLink && (
                            <a
                              href={project.liveDemoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800 print:hidden"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-800 print:hidden"
                            >
                              <Github className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <ul className="text-gray-700 leading-relaxed space-y-0.5 ml-3 mb-2 text-sm">
                        <li className="flex items-start">
                          <span className="text-gray-500 mr-1">•</span>
                          <span>{project.description}</span>
                        </li>
                      </ul>
                      <div className="ml-3">
                        <p className="text-xs text-gray-600 mb-1">Tech Stack:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, index) => (
                            <span key={index} className="text-xs text-gray-700">
                              {tech}{index < project.technologies.length - 1 ? ", " : ""}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interests */}
            {data.additional.interests.length > 0 && (
              <div className="print-break-inside-avoid">
                <div className="flex items-center mb-3">
                  <div className="w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center mr-2">
                    <span className="text-white text-xs font-bold">⭐</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">INTERESTS</h2>
                </div>
                <div className="border-b-2 border-gray-300 mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  {data.additional.interests.map((interest, index) => (
                    <span key={index} className="text-gray-700 text-xs">
                      • {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}