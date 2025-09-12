import type { CVData } from "../../types/cv-data"

interface MinimalTemplate4Props {
  data: CVData
  isPreview?: boolean
}

export function MinimalTemplate4({ data, isPreview = false }: MinimalTemplate4Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-16 min-h-screen font-light">
      {/* Ultra-minimal header */}
      <div className="text-center mb-20">
        <h1 className="text-5xl font-extralight text-gray-900 mb-8 tracking-[0.2em] leading-tight">
          {data.personalInfo.fullName.toLowerCase()}
        </h1>
        <p className="text-lg text-gray-500 mb-12 font-light tracking-wide">
          {data.personalInfo.jobTitle.toLowerCase()}
        </p>
        <div className="flex justify-center items-center space-x-12 text-gray-400 text-sm font-light">
          <span>{data.personalInfo.email}</span>
          <span className="w-px h-4 bg-gray-300"></span>
          <span>{data.personalInfo.phone}</span>
          {(data.personalInfo.city || data.personalInfo.country || data.personalInfo.address) && (
            <>
              <span className="w-px h-4 bg-gray-300"></span>
              <span>
                {(data.personalInfo.city || data.personalInfo.country) && (
                  <span>
                    {data.personalInfo.city && data.personalInfo.country
                      ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                      : data.personalInfo.city || data.personalInfo.country}
                  </span>
                )}
                {data.personalInfo.address && (
                  <span className={`text-xs ${(data.personalInfo.city || data.personalInfo.country) ? 'block mt-1' : ''}`}>
                    {data.personalInfo.address}
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-20 text-center">
        <p className="text-gray-600 leading-loose text-lg font-light max-w-2xl mx-auto">{data.personalInfo.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-20">
        <h2 className="text-2xl font-extralight text-gray-900 mb-16 text-center tracking-[0.15em] lowercase">
          experience
        </h2>
        <div className="space-y-16">
          {data.experience.map((exp) => (
            <div key={exp.id} className="text-center">
              <div className="mb-8">
                <h3 className="text-xl font-light text-gray-900 mb-2 tracking-wide">{exp.jobTitle.toLowerCase()}</h3>
                <p className="text-gray-600 font-light mb-1">{exp.companyName.toLowerCase()}</p>
                {exp.location && <p className="text-gray-400 text-sm font-light mb-2">{exp.location.toLowerCase()}</p>}
                <p className="text-gray-400 text-sm font-light">
                  {formatDate(exp.startDate)} — {exp.current ? "present" : formatDate(exp.endDate)}
                </p>
              </div>
              <div className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  {exp.responsibilities.map((resp, index) => (
                    <p key={index} className="text-gray-600 leading-relaxed font-light text-sm">
                      {resp}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column layout for remaining sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
        {/* Left Column */}
        <div className="space-y-16">
          {/* Education */}
          <div className="text-center">
            <h2 className="text-2xl font-extralight text-gray-900 mb-12 tracking-[0.15em] lowercase">education</h2>
            <div className="space-y-8">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-light text-gray-900 mb-1 tracking-wide">{edu.degree.toLowerCase()}</h3>
                  <p className="text-gray-600 font-light text-sm mb-1">{edu.institutionName.toLowerCase()}</p>
                  {edu.graduationDate && (
                    <p className="text-gray-400 text-xs font-light">{formatDate(edu.graduationDate)}</p>
                  )}
                  {edu.gpa && <p className="text-gray-400 text-xs font-light">gpa {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-extralight text-gray-900 mb-12 tracking-[0.15em] lowercase">languages</h2>
              <div className="space-y-4">
                {data.languages.map((lang) => (
                  <div key={lang.id}>
                    <span className="font-light text-gray-900 tracking-wide">{lang.name.toLowerCase()}</span>
                    <p className="text-gray-500 text-sm font-light">{lang.proficiency.toLowerCase()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-16">
          {/* Skills */}
          <div className="text-center">
            <h2 className="text-2xl font-extralight text-gray-900 mb-12 tracking-[0.15em] lowercase">expertise</h2>
            <div className="space-y-8">
              {data.skills.technical.length > 0 && (
                <div>
                  <h3 className="font-light text-gray-900 mb-4 tracking-wide lowercase">technical</h3>
                  <div className="space-y-2">
                    {data.skills.technical.map((skill, index) => (
                      <p key={index} className="text-gray-600 text-sm font-light">
                        {skill.toLowerCase()}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h3 className="font-light text-gray-900 mb-4 tracking-wide lowercase">leadership</h3>
                  <div className="space-y-2">
                    {data.skills.soft.map((skill, index) => (
                      <p key={index} className="text-gray-600 text-sm font-light">
                        {skill.toLowerCase()}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div className="text-center">
              <h2 className="text-2xl font-extralight text-gray-900 mb-12 tracking-[0.15em] lowercase">
                certifications
              </h2>
              <div className="space-y-6">
                {data.certifications.map((cert) => (
                  <div key={cert.id}>
                    <h3 className="font-light text-gray-900 mb-1 tracking-wide">{cert.title.toLowerCase()}</h3>
                    <p className="text-gray-600 text-sm font-light">{cert.issuingOrganization.toLowerCase()}</p>
                    <p className="text-gray-400 text-xs font-light">{formatDate(cert.dateObtained)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-20">
          <h2 className="text-2xl font-extralight text-gray-900 mb-16 text-center tracking-[0.15em] lowercase">
            selected projects
          </h2>
          <div className="space-y-16">
            {data.projects.map((project) => (
              <div key={project.id} className="text-center">
                <h3 className="text-xl font-light text-gray-900 mb-2 tracking-wide">{project.name.toLowerCase()}</h3>
                <p className="text-gray-600 font-light text-sm mb-4">{project.role.toLowerCase()}</p>
                <p className="text-gray-600 leading-relaxed font-light max-w-2xl mx-auto mb-6">{project.description}</p>
                <div className="flex flex-wrap justify-center gap-4">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="text-gray-500 text-xs font-light tracking-wide">
                      {tech.toLowerCase()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {data.additional.interests.length > 0 && (
        <div className="text-center">
          <h2 className="text-2xl font-extralight text-gray-900 mb-12 tracking-[0.15em] lowercase">interests</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {data.additional.interests.map((interest, index) => (
              <span key={index} className="text-gray-500 text-sm font-light tracking-wide">
                {interest.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
