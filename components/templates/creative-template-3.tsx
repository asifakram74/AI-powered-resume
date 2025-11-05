import type { CVData } from "../../types/cv-data"

interface CreativeTemplate3Props {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate3({ data, isPreview = false }: CreativeTemplate3Props) {
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
    <div className="min-h-screen bg-stone-50">
      {/* Elegant Header */}
      <div className="bg-white border-b-2 border-stone-300 px-12 py-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-6xl font-serif text-stone-900 mb-1 font-thin">{data.personalInfo.fullName}</h1>
          <div className="h-px w-20 bg-rose-400 mb-6"></div>
          <p className="text-lg text-stone-600 font-light">{data.personalInfo.jobTitle}</p>

          <div className="grid grid-cols-3 gap-8 mt-10 text-xs">
            <div>
              <p className="text-stone-500 font-semibold uppercase tracking-wider mb-1">Email</p>
              <p className="text-stone-700 break-words">{data.personalInfo.email}</p>
            </div>
            <div>
              <p className="text-stone-500 font-semibold uppercase tracking-wider mb-1">Phone</p>
              <p className="text-stone-700">{data.personalInfo.phone}</p>
            </div>
            {(data.personalInfo.city || data.personalInfo.country) && (
              <div>
                <p className="text-stone-500 font-semibold uppercase tracking-wider mb-1">Location</p>
                <p className="text-stone-700">
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
      <div className="max-w-5xl mx-auto px-12 py-14">
        {/* Summary */}
        <div className="mb-14">
          <p className="text-stone-700 leading-relaxed font-light text-lg">{data.personalInfo.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-14">
          <h2 className="text-sm font-serif text-stone-900 uppercase tracking-widest mb-10 pb-3 border-b border-rose-300">
            Professional Experience
          </h2>
          <div className="space-y-12">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-serif text-stone-900">{exp.jobTitle}</h3>
                    <p className="text-rose-600 font-light italic">{exp.companyName}</p>
                  </div>
                  <span className="text-xs text-stone-600">
                    {formatDate(exp.startDate)}
                    {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.location && <p className="text-xs text-stone-600 mb-3 font-light">{exp.location}</p>}
                <ul className="text-stone-700 space-y-2 ml-4">
                  {exp.responsibilities.map((resp, index) => (
                    <li key={index} className="list-disc text-sm font-light">
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
          <h2 className="text-sm font-serif text-stone-900 uppercase tracking-widest mb-10 pb-3 border-b border-rose-300">
            Education
          </h2>
          <div className="space-y-8">
            {data.education.map((edu) => (
              <div key={edu.id} className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif text-stone-900">{edu.degree}</h3>
                  <p className="text-rose-600 font-light">{edu.institutionName}</p>
                  {edu.location && <p className="text-xs text-stone-600 mt-1 font-light">{edu.location}</p>}
                  {edu.gpa && <p className="text-xs text-stone-600 font-light">GPA: {edu.gpa}</p>}
                </div>
                {edu.graduationDate && (
                  <span className="text-xs text-stone-600 font-light">{formatDate(edu.graduationDate)}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="mb-14">
          <h2 className="text-sm font-serif text-stone-900 uppercase tracking-widest mb-10 pb-3 border-b border-rose-300">
            Core Competencies
          </h2>
          <div className="space-y-8">
            {data.skills.technical.length > 0 && (
              <div>
                <p className="font-serif text-stone-900 mb-3">Technical</p>
                <p className="text-stone-700 font-light text-sm">{data.skills.technical.join(" • ")}</p>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <p className="font-serif text-stone-900 mb-3">Professional</p>
                <p className="text-stone-700 font-light text-sm">{data.skills.soft.join(" • ")}</p>
              </div>
            )}
          </div>
        </div>

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-14">
            <h2 className="text-sm font-serif text-stone-900 uppercase tracking-widest mb-10 pb-3 border-b border-rose-300">
              Notable Projects
            </h2>
            <div className="space-y-8">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-serif text-stone-900">{project.name}</h3>
                  <p className="text-rose-600 font-light text-sm italic mb-2">{project.role}</p>
                  <p className="text-stone-700 font-light text-sm mb-2">{project.description}</p>
                  <p className="text-stone-600 text-xs font-light">{project.technologies.join(" • ")}</p>
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
                <h2 className="text-sm font-serif text-stone-900 uppercase tracking-widest mb-6 pb-3 border-b border-rose-300">
                  Languages
                </h2>
                <div className="space-y-3">
                  {data.languages.map((lang) => (
                    <div key={lang.id} className="flex justify-between">
                      <span className="text-stone-900 font-light">{lang.name}</span>
                      <span className="text-rose-600 font-light">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.certifications.length > 0 && (
              <div>
                <h2 className="text-sm font-serif text-stone-900 uppercase tracking-widest mb-6 pb-3 border-b border-rose-300">
                  Certifications
                </h2>
                <div className="space-y-3">
                  {data.certifications.map((cert) => (
                    <div key={cert.id}>
                      <p className="font-serif text-stone-900">{cert.title}</p>
                      <p className="text-stone-600 text-xs font-light">{cert.issuingOrganization}</p>
                      <p className="text-rose-600 text-xs font-light">{formatDate(cert.dateObtained)}</p>
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
