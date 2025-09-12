import type { CVData } from "../../types/cv-data"

interface ClassicTemplate3Props {
  data: CVData
  isPreview?: boolean
}

export function ClassicTemplate3({ data, isPreview = false }: ClassicTemplate3Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    return `${month}/${year}`
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 min-h-screen">
      {/* Header */}
      <div className="border-b-4 border-double border-gray-800 pb-8 mb-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
          <h2 className="text-xl text-gray-700 mb-6">{data.personalInfo.jobTitle}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-gray-600">
          <div>
            <strong>Email:</strong>
            <br />
            {data.personalInfo.email}
          </div>
          <div>
            <strong>Phone:</strong>
            <br />
            {data.personalInfo.phone}
          </div>
          {(data.personalInfo.city || data.personalInfo.country || data.personalInfo.address) && (
            <div>
              <strong>Location:</strong>
              <br />
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
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">PROFESSIONAL PROFILE</h2>
        <div className="bg-gray-50 p-6 rounded border-l-4 border-gray-800">
          <p className="text-gray-700 leading-relaxed text-center italic">{data.personalInfo.summary}</p>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">WORK EXPERIENCE</h2>
        <div className="space-y-8">
          {data.experience.map((exp, index) => (
            <div key={exp.id} className="relative">
              <div className="bg-gray-100 p-6 rounded">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.jobTitle}</h3>
                    <p className="text-gray-700 font-semibold">{exp.companyName}</p>
                    {exp.location && <p className="text-gray-600">{exp.location}</p>}
                  </div>
                  <span className="text-gray-600 bg-white px-3 py-1 rounded border">
                    {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                  </span>
                </div>
                <ul className="text-gray-700 leading-relaxed space-y-2">
                  {exp.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-gray-500 mr-3">•</span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Education & Skills Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        {/* Education */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">EDUCATION</h2>
          <div className="space-y-6">
            {data.education.map((edu) => (
              <div key={edu.id} className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700 font-medium">{edu.institutionName}</p>
                {edu.location && <p className="text-gray-600">{edu.location}</p>}
                {edu.graduationDate && <p className="text-gray-600 text-sm">{formatDate(edu.graduationDate)}</p>}
                {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
                {edu.honors && <p className="text-gray-700 text-sm font-medium">{edu.honors}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">SKILLS & EXPERTISE</h2>
          <div className="space-y-6">
            {data.skills.technical.length > 0 && (
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold text-gray-900 mb-3">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, index) => (
                    <span key={index} className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div className="bg-gray-50 p-4 rounded border">
                <h3 className="font-bold text-gray-900 mb-3">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, index) => (
                    <span key={index} className="bg-gray-600 text-white px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Languages & Certifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        {/* Languages */}
        {data.languages.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">LANGUAGES</h2>
            <div className="bg-gray-50 p-4 rounded border space-y-3">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">{lang.name}</span>
                  <span className="text-gray-600 bg-white px-2 py-1 rounded text-sm">{lang.proficiency}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">CERTIFICATIONS</h2>
            <div className="space-y-3">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="bg-gray-50 p-4 rounded border">
                  <h3 className="font-bold text-gray-900">{cert.title}</h3>
                  <p className="text-gray-700">{cert.issuingOrganization}</p>
                  <p className="text-gray-600 text-sm">{formatDate(cert.dateObtained)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">KEY PROJECTS</h2>
          <div className="space-y-6">
            {data.projects.map((project) => (
              <div key={project.id} className="bg-gray-50 p-6 rounded border">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{project.name}</h3>
                    <p className="text-gray-700 font-medium">{project.role}</p>
                  </div>
                  <div className="flex gap-2">
                    {project.liveDemoLink && (
                      <a href={project.liveDemoLink} className="text-blue-600 text-sm hover:underline">
                        Demo
                      </a>
                    )}
                    {project.githubLink && (
                      <a href={project.githubLink} className="text-blue-600 text-sm hover:underline">
                        Code
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <span key={index} className="bg-white text-gray-700 px-2 py-1 rounded text-sm border">
                      {tech}
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
          <h2 className="text-xl font-bold text-gray-900 mb-6">INTERESTS & ACTIVITIES</h2>
          <div className="bg-gray-50 p-4 rounded border">
            <p className="text-gray-700">{data.additional.interests.join(" • ")}</p>
          </div>
        </div>
      )}
    </div>
  )
}
