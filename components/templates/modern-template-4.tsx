import type { CVData } from "../../types/cv-data"

interface ModernTemplate4Props {
  data: CVData
  isPreview?: boolean
}

export function ModernTemplate4({ data, isPreview = false }: ModernTemplate4Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="max-w-5xl mx-auto bg-gray-50 min-h-screen font-sans">
      {/* Modern floating header */}
      <div className="relative pt-16 pb-12">
        <div className="bg-white rounded-3xl shadow-2xl mx-8 p-12 relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">{data.personalInfo.fullName}</h1>
            <div className="flex items-center justify-center space-x-4 mb-8">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent"></div>
              <h2 className="text-xl text-gray-600 font-medium">{data.personalInfo.jobTitle}</h2>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
            </div>

            <div className="flex justify-center items-center space-x-8 text-gray-600">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm font-medium">{data.personalInfo.phone}</span>
              </div>
              {(data.personalInfo.city || data.personalInfo.country || data.personalInfo.address) && (
                <div className="flex items-start space-x-2 bg-gray-100 rounded-full px-4 py-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-1"></div>
                  <div className="text-sm font-medium">
                    {(data.personalInfo.city || data.personalInfo.country) && (
                      <div>
                        {data.personalInfo.city && data.personalInfo.country
                          ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                          : data.personalInfo.city || data.personalInfo.country}
                      </div>
                    )}
                    {data.personalInfo.address && (
                      <div className={`text-xs ${(data.personalInfo.city || data.personalInfo.country) ? 'mt-1' : ''}`}>
                        {data.personalInfo.address}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div className="mx-8 mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed text-center max-w-4xl mx-auto text-lg">
            {data.personalInfo.summary}
          </p>
        </div>
      </div>

      {/* Main content grid */}
      <div className="mx-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Skills card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full mr-3"></div>
              Skills
            </h2>
            {data.skills.technical.length > 0 && (
              <div className="mb-6">
                <h3 className="text-blue-600 font-semibold mb-3 text-sm uppercase tracking-wide">Technical</h3>
                <div className="space-y-2">
                  {data.skills.technical.map((skill, index) => (
                    <div key={index} className="bg-blue-50 rounded-lg px-3 py-2">
                      <span className="text-gray-700 text-sm font-medium">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h3 className="text-purple-600 font-semibold mb-3 text-sm uppercase tracking-wide">Leadership</h3>
                <div className="space-y-2">
                  {data.skills.soft.map((skill, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg px-3 py-2">
                      <span className="text-gray-700 text-sm font-medium">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Education card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-teal-400 rounded-full mr-3"></div>
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{edu.degree}</h3>
                  <p className="text-green-600 font-medium text-sm mb-1">{edu.institutionName}</p>
                  {edu.graduationDate && <p className="text-gray-500 text-xs">{formatDate(edu.graduationDate)}</p>}
                  {edu.gpa && <p className="text-gray-500 text-xs">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Languages & Certifications */}
          {(data.languages.length > 0 || data.certifications.length > 0) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {data.languages.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-red-400 rounded-full mr-3"></div>
                    Languages
                  </h2>
                  <div className="space-y-3">
                    {data.languages.map((lang) => (
                      <div
                        key={lang.id}
                        className="flex justify-between items-center bg-orange-50 rounded-lg px-3 py-2"
                      >
                        <span className="text-gray-900 font-medium text-sm">{lang.name}</span>
                        <span className="text-orange-600 text-xs font-medium bg-orange-100 px-2 py-1 rounded">
                          {lang.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.certifications.length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <div className="w-1 h-6 bg-gradient-to-b from-pink-400 to-rose-400 rounded-full mr-3"></div>
                    Certifications
                  </h2>
                  <div className="space-y-3">
                    {data.certifications.map((cert) => (
                      <div key={cert.id} className="bg-pink-50 rounded-lg p-3">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{cert.title}</h3>
                        <p className="text-pink-600 text-xs font-medium">{cert.issuingOrganization}</p>
                        <p className="text-gray-500 text-xs">{formatDate(cert.dateObtained)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Experience */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
              Professional Experience
            </h2>
            <div className="space-y-8">
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="relative">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border-l-4 border-blue-400">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{exp.jobTitle}</h3>
                        <p className="text-blue-600 font-semibold text-lg">{exp.companyName}</p>
                        {exp.location && <p className="text-gray-500 text-sm">{exp.location}</p>}
                      </div>
                      <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-200">
                        <span className="text-gray-600 text-sm font-medium">
                          {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {exp.responsibilities.map((resp, respIndex) => (
                        <li key={respIndex} className="flex items-start">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                          <span className="text-gray-700 leading-relaxed">{resp}</span>
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
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-4"></div>
                Featured Projects
              </h2>
              <div className="grid gap-6">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-6 border-l-4 border-green-400"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{project.name}</h3>
                    <p className="text-green-600 font-semibold text-sm mb-3">{project.role}</p>
                    <p className="text-gray-700 leading-relaxed mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-white border border-green-200 px-3 py-1 rounded-full text-xs text-green-700 font-medium"
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
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-4"></div>
                Personal Interests
              </h2>
              <div className="flex flex-wrap gap-3">
                {data.additional.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 px-4 py-2 rounded-full text-sm text-purple-700 font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="h-16"></div>
    </div>
  )
}
