import type { CVData } from "../../types/cv-data"

interface ClassicTemplate2Props {
  data: CVData
  isPreview?: boolean
}

export function ClassicTemplate2({ data, isPreview = false }: ClassicTemplate2Props) {
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

  // Compute location and whether to show address without duplication
  const locationText = (data.personalInfo.city && data.personalInfo.country)
    ? `${data.personalInfo.city}, ${data.personalInfo.country}`
    : (data.personalInfo.city || data.personalInfo.country || "")

  const addressText = (data.personalInfo.address || "").trim()
  const locLower = locationText.toLowerCase()
  const addrLower = addressText.toLowerCase()
  const showAddress = Boolean(addressText) && (!locLower || (addrLower !== locLower && !addrLower.includes(locLower)))

  return (
    <div className="max-w-full mx-auto bg-white p-12 min-h-screen font-serif print:px-4 print:py-8">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.2in;
          }
          @page :first {
            margin-top: 0.2in;
            margin-bottom: 0.2in;
          }
          @page :not(:first) {
            margin-top: 0.2in;
            margin-bottom: 0.2in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background: white;
          }
        }
      `}</style>

      {/* Header with underline */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-wide">
          {data.personalInfo.fullName.toUpperCase()}
        </h1>
        <div className="w-32 h-1 bg-gray-800 mx-auto mb-4"></div>
        <h2 className="text-lg text-gray-700 mb-6 italic">{data.personalInfo.jobTitle}</h2>
        <div className="flex justify-center items-center text-gray-600 text-sm space-x-6">
          <span>{data.personalInfo.email}</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
          <span>{data.personalInfo.phone}</span>
          {(data.personalInfo.city || data.personalInfo.country) && (
            <>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>
                {locationText}
                {showAddress && (
                  <> {addressText}</>
                )}
              </span>
            </>
          )}
          {!data.personalInfo.city && !data.personalInfo.country && data.personalInfo.address && (
            <>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{data.personalInfo.address}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="mb-10">
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase">Executive Summary</h2>
          <div className="w-24 h-0.5 bg-gray-400 mx-auto mt-2"></div>
        </div>
        <p className="text-gray-700 leading-relaxed text-center italic max-w-3xl mx-auto">
          {data.personalInfo.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-10">
        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase">Professional Experience</h2>
          <div className="w-24 h-0.5 bg-gray-400 mx-auto mt-2"></div>
        </div>
        <div className="space-y-8">
          {data.experience.map((exp) => (
            <div key={exp.id} className="border-l-2 border-gray-300 pl-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{exp.jobTitle}</h3>
                  <p className="text-gray-700 font-semibold">{exp.companyName}</p>
                  {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                </div>
                <span className="text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded">
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <ul className="text-gray-700 leading-relaxed space-y-2">
                {exp.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-3 mt-2">▪</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout for remaining sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column */}
        <div className="space-y-10">
          {/* Education */}
          <div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase">Education</h2>
              <div className="w-16 h-0.5 bg-gray-400 mx-auto mt-2"></div>
            </div>
            <div className="space-y-6">
              {data.education.map((edu) => (
                <div key={edu.id} className="text-center">
                  <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-700 font-medium">{edu.institutionName}</p>
                  {edu.location && <p className="text-gray-600 text-sm">{edu.location}</p>}
                  {edu.graduationDate && <p className="text-gray-600 text-sm">{formatDate(edu.graduationDate)}</p>}
                  {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
                  {edu.honors && <p className="text-gray-700 text-sm italic">{edu.honors}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase">Core Competencies</h2>
              <div className="w-16 h-0.5 bg-gray-400 mx-auto mt-2"></div>
            </div>
            <div className="space-y-4">
              {data.skills.technical.length > 0 && (
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Technical</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{data.skills.technical.join(" • ")}</p>
                </div>
              )}
              {data.skills.soft.length > 0 && (
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">Leadership</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">{data.skills.soft.join(" • ")}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-10">
          {/* Languages */}
          {data.languages.length > 0 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase">Languages</h2>
                <div className="w-16 h-0.5 bg-gray-400 mx-auto mt-2"></div>
              </div>
              <div className="space-y-3">
                {data.languages.map((lang) => (
                  <div key={lang.id} className="text-center">
                    <span className="font-semibold text-gray-900">{lang.name}</span>
                    <span className="text-gray-600 text-sm block">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {data.certifications.length > 0 && (
            <div>
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase">Certifications</h2>
                <div className="w-16 h-0.5 bg-gray-400 mx-auto mt-2"></div>
              </div>
              <div className="space-y-4">
                {data.certifications.map((cert) => (
                  <div key={cert.id} className="text-center">
                    <h3 className="font-semibold text-gray-900">{cert.title}</h3>
                    <p className="text-gray-700 text-sm">{cert.issuingOrganization}</p>
                    <p className="text-gray-600 text-xs">{formatDate(cert.dateObtained)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mt-10">
          <div className="text-center mb-8">
            <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase">Notable Projects</h2>
            <div className="w-24 h-0.5 bg-gray-400 mx-auto mt-2"></div>
          </div>
          <div className="space-y-6">
            {data.projects.map((project) => (
              <div key={project.id} className="text-center border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
                <p className="text-gray-700 font-medium text-sm mb-2">{project.role}</p>
                <p className="text-gray-700 text-sm mb-3 max-w-2xl mx-auto">{project.description}</p>
                <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {data.additional.interests.length > 0 && (
        <div className="mt-10 text-center">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 tracking-widest uppercase">Personal Interests</h2>
            <div className="w-24 h-0.5 bg-gray-400 mx-auto mt-2"></div>
          </div>
          <p className="text-gray-700 text-sm">{data.additional.interests.join(" • ")}</p>
        </div>
      )}
    </div>
  )
}