import type { CVData } from "../../types/cv-data"

interface ClassicTemplate4Props {
  data: CVData
  isPreview?: boolean
}

export function ClassicTemplate4({ data, isPreview = false }: ClassicTemplate4Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen font-serif">
      {/* Newspaper-style header with border */}
      <div className="border-4 border-gray-900 p-8 mb-8">
        <div className="text-center border-b-2 border-gray-900 pb-6 mb-6">
          <h1 className="text-5xl font-bold text-gray-900 mb-2 tracking-wider">
            {data.personalInfo.fullName.toUpperCase()}
          </h1>
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="w-16 h-0.5 bg-gray-900"></div>
            <span className="text-xl text-gray-700 font-semibold px-4">{data.personalInfo.jobTitle}</span>
            <div className="w-16 h-0.5 bg-gray-900"></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center text-sm text-gray-700">
          <div className="border-r border-gray-400 pr-4">
            <div className="font-semibold">EMAIL</div>
            <div>{data.personalInfo.email}</div>
          </div>
          <div className="border-r border-gray-400 pr-4">
            <div className="font-semibold">PHONE</div>
            <div>{data.personalInfo.phone}</div>
          </div>
          {(data.personalInfo.city || data.personalInfo.country || data.personalInfo.address) && (
            <div>
              <div className="font-semibold">LOCATION</div>
              <div>
                {(data.personalInfo.city || data.personalInfo.country) && (
                  <span>
                    {data.personalInfo.city && data.personalInfo.country
                      ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                      : data.personalInfo.city || data.personalInfo.country}
                  </span>
                )}
                {data.personalInfo.address && (
                  <>
                    {(data.personalInfo.city || data.personalInfo.country) && <br />}
                    {data.personalInfo.address}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Three-column newspaper layout */}
      <div className="grid grid-cols-3 gap-8 px-8">
        {/* Left Column - 1/3 width */}
        <div className="space-y-8">
          {/* Summary Box */}
          <div className="border-2 border-gray-900 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center border-b border-gray-400 pb-2">
              EXECUTIVE SUMMARY
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{data.personalInfo.summary}</p>
          </div>

          {/* Skills Box */}
          <div className="border-2 border-gray-900 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center border-b border-gray-400 pb-2">
              EXPERTISE
            </h2>
            {data.skills.technical.length > 0 && (
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 text-sm mb-2">TECHNICAL</h3>
                <div className="space-y-1">
                  {data.skills.technical.map((skill, index) => (
                    <div key={index} className="text-xs text-gray-700 border-l-2 border-gray-400 pl-2">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">LEADERSHIP</h3>
                <div className="space-y-1">
                  {data.skills.soft.map((skill, index) => (
                    <div key={index} className="text-xs text-gray-700 border-l-2 border-gray-400 pl-2">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Education Box */}
          <div className="border-2 border-gray-900 p-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4 text-center border-b border-gray-400 pb-2">
              EDUCATION
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-gray-400 pl-3">
                  <h3 className="font-bold text-gray-900 text-sm">{edu.degree}</h3>
                  <p className="text-gray-700 text-xs font-semibold">{edu.institutionName}</p>
                  {edu.graduationDate && <p className="text-gray-600 text-xs">{formatDate(edu.graduationDate)}</p>}
                  {edu.gpa && <p className="text-gray-600 text-xs">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Languages & Certifications */}
          {(data.languages.length > 0 || data.certifications.length > 0) && (
            <div className="border-2 border-gray-900 p-4">
              {data.languages.length > 0 && (
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900 mb-3 text-center border-b border-gray-400 pb-2">
                    LANGUAGES
                  </h2>
                  <div className="space-y-2">
                    {data.languages.map((lang) => (
                      <div key={lang.id} className="flex justify-between text-xs">
                        <span className="font-semibold text-gray-900">{lang.name}</span>
                        <span className="text-gray-600">{lang.proficiency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.certifications.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-3 text-center border-b border-gray-400 pb-2">
                    CERTIFICATIONS
                  </h2>
                  <div className="space-y-2">
                    {data.certifications.map((cert) => (
                      <div key={cert.id} className="border-l-2 border-gray-400 pl-2">
                        <h3 className="font-semibold text-gray-900 text-xs">{cert.title}</h3>
                        <p className="text-gray-700 text-xs">{cert.issuingOrganization}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column - 2/3 width */}
        <div className="col-span-2 space-y-8">
          {/* Experience */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center border-b-4 border-gray-900 pb-3">
              PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="border-l-4 border-gray-900 pl-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{exp.jobTitle}</h3>
                      <p className="text-gray-700 font-bold text-lg">{exp.companyName}</p>
                      {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                    </div>
                    <div className="border-2 border-gray-900 px-3 py-1 bg-gray-100">
                      <span className="text-gray-900 text-sm font-bold">
                        {formatDate(exp.startDate)} - {exp.current ? "PRESENT" : formatDate(exp.endDate)}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {exp.responsibilities.map((resp, respIndex) => (
                      <div key={respIndex} className="flex items-start">
                        <span className="text-gray-900 font-bold mr-3 mt-1">■</span>
                        <span className="text-gray-700 text-sm leading-relaxed">{resp}</span>
                      </div>
                    ))}
                  </div>
                  {index < data.experience.length - 1 && <div className="border-b border-gray-300 mt-6"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {data.projects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center border-b-4 border-gray-900 pb-3">
                NOTABLE PROJECTS
              </h2>
              <div className="space-y-6">
                {data.projects.map((project, index) => (
                  <div key={project.id} className="border-l-4 border-gray-600 pl-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{project.name}</h3>
                    <p className="text-gray-700 font-semibold text-sm mb-2">{project.role}</p>
                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="border border-gray-400 px-2 py-1 text-xs text-gray-700">
                          {tech}
                        </span>
                      ))}
                    </div>
                    {index < data.projects.length - 1 && <div className="border-b border-gray-300 mt-6"></div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {data.additional.interests.length > 0 && (
            <div className="border-2 border-gray-900 p-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center border-b border-gray-400 pb-2">
                PERSONAL INTERESTS
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.additional.interests.map((interest, index) => (
                  <span key={index} className="border border-gray-400 px-3 py-1 text-sm text-gray-700">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
