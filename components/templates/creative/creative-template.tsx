"use client"

import { Mail, Phone, MapPin, User, Briefcase, FolderOpen, ExternalLink, Github, Award } from "lucide-react"
import type { CVData } from "../../../types/cv-data";

interface CreativeTemplateProps {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate({ data, isPreview = false }: CreativeTemplateProps) {
  const formatDate = (date: string) => {
    if (!date) return "";
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date);
    if (isoMatch) return `${monthNames[parseInt(isoMatch[2])-1]} ${isoMatch[1]}`;
    
    const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date);
    if (slashMatch) return `${monthNames[parseInt(slashMatch[1])-1]} ${slashMatch[2]}`;
    
    return date;
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 via-blue-75 p-6 mb-6 rounded-b-2xl">
        <div className="flex items-center gap-6 max-w-6xl mx-auto">
          <img
            src={data.personalInfo.profilePicture || "https://img.freepik.com/free-photo/emotions-people-concept-headshot-serious-looking-handsome-man-with-beard-looking-confident-determined_1258-26730.jpg"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-800 tracking-wide uppercase mb-1">
              {data.personalInfo.fullName}
            </h1>
            {data.personalInfo.jobTitle && (
              <h2 className="text-xl text-slate-600 font-medium">
                {data.personalInfo.jobTitle}
              </h2>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row px-4 gap-6 max-w-6xl mx-auto">
        {/* Left Sidebar */}
        <div className="lg:w-1/3 space-y-6">
          {/* Contact */}
          <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-3">
              CONTACT
            </h2>
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-600" />
                <span>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-600" />
                <span className="break-all">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-600" />
                <span>
                  {data.personalInfo.city && data.personalInfo.country 
                    ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                    : data.personalInfo.city || data.personalInfo.country}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-3">
              SKILLS
            </h2>
            <div className="space-y-4">
              {/* Technical Skills */}
              {data.skills.technical.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-700">
                    Technical Skills
                  </h3>
                  <div className="space-y-2">
                    {data.skills.technical.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-slate-600 rounded-full mr-3"></div>
                        <span className="text-sm text-slate-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Soft Skills */}
              {data.skills.soft.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-700">
                    Soft Skills
                  </h3>
                  <div className="space-y-2">
                    {data.skills.soft.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-slate-600 rounded-full mr-3"></div>
                        <span className="text-sm text-slate-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-3">
                LANGUAGES
              </h2>
              <div className="space-y-2 text-sm text-slate-700">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between">
                    <span>{lang.name}</span>
                    <span className="text-slate-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-3">
              EDUCATION
            </h2>
            <div className="space-y-4 text-sm text-slate-700">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-semibold mb-1 text-sm">{edu.degree}</h3>
                  <p className="text-slate-600 mb-1 text-xs">{edu.institutionName}</p>
                  {edu.location && (
                    <p className="text-slate-500 mb-1 text-xs">{edu.location}</p>
                  )}
                  {edu.graduationDate && (
                    <p className="text-slate-500 mb-1 text-xs">
                      {formatDate(edu.graduationDate)}
                    </p>
                  )}
                  {edu.gpa && (
                    <p className="text-slate-500 text-xs">GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}
          {data.additional.interests.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 border-b-2 border-slate-300 pb-2 mb-3">
                INTERESTS
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.additional.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-slate-700 text-white px-3 py-1 rounded-full text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content */}
        <div className="lg:flex-1 space-y-6">
          {/* Profile */}
          <div>
            <div className="flex items-center mb-3">
              <User className="w-5 h-5 bg-slate-700 text-white rounded-full p-1 mr-3" />
              <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-300 pb-1 flex-1">
                PROFILE
              </h2>
            </div>
            <div className="relative pl-6">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-300"></div>
              <div className="absolute left-2.5 top-1.5 w-2 h-2 bg-slate-700 rounded-full"></div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {data.personalInfo.summary}
              </p>
            </div>
          </div>

          {/* Work Experience */}
          <div>
            <div className="flex items-center mb-3">
              <Briefcase className="w-5 h-5 bg-slate-700 text-white rounded-full p-1 mr-3" />
              <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-300 pb-1 flex-1">
                WORK EXPERIENCE
              </h2>
            </div>

            <div className="relative pl-6">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-300"></div>
              
              {data.experience.map((exp, index) => (
                <div key={exp.id} className="relative mb-4">
                  <div className="absolute -left-2 top-1.5 w-2 h-2 bg-slate-700 rounded-full"></div>
                  
                  <div className="mb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-bold text-slate-800 mb-1">
                          {exp.jobTitle}
                        </h3>
                        <p className="text-gray-600 font-medium mb-1 text-sm">
                          {exp.companyName}
                        </p>
                        {exp.location && (
                          <p className="text-gray-500 text-xs">{exp.location}</p>
                        )}
                      </div>
                      <span className="text-gray-500 text-sm whitespace-nowrap">
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-700 pl-3">
                    {exp.responsibilities.map((resp, idx) => (
                      <p key={idx}>{resp}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {data.projects.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <FolderOpen className="w-5 h-5 bg-slate-700 text-white rounded-full p-1 mr-3" />
                <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-300 pb-1 flex-1">
                  PROJECTS
                </h2>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-300"></div>
                
                {data.projects.map((project) => (
                  <div key={project.id} className="relative mb-4">
                    <div className="absolute -left-2 top-1.5 w-2 h-2 bg-slate-700 rounded-full"></div>

                    <div className="mb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-bold text-slate-800 mb-1">
                            {project.name}
                          </h3>
                          <p className="text-gray-600 font-medium mb-1 text-sm">
                            {project.role}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {project.liveDemoLink && (
                            <ExternalLink className="w-4 h-4 text-blue-500" />
                          )}
                          {project.githubLink && (
                            <Github className="w-4 h-4 text-gray-500" />
                          )}
                        </div>
                      </div>
                    </div>

                    {project.description && (
                      <p className="text-gray-700 text-sm mb-3 whitespace-pre-line">
                        {project.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-slate-800 px-2 py-1 rounded text-xs"
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

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div>
              <div className="flex items-center mb-3">
                <Award className="w-5 h-5 bg-slate-700 text-white rounded-full p-1 mr-3" />
                <h2 className="text-xl font-bold text-slate-800 border-b-2 border-slate-300 pb-1 flex-1">
                  CERTIFICATIONS & AWARDS
                </h2>
              </div>

              <div className="relative pl-6">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-300"></div>
                
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="relative mb-3">
                    <div className="absolute -left-2 top-1.5 w-2 h-2 bg-slate-700 rounded-full"></div>

                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-1">
                          {cert.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {cert.issuingOrganization}
                        </p>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {formatDate(cert.dateObtained)}
                      </span>
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