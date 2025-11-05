import type { CVData } from "../../types/cv-data"

interface MinimalTemplate7Props {
  data: CVData
  isPreview?: boolean
  profileImage?: string
}

export function MinimalTemplate7({ data, isPreview = false, profileImage }: MinimalTemplate7Props) {
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
    <div className="flex min-h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-80 bg-emerald-900 text-white p-10">
        {profileImage && (
          <div className="mb-8">
            <img
              src={profileImage || "/placeholder.svg"}
              alt={data.personalInfo.fullName}
              className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-emerald-400"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-1">{data.personalInfo.fullName}</h1>
          <div className="h-1 w-12 bg-emerald-400 mb-4"></div>
          <p className="text-emerald-100">{data.personalInfo.jobTitle}</p>
        </div>

        {/* Contact */}
        <div className="mb-10 pb-10 border-b border-emerald-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 mb-4">Contact</h3>
          <div className="space-y-3 text-sm text-emerald-100">
            <p className="break-words">{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            {data.personalInfo.city && data.personalInfo.country && (
              <p>
                {data.personalInfo.city}, {data.personalInfo.country}
              </p>
            )}
          </div>
        </div>

        {/* Technical Skills */}
        {data.skills.technical.length > 0 && (
          <div className="mb-10 pb-10 border-b border-emerald-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 mb-4">Technical</h3>
            <div className="space-y-2 text-sm text-emerald-100">
              {data.skills.technical.map((skill, i) => (
                <div key={i} className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Soft Skills */}
        {data.skills.soft.length > 0 && (
          <div className="mb-10 pb-10 border-b border-emerald-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 mb-4">Skills</h3>
            <div className="space-y-2 text-sm text-emerald-100">
              {data.skills.soft.map((skill, i) => (
                <div key={i} className="flex items-center">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-300 mb-4">Languages</h3>
            <div className="space-y-2 text-sm text-emerald-100">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between">
                  <span>{lang.name}</span>
                  <span className="text-emerald-300">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="flex-1 p-10">
        {/* Summary */}
        <div className="mb-10">
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </div>

        {/* Experience */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-emerald-600">EXPERIENCE</h2>
          <div className="space-y-8">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
                    <p className="text-emerald-700 font-medium">{exp.companyName}</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatDate(exp.startDate)}
                    {formatDate(exp.startDate) && (exp.current || formatDate(exp.endDate)) ? " - " : ""}
                    {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                {exp.location && <p className="text-sm text-gray-600 mb-2">{exp.location}</p>}
                <ul className="text-gray-700 space-y-1 ml-4">
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
          <h2 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-emerald-600">EDUCATION</h2>
          <div className="space-y-6">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-emerald-700">{edu.institutionName}</p>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>{edu.location}</span>
                  <span>{formatDate(edu.graduationDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        {data.projects.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-emerald-600">PROJECTS</h2>
            <div className="space-y-6">
              {data.projects.map((project) => (
                <div key={project.id}>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-emerald-700 text-sm">{project.role}</p>
                  <p className="text-gray-700 text-sm my-2">{project.description}</p>
                  <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-3 border-b-2 border-emerald-600">CERTIFICATIONS</h2>
            <div className="space-y-3">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">{cert.title}</p>
                    <p className="text-gray-600 text-sm">{cert.issuingOrganization}</p>
                  </div>
                  <span className="text-sm text-gray-600">{formatDate(cert.dateObtained)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
