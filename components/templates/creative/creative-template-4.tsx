"use client"

import { Mail, Phone, MapPin } from "lucide-react"
import type { CVData } from "../../../types/cv-data"

interface CreativeTemplate4Props {
  data: CVData
  isPreview?: boolean
}

export function CreativeTemplate4({ data, isPreview = false }: CreativeTemplate4Props) {
  const formatDate = (date: string) => {
    if (!date) return ""
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date)
    if (isoMatch) {
      const year = isoMatch[1]
      const month = Math.max(1, Math.min(12, Number.parseInt(isoMatch[2], 10)))
      return `${monthNames[month - 1]} ${year}`
    }

    const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date)
    if (slashMatch) {
      const month = Math.max(1, Math.min(12, Number.parseInt(slashMatch[1], 10)))
      const year = slashMatch[2]
      return `${monthNames[month - 1]} ${year}`
    }

    return date
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen p-8 text-gray-900">
      {/* Header */}
      <div className="mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-4xl font-bold mb-1">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-gray-600 font-medium mb-3">{data.personalInfo.jobTitle}</p>
        <p className="text-gray-700 leading-relaxed max-w-3xl">{data.personalInfo.summary}</p>
      </div>

      {/* Contact Info */}
      <div className="flex flex-wrap gap-6 mb-8 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span>{data.personalInfo.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4" />
          <span>{data.personalInfo.phone}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>
            {data.personalInfo.city && data.personalInfo.country
              ? `${data.personalInfo.city}, ${data.personalInfo.country}`
              : data.personalInfo.city || data.personalInfo.country}
          </span>
        </div>
      </div>

      {/* Experience */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Experience</h2>
        <div className="space-y-6">
          {data.experience.map((exp) => (
            <div key={exp.id}>
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{exp.jobTitle}</h3>
                  <p className="text-gray-600">{exp.companyName}</p>
                </div>
                <span className="text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(exp.startDate)} - {exp.current ? "Present" : formatDate(exp.endDate)}
                </span>
              </div>
              <ul className="text-gray-700 space-y-1 ml-4">
                {exp.responsibilities.map((resp, index) => (
                  <li key={index} className="list-disc text-sm">
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
        <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Education</h2>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.id}>
              <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
              <p className="text-gray-600">{edu.institutionName}</p>
              <p className="text-sm text-gray-600">{formatDate(edu.graduationDate)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Skills */}
      {(data.skills.technical.length > 0 || data.skills.soft.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Skills</h2>
          {data.skills.technical.length > 0 && (
            <div className="mb-4">
              <p className="font-medium text-gray-900 mb-2">Technical</p>
              <p className="text-gray-700 text-sm">{data.skills.technical.join(", ")}</p>
            </div>
          )}
          {data.skills.soft.length > 0 && (
            <div>
              <p className="font-medium text-gray-900 mb-2">Professional</p>
              <p className="text-gray-700 text-sm">{data.skills.soft.join(", ")}</p>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project) => (
              <div key={project.id}>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <p className="text-gray-600 text-sm">{project.role}</p>
                <p className="text-gray-700 text-sm my-1">{project.description}</p>
                <p className="text-gray-600 text-xs">{project.technologies.join(" • ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {data.certifications.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert) => (
              <div key={cert.id} className="flex justify-between">
                <p className="font-medium text-gray-900">{cert.title}</p>
                <p className="text-gray-600 text-sm">{formatDate(cert.dateObtained)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
