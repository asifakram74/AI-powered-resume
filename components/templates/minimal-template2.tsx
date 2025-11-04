import type { CVData } from "../../types/cv-data"

interface MinimalTemplate2Props {
  data: CVData
  isPreview?: boolean
}

export function MinimalTemplate2({ data, isPreview = false }: MinimalTemplate2Props) {
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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20"></div>
        <div className="relative max-w-5xl mx-auto px-12 py-16">
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
            {data.personalInfo.fullName}
          </h1>
          <p className="text-2xl text-indigo-300 font-light mb-6">{data.personalInfo.jobTitle}</p>

          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-indigo-400 font-semibold mb-2">EMAIL</p>
              <p className="text-slate-300 break-words">{data.personalInfo.email}</p>
            </div>
            <div>
              <p className="text-indigo-400 font-semibold mb-2">PHONE</p>
              <p className="text-slate-300">{data.personalInfo.phone}</p>
            </div>
            {(data.personalInfo.city || data.personalInfo.country) && (
              <div>
                <p className="text-indigo-400 font-semibold mb-2">LOCATION</p>
                <p className="text-slate-300">
                  {data.personalInfo.city && data.personalInfo.country
                    ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                    : data.personalInfo.city || data.personalInfo.country}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-12 py-12">
        {/* Summary */}
        <div className="mb-16 pb-12 border-b border-slate-700">
          <p className="text-lg text-slate-200 leading-relaxed font-light">{data.personalInfo.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-10 text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-12">
            {data.experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-indigo-500 pl-8">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-blue-300">{exp.jobTitle}</h3>
                    <p className="text-indigo-300 font-medium">{exp.companyName}</p>
                  </div>
                  <span className="text-sm text-slate-400">
                    {formatDate(exp.startDate)}
                    {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.location && <p className="text-sm text-slate-400 mb-3">{exp.location}</p>}
                <ul className="text-slate-300 space-y-2 ml-0">
                  {exp.responsibilities.map((resp, index) => (
                    <li key={index} className="list-disc list-inside text-sm font-light">
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-10 text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
            EDUCATION
          </h2>
          <div className="space-y-8">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-blue-300">{edu.degree}</h3>
                  <p className="text-indigo-300">{edu.institutionName}</p>
                  {edu.location && <p className="text-sm text-slate-400 font-light">{edu.location}</p>}
                  {edu.gpa && <p className="text-sm text-slate-400 font-light">GPA: {edu.gpa}</p>}
                </div>
                {edu.graduationDate && <span className="text-sm text-slate-400">{formatDate(edu.graduationDate)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-10 text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
            CORE COMPETENCIES
          </h2>
          <div className="space-y-8">
            {data.skills.technical.length > 0 && (
              <div>
                <p className="font-semibold text-blue-300 mb-4">Technical Skills</p>
                <div className="flex flex-wrap gap-3">
                  {data.skills.technical.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-indigo-900/40 border border-indigo-500/50 rounded text-slate-300 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <p className="font-semibold text-blue-300 mb-4">Professional Skills</p>
                <div className="flex flex-wrap gap-3">
                  {data.skills.soft.map((skill, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-indigo-900/40 border border-indigo-500/50 rounded text-slate-300 text-sm"
                    >
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
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-10 text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
              KEY PROJECTS
            </h2>
            <div className="space-y-8">
              {data.projects.map((project) => (
                <div key={project.id} className="bg-slate-800/50 border border-slate-700 p-6 rounded">
                  <h3 className="font-semibold text-blue-300 mb-2">{project.name}</h3>
                  <p className="text-indigo-300 text-sm mb-2">{project.role}</p>
                  <p className="text-slate-300 text-sm mb-3 font-light">{project.description}</p>
                  <p className="text-slate-400 text-xs">{project.technologies.join(" • ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages & Certifications */}
        {(data.languages.length > 0 || data.certifications.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {data.languages.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-8 text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
                  LANGUAGES
                </h2>
                <div className="space-y-4">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between">
                      <span className="text-slate-300">{lang.name}</span>
                      <span className="text-indigo-400 font-semibold">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-8 text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text">
                  CERTIFICATIONS
                </h2>
                <div className="space-y-4">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-semibold text-blue-300">{cert.title}</p>
                      <p className="text-slate-400 text-sm font-light">{cert.issuingOrganization}</p>
                      <p className="text-indigo-400 text-sm font-light">{formatDate(cert.dateObtained)}</p>
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
