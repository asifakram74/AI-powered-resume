













import type { CVData } from "../../../types/cv-data";

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
    <div className="max-w-full mx-auto bg-white p-12 min-h-screen font-serif">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-1 tracking-wide">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-gray-600 font-light mb-6">{data.personalInfo.jobTitle}</p>
        <div className="text-sm text-gray-600 space-x-3">
          <span>{data.personalInfo.email}</span>
          <span className="text-gray-400">•</span>
          <span>{data.personalInfo.phone}</span>
          {(data.personalInfo.city || data.personalInfo.country) && (
            <>
              <span className="text-gray-400">•</span>
              <span>
                {data.personalInfo.city && data.personalInfo.country
                  ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                  : data.personalInfo.city || data.personalInfo.country}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t-2 border-gray-300 my-8"></div>

      {/* Summary */}
      <div className="mb-10">
        <p className="text-gray-700 leading-relaxed text-justify italic">"{data.personalInfo.summary}"</p>
      </div>

      {/* Experience */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6">Experience</h2>
        <div className="space-y-8">
          {data.experience.map((exp) => (
            <div key={exp.id} className="space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
                <span className="text-sm text-gray-500 font-light">
                  {formatDate(exp.startDate)}
                  {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
                  {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <p className="text-gray-700 font-medium">{exp.companyName}</p>
              {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
              <ul className="text-gray-700 space-y-2 mt-3 ml-4">
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
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6">Education</h2>
        <div className="space-y-6">
          {data.education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700">{edu.institutionName}</p>
                {edu.location && <p className="text-gray-600 text-sm">{edu.location}</p>}
                {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
              </div>
              {edu.graduationDate && (
                <span className="text-sm text-gray-500 font-light">{formatDate(edu.graduationDate)}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6">Skills</h2>
        <div className="space-y-4">
          {data.skills.technical.length > 0 && (
            <div>
              <p className="font-semibold text-gray-900 mb-2">Technical</p>
              <p className="text-gray-700 text-sm">{data.skills.technical.join(" • ")}</p>
            </div>
          )}
          {data.skills.soft.length > 0 && (
            <div>
              <p className="font-semibold text-gray-900 mb-2">Professional</p>
              <p className="text-gray-700 text-sm">{data.skills.soft.join(" • ")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6">Projects</h2>
          <div className="space-y-6">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-600 text-sm font-light mb-1">{project.role}</p>
                <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                <p className="text-gray-600 text-sm">{project.technologies.join(" • ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {data.languages.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6">Languages</h2>
          <div className="space-y-2">
            {data.languages.map((lang) => (
              <div key={lang.id} className="flex justify-between">
                <span className="text-gray-900">{lang.name}</span>
                <span className="text-gray-600 text-sm">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wider mb-6">Certifications</h2>
          <div className="space-y-3">
            {data.certifications.map((cert) => (
              <div key={cert.id}>
                <p className="font-semibold text-gray-900">{cert.title}</p>
                <p className="text-gray-600 text-sm">{cert.issuingOrganization}</p>
                <p className="text-gray-500 text-sm font-light">{formatDate(cert.dateObtained)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
