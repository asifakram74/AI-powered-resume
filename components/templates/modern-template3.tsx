"use client"

import { Mail, Phone, MapPin, ExternalLink, Github, Calendar, Award, Briefcase } from "lucide-react"
import type { CVData } from "@/types/cv-data"

interface ModernTemplate3Props {
  data: CVData
  isPreview?: boolean
}

export function ModernTemplate3({ data, isPreview = false }: ModernTemplate3Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    return `${month}/${year}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Floating Header Card */}
      <div className="pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-8">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12">
              <div className="flex flex-col lg:flex-row items-center gap-8 text-white">
                {data.personalInfo.profilePicture && (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-lg"></div>
                    <img
                      src={data.personalInfo.profilePicture || "/placeholder.svg"}
                      alt={data.personalInfo.fullName}
                      className="relative w-40 h-40 rounded-full object-cover border-4 border-white/30 shadow-2xl"
                    />
                  </div>
                )}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-5xl font-bold mb-4">{data.personalInfo.fullName}</h1>
                  <h2 className="text-2xl font-light mb-6 text-blue-100">{data.personalInfo.jobTitle}</h2>
                  <p className="text-lg leading-relaxed text-blue-50 max-w-2xl">{data.personalInfo.summary}</p>
                </div>
              </div>
            </div>

            {/* Contact Bar */}
            <div className="bg-slate-800 px-8 py-6">
              <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-slate-300">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>{data.personalInfo.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <span>{data.personalInfo.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span>
                    {data.personalInfo.city}, {data.personalInfo.country}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Skills Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Skills</h3>
              </div>

              {data.skills.technical.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
                    Technical Skills
                  </h4>
                  <div className="space-y-3">
                    {data.skills.technical.map((skill, index) => (
                      <div key={index} className="relative">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm">
                          {skill}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.skills.soft.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">Soft Skills</h4>
                  <div className="space-y-3">
                    {data.skills.soft.map((skill, index) => (
                      <div key={index} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Languages Card */}
            {data.languages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Languages</h3>
                <div className="space-y-4">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-900 font-medium">{lang.name}</span>
                      <span className="text-blue-600 bg-blue-100 px-3 py-1 rounded-full text-sm font-semibold">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Education</h3>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id} className="border-l-4 border-indigo-400 pl-4">
                    <h4 className="font-bold text-slate-900 mb-1">{edu.degree}</h4>
                    <p className="text-indigo-600 font-semibold mb-1">{edu.institutionName}</p>
                    {edu.location && <p className="text-slate-500 text-sm mb-1">{edu.location}</p>}
                    {edu.graduationDate && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(edu.graduationDate)}</span>
                      </div>
                    )}
                    {edu.gpa && <p className="text-slate-500 text-sm">GPA: {edu.gpa}</p>}
                    {edu.honors && <p className="text-indigo-600 text-sm font-medium">{edu.honors}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-8">Professional Experience</h3>
              <div className="space-y-8">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    {index !== data.experience.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-full bg-slate-200"></div>
                    )}
                    <div className="flex gap-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                          <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-1">{exp.jobTitle}</h4>
                            <p className="text-blue-600 font-semibold text-lg">{exp.companyName}</p>
                            {exp.location && <p className="text-slate-500">{exp.location}</p>}
                          </div>
                          <div className="bg-slate-100 px-4 py-2 rounded-lg">
                            <span className="text-slate-700 font-medium text-sm">
                              {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                            </span>
                          </div>
                        </div>
                        <ul className="text-slate-700 space-y-2 leading-relaxed">
                          {exp.responsibilities.map((resp, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects Card */}
            {data.projects.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-8">Featured Projects</h3>
                <div className="grid gap-6">
                  {data.projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 border border-slate-200"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 mb-1">{project.name}</h4>
                          <p className="text-blue-600 font-semibold">{project.role}</p>
                        </div>
                        <div className="flex gap-3">
                          {project.liveDemoLink && (
                            <a
                              href={project.liveDemoLink}
                              className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              className="bg-slate-700 text-white p-3 rounded-lg hover:bg-slate-800 transition-colors shadow-md"
                            >
                              <Github className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-700 mb-4 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-white text-slate-700 px-3 py-1 rounded-full text-sm font-medium border border-slate-200 shadow-sm"
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

            {/* Bottom Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Certifications */}
              {data.certifications.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">Certifications</h3>
                  </div>
                  <div className="space-y-4">
                    {data.certifications.map((cert) => (
                      <div key={cert.id} className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h4 className="font-bold text-slate-900 mb-1">{cert.title}</h4>
                        <p className="text-yellow-700 font-medium">{cert.issuingOrganization}</p>
                        <p className="text-slate-500 text-sm">{formatDate(cert.dateObtained)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {data.additional.interests.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Interests</h3>
                  <div className="flex flex-wrap gap-3">
                    {data.additional.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 px-4 py-2 rounded-full font-medium border border-blue-200"
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
  )
}
