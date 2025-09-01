import type { CVData } from "@/types/cv-data"

interface CreativeTemplate4Props {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate4({ data, isPreview = false }: CreativeTemplate4Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen font-sans text-white relative overflow-hidden">
      {/* Geometric background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute top-32 right-0 w-48 h-48 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl"></div>

      {/* Geometric shapes */}
      <div className="absolute top-20 right-20 w-16 h-16 border-2 border-cyan-400/50 rotate-45"></div>
      <div className="absolute bottom-40 left-10 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
      <div className="absolute top-1/2 left-5 w-8 h-20 bg-gradient-to-b from-emerald-400 to-teal-400 transform -rotate-12"></div>

      <div className="relative z-10 p-10">
        {/* Futuristic Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent h-px top-1/2"></div>
          <h1 className="text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {data.personalInfo.fullName.toUpperCase()}
          </h1>
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-cyan-400"></div>
            <h2 className="text-2xl font-light text-gray-300 tracking-widest">{data.personalInfo.jobTitle}</h2>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-purple-400"></div>
          </div>

          <div className="flex justify-center items-center space-x-8 text-gray-300">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
              <span className="text-sm">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
              <span className="text-sm">{data.personalInfo.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
              <span className="text-sm">
                {data.personalInfo.city}, {data.personalInfo.country}
              </span>
            </div>
          </div>
        </div>

        {/* Summary with neon glow */}
        <div className="mb-12 text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-cyan-400/30 rounded-2xl p-8 shadow-2xl shadow-cyan-400/10">
            <h2 className="text-2xl font-bold mb-6 text-cyan-400 tracking-wider">MISSION STATEMENT</h2>
            <p className="text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto">{data.personalInfo.summary}</p>
          </div>
        </div>

        {/* Two-column layout with cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left sidebar */}
          <div className="space-y-8">
            {/* Skills with progress bars */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 shadow-2xl shadow-purple-400/10">
              <h2 className="text-xl font-bold mb-6 text-purple-400 tracking-wider flex items-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                CORE SKILLS
              </h2>
              {data.skills.technical.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-cyan-300 font-semibold mb-3">Technical Expertise</h3>
                  <div className="space-y-3">
                    {data.skills.technical.slice(0, 6).map((skill, index) => (
                      <div key={index} className="relative">
                        <div className="flex justify-between mb-1">
                          <span className="text-gray-300 text-sm">{skill}</span>
                        </div>
                        <div className="w-full bg-slate-600/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full"
                            style={{ width: `${85 + index * 3}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h3 className="text-pink-300 font-semibold mb-3">Leadership Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.soft.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gradient-to-r from-pink-400/20 to-purple-400/20 border border-pink-400/30 px-3 py-1 rounded-full text-xs text-pink-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-emerald-400/30 rounded-2xl p-6 shadow-2xl shadow-emerald-400/10">
              <h2 className="text-xl font-bold mb-6 text-emerald-400 tracking-wider flex items-center">
                <div className="w-3 h-3 bg-emerald-400 rounded-full mr-3"></div>
                EDUCATION
              </h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-emerald-400/50 pl-4">
                    <h3 className="font-bold text-white text-sm">{edu.degree}</h3>
                    <p className="text-emerald-300 text-sm font-medium">{edu.institutionName}</p>
                    {edu.graduationDate && <p className="text-gray-400 text-xs">{formatDate(edu.graduationDate)}</p>}
                    {edu.gpa && <p className="text-gray-400 text-xs">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Languages & Certifications */}
            {(data.languages.length > 0 || data.certifications.length > 0) && (
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-700/60 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-6 shadow-2xl shadow-yellow-400/10">
                {data.languages.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4 text-yellow-400 tracking-wider flex items-center">
                      <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                      LANGUAGES
                    </h2>
                    <div className="space-y-2">
                      {data.languages.map((lang) => (
                        <div key={lang.id} className="flex justify-between items-center">
                          <span className="text-white text-sm font-medium">{lang.name}</span>
                          <span className="text-yellow-300 text-xs bg-yellow-400/20 px-2 py-1 rounded">
                            {lang.proficiency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.certifications.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold mb-4 text-orange-400 tracking-wider flex items-center">
                      <div className="w-3 h-3 bg-orange-400 rounded-full mr-3"></div>
                      CERTIFICATIONS
                    </h2>
                    <div className="space-y-3">
                      {data.certifications.map((cert) => (
                        <div key={cert.id} className="border-l-2 border-orange-400/50 pl-3">
                          <h3 className="font-semibold text-white text-sm">{cert.title}</h3>
                          <p className="text-orange-300 text-xs">{cert.issuingOrganization}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Experience */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent tracking-wider">
                PROFESSIONAL JOURNEY
              </h2>
              <div className="space-y-8">
                {data.experience.map((exp, index) => (
                  <div key={exp.id} className="relative">
                    <div className="flex items-start space-x-6">
                      <div className="flex-shrink-0">
                        <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
                        {index < data.experience.length - 1 && (
                          <div className="w-px h-24 bg-gradient-to-b from-cyan-400/50 to-purple-400/50 ml-2 mt-2"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-1">{exp.jobTitle}</h3>
                            <p className="text-cyan-300 font-semibold text-lg">{exp.companyName}</p>
                            {exp.location && <p className="text-gray-400 text-sm">{exp.location}</p>}
                          </div>
                          <div className="bg-gradient-to-r from-purple-400/20 to-pink-400/20 border border-purple-400/30 px-4 py-2 rounded-lg">
                            <span className="text-purple-300 text-sm font-medium">
                              {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                            </span>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {exp.responsibilities.map((resp, respIndex) => (
                            <li key={respIndex} className="flex items-start">
                              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              <span className="text-gray-300 text-sm leading-relaxed">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects */}
            {data.projects.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
                <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-wider">
                  FEATURED PROJECTS
                </h2>
                <div className="grid gap-6">
                  {data.projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-gradient-to-r from-slate-700/50 to-slate-600/50 border border-emerald-400/20 rounded-xl p-6"
                    >
                      <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                      <p className="text-emerald-300 font-semibold text-sm mb-3">{project.role}</p>
                      <p className="text-gray-300 text-sm mb-4 leading-relaxed">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-emerald-400/20 to-teal-400/20 border border-emerald-400/30 px-3 py-1 rounded-full text-xs text-emerald-300"
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

            {/* Interests */}
            {data.additional.interests.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/40 to-slate-700/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent tracking-wider">
                  PERSONAL INTERESTS
                </h2>
                <div className="flex flex-wrap gap-3 justify-center">
                  {data.additional.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="bg-gradient-to-r from-pink-400/20 to-purple-400/20 border border-pink-400/30 px-4 py-2 rounded-full text-sm text-pink-300"
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
