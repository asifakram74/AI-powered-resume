"use client"

import { Mail, Phone, MapPin, ExternalLink, Github, Calendar, Award } from "lucide-react"
import type { CVData } from "../../types/cv-data"

interface ModernTemplate2Props {
  data: CVData
  isPreview?: boolean
}

export function ModernTemplate2({ data, isPreview = false }: ModernTemplate2Props) {
const formatDate = (date: string) => {
  if (!date) return "";
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  
  // ISO patterns: YYYY-MM or YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)));
    return `${monthNames[month - 1]} ${year}`;
  }
  
  // Slash pattern: MM/YYYY
  const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date);
  if (slashMatch) {
    const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)));
    const year = slashMatch[2];
    return `${monthNames[month - 1]} ${year}`;
  }
  
  // Already formatted like "Jan 2020"
  const monTextMatch = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(date);
  if (monTextMatch) return date;
  
  // Fallback: return raw string
  return date;
};

  return (
    <div className="flex max-w-full mx-auto min-h-screen bg-gray-50 print:min-h-0 print:shadow-none">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:break-before-page {
            break-before: page;
          }
          .print\\:break-after-avoid {
            break-after: avoid;
          }
        }
      `}</style>

      <div className="w-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-8 py-12">
            <div className="flex flex-col lg:flex-row items-start gap-8">
              {data.personalInfo.profilePicture && (
                <img
                  src={data.personalInfo.profilePicture || "/placeholder.svg"}
                  alt={data.personalInfo.fullName}
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                />
              )}
              <div className="flex-1">
                <h1 className="text-5xl font-bold text-gray-900 mb-3">{data.personalInfo.fullName}</h1>
                <h2 className="text-2xl text-indigo-600 font-semibold mb-6">{data.personalInfo.jobTitle}</h2>
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{data.personalInfo.summary}</p>
              </div>
              <div className="flex flex-col gap-3 text-gray-600">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span>{data.personalInfo.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <span>{data.personalInfo.phone}</span>
                </div>
                {(data.personalInfo.city || data.personalInfo.country) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-indigo-600 mt-0.5" />
                    <div>
                      {(data.personalInfo.city || data.personalInfo.country) && (
                        <div>
                          {data.personalInfo.city && data.personalInfo.country
                            ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                            : data.personalInfo.city || data.personalInfo.country}
                        </div>
                      )}
                     
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-8">
              {/* Skills */}
              <div className="bg-white rounded-xl p-6 shadow-sm border print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                  Skills
                </h3>
                {data.skills.technical.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Technical</h4>
                    <div className="space-y-2">
                      {data.skills.technical.map((skill, index) => (
                        <div
                          key={index}
                          className="bg-indigo-50 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium"
                        >
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.skills.soft.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Soft Skills</h4>
                    <div className="space-y-2">
                      {data.skills.soft.map((skill, index) => (
                        <div key={index} className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Languages */}
              {data.languages.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm border print:break-inside-avoid">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    Languages
                  </h3>
                  <div className="space-y-4">
                    {data.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between items-center">
                        <span className="text-gray-900 font-medium">{lang.name}</span>
                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              <div className="bg-white rounded-xl p-6 shadow-sm border print:break-inside-avoid">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  Education
                </h3>
                <div className="space-y-6">
                  {data.education.map((edu) => (
                    <div key={edu.id}>
                      <h4 className="font-semibold text-gray-900 mb-1">{edu.degree}</h4>
                      <p className="text-purple-600 font-medium mb-1">{edu.institutionName}</p>
                      {edu.location && <p className="text-gray-500 text-sm mb-1">{edu.location}</p>}
                      {edu.graduationDate && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(edu.graduationDate)}</span>
                        </div>
                      )}
                      {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                      {edu.honors && <p className="text-purple-600 text-sm font-medium">{edu.honors}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Experience */}
              <div className="bg-white rounded-xl p-8 shadow-sm border print:break-inside-avoid">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                  Professional Experience
                </h3>
                <div className="space-y-8">
                  {data.experience.map((exp) => (
                    <div key={exp.id} className="relative pl-8">
                      <div className="absolute left-0 top-0 w-1 h-full bg-indigo-100 rounded-full"></div>
                      <div className="absolute left-0 top-2 w-3 h-3 bg-indigo-600 rounded-full -ml-1"></div>

                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{exp.jobTitle}</h4>
                          <p className="text-indigo-600 font-semibold text-lg">{exp.companyName}</p>
                          {exp.location && <p className="text-gray-500">{exp.location}</p>}
                        </div>
                        <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                          <span className="text-indigo-700 font-medium text-sm">
                            {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>

                      <ul className="text-gray-700 space-y-2 leading-relaxed">
                        {exp.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
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
                <div className="bg-white rounded-xl p-8 shadow-sm border print:break-inside-avoid">
                  <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                    Featured Projects
                  </h3>
                  <div className="grid gap-6">
                    {data.projects.map((project) => (
                      <div
                        key={project.id}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h4>
                            <p className="text-green-600 font-semibold">{project.role}</p>
                          </div>
                          <div className="flex gap-3">
                            {project.liveDemoLink && (
                              <a
                                href={project.liveDemoLink}
                                className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            )}
                            {project.githubLink && (
                              <a
                                href={project.githubLink}
                                className="bg-gray-100 text-gray-600 p-2 rounded-lg hover:bg-gray-200 transition-colors"
                              >
                                <Github className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-700 mb-4 leading-relaxed">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
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

              {/* Certifications & Interests */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Certifications */}
                {data.certifications.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border print:break-inside-avoid">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      Certifications
                    </h3>
                    <div className="space-y-4">
                      {data.certifications.map((cert) => (
                        <div key={cert.id} className="border-l-4 border-yellow-400 pl-4">
                          <h4 className="font-bold text-gray-900 mb-1">{cert.title}</h4>
                          <p className="text-yellow-600 font-medium">{cert.issuingOrganization}</p>
                          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                            <Award className="w-4 h-4" />
                            <span>{formatDate(cert.dateObtained)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {data.additional.interests.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border print:break-inside-avoid">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-600 rounded-full"></div>
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {data.additional.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="bg-pink-50 text-pink-700 px-4 py-2 rounded-full font-medium border border-pink-200"
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
      </div>
    </div>
  )
}
