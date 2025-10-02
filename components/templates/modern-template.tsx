"use client";

import { Mail, Phone, MapPin, ExternalLink, Github } from "lucide-react";
import type { CVData } from "../../types/cv-data";

interface ModernTemplateProps {
  data: CVData;
  isPreview?: boolean;
}

export function ModernTemplate({
  data,
  isPreview = false,
}: ModernTemplateProps) {
  const formatDate = (date: string) => {
    if (!date) return "";
    const [year, month] = date.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="flex max-w-full mx-auto min-h-screen bg-white print:min-h-0 print:shadow-none">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
          .print\\:break-before-page {
            break-before: page;
          }
          .print\\:break-after-avoid {
            break-after: avoid;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div className="w-1/3 bg-slate-800 text-white p-8 print:break-inside-avoid">
        <div className="space-y-8">
          {/* Profile Picture */}
          {data.personalInfo.profilePicture && (
            <div className="text-center print:break-inside-avoid">
              <img
                src={data.personalInfo.profilePicture || "/placeholder.svg"}
                alt={data.personalInfo.fullName}
                className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-blue-300"
              />
            </div>
          )}

          {/* Contact Info */}
          <div className="print:break-inside-avoid">
            <h2 className="text-xl font-bold mb-4 text-blue-300">Contact</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-300" />
                <span className="break-all">{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-blue-300" />
                <span>{data.personalInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-blue-300" />
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
                      {/* <br /> */}
                      {data.personalInfo.address}
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="print:break-inside-avoid">
            <h2 className="text-xl font-bold mb-4 text-blue-300">Skills</h2>
            <div className="space-y-4">
              {data.skills.technical.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm">
                    Technical Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.technical.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-600 text-white px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-sm">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.skills.soft.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-slate-600 text-white px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="print:break-inside-avoid">
              <h2 className="text-xl font-bold mb-4 text-blue-300">
                Languages
              </h2>
              <div className="space-y-2">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between text-sm">
                    <span>{lang.name}</span>
                    <span className="text-blue-200">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          <div className="print:break-inside-avoid">
            <h2 className="text-xl font-bold mb-4 text-blue-300">Education</h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="text-sm print:break-inside-avoid">
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-blue-200">{edu.institutionName}</p>
                  {edu.location && (
                    <p className="text-gray-300">{edu.location}</p>
                  )}
                  {edu.graduationDate && (
                    <p className="text-gray-400 text-xs">
                      {formatDate(edu.graduationDate)}
                    </p>
                  )}
                  {edu.gpa && (
                    <p className="text-gray-400 text-xs">GPA: {edu.gpa}</p>
                  )}
                  {edu.honors && (
                    <p className="text-blue-200 text-xs">{edu.honors}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}
          {data.additional.interests.length > 0 && (
            <div className="print:break-inside-avoid">
              <h2 className="text-xl font-bold mb-4 text-blue-300">
                Interests
              </h2>
              <div className="flex flex-wrap gap-2">
                {data.additional.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-slate-600 text-white px-2 py-1 rounded text-xs"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="border-b border-gray-200 pb-6 mb-8 print:break-inside-avoid">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {data.personalInfo.fullName}
            </h1>
            <h2 className="text-xl text-blue-600 font-medium mb-4">
              {data.personalInfo.jobTitle}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {data.personalInfo.summary}
            </p>
          </div>

          {/* Experience */}
          <div className="print:break-inside-avoid">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div
                  key={exp.id}
                  className="border-l-4 border-blue-500 pl-6 print:break-inside-avoid"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {exp.jobTitle}
                      </h3>
                      <p className="text-blue-600 font-medium">
                        {exp.companyName}
                      </p>
                      {exp.location && (
                        <p className="text-gray-500 text-sm">{exp.location}</p>
                      )}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDate(exp.startDate)} -{" "}
                      {exp.current ? "Present" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <ul className="text-gray-700 leading-relaxed space-y-1">
                    {exp.responsibilities.map((resp, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Projects
              </h2>
              <div className="space-y-6">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="border rounded-lg p-4 print:break-inside-avoid"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {project.name}
                        </h3>
                        <p className="text-blue-600 font-medium">
                          {project.role}
                        </p>
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
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
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
            <div className="print:break-inside-avoid">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Certifications & Awards
              </h2>
              <div className="space-y-3">
                {data.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-center print:break-inside-avoid"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {cert.title}
                      </h3>
                      <p className="text-gray-600">
                        {cert.issuingOrganization}
                      </p>
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
