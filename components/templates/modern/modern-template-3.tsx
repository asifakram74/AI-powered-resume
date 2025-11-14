"use client"

import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react"
import type { CVData } from "../../../types/cv-data"

interface ModernTemplateProps {
  data: CVData
  isPreview?: boolean
}

export function ModernTemplate3({ data, isPreview = false }: ModernTemplateProps) {
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

  return (
    <div className="flex max-w-full mx-auto min-h-screen bg-white print:min-h-0 print:shadow-none print:bg-white">
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white;
          }
          // .print-break-inside-avoid {
          //   break-inside: avoid;
          // }
          .sidebar-bg {
            background: #312e81 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Sidebar - Deep indigo */}
      <div className="w-1/3 bg-indigo-900 text-white p-6 print:break-inside-avoid sidebar-bg">
        <div className="space-y-6 print:space-y-5 sticky top-0">
          {/* Profile Picture */}
          {data.personalInfo.profilePicture && (
            <div className="text-center print-break-inside-avoid mb-2">
              <img
                src={data.personalInfo.profilePicture || "/placeholder.svg"}
                alt={data.personalInfo.fullName}
                className="w-28 h-28 rounded mx-auto object-cover border-4 border-amber-400 print:border-amber-400 print:w-20 print:h-20"
              />
            </div>
          )}
          {/* Contact Info */}
          <div className="print-break-inside-avoid">
            <h2 className="text-sm font-black mb-3 text-amber-400 print:text-amber-400 uppercase">Contact</h2>
            <div className="space-y-2.5 text-sm border-b border-indigo-700 pb-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-amber-400 print:text-amber-400 flex-shrink-0" />
                <span className="break-all text-xs">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-amber-400 print:text-amber-400 flex-shrink-0" />
                <span className="text-xs">{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-amber-400 print:text-amber-400 flex-shrink-0" />
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
            <h2 className="text-sm font-black mb-3 text-amber-400 print:text-amber-400 uppercase">Skills</h2>
            <div className="space-y-3">
              {data.skills.technical.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2 text-xs text-indigo-200">Technical</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.technical.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-amber-500 text-indigo-900 px-2 py-1 rounded text-xs font-bold print:bg-amber-500 print:text-indigo-900"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2 text-xs text-indigo-200">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.soft.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-indigo-700 text-amber-200 px-2 py-1 rounded text-xs font-bold print:bg-indigo-700 print:text-amber-200"
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
              <h2 className="text-sm font-black mb-3 text-amber-400 print:text-amber-400 uppercase">Languages</h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-xs">
                    <span className="text-indigo-200">{lang.name}</span>
                    <span className="font-bold text-amber-400 print:text-amber-400">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          <div className="print-break-inside-avoid">
            <h2 className="text-sm font-black mb-3 text-amber-400 print:text-amber-400 uppercase">Education</h2>
            <div className="space-y-3">
              {data.education.map((edu) => (
                <div key={edu.id} className="text-xs print-break-inside-avoid border-l-2 border-amber-400 pl-3">
                  <h3 className="font-bold text-white">{edu.degree}</h3>
                  <p className="text-amber-200 print:text-amber-200">{edu.institutionName}</p>
                  {edu.graduationDate && <p className="text-indigo-300">{formatDate(edu.graduationDate)}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}
          {data.additional.interests.length > 0 && (
            <div className="print-break-inside-avoid">
              <h2 className="text-sm font-black mb-3 text-amber-400 print:text-amber-400 uppercase">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {data.additional.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-indigo-700 text-amber-200 px-2 py-1 rounded text-xs font-bold print:bg-indigo-700 print:text-amber-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 print:p-6 print:break-inside-avoid">
        <div className="space-y-6 print:space-y-4">
          {/* Header */}
          <div className="pb-6 mb-6 print-break-inside-avoid border-b-4 border-indigo-900">
            <h1 className="text-5xl font-black text-indigo-900 mb-2 print:text-indigo-900 print:text-3xl">
              {data.personalInfo.fullName}
            </h1>
            <h2 className="text-xl text-amber-600 font-black mb-4 print:text-amber-600">
              {data.personalInfo.jobTitle}
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm print:text-gray-700">{data.personalInfo.summary}</p>
          </div>

          {/* Experience */}
          <div className="print-break-inside-avoid">
            <h2 className="text-lg font-black text-indigo-900 mb-4 print:text-indigo-900 uppercase tracking-widest">
              Experience
            </h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="border-l-4 border-amber-500 pl-4 print-break-inside-avoid print:border-amber-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base font-black text-indigo-900 print:text-indigo-900">{exp.jobTitle}</h3>
                      <p className="text-amber-600 font-black text-sm print:text-amber-600">{exp.companyName}</p>
                    </div>
                    {(formatDate(exp.startDate) || exp.current || formatDate(exp.endDate)) && (
                      <span className="text-gray-500 text-xs print:text-gray-500 whitespace-nowrap font-semibold">
                        {formatDate(exp.startDate)}
                        {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
                        {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    )}
                  </div>
                  <ul className="text-gray-700 leading-relaxed space-y-1 text-sm print:text-gray-700">
                    {exp.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-amber-500 mr-2 print:text-amber-500 font-bold">◆</span>
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
              <h2 className="text-lg font-black text-indigo-900 mb-4 print:text-indigo-900 uppercase tracking-widest">
                Projects
              </h2>
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="border-2 border-indigo-200 rounded p-4 print-break-inside-avoid print:border-indigo-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-sm font-black text-indigo-900 print:text-indigo-900">{project.name}</h3>
                        <p className="text-amber-600 font-bold text-xs print:text-amber-600">{project.role}</p>
                      </div>
                      <div className="flex space-x-2">
                        {project.liveDemoLink && (
                          <a
                            href={project.liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-800 print:text-indigo-600"
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
                          className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded text-xs font-semibold print:bg-indigo-100 print:text-indigo-800"
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
            <div className="print-break-inside-avoid">
              <h2 className="text-lg font-black text-indigo-900 mb-4 print:text-indigo-900 uppercase tracking-widest">
                Certifications & Awards
              </h2>
              <div className="space-y-2">
                {data.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-center print-break-inside-avoid border-b-2 border-indigo-100 pb-2 last:border-b-0"
                  >
                    <div>
                      <h3 className="font-bold text-indigo-900 text-sm print:text-indigo-900">{cert.title}</h3>
                      <p className="text-gray-600 text-xs print:text-gray-600">{cert.issuingOrganization}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-600 text-xs print:text-amber-600 font-bold">
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
  )
}
