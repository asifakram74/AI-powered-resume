
"use client"

import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react"
import type { CVData } from "../../../types/cv-data"

interface ClassicTemplate2Props {
  data: CVData
  isPreview?: boolean
}

export function ClassicTemplate2({ data, isPreview = false }: ClassicTemplate2Props) {
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
    <div className="w-full max-w-4xl mx-auto min-h-screen bg-white print:min-h-0 print:bg-white">
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
        }
      `}</style>

      <div className="p-8 print:p-6">
        {/* Header with accent line */}
        <div className="border-b-2 border-gray-900 pb-4 mb-6 print-break-inside-avoid">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 print:text-gray-900">{data.personalInfo.fullName}</h1>
          <h2 className="text-lg font-semibold text-gray-700 mb-3 print:text-gray-700">{data.personalInfo.jobTitle}</h2>
          <p className="text-gray-600 leading-relaxed text-sm print:text-gray-600">{data.personalInfo.summary}</p>
        </div>

        {/* Two Column Grid - Contact & Skills */}
        <div className="grid grid-cols-2 gap-6 mb-6 print:gap-4">
          {/* Contact Info */}
          <div className="print-break-inside-avoid">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 print:text-gray-900">
              Contact
            </h3>
            <div className="space-y-1 text-sm text-gray-600 print:text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                <span className="break-all text-xs">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
                <span className="text-xs">{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-gray-900 flex-shrink-0" />
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

          {/* Skills - Two columns */}
          <div className="print-break-inside-avoid">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 print:text-gray-900">Skills</h3>
            {data.skills.technical.length > 0 && (
              <div className="mb-2">
                <h4 className="text-xs font-semibold text-gray-700 mb-1 print:text-gray-700">Technical</h4>
                <div className="flex flex-wrap gap-1">
                  {data.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded print:text-gray-600 print:bg-gray-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-700 mb-1 print:text-gray-700">Soft Skills</h4>
                <div className="flex flex-wrap gap-1">
                  {data.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded print:text-gray-600 print:bg-gray-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6 print-break-inside-avoid">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 print:text-gray-900">
            Experience
          </h3>
          <div className="space-y-4">
            {data.experience.map((exp, index) => (
              <div key={exp.id} className="relative pl-6 print-break-inside-avoid">
                {/* Vertical line connector */}
                <div className="absolute left-1 top-0 w-1 h-full bg-gray-300 print:bg-gray-300"></div>
                {/* Circle bullet */}
                <div className="absolute left-0 top-1 w-3 h-3 bg-gray-900 rounded-full border-2 border-white print:bg-gray-900 print:border-white"></div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 print:text-gray-900">{exp.jobTitle}</h4>
                  <p className="text-xs font-semibold text-gray-700 print:text-gray-700">{exp.companyName}</p>
                  <p className="text-xs text-gray-500 mb-1 print:text-gray-500">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </p>
                  <ul className="text-xs text-gray-600 space-y-0.5 print:text-gray-600">
                    {exp.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">—</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-6 print-break-inside-avoid">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 print:text-gray-900">
              Projects
            </h3>
            <div className="space-y-3">
              {data.projects.map((project) => (
                <div key={project.id} className="print-break-inside-avoid">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 print:text-gray-900">{project.name}</h4>
                      <p className="text-xs font-semibold text-gray-700 print:text-gray-700">{project.role}</p>
                    </div>
                    <div className="flex space-x-1">
                      {project.liveDemoLink && (
                        <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 text-gray-600 hover:text-gray-900 print:text-gray-600" />
                        </a>
                      )}
                      {project.githubLink && (
                        <a href={project.githubLink} target="_blank" rel="noopener noreferrer">
                          <Github className="w-3 h-3 text-gray-600 hover:text-gray-900 print:text-gray-600" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-1 print:text-gray-600">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded print:bg-gray-100 print:text-gray-700"
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

        {/* Education & Certifications */}
        <div className="grid grid-cols-2 gap-6 print:gap-4">
          {data.education.length > 0 && (
            <div className="print-break-inside-avoid">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 print:text-gray-900">
                Education
              </h3>
              <div className="space-y-2">
                {data.education.map((edu) => (
                  <div key={edu.id} className="print-break-inside-avoid">
                    <h4 className="text-xs font-bold text-gray-900 print:text-gray-900">{edu.degree}</h4>
                    <p className="text-xs text-gray-700 print:text-gray-700">{edu.institutionName}</p>
                    <p className="text-xs text-gray-500 print:text-gray-500">{formatDate(edu.graduationDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.certifications.length > 0 && (
            <div className="print-break-inside-avoid">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 print:text-gray-900">
                Certifications
              </h3>
              <div className="space-y-2">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="print-break-inside-avoid">
                    <h4 className="text-xs font-bold text-gray-900 print:text-gray-900">{cert.title}</h4>
                    <p className="text-xs text-gray-700 print:text-gray-700">{cert.issuingOrganization}</p>
                    <p className="text-xs text-gray-500 print:text-gray-500">{formatDate(cert.dateObtained)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Languages & Interests */}
        {(data.languages.length > 0 || data.additional.interests.length > 0) && (
          <div className="mt-6 grid grid-cols-2 gap-6 print:gap-4">
            {data.languages.length > 0 && (
              <div className="print-break-inside-avoid">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 print:text-gray-900">
                  Languages
                </h3>
                <div className="space-y-1">
                  {data.languages.map((lang) => (
                    <p key={lang.id} className="text-xs text-gray-600 print:text-gray-600">
                      <span className="font-semibold text-gray-900 print:text-gray-900">{lang.name}</span> —{" "}
                      {lang.proficiency}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {data.additional.interests.length > 0 && (
              <div className="print-break-inside-avoid">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2 print:text-gray-900">
                  Interests
                </h3>
                <div className="flex flex-wrap gap-1">
                  {data.additional.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded print:bg-gray-100 print:text-gray-700"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}




