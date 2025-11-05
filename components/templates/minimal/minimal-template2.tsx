import type { CVData } from "../../../types/cv-data";

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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-12 py-12">
          <h1 className="text-4xl font-bold mb-1 text-slate-900">
            {data.personalInfo.fullName}
          </h1>
          <p className="text-lg text-slate-700 font-medium mb-8">
            {data.personalInfo.jobTitle}
          </p>

          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-slate-600 font-semibold mb-2 uppercase tracking-wide">Email</p>
              <p className="text-slate-800 break-words">{data.personalInfo.email}</p>
            </div>
            <div>
              <p className="text-slate-600 font-semibold mb-2 uppercase tracking-wide">Phone</p>
              <p className="text-slate-800">{data.personalInfo.phone}</p>
            </div>
            {(data.personalInfo.city || data.personalInfo.country) && (
              <div>
                <p className="text-slate-600 font-semibold mb-2 uppercase tracking-wide">Location</p>
                <p className="text-slate-800">
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
        <div className="mb-12 pb-8 border-b border-slate-200">
          <p className="text-base text-slate-700 leading-relaxed">{data.personalInfo.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-slate-900">
            Professional Experience
          </h2>
          <div className="space-y-8">
            {data.experience.map((exp) => (
              <div key={exp.id} className="border-l-2 border-blue-500 pl-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{exp.jobTitle}</h3>
                    <p className="text-slate-700 font-medium">{exp.companyName}</p>
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatDate(exp.startDate)}
                    {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.location && <p className="text-sm text-slate-600 mb-3">{exp.location}</p>}
                <ul className="text-slate-700 space-y-2 ml-0">
                  {exp.responsibilities.map((resp, index) => (
                    <li key={index} className="list-disc list-inside text-sm">
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-slate-900">Education</h2>
          <div className="space-y-8">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                  <p className="text-slate-700">{edu.institutionName}</p>
                  {edu.location && <p className="text-sm text-slate-600">{edu.location}</p>}
                  {edu.gpa && <p className="text-sm text-slate-600">GPA: {edu.gpa}</p>}
                </div>
                {edu.graduationDate && <span className="text-sm text-slate-500">{formatDate(edu.graduationDate)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8 text-slate-900">Core Competencies</h2>
          <div className="space-y-8">
            {data.skills.technical.length > 0 && (
              <div>
                <p className="font-semibold text-slate-800 mb-4">Technical Skills</p>
                <div className="flex flex-wrap gap-3">
                  {data.skills.technical.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <p className="font-semibold text-slate-800 mb-4">Professional Skills</p>
                <div className="flex flex-wrap gap-3">
                  {data.skills.soft.map((skill, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm"
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
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-8 text-slate-900">Key Projects</h2>
            <div className="space-y-8">
              {data.projects.map((project) => (
                <div key={project.id} className="bg-slate-50 border border-slate-200 p-6 rounded">
                  <h3 className="font-semibold text-slate-900 mb-2">{project.name}</h3>
                  <p className="text-slate-700 text-sm mb-2">{project.role}</p>
                  <p className="text-slate-700 text-sm mb-3">{project.description}</p>
                  <p className="text-slate-600 text-xs">{project.technologies.join(" • ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages & Certifications */}
        {(data.languages.length > 0 || data.certifications.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {data.languages.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-slate-900">Languages</h2>
                <div className="space-y-3">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between">
                      <span className="text-slate-700">{lang.name}</span>
                      <span className="text-blue-700 font-semibold">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-slate-900">Certifications</h2>
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-semibold text-slate-900">{cert.title}</p>
                      <p className="text-slate-600 text-sm">{cert.issuingOrganization}</p>
                      <p className="text-blue-700 text-sm">{formatDate(cert.dateObtained)}</p>
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
