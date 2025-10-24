"use client"

import { Mail, Phone, MapPin, User, Briefcase, FolderOpen, ExternalLink, Github, Award, Heart } from "lucide-react"
import type { CVData } from "../../types/cv-data"

interface ModernTemplate9Props {
  data: CVData
  isPreview?: boolean
}

export function ModernTemplate9({ data, isPreview = false }: ModernTemplate9Props) {
 const formatDate = (date: string) => {
  if (!date) return "";
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  
  // ISO patterns: YYYY-MM or YYYY-MM-DD
  const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)));
    return `${monthNames[month - 1]} ${year}`;
  }
  
  // Slash pattern: MM/YYYY
  const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date);
  if (slashMatch) {
    const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)));
    const year = slashMatch[2];
    return `${monthNames[month - 1]} ${year}`;
  }
  
  // Already formatted like "Jan 2020"
  const monTextMatch = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(date);
  if (monTextMatch) return date;
  
  // Fallback: return raw string
  return date;
};

  return (
    <div className="min-h-screen bg-white print:min-h-0 print:shadow-none">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-8 mb-8 print:break-inside-avoid">
        <div className="flex items-center space-x-8">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            <img
              src={
                data.personalInfo.profilePicture ||
                "https://img.freepik.com/free-photo/emotions-people-concept-headshot-serious-looking-handsome-man-with-beard-looking-confident-determined_1258-26730.jpg?semt=ais_hybrid&w=740&q=80"
              }
              alt={data.personalInfo.fullName || "Profile"}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => {
                e.currentTarget.src =
                  "https://img.freepik.com/free-photo/emotions-people-concept-headshot-serious-looking-handsome-man-with-beard-looking-confident-determined_1258-26730.jpg?semt=ais_hybrid&w=740&q=80";
              }}
            />
          </div>


          {/* Name and Job Title */}
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-slate-700 tracking-wider">
              {data.personalInfo.fullName.toUpperCase()}
            </h1>
            {data.personalInfo.jobTitle && (
              <h2 className="text-2xl text-slate-600 font-medium mt-2">
                {data.personalInfo.jobTitle}
              </h2>
            )}
          </div>
        </div>
      </div>

      <div className="flex px-8 space-x-8 print:break-inside-avoid">
        {/* Left Sidebar */}
        <div className="w-1/3 space-y-8 print:break-inside-avoid">
          {/* Contact */}
          <div className="bg-blue-100 rounded-2xl p-6 print:break-inside-avoid">
            <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-700 pb-2">CONTACT</h2>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4" />
                <span>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4" />
                <span className="break-all">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4" />
                <span>
                  {(data.personalInfo.city || data.personalInfo.country) && (
                    <span>
                      {data.personalInfo.city && data.personalInfo.country
                        ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                        : data.personalInfo.city || data.personalInfo.country}
                    </span>
                  )}
                  {data.personalInfo.address && (
                    <>
                      <br />
                      {data.personalInfo.address}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-blue-100 rounded-2xl p-6 print:break-inside-avoid">
            <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-700 pb-2">SKILLS</h2>
            <div className="space-y-4">
              {data.skills.technical.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-700">Technical Skills</h3>
                  <div className="space-y-2">
                    {data.skills.technical.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-slate-700 rounded-full mr-3"></span>
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm text-slate-700">Soft Skills</h3>
                  <div className="space-y-2">
                    {data.skills.soft.map((skill, index) => (
                      <div key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-slate-700 rounded-full mr-3"></span>
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="bg-blue-100 rounded-2xl p-6 print:break-inside-avoid">
              <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-700 pb-2">LANGUAGES</h2>
              <div className="space-y-2 text-sm text-slate-700">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between print:break-inside-avoid">
                    <span>{lang.name}</span>
                    <span className="text-slate-600">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          <div className="bg-blue-100 rounded-2xl p-6 print:break-inside-avoid">
            <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-700 pb-2">EDUCATION</h2>
            <div className="space-y-4 text-sm text-slate-700">
              {data.education.map((edu) => (
                <div key={edu.id} className="print:break-inside-avoid">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-slate-600">{edu.institutionName}</p>
                  {edu.location && (
                    <p className="text-slate-500">{edu.location}</p>
                  )}
                  {edu.graduationDate && <p className="text-slate-500">{formatDate(edu.graduationDate)}</p>}
                  {edu.gpa && (
                    <p className="text-slate-500 text-xs">GPA: {edu.gpa}</p>
                  )}
                  {edu.honors && (
                    <p className="text-blue-600 text-xs font-medium">{edu.honors}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}
          {data.additional.interests.length > 0 && (
            <div className="bg-blue-100 rounded-2xl p-6 print:break-inside-avoid mb-8">
              <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-700 pb-2">INTERESTS</h2>
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
        <div className="flex-1 space-y-8 print:break-inside-avoid">
          {/* Profile Section */}
          <div className="print:break-inside-avoid">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 bg-slate-700 text-white rounded-full p-1 mr-3" />
              <h2 className="text-2xl font-bold text-slate-700 border-b-2 border-slate-700 pb-1 flex-1">PROFILE</h2>
            </div>
            <div className="relative pl-8">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
              <div className="absolute left-3 top-2 w-2 h-2 bg-slate-700 rounded-full"></div>
              <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
            </div>
          </div>

          {/* Work Experience */}
<div className="print:break-inside-avoid">
  <div className="flex items-center mb-4">
    <Briefcase className="w-6 h-6 bg-slate-700 text-white rounded-full p-1 mr-3" />
    <h2 className="text-2xl font-bold text-slate-700 border-b-2 border-slate-700 pb-1 flex-1">
      WORK EXPERIENCE
    </h2>
  </div>

  <div className="relative pl-8">
    <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
    <div className="space-y-6">
      {data.experience.map((exp, index) => (
        <div key={exp.id} className="relative print:break-inside-avoid">
          {/* Removed bullet circle */}
          <div className="mb-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-slate-700">{exp.jobTitle}</h3>
                <p className="text-gray-600 font-medium">{exp.companyName}</p>
                {exp.location && (
                  <p className="text-gray-500 text-sm">{exp.location}</p>
                )}
              </div>
              <span className="text-gray-500 text-sm">
                {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
              </span>
            </div>
          </div>

          {/* Removed bullets: responsibilities now shown as plain text */}
          <div className="space-y-1 text-sm text-gray-700">
            {exp.responsibilities.map((resp, idx) => (
              <p key={idx}>{resp}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
</div>


     {/* Projects */}
{data.projects.length > 0 && (
  <div className="print:break-inside-avoid mb-8">
    <div className="flex items-center mb-4">
      <FolderOpen className="w-6 h-6 bg-slate-700 text-white rounded-full p-1 mr-3" />
      <h2 className="text-2xl font-bold text-slate-700 border-b-2 border-slate-700 pb-1 flex-1">
        PROJECTS
      </h2>
    </div>

    <div className="relative pl-8">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
      <div className="space-y-6">
        {data.projects.map((project) => (
          <div key={project.id} className="relative print:break-inside-avoid">
            <div className="absolute left-3 top-2 w-2 h-2 bg-slate-700 rounded-full"></div>

            <div className="mb-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-700">{project.name}</h3>
                  <p className="text-gray-600 font-medium">{project.role}</p>
                </div>
                <div className="flex space-x-2">
                  {project.liveDemoLink && (
                    <a
                      href={project.liveDemoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {project.githubLink && (
                    <a
                      href={project.githubLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Description — plain text, no bullets */}
            {project.description && (
              <p className="text-gray-700 text-sm mb-3 whitespace-pre-line">
                {project.description}
              </p>
            )}

            {/* Technologies */}
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-slate-700 px-2 py-1 rounded text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}



          {/* Certifications & Awards */}
          {data.certifications.length > 0 && (
            <div className="print:break-inside-avoid">
              <div className="flex items-center mb-4">
                <Award className="w-6 h-6 bg-slate-700 text-white rounded-full p-1 mr-3" />
                <h2 className="text-2xl font-bold text-slate-700 border-b-2 border-slate-700 pb-1 flex-1">
                  CERTIFICATIONS & AWARDS
                </h2>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="space-y-4">
                  {data.certifications.map((cert) => (
                    <div key={cert.id} className="relative print:break-inside-avoid">
                      <div className="absolute left-3 top-2 w-2 h-2 bg-slate-700 rounded-full"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-700">{cert.title}</h3>
                          <p className="text-gray-600">{cert.issuingOrganization}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-gray-500 text-sm">
                            {formatDate(cert.dateObtained)}
                          </span>
                          {cert.verificationLink && (
                            <div>
                              <a
                                href={cert.verificationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700 text-sm"
                              >
                                Verify
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}