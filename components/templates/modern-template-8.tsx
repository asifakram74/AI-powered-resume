import { CVData } from '@/types/cv-data';
import { Mail, Phone, MapPin, Globe, Calendar, Award, Briefcase, GraduationCap, User, Star } from 'lucide-react';

interface ModernTemplate8Props {
  data: CVData;
    isPreview?: boolean

}

export default function ModernTemplate8({ data }: ModernTemplate8Props) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-lg">
      <div className="flex min-h-[297mm]">
        {/* Left Column - Light Blue Sidebar */}
        <div className="w-1/3 bg-gradient-to-b from-blue-50 to-blue-100 p-8">
          {/* Profile Picture */}
          {data.personalInfo?.profilePicture && (
            <div className="mb-6">
              <div className="w-32 h-32 mx-auto bg-white rounded-2xl p-2 shadow-md">
                <img
                  src={data.personalInfo.profilePicture}
                  alt="Profile"
                  className="w-full h-full rounded-xl object-cover"
                />
              </div>
            </div>
          )}

          {/* Name */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-900 mb-2">
              {data.personalInfo?.fullName} 
            </h1>
            <p className="text-lg text-blue-700 font-medium">
              {data.personalInfo?.jobTitle}
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              CONTACT
            </h2>
            <div className="space-y-3">
              {data.personalInfo?.email && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo?.phone && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">{data.personalInfo.phone}</span>
                </div>
              )}
              {(data.personalInfo?.address || data.personalInfo?.city) && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {[data.personalInfo.address, data.personalInfo.city, data.personalInfo.country].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {(data.personalInfo?.linkedin || data.personalInfo?.github) && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-700">
                    {data.personalInfo.linkedin || data.personalInfo.github}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0) && (
            <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                SKILLS
              </h2>
              <div className="space-y-4">
                {data.skills.technical?.map((skill: string, index: number) => (
                  <div key={`tech-${index}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{skill}</span>
                      <span className="text-xs text-blue-600 font-medium">Technical</span>
                    </div>
                    <div className="w-full bg-blue-50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: '80%' }}
                      ></div>
                    </div>
                  </div>
                ))}
                {data.skills.soft?.map((skill: string, index: number) => (
                  <div key={`soft-${index}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{skill}</span>
                      <span className="text-xs text-blue-600 font-medium">Soft</span>
                    </div>
                    <div className="w-full bg-blue-50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
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
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-blue-900 mb-4">
                LANGUAGES
              </h2>
              <div className="space-y-3">
                {data.languages.map((language, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{language.name}</span>
                    <span className="text-xs text-blue-600 font-medium">{language.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Main Content */}
        <div className="flex-1 p-8">
          {/* Profile Summary */}
          {data.personalInfo?.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                PROFILE
              </h2>
              <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
            </div>
          )}

          {/* Work Experience */}
          {data.experience && data.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                WORK EXPERIENCE
              </h2>
              <div className="space-y-6">
                {data.experience.map((exp, index) => (
                  <div key={index} className="relative pl-6">
                    <div className="absolute left-0 top-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div className="absolute left-1.5 top-5 w-0.5 h-full bg-blue-200"></div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900">{exp.jobTitle}</h3>
                          <p className="text-blue-700 font-medium">{exp.companyName}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-600 flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                          {exp.location && (
                            <p className="text-sm text-gray-500">{exp.location}</p>
                          )}
                        </div>
                      </div>
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div className="text-gray-700 text-sm leading-relaxed">
                          <ul className="list-disc list-inside space-y-1">
                            {exp.responsibilities.map((responsibility, idx) => (
                              <li key={idx}>{responsibility}</li>
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
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                </div>
                EDUCATION
              </h2>
              <div className="space-y-4">
                {data.education.map((edu, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">{edu.degree}</h3>
                        <p className="text-blue-700">{edu.institutionName}</p>
                        {edu.gpa && (
                          <p className="text-sm text-gray-600">GPA: {edu.gpa}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {edu.startDate} - {edu.endDate}
                        </p>
                        {edu.location && (
                          <p className="text-sm text-gray-500">{edu.location}</p>
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
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Star className="w-4 h-4 text-blue-600" />
                </div>
                PROJECTS
              </h2>
              <div className="space-y-4">
                {data.projects.map((project, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-blue-900">{project.name}</h3>
                      {project.date && (
                        <p className="text-sm text-blue-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {project.date}
                        </p>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-gray-700 text-sm leading-relaxed mb-3">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 bg-blue-200 text-blue-800 text-xs rounded-full font-medium"
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
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <Award className="w-4 h-4 text-blue-600" />
                </div>
                CERTIFICATIONS
              </h2>
              <div className="space-y-3">
                {data.certifications.map((cert, index) => (
                  <div key={index} className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-blue-900">{cert.name}</h3>
                        <p className="text-blue-700 text-sm">{cert.issuer}</p>
                      </div>
                      {cert.date && (
                        <p className="text-sm text-blue-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {cert.date}
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
            <div className="mb-8">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                ADDITIONAL INFORMATION
              </h2>
              <div className="space-y-4">
                {data.additional.interests && data.additional.interests.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {data.additional.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-200 text-blue-800 text-sm rounded-full"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {data.additional.awards && data.additional.awards.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Awards</h3>
                    <div className="space-y-2">
                      {data.additional.awards.map((award, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-700">{award.title}</span>
                          {award.date && (
                            <span className="text-sm text-blue-600">{award.date}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.additional.publications && data.additional.publications.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-900 mb-3">Publications</h3>
                    <div className="space-y-2">
                      {data.additional.publications.map((pub, index) => (
                        <div key={index}>
                          <p className="text-gray-700 font-medium">{pub.title}</p>
                          <p className="text-sm text-blue-600">{pub.publisher} - {pub.date}</p>
                        </div>
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