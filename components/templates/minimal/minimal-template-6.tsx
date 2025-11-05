import type { CVData } from "../../../types/cv-data";
interface MinimalTemplate6Props {
  data: CVData
  isPreview?: boolean
}

export function MinimalTemplate6({ data, isPreview = false }: MinimalTemplate6Props) {
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
      {/* Gold Top Bar */}
      <div className="bg-amber-600 h-2"></div>

      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="pt-16 pb-12 px-12 border-b-2 border-amber-600">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-tight">{data.personalInfo.fullName}</h1>
          <p className="text-2xl text-amber-700 font-light mb-8">{data.personalInfo.jobTitle}</p>

          <div className="grid grid-cols-3 gap-6 text-sm text-gray-700">
            <div>
              <p className="text-amber-700 font-semibold text-xs mb-1">EMAIL</p>
              <p className="break-words">{data.personalInfo.email}</p>
            </div>
            <div>
              <p className="text-amber-700 font-semibold text-xs mb-1">PHONE</p>
              <p>{data.personalInfo.phone}</p>
            </div>
            {(data.personalInfo.city || data.personalInfo.country) && (
              <div>
                <p className="text-amber-700 font-semibold text-xs mb-1">LOCATION</p>
                <p>
                  {data.personalInfo.city && data.personalInfo.country
                    ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                    : data.personalInfo.city || data.personalInfo.country}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="px-12 py-12">
          {/* Executive Summary */}
          <div className="mb-12">
            <p className="text-lg text-gray-800 leading-relaxed font-light">{data.personalInfo.summary}</p>
          </div>

          {/* Experience */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-8 pb-3 border-b-2 border-amber-600">
              Professional Experience
            </h2>
            <div className="space-y-10">
              {data.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-amber-700 font-semibold">{exp.companyName}</p>
                    </div>
                    <span className="text-sm text-gray-600 font-light">
                      {formatDate(exp.startDate)}
                      {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
                      {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  {exp.location && <p className="text-sm text-gray-600 mb-3 font-light">{exp.location}</p>}
                  <ul className="text-gray-700 space-y-2 ml-4">
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
          <div className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-8 pb-3 border-b-2 border-amber-600">
              Education
            </h2>
            <div className="space-y-6">
              {data.education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-amber-700">{edu.institutionName}</p>
                    {edu.location && <p className="text-sm text-gray-600 font-light">{edu.location}</p>}
                    {edu.gpa && <p className="text-sm text-gray-600 font-light">GPA: {edu.gpa}</p>}
                  </div>
                  {edu.graduationDate && (
                    <span className="text-sm text-gray-600 font-light">{formatDate(edu.graduationDate)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mb-12">
            <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-8 pb-3 border-b-2 border-amber-600">
              Key Competencies
            </h2>
            <div className="space-y-6">
              {data.skills.technical.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3">Technical</p>
                  <p className="text-gray-700 font-light">{data.skills.technical.join(" • ")}</p>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-900 mb-3">Leadership & Soft Skills</p>
                  <p className="text-gray-700 font-light">{data.skills.soft.join(" • ")}</p>
                </div>
              )}
            </div>
          </div>

          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="mb-12">
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-8 pb-3 border-b-2 border-amber-600">
                Notable Projects
              </h2>
              <div className="space-y-6">
                {data.projects.map((project) => (
                  <div key={project.id} className="pl-4 border-l-4 border-amber-200">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-amber-700 font-light text-sm mb-2">{project.role}</p>
                    <p className="text-gray-700 font-light mb-2">{project.description}</p>
                    <p className="text-gray-600 text-sm font-light">{project.technologies.join(" • ")}</p>
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
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-6 pb-3 border-b-2 border-amber-600">
                    Languages
                  </h2>
                  <div className="space-y-3">
                    {data.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between">
                        <span className="text-gray-900">{lang.name}</span>
                        <span className="text-amber-700 font-semibold">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.certifications.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-widest mb-6 pb-3 border-b-2 border-amber-600">
                    Certifications & Awards
                  </h2>
                  <div className="space-y-3">
                    {data.certifications.map((cert) => (
                      <div key={cert.id}>
                        <p className="font-semibold text-gray-900">{cert.title}</p>
                        <p className="text-gray-600 text-sm font-light">{cert.issuingOrganization}</p>
                        <p className="text-amber-700 text-sm font-light">{formatDate(cert.dateObtained)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>       
      </div>
    </div>
  )
}
