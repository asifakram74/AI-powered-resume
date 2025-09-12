import type { CVData } from "../../types/cv-data"

interface MinimalTemplate2Props {
  data: CVData
  isPreview?: boolean
}

export function MinimalTemplate2({ data, isPreview = false }: MinimalTemplate2Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    return `${year}`
  }

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 min-h-screen font-light">
      {/* Header */}
      <div className="mb-20">
        <div className="text-left">
          <h1 className="text-6xl font-extralight text-gray-900 mb-4 tracking-tight">
            {data.personalInfo.fullName.split(" ")[0]}
          </h1>
          <h1 className="text-6xl font-extralight text-gray-900 mb-8 tracking-tight">
            {data.personalInfo.fullName.split(" ").slice(1).join(" ")}
          </h1>
          <div className="w-16 h-px bg-gray-900 mb-8"></div>
          <h2 className="text-xl font-light text-gray-600 mb-12 tracking-wide">{data.personalInfo.jobTitle}</h2>
        </div>

        {/* Contact - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-500">
          <div>
            <p className="font-medium text-gray-900 mb-1">Email</p>
            <p>{data.personalInfo.email}</p>
          </div>
          <div>
            <p className="font-medium text-gray-900 mb-1">Phone</p>
            <p>{data.personalInfo.phone}</p>
          </div>
          {(data.personalInfo.city || data.personalInfo.country || data.personalInfo.address) && (
            <div>
              <p className="font-medium text-gray-900 mb-1">Location</p>
              <div>
                {(data.personalInfo.city || data.personalInfo.country) && (
                  <p>
                    {data.personalInfo.city && data.personalInfo.country
                      ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                      : data.personalInfo.city || data.personalInfo.country}
                  </p>
                )}
                {data.personalInfo.address && (
                  <p className={`text-sm ${(data.personalInfo.city || data.personalInfo.country) ? 'mt-1' : ''}`}>
                    {data.personalInfo.address}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-20">
        <p className="text-gray-700 text-lg leading-loose font-light max-w-2xl">{data.personalInfo.summary}</p>
      </div>

      {/* Experience */}
      <div className="mb-20">
        <h2 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-12">Experience</h2>
        <div className="space-y-16">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
                <div className="md:col-span-1">
                  <p className="text-sm text-gray-500 font-medium">
                    {formatDate(exp.startDate)}—{exp.current ? "Present" : formatDate(exp.endDate)}
                  </p>
                </div>
                <div className="md:col-span-3">
                  <h3 className="text-2xl font-light text-gray-900 mb-2">{exp.jobTitle}</h3>
                  <p className="text-gray-600 mb-1">{exp.companyName}</p>
                  {exp.location && <p className="text-gray-500 text-sm mb-6">{exp.location}</p>}
                </div>
              </div>
              <div className="md:col-start-2 md:col-span-3 md:ml-[calc(25%+2rem)]">
                <ul className="text-gray-700 leading-loose space-y-3">
                  {exp.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-20">
        <h2 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-12">Education</h2>
        <div className="space-y-8">
          {data.education.map((edu) => (
            <div key={edu.id} className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                {edu.graduationDate && (
                  <p className="text-sm text-gray-500 font-medium">{formatDate(edu.graduationDate)}</p>
                )}
              </div>
              <div className="md:col-span-3">
                <h3 className="text-lg font-light text-gray-900 mb-1">{edu.degree}</h3>
                <p className="text-gray-600 mb-1">{edu.institutionName}</p>
                {edu.location && <p className="text-gray-500 text-sm">{edu.location}</p>}
                {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                {edu.honors && <p className="text-gray-600 text-sm">{edu.honors}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-20">
        <h2 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-12">Skills</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {data.skills.technical.length > 0 && (
            <div>
              <h3 className="text-lg font-light text-gray-900 mb-4">Technical</h3>
              <div className="space-y-2">
                {data.skills.technical.map((skill, index) => (
                  <p key={index} className="text-gray-700">
                    {skill}
                  </p>
                ))}
              </div>
            </div>
          )}
          {data.skills.soft.length > 0 && (
            <div>
              <h3 className="text-lg font-light text-gray-900 mb-4">Soft Skills</h3>
              <div className="space-y-2">
                {data.skills.soft.map((skill, index) => (
                  <p key={index} className="text-gray-700">
                    {skill}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-20">
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-12">Selected Projects</h2>
          <div className="space-y-12">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="text-lg font-light text-gray-900 mb-2">{project.name}</h3>
                <p className="text-gray-600 mb-4">{project.role}</p>
                <p className="text-gray-700 leading-loose mb-4">{project.description}</p>
                <p className="text-gray-500 text-sm mb-2">{project.technologies.join(", ")}</p>
                {(project.liveDemoLink || project.githubLink) && (
                  <div className="text-gray-500 text-sm space-x-6">
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

      {/* Languages & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
        {/* Languages */}
        {data.languages.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-8">Languages</h2>
            <div className="space-y-3">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between">
                  <span className="text-gray-900">{lang.name}</span>
                  <span className="text-gray-500 text-sm">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-8">Certifications</h2>
            <div className="space-y-4">
              {data.certifications.map((cert) => (
                <div key={cert.id}>
                  <h3 className="text-gray-900 font-light">{cert.title}</h3>
                  <p className="text-gray-600 text-sm">{cert.issuingOrganization}</p>
                  <p className="text-gray-500 text-sm">{formatDate(cert.dateObtained)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interests */}
      {data.additional.interests.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-900 uppercase tracking-widest mb-8">Interests</h2>
          <p className="text-gray-700 leading-loose">{data.additional.interests.join(", ")}</p>
        </div>
      )}
    </div>
  )
}
