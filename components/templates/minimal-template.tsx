import type { CVData } from "@/types/cv-data";

interface MinimalTemplateProps {
  data: CVData;
  isPreview?: boolean;
}

export function MinimalTemplate({
  data,
  isPreview = false,
}: MinimalTemplateProps) {
  const formatDate = (date: string) => {
    if (!date) return "";
    const [year, month] = date.split("-");
    return `${month}/${year}`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 min-h-screen">
      {/* Header */}
      <div className="mb-16">
        <h1 className="text-5xl font-light text-gray-900 mb-2">
          {data.personalInfo.fullName}
        </h1>
        <h2 className="text-2xl font-light text-gray-600 mb-6">
          {data.personalInfo.jobTitle}
        </h2>
        <div className="text-gray-500 space-y-1">
          <p>
            {data.personalInfo.email} • {data.personalInfo.phone}
          </p>
          <p>
            {data.personalInfo.city} {data.personalInfo.country}
            {data.personalInfo.address && ` • ${data.personalInfo.address}`}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-16">
        <p className="text-gray-700 text-lg leading-relaxed font-light">
          {data.personalInfo.summary}
        </p>
      </div>

      {/* Experience */}
      <div className="mb-16">
        <h2 className="text-2xl font-light text-gray-900 mb-8">Experience</h2>
        <div className="space-y-12">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-xl font-medium text-gray-900">
                  {exp.jobTitle}
                </h3>
                <span className="text-gray-500 text-sm">
                  {formatDate(exp.startDate)} —{" "}
                  {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <p className="text-gray-600 mb-1">{exp.companyName}</p>
              {exp.location && (
                <p className="text-gray-500 text-sm mb-4">{exp.location}</p>
              )}
              <ul className="text-gray-700 leading-relaxed space-y-2">
                {exp.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-gray-400 mr-3">—</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-16">
        <h2 className="text-2xl font-light text-gray-900 mb-8">Education</h2>
        <div className="space-y-6">
          {data.education.map((edu) => (
            <div key={edu.id}>
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {edu.degree}
                </h3>
                {edu.graduationDate && (
                  <span className="text-gray-500 text-sm">
                    {formatDate(edu.graduationDate)}
                  </span>
                )}
              </div>
              <p className="text-gray-600">{edu.institutionName}</p>
              {edu.location && <p className="text-gray-600">{edu.location}</p>}
              {edu.gpa && (
                <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>
              )}
              {edu.honors && (
                <p className="text-gray-500 text-sm">{edu.honors}</p>
              )}
              {edu.additionalInfo && (
                <p className="text-gray-600 text-sm mt-2">
                  {edu.additionalInfo}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      <div className="mb-16">
        <h2 className="text-2xl font-light text-gray-900 mb-8">Skills</h2>
        <div className="space-y-4">
          {data.skills.technical.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Technical</h3>
              <p className="text-gray-700">
                {data.skills.technical.join(" • ")}
              </p>
            </div>
          )}
          {data.skills.soft.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Soft Skills</h3>
              <p className="text-gray-700">{data.skills.soft.join(" • ")}</p>
            </div>
          )}
        </div>
      </div>

      {/* Languages */}
      {data.languages.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-light text-gray-900 mb-8">Languages</h2>
          <div className="space-y-2">
            {data.languages.map((lang) => (
              <div
                key={lang.id}
                className="flex justify-between items-baseline"
              >
                <h3 className="font-medium text-gray-900">{lang.name}</h3>
                <span className="text-gray-500 text-sm">
                  {lang.proficiency}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-light text-gray-900 mb-8">Projects</h2>
          <div className="space-y-8">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {project.name}
                </h3>
                <p className="text-gray-600 mb-3">{project.role}</p>
                <p className="text-gray-700 mb-3">{project.description}</p>
                <p className="text-gray-500 text-sm mb-2">
                  {project.technologies.join(" • ")}
                </p>
                {(project.liveDemoLink || project.githubLink) && (
                  <div className="text-gray-500 text-sm space-x-4">
                    {project.liveDemoLink && (
                      <a
                        href={project.liveDemoLink}
                        className="hover:text-gray-700"
                      >
                        Live Demo
                      </a>
                    )}
                    {project.githubLink && (
                      <a
                        href={project.githubLink}
                        className="hover:text-gray-700"
                      >
                        GitHub
                      </a>
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
        <div className="mb-16">
          <h2 className="text-2xl font-light text-gray-900 mb-8">
            Certifications
          </h2>
          <div className="space-y-4">
            {data.certifications.map((cert) => (
              <div
                key={cert.id}
                className="flex justify-between items-baseline"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{cert.title}</h3>
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
                        className="text-gray-500 text-sm hover:text-gray-700"
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

      {/* Interests */}
      {data.additional.interests.length > 0 && (
        <div>
          <h2 className="text-2xl font-light text-gray-900 mb-8">Interests</h2>
          <p className="text-gray-700">
            {data.additional.interests.join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}
