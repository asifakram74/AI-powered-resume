import type { CVData } from "../../types/cv-data"

interface MinimalTemplate3Props {
  data: CVData
  isPreview?: boolean
}

export function MinimalTemplate3({ data, isPreview = false }: MinimalTemplate3Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    return `${year}`
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-16 min-h-screen">
      {/* Header */}
      <div className="text-center mb-24">
        <h1 className="text-7xl font-thin text-gray-900 mb-6 tracking-wider">{data.personalInfo.fullName}</h1>
        <div className="w-24 h-px bg-gray-300 mx-auto mb-8"></div>
        <h2 className="text-2xl font-thin text-gray-600 mb-12 tracking-widest uppercase">
          {data.personalInfo.jobTitle}
        </h2>

        {/* Contact Info */}
        <div className="flex justify-center items-center space-x-12 text-gray-500 text-sm">
          <span>{data.personalInfo.email}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>{data.personalInfo.phone}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span>
            {data.personalInfo.city}, {data.personalInfo.country}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="text-center mb-24">
        <p className="text-xl font-thin text-gray-700 leading-relaxed max-w-3xl mx-auto">{data.personalInfo.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-24">
        <div className="text-center mb-16">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-[0.3em] mb-4">Experience</h2>
          <div className="w-16 h-px bg-gray-300 mx-auto"></div>
        </div>

        <div className="space-y-20">
          {data.experience.map((exp) => (
            <div key={exp.id} className="text-center">
              <div className="mb-8">
                <h3 className="text-3xl font-thin text-gray-900 mb-3">{exp.jobTitle}</h3>
                <p className="text-lg text-gray-600 mb-2">{exp.companyName}</p>
                {exp.location && <p className="text-gray-500 text-sm mb-4">{exp.location}</p>}
                <p className="text-gray-400 text-sm tracking-wider">
                  {formatDate(exp.startDate)} — {exp.current ? "Present" : formatDate(exp.endDate)}
                </p>
              </div>

              <div className="max-w-2xl mx-auto">
                <ul className="text-gray-700 leading-relaxed space-y-4">
                  {exp.responsibilities.map((resp, index) => (
                    <li key={index} className="text-center">
                      {resp}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills & Education Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-24">
        {/* Skills */}
        <div className="text-center">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-[0.3em] mb-8">Skills</h2>
          <div className="w-16 h-px bg-gray-300 mx-auto mb-12"></div>

          <div className="space-y-8">
            {data.skills.technical.length > 0 && (
              <div>
                <h3 className="text-lg font-thin text-gray-900 mb-6">Technical</h3>
                <div className="space-y-3">
                  {data.skills.technical.map((skill, index) => (
                    <p key={index} className="text-gray-700 font-light">
                      {skill}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {data.skills.soft.length > 0 && (
              <div>
                <h3 className="text-lg font-thin text-gray-900 mb-6">Soft Skills</h3>
                <div className="space-y-3">
                  {data.skills.soft.map((skill, index) => (
                    <p key={index} className="text-gray-700 font-light">
                      {skill}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Education */}
        <div className="text-center">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-[0.3em] mb-8">Education</h2>
          <div className="w-16 h-px bg-gray-300 mx-auto mb-12"></div>

          <div className="space-y-8">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <h3 className="text-lg font-thin text-gray-900 mb-2">{edu.degree}</h3>
                <p className="text-gray-600 mb-1">{edu.institutionName}</p>
                {edu.location && <p className="text-gray-500 text-sm mb-1">{edu.location}</p>}
                {edu.graduationDate && <p className="text-gray-400 text-sm">{formatDate(edu.graduationDate)}</p>}
                {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                {edu.honors && <p className="text-gray-600 text-sm italic">{edu.honors}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-[0.3em] mb-4">Selected Projects</h2>
            <div className="w-16 h-px bg-gray-300 mx-auto"></div>
          </div>

          <div className="space-y-16">
            {data.projects.map((project) => (
              <div key={project.id} className="text-center">
                <h3 className="text-2xl font-thin text-gray-900 mb-3">{project.name}</h3>
                <p className="text-gray-600 mb-6">{project.role}</p>
                <p className="text-gray-700 leading-relaxed mb-6 max-w-2xl mx-auto">{project.description}</p>
                <p className="text-gray-500 text-sm mb-4">{project.technologies.join(" • ")}</p>
                {(project.liveDemoLink || project.githubLink) && (
                  <div className="text-gray-500 text-sm space-x-8">
                    {project.liveDemoLink && (
                      <a href={project.liveDemoLink} className="hover:text-gray-700 underline">
                        View Project
                      </a>
                    )}
                    {project.githubLink && (
                      <a href={project.githubLink} className="hover:text-gray-700 underline">
                        Source Code
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
        {/* Languages */}
        {data.languages.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-[0.3em] mb-8">Languages</h2>
            <div className="w-12 h-px bg-gray-300 mx-auto mb-8"></div>
            <div className="space-y-4">
              {data.languages.map((lang) => (
                <div key={lang.id}>
                  <p className="text-gray-900 font-light">{lang.name}</p>
                  <p className="text-gray-500 text-sm">{lang.proficiency}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-[0.3em] mb-8">Certifications</h2>
            <div className="w-12 h-px bg-gray-300 mx-auto mb-8"></div>
            <div className="space-y-6">
              {data.certifications.map((cert) => (
                <div key={cert.id}>
                  <h3 className="text-gray-900 font-light mb-1">{cert.title}</h3>
                  <p className="text-gray-600 text-sm">{cert.issuingOrganization}</p>
                  <p className="text-gray-500 text-sm">{formatDate(cert.dateObtained)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interests */}
        {data.additional.interests.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-[0.3em] mb-8">Interests</h2>
            <div className="w-12 h-px bg-gray-300 mx-auto mb-8"></div>
            <div className="space-y-3">
              {data.additional.interests.map((interest, index) => (
                <p key={index} className="text-gray-700 font-light">
                  {interest}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
