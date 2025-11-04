import type { CVData } from "../../types/cv-data"

interface ClassicTemplate3Props {
  data: CVData
  isPreview?: boolean
}

export function ClassicTemplate3({ data, isPreview = false }: ClassicTemplate3Props) {
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
    <div className="min-h-screen bg-white">
      {/* Navy Header with Gold Accent */}
      <div className="relative">
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white px-12 py-14">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end gap-4 mb-6">
              <h1 className="text-6xl font-bold tracking-tight">{data.personalInfo.fullName}</h1>
              <div className="h-16 w-1 bg-yellow-500"></div>
            </div>
            <p className="text-2xl text-zinc-300 font-light mb-10">{data.personalInfo.jobTitle}</p>

            <div className="grid grid-cols-3 gap-10 text-sm border-t border-zinc-700 pt-10">
              <div>
                <p className="text-yellow-500 font-bold uppercase tracking-wide text-xs mb-2">Email</p>
                <p className="text-zinc-200 break-words">{data.personalInfo.email}</p>
              </div>
              <div>
                <p className="text-yellow-500 font-bold uppercase tracking-wide text-xs mb-2">Phone</p>
                <p className="text-zinc-200">{data.personalInfo.phone}</p>
              </div>
              {(data.personalInfo.city || data.personalInfo.country) && (
                <div>
                  <p className="text-yellow-500 font-bold uppercase tracking-wide text-xs mb-2">Location</p>
                  <p className="text-zinc-200">
                    {data.personalInfo.city && data.personalInfo.country
                      ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                      : data.personalInfo.city || data.personalInfo.country}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-12 py-14">
        {/* Summary */}
        <div className="mb-14 pb-12 border-b-2 border-zinc-200">
          <p className="text-gray-800 leading-relaxed text-lg font-light">{data.personalInfo.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-widest mb-10 pb-4 border-b-2 border-yellow-500">
            Professional Experience
          </h2>
          <div className="space-y-12">
            {data.experience.map((exp) => (
              <div key={exp.id} className="relative">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900">{exp.jobTitle}</h3>
                    <p className="text-yellow-600 font-semibold text-lg">{exp.companyName}</p>
                  </div>
                  <span className="text-sm text-gray-600 font-semibold">
                    {formatDate(exp.startDate)}
                    {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.location && <p className="text-sm text-gray-700 mb-3 font-light">{exp.location}</p>}
                <ul className="text-gray-800 space-y-2 ml-4">
                  {exp.responsibilities.map((resp, index) => (
                    <li key={index} className="list-disc text-sm">
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-widest mb-10 pb-4 border-b-2 border-yellow-500">
            Education
          </h2>
          <div className="space-y-8">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">{edu.degree}</h3>
                  <p className="text-yellow-600 font-semibold">{edu.institutionName}</p>
                  {edu.location && <p className="text-sm text-gray-700 mt-2 font-light">{edu.location}</p>}
                  {edu.gpa && <p className="text-sm text-gray-700 font-light">GPA: {edu.gpa}</p>}
                </div>
                {edu.graduationDate && (
                  <span className="text-sm text-gray-600 font-semibold">{formatDate(edu.graduationDate)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-widest mb-10 pb-4 border-b-2 border-yellow-500">
            Core Competencies
          </h2>
          <div className="space-y-8">
            {data.skills.technical.length > 0 && (
              <div>
                <p className="font-bold text-zinc-900 mb-4">Technical Skills</p>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-yellow-100 text-zinc-900 text-sm rounded font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <p className="font-bold text-zinc-900 mb-4">Professional Skills</p>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-yellow-100 text-zinc-900 text-sm rounded font-medium">
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
          <div className="mb-14">
            <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-widest mb-10 pb-4 border-b-2 border-yellow-500">
              Key Projects
            </h2>
            <div className="space-y-8">
              {data.projects.map((project) => (
                <div key={project.id} className="bg-zinc-50 p-6 rounded-lg border-l-4 border-yellow-500">
                  <h3 className="font-bold text-zinc-900 mb-2">{project.name}</h3>
                  <p className="text-yellow-700 text-sm font-semibold mb-2">{project.role}</p>
                  <p className="text-gray-800 text-sm mb-3 font-light">{project.description}</p>
                  <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
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
                <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-widest mb-6 pb-4 border-b-2 border-yellow-500">
                  Languages
                </h2>
                <div className="space-y-3">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between">
                      <span className="text-gray-900">{lang.name}</span>
                      <span className="text-yellow-600 font-bold">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div>
                <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-widest mb-6 pb-4 border-b-2 border-yellow-500">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-bold text-zinc-900">{cert.title}</p>
                      <p className="text-gray-600 text-sm font-light">{cert.issuingOrganization}</p>
                      <p className="text-yellow-600 text-sm font-semibold">{formatDate(cert.dateObtained)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-zinc-900 text-zinc-400 py-6 px-12 text-center text-xs mt-12">
        <p>Crafted with precision | Professional CV</p>
      </div>
    </div>
  )
}
