import { CVData } from '@/types/cv-data';
import { Mail, Phone, MapPin, Globe, Calendar, Award, Briefcase, GraduationCap, User, Star } from 'lucide-react';

interface ModernTemplate8Props {
  data: CVData;
  isPreview?: boolean;
}

export default function ModernTemplate8({ data }: ModernTemplate8Props) {
  const formatDate = (date: string) => {
    if (!date) return "";
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    
    const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date);
    if (isoMatch) {
      const year = isoMatch[1];
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)));
      return `${monthNames[month - 1]} ${year}`;
    }
    
    const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date);
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)));
      const year = slashMatch[2];
      return `${monthNames[month - 1]} ${year}`;
    }
    
    const monTextMatch = /^([A-Za-z]{3,})\s+(\d{4})$/.exec(date);
    if (monTextMatch) return date;
    
    return date;
  };

  return (
    <div className="w-full mx-auto bg-white shadow-lg print:shadow-none print:max-w-full print:mx-0">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.3in;
          }
          @page :first {
            margin-top: 0.3in;
            margin-bottom: 0.3in;
          }
          @page :not(:first) {
            margin-top: 0.3in;
            margin-bottom: 0.3in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white;
          }
          .print-break-inside-avoid {
            break-inside: avoid;
          }
          .print-break-after-auto {
            break-after: auto;
          }
          .print-break-before-auto {
            break-before: auto;
          }
          .print-break-before-page {
            break-before: page;
          }
          .print-break-after-page {
            break-after: page;
          }
          .avoid-break-inside {
            break-inside: avoid;
          }
          .allow-break-inside {
            break-inside: auto;
          }
          
          /* Force colors in print */
          .print-bg-blue-50 {
            background-color: #eff6ff !important;
          }
          .print-bg-blue-100 {
            background-color: #dbeafe !important;
          }
          .print-bg-gradient-blue {
            background: linear-gradient(to bottom, #eff6ff, #dbeafe) !important;
          }
        }
      `}</style>

      <div className="flex min-h-[297mm] print:min-h-0">
        {/* Left Column - Light Blue Sidebar */}
        <div className="w-1/3 bg-gradient-to-b from-blue-50 to-blue-100 p-8 print:p-6 print:from-blue-50 print:to-blue-100 print-bg-gradient-blue print:break-inside-avoid">
          {/* Profile Picture */}
          {data.personalInfo?.profilePicture && (
            <div className="mb-6 print:mb-4 avoid-break-inside">
              <div className="w-32 h-32 mx-auto bg-white rounded-2xl p-2 shadow-md print:shadow-sm print:w-28 print:h-28">
                <img
                  src={data.personalInfo.profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
            </div>
          )}

          {/* Name */}
          <div className="text-center mb-8 print:mb-6 avoid-break-inside">
            <h1 className="text-3xl font-bold text-blue-900 mb-2 print:text-2xl">
              {data.personalInfo?.fullName} 
            </h1>
            <p className="text-lg text-blue-700 font-medium print:text-base">
              {data.personalInfo?.jobTitle}
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm print:p-4 print:mb-6 print:rounded-lg avoid-break-inside">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 print:text-base print:mb-3">
              CONTACT
            </h2>
            <div className="space-y-3 print:space-y-2">
              {data.personalInfo?.email && (
                <div className="flex items-center space-x-3 print:space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center print:w-6 print:h-6">
                    <Mail className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                  </div>
                  <span className="text-sm text-gray-700 print:text-xs break-all">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo?.phone && (
                <div className="flex items-center space-x-3 print:space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center print:w-6 print:h-6">
                    <Phone className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                  </div>
                  <span className="text-sm text-gray-700 print:text-xs">{data.personalInfo.phone}</span>
                </div>
              )}
              {(data.personalInfo?.address || data.personalInfo?.city) && (
                <div className="flex items-center space-x-3 print:space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center print:w-6 print:h-6">
                    <MapPin className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                  </div>
                  <span className="text-sm text-gray-700 print:text-xs">
                    {[data.personalInfo.address, data.personalInfo.city, data.personalInfo.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {(data.personalInfo?.linkedin || data.personalInfo?.github) && (
                <div className="flex items-center space-x-3 print:space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center print:w-6 print:h-6">
                    <Globe className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                  </div>
                  <span className="text-sm text-gray-700 print:text-xs break-all">
                    {data.personalInfo.linkedin || data.personalInfo.github}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0) && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm print:p-4 print:mb-6 print:rounded-lg avoid-break-inside">
              <h2 className="text-lg font-semibold text-blue-900 mb-4 print:text-base print:mb-3">
                SKILLS
              </h2>
              <div className="space-y-4 print:space-y-3">
                {data.skills.technical?.slice(0, 8).map((skill: string, index: number) => (
                  <div key={`tech-${index}`} className="print-break-inside-avoid">
                    <div className="flex justify-between items-center mb-2 print:mb-1">
                      <span className="text-sm font-medium text-gray-700 print:text-xs">{skill}</span>
                      <span className="text-xs text-blue-600 font-medium print:text-xs">Technical</span>
                    </div>
                    <div className="w-full bg-blue-50 rounded-full h-2 print:h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300 print:h-1.5"
                        style={{ width: '80%' }}
                      ></div>
                    </div>
                  </div>
                ))}
                {data.skills.soft?.slice(0, 4).map((skill: string, index: number) => (
                  <div key={`soft-${index}`} className="print-break-inside-avoid">
                    <div className="flex justify-between items-center mb-2 print:mb-1">
                      <span className="text-sm font-medium text-gray-700 print:text-xs">{skill}</span>
                      <span className="text-xs text-blue-600 font-medium print:text-xs">Soft</span>
                    </div>
                    <div className="w-full bg-blue-50 rounded-full h-2 print:h-1.5">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300 print:h-1.5"
                        style={{ width: '70%' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm print:p-4 print:rounded-lg avoid-break-inside">
              <h2 className="text-lg font-semibold text-blue-900 mb-4 print:text-base print:mb-3">
                LANGUAGES
              </h2>
              <div className="space-y-3 print:space-y-2">
                {data.languages.map((language, index) => (
                  <div key={index} className="flex justify-between items-center print-break-inside-avoid">
                    <span className="text-sm font-medium text-gray-700 print:text-xs">{language.name}</span>
                    <span className="text-xs text-blue-600 font-medium print:text-xs">{language.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="flex-1 p-8 print:p-6 print:break-inside-avoid">
          {/* Profile Summary */}
          {data.personalInfo?.summary && (
            <div className="mb-8 print:mb-6 avoid-break-inside">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center print:text-lg print:mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 print:w-5 print:h-5">
                  <User className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                </div>
                PROFILE
              </h2>
              <p className="text-gray-700 leading-relaxed print:text-sm print:leading-normal">{data.personalInfo.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="mb-8 print:mb-6 avoid-break-inside">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center print:text-lg print:mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 print:w-5 print:h-5">
                  <Briefcase className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                </div>
                WORK EXPERIENCE
              </h2>
              <div className="space-y-6 print:space-y-4">
                {data.experience.map((exp, index) => (
                  <div key={index} className="relative pl-6 print-break-inside-avoid">
                    <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full print:w-2 print:h-2"></div>
                    <div className="absolute left-1.5 top-5 w-0.5 h-full bg-blue-200 print:left-1"></div>
                    <div className="bg-blue-50 rounded-lg p-4 print:p-3 print-bg-blue-50">
                      <div className="flex justify-between items-start mb-2 print:mb-1">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900 print:text-base">{exp.jobTitle}</h3>
                          <p className="text-blue-700 font-medium print:text-sm">{exp.companyName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-600 flex items-center print:text-xs">
                            <Calendar className="w-4 h-4 mr-1 print:w-3 print:h-3" />
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                          </p>
                          {exp.location && (
                            <p className="text-sm text-gray-500 print:text-xs">{exp.location}</p>
                          )}
                        </div>
                      </div>
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div className="text-gray-700 text-sm leading-relaxed print:text-xs">
                          <ul className="list-disc list-inside space-y-1 print:space-y-0.5">
                            {exp.responsibilities.slice(0, 4).map((responsibility, idx) => (
                              <li key={idx} className="print-break-inside-avoid">{responsibility}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <div className="mb-8 print:mb-6 avoid-break-inside">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center print:text-lg print:mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 print:w-5 print:h-5">
                  <GraduationCap className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                </div>
                EDUCATION
              </h2>
              <div className="space-y-4 print:space-y-3">
                {data.education.map((edu, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 print:p-3 print-bg-blue-50 print-break-inside-avoid">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900 print:text-base">{edu.degree}</h3>
                        <p className="text-blue-700 print:text-sm">{edu.institutionName}</p>
                        {edu.gpa && (
                          <p className="text-sm text-gray-600 print:text-xs">GPA: {edu.gpa}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600 flex items-center print:text-xs">
                          <Calendar className="w-4 h-4 mr-1 print:w-3 print:h-3" />
                          {formatDate(edu.graduationDate)}
                        </p>
                        {edu.location && (
                          <p className="text-sm text-gray-500 print:text-xs">{edu.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {data.projects && data.projects.length > 0 && (
            <div className="mb-8 print:mb-6 avoid-break-inside">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center print:text-lg print:mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 print:w-5 print:h-5">
                  <Star className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                </div>
                PROJECTS
              </h2>
              <div className="space-y-4 print:space-y-3">
                {data.projects.map((project, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 print:p-3 print-bg-blue-50 print-break-inside-avoid">
                    <div className="flex justify-between items-start mb-2 print:mb-1">
                      <h3 className="text-lg font-semibold text-blue-900 print:text-base">{project.name}</h3>
                    </div>
                    {project.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-3 print:text-xs print:mb-2">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2 print:gap-1">
                        {project.technologies.slice(0, 6).map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium print:px-2 print:py-0.5 print:text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications && data.certifications.length > 0 && (
            <div className="mb-8 print:mb-6 avoid-break-inside">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center print:text-lg print:mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 print:w-5 print:h-5">
                  <Award className="w-4 h-4 text-blue-600 print:w-3 print:h-3" />
                </div>
                CERTIFICATIONS
              </h2>
              <div className="space-y-3 print:space-y-2">
                {data.certifications.map((cert, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4 print:p-3 print-bg-blue-50 print-break-inside-avoid">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-blue-900 print:text-sm">{cert.title}</h3>
                        <p className="text-blue-700 text-sm print:text-xs">{cert.issuingOrganization}</p>
                      </div>
                      {cert.dateObtained && (
                        <p className="text-sm text-blue-600 flex items-center print:text-xs">
                          <Calendar className="w-4 h-4 mr-1 print:w-3 print:h-3" />
                          {formatDate(cert.dateObtained)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          {data.additional && (
            <div className="mb-8 print:mb-6 avoid-break-inside">
              <h2 className="text-xl font-bold text-blue-900 mb-4 print:text-lg print:mb-3">
                ADDITIONAL INFORMATION
              </h2>
              <div className="space-y-4 print:space-y-3">
                {data.additional.interests && data.additional.interests.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 print:p-3 print-bg-blue-50">
                    <h3 className="font-semibold text-blue-900 mb-3 print:text-sm print:mb-2">Interests</h3>
                    <div className="flex flex-wrap gap-2 print:gap-1">
                      {data.additional.interests.slice(0, 6).map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full print:px-2 print:py-0.5 print:text-xs"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { ModernTemplate8 };