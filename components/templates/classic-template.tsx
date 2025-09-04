import type { CVData } from "../../types/cv-data";

interface ClassicTemplateProps {
  data: CVData;
  isPreview?: boolean;
}

export function ClassicTemplate({
  data,
  isPreview = false,
}: ClassicTemplateProps) {
  const formatDate = (date: string) => {
    if (!date) return "";
    const [year, month] = date.split("-");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${monthNames[Number.parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 min-h-screen">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {data.personalInfo.fullName}
        </h1>
        <h2 className="text-xl text-gray-700 mb-4">
          {data.personalInfo.jobTitle}
        </h2>
        <div className="text-gray-600 space-x-4">
          <span>{data.personalInfo.email}</span>
          <span>•</span>
          <span>{data.personalInfo.phone}</span>
          <span>•</span>
          <span>
            {data.personalInfo.city} {data.personalInfo.country}
          </span>
        </div>
        {data.personalInfo.address && (
          <div className="text-gray-600 mt-1">{data.personalInfo.address}</div>
        )}
      </div>

      {/* Summary */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">
          PROFESSIONAL SUMMARY
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {data.personalInfo.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
          PROFESSIONAL EXPERIENCE
        </h2>
        <div className="space-y-6">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {exp.jobTitle}
                  </h3>
                  <p className="text-gray-700 font-medium">{exp.companyName}</p>
                  {exp.location && (
                    <p className="text-gray-600">{exp.location}</p>
                  )}
                </div>
                <span className="text-gray-600">
                  {formatDate(exp.startDate)} -{" "}
                  {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <ul className="text-gray-700 leading-relaxed ml-4 space-y-1">
                {exp.responsibilities.map((resp, index) => (
                  <li key={index} className="list-disc">
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
          EDUCATION
        </h2>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id} className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                <p className="text-gray-700">{edu.institutionName}</p>
                {edu.location && (
                  <p className="text-gray-600">{edu.location}</p>
                )}
                {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                {edu.honors && <p className="text-gray-600">{edu.honors}</p>}
                {edu.additionalInfo && (
                  <p className="text-gray-600 text-sm mt-1">
                    {edu.additionalInfo}
                  </p>
                )}
              </div>
              {edu.graduationDate && (
                <span className="text-gray-600">
                  {formatDate(edu.graduationDate)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
          SKILLS
        </h2>
        <div className="space-y-3">
          {data.skills.technical.length > 0 && (
            <div>
              <span className="font-semibold text-gray-900">
                Technical Skills:{" "}
              </span>
              <span className="text-gray-700">
                {data.skills.technical.join(", ")}
              </span>
            </div>
          )}
          {data.skills.soft.length > 0 && (
            <div>
              <span className="font-semibold text-gray-900">Soft Skills: </span>
              <span className="text-gray-700">
                {data.skills.soft.join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Languages */}
      {data.languages.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
            LANGUAGES
          </h2>
          <div className="space-y-2">
            {data.languages.map((lang) => (
              <div key={lang.id}>
                <span className="font-semibold text-gray-900">
                  {lang.name}:{" "}
                </span>
                <span className="text-gray-700">{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
            PROJECTS
          </h2>
          <div className="space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-600 font-medium">{project.role}</p>
                <p className="text-gray-700 mb-2">{project.description}</p>
                <p className="text-gray-600">
                  <span className="font-medium">Technologies: </span>
                  {project.technologies.join(", ")}
                </p>
                {(project.liveDemoLink || project.githubLink) && (
                  <div className="text-gray-600 text-sm">
                    {project.liveDemoLink && (
                      <span>
                        <span className="font-medium">Demo: </span>
                        <a
                          href={project.liveDemoLink}
                          className="text-blue-600 hover:underline"
                        >
                          {project.liveDemoLink}
                        </a>
                      </span>
                    )}
                    {project.liveDemoLink && project.githubLink && (
                      <span> | </span>
                    )}
                    {project.githubLink && (
                      <span>
                        <span className="font-medium">GitHub: </span>
                        <a
                          href={project.githubLink}
                          className="text-blue-600 hover:underline"
                        >
                          {project.githubLink}
                        </a>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
            CERTIFICATIONS & AWARDS
          </h2>
          <div className="space-y-2">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between items-center">
                <div>
                  <span className="font-semibold text-gray-900">
                    {cert.title}
                  </span>
                  <span className="text-gray-700">
                    {" "}
                    - {cert.issuingOrganization}
                  </span>
                  {cert.verificationLink && (
                    <span>
                      {" "}
                      (
                      <a
                        href={cert.verificationLink}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Verify
                      </a>
                      )
                    </span>
                  )}
                </div>
                <span className="text-gray-600">
                  {formatDate(cert.dateObtained)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interests */}
      {data.additional.interests.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">
            INTERESTS & HOBBIES
          </h2>
          <p className="text-gray-700">
            {data.additional.interests.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
