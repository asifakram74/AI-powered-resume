import type { CVData } from "../../../types/cv-data";

interface MinimalTemplate3Props {
  data: CVData
  isPreview?: boolean
}

export function MinimalTemplate3({ data, isPreview = false }: MinimalTemplate3Props) {
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
      {/* Header with Navy Background */}
      <div className="bg-slate-900 text-white py-12 px-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-baseline gap-4 mb-4">
            <h1 className="text-5xl font-bold">{data.personalInfo.fullName}</h1>
            <div className="w-1 h-12 bg-emerald-500"></div>
          </div>
          <p className="text-xl text-slate-300 mb-8">{data.personalInfo.jobTitle}</p>

          <div className="grid grid-cols-3 gap-8 text-sm">
            <div>
              <p className="text-emerald-400 font-semibold mb-1 uppercase text-xs">Email</p>
              <p className="text-slate-200 break-words">{data.personalInfo.email}</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold mb-1 uppercase text-xs">Phone</p>
              <p className="text-slate-200">{data.personalInfo.phone}</p>
            </div>
            {(data.personalInfo.city || data.personalInfo.country) && (
              <div>
                <p className="text-emerald-400 font-semibold mb-1 uppercase text-xs">Location</p>
                <p className="text-slate-200">
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
        <div className="mb-12 pb-12 border-b border-slate-300">
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-10 pb-4 border-b-2 border-emerald-500">
            Professional Experience
          </h2>
          <div className="space-y-10">
            {data.experience.map((exp) => (
              <div key={exp.id} className="relative pl-6">
                <div className="absolute left-0 top-2 w-3 h-3 bg-emerald-500 rounded-full"></div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{exp.jobTitle}</h3>
                    <p className="text-emerald-700 font-semibold">{exp.companyName}</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(exp.startDate)}
                    {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.location && <p className="text-sm text-gray-600 mb-3">{exp.location}</p>}
                <ul className="text-gray-700 space-y-2 ml-0">
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
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-10 pb-4 border-b-2 border-emerald-500">
            Education
          </h2>
          <div className="space-y-8">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">{edu.degree}</h3>
                  <p className="text-emerald-700 font-semibold text-sm">{edu.institutionName}</p>
                  {edu.location && <p className="text-sm text-gray-600 mt-1">{edu.location}</p>}
                  {edu.gpa && <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>}
                </div>
                {edu.graduationDate && <span className="text-sm text-gray-600">{formatDate(edu.graduationDate)}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-10 pb-4 border-b-2 border-emerald-500">
            Key Skills
          </h2>
          <div className="grid grid-cols-2 gap-8">
            {data.skills.technical.length > 0 && (
              <div>
                <p className="font-semibold text-slate-900 mb-4">Technical</p>
                <div className="space-y-2">
                  {data.skills.technical.map((skill, i) => (
                    <div key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <p className="font-semibold text-slate-900 mb-4">Professional</p>
                <div className="space-y-2">
                  {data.skills.soft.map((skill, i) => (
                    <div key={i} className="flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></span>
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-12">
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-10 pb-4 border-b-2 border-emerald-500">
              Notable Projects
            </h2>
            <div className="space-y-8">
              {data.projects.map((project) => (
                <div key={project.id} className="bg-slate-50 p-6 rounded border-l-4 border-emerald-500">
                  <h3 className="font-semibold text-slate-900">{project.name}</h3>
                  <p className="text-emerald-700 text-sm font-semibold mb-2">{project.role}</p>
                  <p className="text-gray-700 text-sm mb-3">{project.description}</p>
                  <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
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
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b-2 border-emerald-500">
                  Languages
                </h2>
                <div className="space-y-3">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between">
                      <span className="text-gray-900">{lang.name}</span>
                      <span className="text-emerald-700 font-semibold">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wider mb-6 pb-4 border-b-2 border-emerald-500">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-semibold text-slate-900">{cert.title}</p>
                      <p className="text-gray-600 text-sm">{cert.issuingOrganization}</p>
                      <p className="text-emerald-700 text-sm">{formatDate(cert.dateObtained)}</p>
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
