// import { CVData } from '@/types/cv-data';
// import { Mail, Phone, MapPin, Globe, Calendar, Award, Briefcase, GraduationCap, User, Star } from 'lucide-react';

// interface ModernTemplate9Props {
//   data: CVData;
//     isPreview?: boolean

// }

// export default function ModernTemplate9({ data }: ModernTemplate9Props) {
//   return (
//     <div className="w-full max-w-4xl mx-auto bg-white shadow-lg">
//       <div className="flex min-h-[297mm]">
//         {/* Left Column - Name and Contact */}
//         <div className="w-1/3 bg-gradient-to-b from-slate-50 to-slate-100 p-8">
//           {/* Profile Picture */}
//           {data.personalInfo?.profilePicture && (
//             <div className="mb-6">
//               <img
//                 src={data.personalInfo.profilePicture}
//                 alt="Profile"
//                 className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-md"
//               />
//             </div>
//           )}

//           {/* Name */}
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">
//               {data.personalInfo?.firstName} {data.personalInfo?.lastName}
//             </h1>
//             <p className="text-lg text-gray-600 font-medium">
//               {data.personalInfo?.jobTitle}
//             </p>
//           </div>

//           {/* Contact Information */}
//           <div className="space-y-4 mb-8">
//             <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2">
//               CONTACT
//             </h2>
//             {data.personalInfo?.email && (
//               <div className="flex items-center space-x-3">
//                 <Mail className="w-4 h-4 text-gray-600" />
//                 <span className="text-sm text-gray-700">{data.personalInfo.email}</span>
//               </div>
//             )}
//             {data.personalInfo?.phone && (
//               <div className="flex items-center space-x-3">
//                 <Phone className="w-4 h-4 text-gray-600" />
//                 <span className="text-sm text-gray-700">{data.personalInfo.phone}</span>
//               </div>
//             )}
//             {data.personalInfo?.location && (
//               <div className="flex items-center space-x-3">
//                 <MapPin className="w-4 h-4 text-gray-600" />
//                 <span className="text-sm text-gray-700">{data.personalInfo.location}</span>
//               </div>
//             )}
//             {data.personalInfo?.website && (
//               <div className="flex items-center space-x-3">
//                 <Globe className="w-4 h-4 text-gray-600" />
//                 <span className="text-sm text-gray-700">{data.personalInfo.website}</span>
//               </div>
//             )}
//           </div>

//           {/* Skills */}
//           {data.skills && data.skills.length > 0 && (
//             <div className="mb-8">
//               <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
//                 SKILLS
//               </h2>
//               <div className="space-y-3">
//                 {data.skills.map((skill, index) => (
//                   <div key={index}>
//                     <div className="flex justify-between items-center mb-1">
//                       <span className="text-sm font-medium text-gray-700">{skill.name}</span>
//                       <span className="text-xs text-gray-500">{skill.level}</span>
//                     </div>
//                     <div className="w-full bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-gray-600 h-2 rounded-full"
//                         style={{
//                           width: `${skill.level === 'Expert' ? 100 : skill.level === 'Advanced' ? 80 : skill.level === 'Intermediate' ? 60 : 40}%`
//                         }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Languages */}
//           {data.languages && data.languages.length > 0 && (
//             <div className="mb-8">
//               <h2 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
//                 LANGUAGES
//               </h2>
//               <div className="space-y-2">
//                 {data.languages.map((language, index) => (
//                   <div key={index} className="flex justify-between items-center">
//                     <span className="text-sm font-medium text-gray-700">{language.name}</span>
//                     <span className="text-xs text-gray-500">{language.proficiency}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right Column - Main Content */}
//         <div className="flex-1 p-8">
//           {/* Profile Summary */}
//           {data.personalInfo?.summary && (
//             <div className="mb-8">
//               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <User className="w-5 h-5 mr-2" />
//                 PROFILE
//               </h2>
//               <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
//             </div>
//           )}

//           {/* Work Experience */}
//           {data.experience && data.experience.length > 0 && (
//             <div className="mb-8">
//               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <Briefcase className="w-5 h-5 mr-2" />
//                 WORK EXPERIENCE
//               </h2>
//               <div className="space-y-6">
//                 {data.experience.map((exp, index) => (
//                   <div key={index} className="border-l-2 border-gray-300 pl-4">
//                     <div className="flex justify-between items-start mb-2">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-800">{exp.position}</h3>
//                         <p className="text-gray-600 font-medium">{exp.company}</p>
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-500 flex items-center">
//                           <Calendar className="w-4 h-4 mr-1" />
//                           {exp.startDate} - {exp.endDate || 'Present'}
//                         </p>
//                         {exp.location && (
//                           <p className="text-sm text-gray-500">{exp.location}</p>
//                         )}
//                       </div>
//                     </div>
//                     {exp.description && (
//                       <p className="text-gray-700 text-sm leading-relaxed">{exp.description}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Education */}
//           {data.education && data.education.length > 0 && (
//             <div className="mb-8">
//               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <GraduationCap className="w-5 h-5 mr-2" />
//                 EDUCATION
//               </h2>
//               <div className="space-y-4">
//                 {data.education.map((edu, index) => (
//                   <div key={index} className="border-l-2 border-gray-300 pl-4">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
//                         <p className="text-gray-600">{edu.institution}</p>
//                         {edu.gpa && (
//                           <p className="text-sm text-gray-500">GPA: {edu.gpa}</p>
//                         )}
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-500 flex items-center">
//                           <Calendar className="w-4 h-4 mr-1" />
//                           {edu.startDate} - {edu.endDate}
//                         </p>
//                         {edu.location && (
//                           <p className="text-sm text-gray-500">{edu.location}</p>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Projects */}
//           {data.projects && data.projects.length > 0 && (
//             <div className="mb-8">
//               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <Star className="w-5 h-5 mr-2" />
//                 PROJECTS
//               </h2>
//               <div className="space-y-4">
//                 {data.projects.map((project, index) => (
//                   <div key={index} className="border-l-2 border-gray-300 pl-4">
//                     <div className="flex justify-between items-start mb-2">
//                       <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
//                       {project.date && (
//                         <p className="text-sm text-gray-500 flex items-center">
//                           <Calendar className="w-4 h-4 mr-1" />
//                           {project.date}
//                         </p>
//                       )}
//                     </div>
//                     {project.description && (
//                       <p className="text-gray-700 text-sm leading-relaxed mb-2">{project.description}</p>
//                     )}
//                     {project.technologies && project.technologies.length > 0 && (
//                       <div className="flex flex-wrap gap-2">
//                         {project.technologies.map((tech, techIndex) => (
//                           <span
//                             key={techIndex}
//                             className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
//                           >
//                             {tech}
//                           </span>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Certifications */}
//           {data.certifications && data.certifications.length > 0 && (
//             <div className="mb-8">
//               <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
//                 <Award className="w-5 h-5 mr-2" />
//                 CERTIFICATIONS
//               </h2>
//               <div className="space-y-3">
//                 {data.certifications.map((cert, index) => (
//                   <div key={index} className="border-l-2 border-gray-300 pl-4">
//                     <div className="flex justify-between items-start">
//                       <div>
//                         <h3 className="font-semibold text-gray-800">{cert.name}</h3>
//                         <p className="text-gray-600 text-sm">{cert.issuer}</p>
//                       </div>
//                       {cert.date && (
//                         <p className="text-sm text-gray-500 flex items-center">
//                           <Calendar className="w-4 h-4 mr-1" />
//                           {cert.date}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Additional Information */}
//           {data.additional && (
//             <div className="mb-8">
//               <h2 className="text-xl font-bold text-gray-800 mb-4">
//                 ADDITIONAL INFORMATION
//               </h2>
//               <div className="space-y-4">
//                 {data.additional.interests && data.additional.interests.length > 0 && (
//                   <div>
//                     <h3 className="font-semibold text-gray-700 mb-2">Interests</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {data.additional.interests.map((interest, index) => (
//                         <span
//                           key={index}
//                           className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
//                         >
//                           {interest}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {data.additional.awards && data.additional.awards.length > 0 && (
//                   <div>
//                     <h3 className="font-semibold text-gray-700 mb-2">Awards</h3>
//                     <div className="space-y-2">
//                       {data.additional.awards.map((award, index) => (
//                         <div key={index} className="flex justify-between items-center">
//                           <span className="text-gray-700">{award.title}</span>
//                           {award.date && (
//                             <span className="text-sm text-gray-500">{award.date}</span>
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//                 {data.additional.publications && data.additional.publications.length > 0 && (
//                   <div>
//                     <h3 className="font-semibold text-gray-700 mb-2">Publications</h3>
//                     <div className="space-y-2">
//                       {data.additional.publications.map((pub, index) => (
//                         <div key={index}>
//                           <p className="text-gray-700 font-medium">{pub.title}</p>
//                           <p className="text-sm text-gray-600">{pub.publisher} - {pub.date}</p>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }







"use client"

import { Mail, Phone, MapPin, User, Briefcase, FolderOpen } from "lucide-react"
import type { CVData } from "../../types/cv-data"

interface ModernTemplate9Props {
  data: CVData
  isPreview?: boolean
}

export function ModernTemplate9({ data, isPreview = false }: ModernTemplate9Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const [year, month] = date.split("-")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`
  }

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
        }
      `}</style>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-8 mb-8">
        <div className="flex items-center space-x-8">
          {/* Profile Picture */}
          {data.personalInfo.profilePicture && (
            <div className="flex-shrink-0">
              <img
                src={data.personalInfo.profilePicture || "/placeholder.svg"}
                alt={data.personalInfo.fullName}
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            </div>
          )}

          {/* Name */}
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-slate-700 tracking-wider">
              {data.personalInfo.fullName.toUpperCase()}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex px-8 space-x-8">
        {/* Left Sidebar */}
        <div className="w-1/3 space-y-8">
          {/* Contact */}
          <div className="bg-blue-100 rounded-2xl p-6">
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
                  {data.personalInfo.city}, {data.personalInfo.country}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-700 pb-2">SKILLS</h2>
            <div className="space-y-2 text-sm text-slate-700">
              {[...data.skills.technical, ...data.skills.soft].map((skill, index) => (
                <div key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-slate-700 rounded-full mr-3"></span>
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          {data.languages.length > 0 && (
            <div className="bg-blue-100 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-700 pb-2">LANGUAGES</h2>
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
          <div className="bg-blue-100 rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700 border-b-2 border-slate-700 pb-2">EDUCATION</h2>
            <div className="space-y-4 text-sm text-slate-700">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="font-semibold">{edu.degree}</h3>
                  <p className="text-slate-600">{edu.institutionName}</p>
                  {edu.graduationDate && <p className="text-slate-500">{formatDate(edu.graduationDate)}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 space-y-8">
          {/* Profile Section */}
          <div>
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
          <div>
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
                  <div key={exp.id} className="relative">
                    <div className="absolute left-3 top-2 w-2 h-2 bg-slate-700 rounded-full"></div>
                    <div className="mb-2">
                      <h3 className="text-lg font-bold text-slate-700">{exp.jobTitle}</h3>
                      <p className="text-gray-600 font-medium">{exp.companyName}</p>
                      <p className="text-gray-500 text-sm">
                        {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                      </p>
                    </div>
                    <ul className="space-y-1 text-sm text-gray-700">
                      {exp.responsibilities.map((resp, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-slate-700 mr-2">•</span>
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects */}
          {data.projects.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <FolderOpen className="w-6 h-6 bg-slate-700 text-white rounded-full p-1 mr-3" />
                <h2 className="text-2xl font-bold text-slate-700 border-b-2 border-slate-700 pb-1 flex-1">PROJECTS</h2>
              </div>
              <div className="relative pl-8">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
                <div className="space-y-6">
                  {data.projects.map((project, index) => (
                    <div key={project.id} className="relative">
                      <div className="absolute left-3 top-2 w-2 h-2 bg-slate-700 rounded-full"></div>
                      <div className="mb-2">
                        <h3 className="text-lg font-bold text-slate-700">{project.name}</h3>
                        <p className="text-gray-600 font-medium">{project.role}</p>
                      </div>
                      <p className="text-gray-700 text-sm mb-2">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, idx) => (
                          <span key={idx} className="bg-blue-100 text-slate-700 px-2 py-1 rounded text-xs">
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
        </div>
      </div>
    </div>
  )
}
