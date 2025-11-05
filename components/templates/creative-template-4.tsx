import type { CVData } from "../../types/cv-data"

interface CreativeTemplate4Props {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate4({ data, isPreview = false }: CreativeTemplate4Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const s = date.trim()
    if (!s) return ""

    const normalized = s.replace(/[\u2012-\u2015\u2212]/g, "-")

    if (/^\d{4}$/.test(normalized)) return normalized

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    const isoMatch = normalized.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/)
    if (isoMatch) {
      const year = isoMatch[1]
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)))
      return `${monthNames[month - 1]} ${year}`
    }

    const slashMatch = normalized.match(/^(\d{1,2})\/(\d{4})$/)
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)))
      const year = slashMatch[2]
      return `${monthNames[month - 1]} ${year}`
    }

    if (/^([A-Za-z]{3,9})\s+\d{4}$/.test(normalized)) return normalized

    return normalized
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-lg p-10 mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
              <p className="text-xl text-indigo-600 font-semibold">{data.personalInfo.jobTitle}</p>
            </div>
          </div>
          <div className="flex gap-6 flex-wrap text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-indigo-600">✉</span>
              <span className="text-sm">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600">📱</span>
              <span className="text-sm">{data.personalInfo.phone}</span>
            </div>
            {data.personalInfo.city && data.personalInfo.country && (
              <div className="flex items-center gap-2">
                <span className="text-indigo-600">📍</span>
                <span className="text-sm">
                  {data.personalInfo.city}, {data.personalInfo.country}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </div>

        {/* Experience & Education Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Experience */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Experience</h2>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-indigo-600 font-medium">{exp.companyName}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                      {formatDate(exp.startDate)}
                      {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
                      {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.location && <p className="text-sm text-gray-600 mb-3">{exp.location}</p>}
                  <ul className="space-y-1">
                    {exp.responsibilities.map((resp, index) => (
                      <li key={index} className="text-sm text-gray-700 list-disc list-inside">
                        {resp}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="font-semibold text-gray-900 mb-1">{edu.degree}</h3>
                  <p className="text-indigo-600 font-medium text-sm mb-2">{edu.institutionName}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{edu.location}</span>
                    <span>{formatDate(edu.graduationDate)}</span>
                  </div>
                  {edu.gpa && <p className="text-xs text-gray-600 mt-2">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills</h2>
          <div className="space-y-6">
            {data.skills.technical.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technical</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, i) => (
                    <span key={i} className="bg-slate-200 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.projects.map((project) => (
                <div key={project.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                  <h3 className="font-semibold text-gray-900 mb-2">{project.name}</h3>
                  <p className="text-indigo-600 text-sm font-medium mb-2">{project.role}</p>
                  <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                  <p className="text-xs text-gray-500">{project.technologies.join(" • ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages & Certifications */}
        {(data.languages.length > 0 || data.certifications.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {data.languages.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Languages</h2>
                <div className="space-y-3">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-900">{lang.name}</span>
                      <span className="text-indigo-600 font-medium text-sm">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Certifications</h2>
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="pb-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-900 text-sm">{cert.title}</p>
                      <p className="text-gray-600 text-xs">{cert.issuingOrganization}</p>
                      <p className="text-indigo-600 text-xs mt-1">{formatDate(cert.dateObtained)}</p>
                    </div>
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
