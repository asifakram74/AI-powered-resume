"use client"

import type { CVData } from "@/types/cv-data"
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
  Zap,
} from "lucide-react"

interface CreativeTemplate3Props {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate3({ data, isPreview = false }: CreativeTemplate3Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    return `${month}/${year}`
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Neon Header */}
      <div className="relative bg-black overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-20 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-pink-500/20 rounded-full blur-xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-8 py-16">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {data.personalInfo.profilePicture && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full blur-md opacity-75"></div>
                <img
                  src={data.personalInfo.profilePicture || "/placeholder.svg"}
                  alt={data.personalInfo.fullName}
                  className="relative w-48 h-48 rounded-full object-cover border-4 border-cyan-400 shadow-2xl shadow-cyan-400/50"
                />
              </div>
            )}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {data.personalInfo.fullName}
              </h1>
              <h2 className="text-3xl font-light mb-8 text-cyan-300 tracking-wide">{data.personalInfo.jobTitle}</h2>
              <p className="text-xl leading-relaxed text-gray-300 max-w-3xl">{data.personalInfo.summary}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6 mt-12">
            <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-3 border border-cyan-400/30">
              <Mail className="w-5 h-5 text-cyan-400" />
              <span className="text-gray-300">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-3 border border-purple-400/30">
              <Phone className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">{data.personalInfo.phone}</span>
            </div>
            <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-3 border border-pink-400/30">
              <MapPin className="w-5 h-5 text-pink-400" />
              <span className="text-gray-300">
                {data.personalInfo.city}, {data.personalInfo.country}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Skills */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-cyan-400/30 shadow-lg shadow-cyan-400/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-cyan-400">Skills</h3>
              </div>
              {data.skills.technical.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-4">
                    Technical Arsenal
                  </h4>
                  <div className="space-y-3">
                    {data.skills.technical.map((skill, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg px-4 py-3 border-l-4 border-cyan-400">
                        <span className="text-gray-200 font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-4">Soft Powers</h4>
                  <div className="space-y-3">
                    {data.skills.soft.map((skill, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg px-4 py-3 border-l-4 border-pink-400">
                        <span className="text-gray-200 font-medium">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Languages */}
            {data.languages.length > 0 && (
              <div className="bg-gray-800 rounded-2xl p-6 border border-purple-400/30 shadow-lg shadow-purple-400/10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <Globe className="w-6 h-6 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold text-purple-400">Languages</h3>
                </div>
                <div className="space-y-4">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center bg-gray-700 rounded-lg px-4 py-3">
                      <span className="text-gray-200 font-medium">{lang.name}</span>
                      <span className="text-purple-400 bg-gray-600 px-3 py-1 rounded-full text-sm font-bold">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-pink-400/30 shadow-lg shadow-pink-400/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-pink-400">Education</h3>
              </div>
              <div className="space-y-6">
                {data.education.map((edu) => (
                  <div key={edu.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-pink-400">
                    <h4 className="font-bold text-gray-200 mb-2">{edu.degree}</h4>
                    <p className="text-pink-400 font-medium mb-1">{edu.institutionName}</p>
                    {edu.location && <p className="text-gray-400 text-sm mb-2">{edu.location}</p>}
                    {edu.graduationDate && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(edu.graduationDate)}</span>
                      </div>
                    )}
                    {edu.gpa && <p className="text-gray-400 text-sm">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-cyan-400/30 shadow-lg shadow-cyan-400/10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-black" />
                </div>
                <h3 className="text-3xl font-bold text-cyan-400">Experience</h3>
              </div>
              <div className="space-y-8">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></div>
                    <div className="pl-8">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4 mb-4">
                        <div>
                          <h4 className="text-2xl font-bold text-gray-200 mb-2">{exp.jobTitle}</h4>
                          <p className="text-cyan-400 font-bold text-lg">{exp.companyName}</p>
                          {exp.location && <p className="text-gray-400">{exp.location}</p>}
                        </div>
                        <div className="bg-gray-700 px-4 py-2 rounded-lg border border-cyan-400/30">
                          <span className="text-cyan-400 font-bold text-sm">
                            {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>
                      <ul className="text-gray-300 space-y-3 leading-relaxed">
                        {exp.responsibilities.map((resp, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
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
              <div className="bg-gray-800 rounded-2xl p-8 border border-purple-400/30 shadow-lg shadow-purple-400/10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <ExternalLink className="w-7 h-7 text-black" />
                  </div>
                  <h3 className="text-3xl font-bold text-purple-400">Projects</h3>
                </div>
                <div className="grid gap-6">
                  {data.projects.map((project) => (
                    <div key={project.id} className="bg-gray-700 rounded-xl p-6 border border-purple-400/30">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-200 mb-2">{project.name}</h4>
                          <p className="text-purple-400 font-bold">{project.role}</p>
                        </div>
                        <div className="flex gap-3">
                          {project.liveDemoLink && (
                            <a
                              href={project.liveDemoLink}
                              className="bg-purple-500 text-black p-2 rounded-lg hover:bg-purple-400 transition-colors"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          )}
                          {project.githubLink && (
                            <a
                              href={project.githubLink}
                              className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-500 transition-colors"
                            >
                              <Github className="w-5 h-5" />
                            </a>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 mb-4 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-gray-600 text-purple-400 px-3 py-1 rounded-full text-sm font-bold border border-purple-400/30"
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

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Certifications */}
              {data.certifications.length > 0 && (
                <div className="bg-gray-800 rounded-2xl p-6 border border-yellow-400/30 shadow-lg shadow-yellow-400/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Award className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-2xl font-bold text-yellow-400">Awards</h3>
                  </div>
                  <div className="space-y-4">
                    {data.certifications.map((cert) => (
                      <div key={cert.id} className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-400">
                        <h4 className="font-bold text-gray-200 mb-1">{cert.title}</h4>
                        <p className="text-yellow-400 font-medium">{cert.issuingOrganization}</p>
                        <p className="text-gray-400 text-sm">{formatDate(cert.dateObtained)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interests */}
              {data.additional.interests.length > 0 && (
                <div className="bg-gray-800 rounded-2xl p-6 border border-pink-400/30 shadow-lg shadow-pink-400/10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-black" />
                    </div>
                    <h3 className="text-2xl font-bold text-pink-400">Interests</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {data.additional.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="bg-gray-700 text-pink-400 px-4 py-2 rounded-full font-bold border border-pink-400/30"
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
