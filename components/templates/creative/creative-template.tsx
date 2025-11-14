"use client"

import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react"
import type { CVData } from "../../../types/cv-data"

interface CreativeTemplateProps {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate({ data, isPreview = false }: CreativeTemplateProps) {
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
    <div className="w-full mx-auto min-h-screen bg-slate-50 print:min-h-0 print:bg-white">


      <div className="p-10 print:p-6 bg-white shadow-lg print:shadow-none">
        {/* Header Section */}
        <div className="mb-8 print-break-inside-avoid">
          <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-700 mb-6 rounded-full print:bg-gradient-to-r print:from-blue-600 print:to-indigo-700"></div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 mb-2 print:text-slate-800">{data.personalInfo.fullName}</h1>
              <h2 className="text-lg font-semibold text-blue-600 mb-4 print:text-blue-600">
                {data.personalInfo.jobTitle}
              </h2>
            </div>
            {data.personalInfo.profilePicture && (
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-blue-100 print:border-blue-100">
                <img
                  src={data.personalInfo.profilePicture}
                  alt={data.personalInfo.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
          <p className="text-slate-600 leading-relaxed text-sm print:text-slate-600">{data.personalInfo.summary}</p>
        </div>

        {/* Contact & Skills Row */}
        <div className="grid grid-cols-3 gap-8 mb-8 print:gap-6 pb-8 border-b border-slate-200 print:border-slate-200">
          <div className="print-break-inside-avoid">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center print:text-slate-800">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Contact
            </h3>
            <div className="space-y-2 text-sm text-slate-600 print:text-slate-600">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 print:text-blue-600" />
                <span className="break-all text-sm">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 print:text-blue-600" />
                <span className="text-sm">{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 print:text-blue-600" />
                <span className="text-sm">
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

          {data.skills.technical.length > 0 && (
            <div className="print-break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center print:text-slate-800">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Technical Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.technical.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full print:text-blue-700 print:bg-blue-50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {data.skills.soft.length > 0 && (
            <div className="print-break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center print:text-slate-800">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Soft Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {data.skills.soft.map((skill, index) => (
                  <span
                    key={index}
                    className="text-xs font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full print:text-indigo-700 print:bg-indigo-50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-8 print:gap-6">
          {/* Left Column - Experience & Projects */}
          <div className="col-span-2 space-y-8">
            {/* Experience */}
            <div className="print-break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center print:text-slate-800">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                Experience
              </h3>
              <div className="space-y-6">
                {data.experience.map((exp) => (
                  <div key={exp.id} className="print-break-inside-avoid">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-base font-bold text-slate-800 print:text-slate-800">{exp.jobTitle}</h4>
                        <p className="text-sm font-semibold text-blue-600 mb-1 print:text-blue-600">{exp.companyName}</p>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded print:text-slate-500 print:bg-slate-100">
                        {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                      </span>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1.5 print:text-slate-600">
                      {exp.responsibilities.map((resp, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-blue-500 mr-2 mt-1.5">•</span>
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
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center print:text-slate-800">
                  <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                  Projects
                </h3>
                <div className="space-y-4">
                  {data.projects.map((project) => (
                    <div key={project.id} className="print-break-inside-avoid p-4 bg-slate-50 rounded-lg print:bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-base font-bold text-slate-800 print:text-slate-800">{project.name}</h4>
                        <div className="flex space-x-2">
                          {project.liveDemoLink && (
                            <a href={project.liveDemoLink} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors print:text-slate-500">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {project.githubLink && (
                            <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition-colors print:text-slate-500">
                              <Github className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-slate-600 mb-2 print:text-slate-600">{project.role}</p>
                      <p className="text-sm text-slate-600 mb-3 print:text-slate-600">{project.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {project.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="text-xs text-slate-600 bg-white px-2 py-1 rounded print:text-slate-600 print:bg-white"
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
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {data.education.length > 0 && (
              <div className="print-break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center print:text-slate-800">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Education
                </h3>
                <div className="space-y-4">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="p-3 bg-blue-50 rounded-lg print:bg-blue-50">
                      <h4 className="text-sm font-bold text-slate-800 mb-1 print:text-slate-800">{edu.degree}</h4>
                      <p className="text-sm text-slate-600 mb-1 print:text-slate-600">{edu.institutionName}</p>
                      <p className="text-xs text-blue-600 font-medium print:text-blue-600">{formatDate(edu.graduationDate)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div className="print-break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center print:text-slate-800">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Certifications
                </h3>
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <h4 className="text-sm font-bold text-slate-800 print:text-slate-800">{cert.title}</h4>
                      <p className="text-sm text-slate-600 print:text-slate-600">{cert.issuingOrganization}</p>
                      <p className="text-xs text-blue-600 font-medium print:text-blue-600">{formatDate(cert.dateObtained)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.languages.length > 0 && (
              <div className="print-break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center print:text-slate-800">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Languages
                </h3>
                <div className="space-y-2">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-800 print:text-slate-800">{lang.name}</span>
                      <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded print:text-slate-600 print:bg-slate-100">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.additional.interests.length > 0 && (
              <div className="print-break-inside-avoid">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center print:text-slate-800">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Interests
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.additional.interests.map((interest, i) => (
                    <span
                      key={i}
                      className="text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full print:text-slate-600 print:bg-white print:border-slate-200"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}