"use client"

import type { CVData } from "../../types/cv-data"
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Github,
  Award,
  Calendar,
  GraduationCap,
  Briefcase,
  Globe,
  Heart,
  Star,
} from "lucide-react"

interface CreativeTemplate2Props {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate2({ data, isPreview = false }: CreativeTemplate2Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Floating Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-white/10 rounded-full"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-8 py-16 text-white">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {data.personalInfo.profilePicture && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full blur-lg opacity-50"></div>
                <img
                  src={data.personalInfo.profilePicture || "/placeholder.svg"}
                  alt={data.personalInfo.fullName}
                  className="relative w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl"
                />
              </div>
            )}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-200 to-white bg-clip-text text-transparent">
                {data.personalInfo.fullName}
              </h1>
              <h2 className="text-2xl lg:text-3xl font-light mb-6 text-purple-100">{data.personalInfo.jobTitle}</h2>
              <p className="text-lg leading-relaxed text-purple-50 max-w-2xl">{data.personalInfo.summary}</p>
            </div>
            <div className="flex flex-col gap-4 text-purple-100">
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
                <Mail className="w-5 h-5" />
                <span>{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
                <Phone className="w-5 h-5" />
                <span>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2">
                <MapPin className="w-5 h-5" />
                <span>
                  {data.personalInfo.city}, {data.personalInfo.country}
                </span>
              </div>
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
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Skills</h3>
              </div>
              {data.skills.technical.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-3">Technical</h4>
                  <div className="space-y-2">
                    {data.skills.technical.map((skill, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg px-3 py-2">
                        <span className="text-purple-800 font-medium text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-pink-600 uppercase tracking-wide mb-3">Soft Skills</h4>
                  <div className="space-y-2">
                    {data.skills.soft.map((skill, index) => (
                      <div key={index} className="bg-gradient-to-r from-pink-100 to-red-100 rounded-lg px-3 py-2">
                        <span className="text-pink-800 font-medium text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Languages</h3>
                </div>
                <div className="space-y-4">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center">
                      <span className="text-gray-900 font-medium">{lang.name}</span>
                      <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Education</h3>
              </div>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id} className="relative">
                    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-1">{edu.degree}</h4>
                      <p className="text-green-700 font-medium mb-1">{edu.institutionName}</p>
                      {edu.location && <p className="text-gray-600 text-sm mb-1">{edu.location}</p>}
                      {edu.graduationDate && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(edu.graduationDate)}</span>
                        </div>
                      )}
                      {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Experience */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Experience</h3>
              </div>
              <div className="space-y-8">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
                    <div className="pl-8">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{exp.jobTitle}</h4>
                          <p className="text-orange-600 font-semibold text-lg">{exp.companyName}</p>
                          {exp.location && <p className="text-gray-600">{exp.location}</p>}
                        </div>
                        <div className="bg-gradient-to-r from-orange-100 to-red-100 px-4 py-2 rounded-full">
                          <span className="text-orange-700 font-medium text-sm">
                            {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>
                      <ul className="text-gray-700 space-y-2 leading-relaxed">
                        {exp.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mt-2 flex-shrink-0"></div>
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
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-purple-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <ExternalLink className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Projects</h3>
                </div>
                <div className="grid gap-6">
                  {data.projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 mb-1">{project.name}</h4>
                          <p className="text-indigo-600 font-semibold">{project.role}</p>
                        </div>
                        <div className="flex gap-3">
                          {project.liveDemoLink && (
                            <a
                              href={project.liveDemoLink}
                              className="bg-indigo-500 text-white p-2 rounded-lg hover:bg-indigo-600 transition-colors"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              className="bg-gray-700 text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
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
                            className="bg-white text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-200"
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
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Certifications</h3>
                  </div>
                  <div className="space-y-4">
                    {data.certifications.map((cert) => (
                      <div
                        key={cert.id}
                        className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200"
                      >
                        <h4 className="font-bold text-gray-900 mb-1">{cert.title}</h4>
                        <p className="text-yellow-700 font-medium">{cert.issuingOrganization}</p>
                        <p className="text-gray-600 text-sm">{formatDate(cert.dateObtained)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {data.additional.interests.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Interests</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {data.additional.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-pink-100 to-red-100 text-pink-700 px-4 py-2 rounded-full font-medium border border-pink-200"
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
