import type { CVData } from "@/types/cv"
import { Mail, Phone, MapPin, ExternalLink, Github, Linkedin } from "lucide-react"

interface CreativeTemplateProps {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate({ data, isPreview = false }: CreativeTemplateProps) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {data.personalInfo.profilePicture && (
              <img
                src={data.personalInfo.profilePicture}
                alt={data.personalInfo.fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{data.personalInfo.fullName}</h1>
              <h2 className="text-xl md:text-2xl text-blue-600 font-medium mb-3">{data.personalInfo.jobTitle}</h2>
              <p className="text-gray-600 max-w-3xl">{data.personalInfo.summary}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {data.personalInfo.linkedin && (
                <a
                  href={data.personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-50 text-blue-600 p-2 rounded-full hover:bg-blue-100 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {data.personalInfo.github && (
                <a
                  href={data.personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Personal Info */}
        <div className="lg:col-span-1 space-y-6 pt-4">
          {/* Contact Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">
                  {data.personalInfo.city}, {data.personalInfo.country}
                </span>
              </div>
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Skills</h3>
            {data.skills.technical.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-500 mb-2">TECHNICAL</h4>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">SOFT SKILLS</h4>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Languages Card */}
          {data.languages.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Languages</h3>
              <div className="space-y-3">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between">
                    <span className="text-gray-700 font-medium">{lang.name}</span>
                    <span className="text-gray-500 text-sm">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Professional Info */}
        <div className="lg:col-span-2 space-y-6 pt-4">
          {/* Experience Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Work Experience</h3>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative pl-6">
                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-blue-500 border-4 border-blue-100"></div>
                  <div className="pb-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h4>
                        <p className="text-blue-600 font-medium">{exp.companyName}</p>
                        {exp.location && <p className="text-gray-500 text-sm">{exp.location}</p>}
                      </div>
                      <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                      </div>
                    </div>
                    <ul className="text-gray-700 space-y-2 mt-3">
                      {exp.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2 mt-1">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Education</h3>
            <div className="space-y-6">
              {data.education.map((edu) => (
                <div key={edu.id} className="relative pl-6">
                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-green-500 border-4 border-green-100"></div>
                  <div className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">{edu.degree}</h4>
                      {edu.graduationDate && (
                        <div className="text-sm text-gray-500">{formatDate(edu.graduationDate)}</div>
                      )}
                    </div>
                    <p className="text-green-600 font-medium">{edu.institutionName}</p>
                    {edu.location && <p className="text-gray-500 text-sm">{edu.location}</p>}
                    {edu.gpa && (
                      <p className="text-gray-500 text-sm mt-1">
                        <span className="font-medium">GPA:</span> {edu.gpa}
                      </p>
                    )}
                    {edu.honors && (
                      <p className="text-green-600 text-sm mt-1">
                        <span className="font-medium">Honors:</span> {edu.honors}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Section */}
          {data.projects.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Projects</h3>
              <div className="grid gap-4">
                {data.projects.map((project) => (
                  <div key={project.id} className="p-4 border border-gray-100 rounded-lg hover:shadow-xs transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{project.name}</h4>
                        <p className="text-purple-600 font-medium">{project.role}</p>
                      </div>
                      <div className="flex gap-2">
                        {project.liveDemoLink && (
                          <a
                            href={project.liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" /> Demo
                          </a>
                        )}
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1"
                          >
                            <Github className="w-4 h-4" /> Code
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {data.certifications.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">Certifications</h3>
              <div className="grid gap-4">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{cert.title}</h4>
                      <p className="text-gray-600">{cert.issuingOrganization}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">{formatDate(cert.dateObtained)}</p>
                      {cert.verificationLink && (
                        <a
                          href={cert.verificationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          Verify
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}