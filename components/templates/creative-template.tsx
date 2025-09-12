"use client";

import type { CVData } from "../../types/cv-data";
import {
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Github,
  Award,
  Calendar,
  GraduationCap,
  Briefcase,
  Globe,
  Heart,
} from "lucide-react";

interface CreativeTemplateProps {
  data: CVData;
  isPreview?: boolean;
}

export function CreativeTemplate({
  data,
  isPreview = false,
}: CreativeTemplateProps) {
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
    <div className="min-h-screen bg-white print:min-h-0 print:shadow-none">
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

      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white print:break-inside-avoid">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {data.personalInfo.profilePicture && (
              <img
                src={data.personalInfo.profilePicture || "/placeholder.svg"}
                alt={data.personalInfo.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl"
              />
            )}
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                {data.personalInfo.fullName}
              </h1>
              <h2 className="text-xl lg:text-2xl font-light mb-4 text-emerald-100">
                {data.personalInfo.jobTitle}
              </h2>
              <p className="text-lg leading-relaxed text-emerald-50 max-w-3xl">
                {data.personalInfo.summary}
              </p>
            </div>
            <div className="flex flex-col gap-3 text-emerald-100">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>{data.personalInfo.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <span>{data.personalInfo.phone}</span>
              </div>
              {(data.personalInfo.city || data.personalInfo.country || data.personalInfo.address) && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 mt-0.5" />
                  <div>
                    {(data.personalInfo.city || data.personalInfo.country) && (
                      <span>
                        {data.personalInfo.city && data.personalInfo.country
                          ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                          : data.personalInfo.city || data.personalInfo.country}
                      </span>
                    )}
                    {data.personalInfo.address && (
                      <div className={`text-sm text-gray-100 ${(data.personalInfo.city || data.personalInfo.country) ? 'mt-1' : ''}`}>
                        {data.personalInfo.address}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          {/* Skills */}
          <div className="print:break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Skills</h3>
            </div>
            {data.skills.technical.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Technical Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.skills.technical.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-sm font-medium border border-emerald-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {data.skills.soft.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Soft Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {data.skills.soft.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-sm font-medium border border-teal-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Languages</h3>
              </div>
              <div className="space-y-4">
                {data.languages.map((lang) => (
                  <div
                    key={lang.id}
                    className="flex justify-between items-center"
                  >
                    <span className="text-gray-900 font-medium">
                      {lang.name}
                    </span>
                    <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {lang.proficiency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          <div className="print:break-inside-avoid">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Education</h3>
            </div>
            <div className="space-y-6">
              {data.education.map((edu) => (
                <div
                  key={edu.id}
                  className="relative pl-6 print:break-inside-avoid"
                >
                  <div className="absolute left-0 top-2 w-3 h-3 rounded-full bg-purple-500"></div>
                  <div className="border-l-2 border-purple-100 pl-6 pb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">
                      {edu.degree}
                    </h4>
                    <p className="text-purple-600 font-medium mb-1">
                      {edu.institutionName}
                    </p>
                    {edu.location && (
                      <p className="text-gray-500 text-sm mb-1">
                        {edu.location}
                      </p>
                    )}
                    {edu.graduationDate && (
                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(edu.graduationDate)}</span>
                      </div>
                    )}
                    {edu.gpa && (
                      <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>
                    )}
                    {edu.honors && (
                      <p className="text-purple-600 text-sm font-medium">
                        {edu.honors}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Experience */}
          <div className="print:break-inside-avoid">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">
                Work Experience
              </h3>
            </div>
            <div className="space-y-8">
              {data.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="relative pl-8 print:break-inside-avoid"
                >
                  <div className="absolute left-0 top-3 w-4 h-4 rounded-full bg-emerald-500 border-4 border-emerald-100"></div>
                  <div className="border-l-2 border-emerald-100 pl-8 pb-8">
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-2 mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {exp.jobTitle}
                        </h4>
                        <p className="text-emerald-600 font-semibold text-lg">
                          {exp.companyName}
                        </p>
                        {exp.location && (
                          <p className="text-gray-500">{exp.location}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-4 py-2 rounded-full">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {formatDate(exp.startDate)} -{" "}
                          {exp.current ? "Present" : formatDate(exp.endDate)}
                        </span>
                      </div>
                    </div>
                    <ul className="text-gray-700 space-y-2 leading-relaxed">
                      {exp.responsibilities.map((resp, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0"></span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Featured Projects
                </h3>
              </div>
              <div className="grid gap-6">
                {data.projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-gray-50 rounded-xl p-6 border border-gray-200 print:break-inside-avoid"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                          {project.name}
                        </h4>
                        <p className="text-orange-600 font-semibold">
                          {project.role}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {project.liveDemoLink && (
                          <a
                            href={project.liveDemoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-100 text-emerald-600 p-2 rounded-lg hover:bg-emerald-200 transition-colors"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-200 text-gray-600 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-white text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-300"
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
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Certifications & Awards
                </h3>
              </div>
              <div className="grid gap-4">
                {data.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex justify-between items-center bg-yellow-50 rounded-lg p-4 border border-yellow-200 print:break-inside-avoid"
                  >
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">
                        {cert.title}
                      </h4>
                      <p className="text-yellow-700 font-medium">
                        {cert.issuingOrganization}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {formatDate(cert.dateObtained)}
                        </span>
                      </div>
                      {cert.verificationLink && (
                        <a
                          href={cert.verificationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                        >
                          Verify Certificate
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interests */}
          {data.additional.interests.length > 0 && (
            <div className="print:break-inside-avoid">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Interests & Hobbies
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {data.additional.interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-pink-50 text-pink-700 px-4 py-2 rounded-full font-medium border border-pink-200"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
