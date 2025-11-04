import type { CVData } from "../../types/cv-data"

interface ClassicTemplate2Props {
  data: CVData
  isPreview?: boolean
}

export function ClassicTemplate2({ data, isPreview = false }: ClassicTemplate2Props) {
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
    <div className="max-w-full mx-auto bg-white p-14 min-h-screen">
      {/* Header with Bold Design */}
      <div className="bg-gray-900 text-white p-8 -mx-14 -mt-14 mb-12">
        <h1 className="text-5xl font-black mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-2xl font-light mb-6 text-gray-300">{data.personalInfo.jobTitle}</p>
        <div className="text-gray-400 text-sm space-x-4">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          {(data.personalInfo.city || data.personalInfo.country) && (
            <>
              <span>•</span>
              <span>
                {data.personalInfo.city && data.personalInfo.country
                  ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                  : data.personalInfo.city || data.personalInfo.country}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-12">
        <p className="text-gray-700 leading-relaxed text-lg">{data.personalInfo.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-12">
        <h2 className="text-2xl font-black text-gray-900 mb-8 pb-3 border-b-4 border-gray-900">
          PROFESSIONAL EXPERIENCE
        </h2>
        <div className="space-y-10">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-black text-gray-900">{exp.jobTitle}</h3>
                  <p className="text-lg font-bold text-gray-700">{exp.companyName}</p>
                  {exp.location && <p className="text-gray-600">{exp.location}</p>}
                </div>
                <span className="text-sm text-gray-600 font-bold">
                  {formatDate(exp.startDate)}
                  {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " – " : ""}
                  {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <ul className="text-gray-700 space-y-2 ml-4">
                {exp.responsibilities.map((resp, index) => (
                  <li key={index} className="list-disc text-base">
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
        <h2 className="text-2xl font-black text-gray-900 mb-8 pb-3 border-b-4 border-gray-900">EDUCATION</h2>
        <div className="space-y-6">
          {data.education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-black text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700 font-bold">{edu.institutionName}</p>
                {edu.location && <p className="text-gray-600">{edu.location}</p>}
                {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
              </div>
              {edu.graduationDate && <span className="text-gray-600 font-bold">{formatDate(edu.graduationDate)}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-12">
        <h2 className="text-2xl font-black text-gray-900 mb-8 pb-3 border-b-4 border-gray-900">CORE SKILLS</h2>
        <div className="space-y-6">
          {data.skills.technical.length > 0 && (
            <div>
              <p className="font-black text-gray-900 mb-3">TECHNICAL SKILLS</p>
              <p className="text-gray-700">{data.skills.technical.join(" • ")}</p>
            </div>
          )}
          {data.skills.soft.length > 0 && (
            <div>
              <p className="font-black text-gray-900 mb-3">SOFT SKILLS</p>
              <p className="text-gray-700">{data.skills.soft.join(" • ")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-8 pb-3 border-b-4 border-gray-900">PROJECTS</h2>
          <div className="space-y-6">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="text-lg font-black text-gray-900">{project.name}</h3>
                <p className="font-bold text-gray-700 mb-1">{project.role}</p>
                <p className="text-gray-700 mb-2">{project.description}</p>
                <p className="text-gray-600">{project.technologies.join(" • ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {data.languages.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-8 pb-3 border-b-4 border-gray-900">LANGUAGES</h2>
          <div className="space-y-3">
            {data.languages.map((lang) => (
              <div key={lang.id} className="flex justify-between">
                <span className="font-bold text-gray-900">{lang.name}</span>
                <span className="text-gray-700">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className="text-2xl font-black text-gray-900 mb-8 pb-3 border-b-4 border-gray-900">CERTIFICATIONS</h2>
          <div className="space-y-3">
            {data.certifications.map((cert) => (
              <div key={cert.id}>
                <p className="font-black text-gray-900">{cert.title}</p>
                <p className="text-gray-700">{cert.issuingOrganization}</p>
                <p className="text-gray-600 text-sm">{formatDate(cert.dateObtained)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
