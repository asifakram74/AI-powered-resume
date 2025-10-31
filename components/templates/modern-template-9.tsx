"use client"

import { Mail, Phone, MapPin, User, Briefcase, FolderOpen, ExternalLink, Github, Award } from "lucide-react"
import type { CVData } from "../../types/cv-data"

interface ModernTemplate9Props {
  data: CVData
  isPreview?: boolean
}

export function ModernTemplate9({ data, isPreview = false }: ModernTemplate9Props) {
  const formatDate = (date: string) => {
    if (!date) return "";
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const isoMatch = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(date);
    if (isoMatch) return `${monthNames[parseInt(isoMatch[2])-1]} ${isoMatch[1]}`;
    
    const slashMatch = /^(\d{1,2})\/(\d{4})$/.exec(date);
    if (slashMatch) return `${monthNames[parseInt(slashMatch[1])-1]} ${slashMatch[2]}`;
    
    return date;
  };

  return (
    <div className="bg-white" style={{fontFamily: 'Arial, sans-serif', minHeight: '100vh'}}>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(to right, #dbeafe, #bfdbfe)',
        padding: '1.5rem 1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1.5rem'}}>
          <img
            src={data.personalInfo.profilePicture || "https://img.freepik.com/free-photo/emotions-people-concept-headshot-serious-looking-handsome-man-with-beard-looking-confident-determined_1258-26730.jpg"}
            alt="Profile"
            style={{
              width: '6rem',
              height: '6rem',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid white',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          />
          <div style={{flex: 1}}>
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: '#334155',
              letterSpacing: '0.05em',
              margin: 0,
              textTransform: 'uppercase'
            }}>
              {data.personalInfo.fullName}
            </h1>
            {data.personalInfo.jobTitle && (
              <h2 style={{
                fontSize: '1.25rem',
                color: '#475569',
                fontWeight: 500,
                marginTop: '0.25rem',
                margin: 0
              }}>
                {data.personalInfo.jobTitle}
              </h2>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{display: 'flex', padding: '0 1rem', gap: '1.5rem', minHeight: 'calc(100vh - 150px)'}}>
        {/* Left Sidebar */}
        <div style={{width: '33.333%'}}>
          {/* Contact */}
          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#334155',
              borderBottom: '2px solid #334155',
              paddingBottom: '0.375rem',
              margin: '0 0 0.75rem 0'
            }}>
              CONTACT
            </h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem', color: '#334155'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Phone style={{width: '0.875rem', height: '0.875rem'}} />
                <span>{data.personalInfo.phone}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <Mail style={{width: '0.875rem', height: '0.875rem'}} />
                <span style={{wordBreak: 'break-all'}}>{data.personalInfo.email}</span>
              </div>
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                <MapPin style={{width: '0.875rem', height: '0.875rem'}} />
                <span>
                  {data.personalInfo.city && data.personalInfo.country 
                    ? `${data.personalInfo.city}, ${data.personalInfo.country}`
                    : data.personalInfo.city || data.personalInfo.country}
                </span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#334155',
              borderBottom: '2px solid #334155',
              paddingBottom: '0.375rem',
              margin: '0 0 0.75rem 0'
            }}>
              SKILLS
            </h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
              {/* Technical Skills */}
              {data.skills.technical.length > 0 && (
                <div>
                  <h3 style={{fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8rem', color: '#334155'}}>
                    Technical Skills
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                    {data.skills.technical.map((skill, index) => (
                      <div key={index} style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{
                          width: '0.375rem',
                          height: '0.375rem',
                          backgroundColor: '#334155',
                          borderRadius: '50%',
                          marginRight: '0.5rem'
                        }}></span>
                        <span style={{fontSize: '0.8rem'}}>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Soft Skills */}
              {data.skills.soft.length > 0 && (
                <div>
                  <h3 style={{fontWeight: 600, marginBottom: '0.375rem', fontSize: '0.8rem', color: '#334155'}}>
                    Soft Skills
                  </h3>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem'}}>
                    {data.skills.soft.map((skill, index) => (
                      <div key={index} style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{
                          width: '0.375rem',
                          height: '0.375rem',
                          backgroundColor: '#334155',
                          borderRadius: '50%',
                          marginRight: '0.5rem'
                        }}></span>
                        <span style={{fontSize: '0.8rem'}}>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Languages */}
          {data.languages.length > 0 && (
            <div style={{
              backgroundColor: '#dbeafe',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1.5rem'
            }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: '#334155',
                borderBottom: '2px solid #334155',
                paddingBottom: '0.375rem',
                margin: '0 0 0.75rem 0'
              }}>
                LANGUAGES
              </h2>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.375rem', fontSize: '0.8rem', color: '#334155'}}>
                {data.languages.map((lang) => (
                  <div key={lang.id} style={{display: 'flex', justifyContent: 'space-between'}}>
                    <span>{lang.name}</span>
                    <span style={{color: '#475569'}}>{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          <div style={{
            backgroundColor: '#dbeafe',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#334155',
              borderBottom: '2px solid #334155',
              paddingBottom: '0.375rem',
              margin: '0 0 0.75rem 0'
            }}>
              EDUCATION
            </h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: '#334155'}}>
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 style={{fontWeight: 600, marginBottom: '0.125rem', fontSize: '0.8rem'}}>{edu.degree}</h3>
                  <p style={{color: '#475569', margin: '0 0 0.125rem 0', fontSize: '0.75rem'}}>{edu.institutionName}</p>
                  {edu.location && (
                    <p style={{color: '#64748b', margin: '0 0 0.125rem 0', fontSize: '0.7rem'}}>{edu.location}</p>
                  )}
                  {edu.graduationDate && (
                    <p style={{color: '#64748b', margin: '0 0 0.125rem 0', fontSize: '0.7rem'}}>
                      {formatDate(edu.graduationDate)}
                    </p>
                  )}
                  {edu.gpa && (
                    <p style={{color: '#64748b', margin: 0, fontSize: '0.7rem'}}>GPA: {edu.gpa}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Interests */}
          {data.additional.interests.length > 0 && (
            <div style={{
              backgroundColor: '#dbeafe',
              borderRadius: '0.75rem',
              padding: '1rem'
            }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 'bold',
                color: '#334155',
                borderBottom: '2px solid #334155',
                paddingBottom: '0.375rem',
                margin: '0 0 0.75rem 0'
              }}>
                INTERESTS
              </h2>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.375rem'}}>
                {data.additional.interests.map((interest, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#334155',
                      color: 'white',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem'
                    }}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Content */}
        <div style={{flex: 1}}>
          {/* Profile */}
          <div style={{marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem'}}>
              <User style={{
                width: '1.25rem',
                height: '1.25rem',
                backgroundColor: '#334155',
                color: 'white',
                borderRadius: '50%',
                padding: '0.2rem',
                marginRight: '0.5rem'
              }} />
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#334155',
                borderBottom: '2px solid #334155',
                paddingBottom: '0.2rem',
                flex: 1,
                margin: 0
              }}>
                PROFILE
              </h2>
            </div>
            <div style={{position: 'relative', paddingLeft: '1.5rem'}}>
              <div style={{
                position: 'absolute',
                left: '0.75rem',
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: '#d1d5db'
              }}></div>
              <div style={{
                position: 'absolute',
                left: '0.625rem',
                top: '0.375rem',
                width: '0.375rem',
                height: '0.375rem',
                backgroundColor: '#334155',
                borderRadius: '50%'
              }}></div>
              <p style={{color: '#374151', lineHeight: '1.5', fontSize: '0.8rem', margin: 0}}>
                {data.personalInfo.summary}
              </p>
            </div>
          </div>

          {/* Work Experience */}
          <div style={{marginBottom: '1.5rem'}}>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem'}}>
              <Briefcase style={{
                width: '1.25rem',
                height: '1.25rem',
                backgroundColor: '#334155',
                color: 'white',
                borderRadius: '50%',
                padding: '0.2rem',
                marginRight: '0.5rem'
              }} />
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#334155',
                borderBottom: '2px solid #334155',
                paddingBottom: '0.2rem',
                flex: 1,
                margin: 0
              }}>
                WORK EXPERIENCE
              </h2>
            </div>

            <div style={{position: 'relative', paddingLeft: '1.5rem'}}>
              <div style={{
                position: 'absolute',
                left: '0.75rem',
                top: 0,
                bottom: 0,
                width: '1px',
                backgroundColor: '#d1d5db'
              }}></div>
              
              {data.experience.map((exp, index) => (
                <div key={exp.id} style={{position: 'relative', marginBottom: '1rem'}}>
                  <div style={{
                    position: 'absolute',
                    left: '-0.875rem',
                    top: '0.375rem',
                    width: '0.375rem',
                    height: '0.375rem',
                    backgroundColor: '#334155',
                    borderRadius: '50%'
                  }}></div>
                  
                  <div style={{marginBottom: '0.375rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <div>
                        <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#334155', margin: '0 0 0.125rem 0'}}>
                          {exp.jobTitle}
                        </h3>
                        <p style={{color: '#4b5563', fontWeight: 500, margin: '0 0 0.125rem 0', fontSize: '0.875rem'}}>
                          {exp.companyName}
                        </p>
                        {exp.location && (
                          <p style={{color: '#6b7280', fontSize: '0.75rem', margin: 0}}>{exp.location}</p>
                        )}
                      </div>
                      <span style={{color: '#6b7280', fontSize: '0.8rem', whiteSpace: 'nowrap'}}>
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.125rem', fontSize: '0.8rem', color: '#374151', paddingLeft: '0.75rem'}}>
                    {exp.responsibilities.map((resp, idx) => (
                      <p key={idx} style={{margin: 0}}>{resp}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          {data.projects.length > 0 && (
            <div style={{marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem'}}>
                <FolderOpen style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  backgroundColor: '#334155',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '0.2rem',
                  marginRight: '0.5rem'
                }} />
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#334155',
                  borderBottom: '2px solid #334155',
                  paddingBottom: '0.2rem',
                  flex: 1,
                  margin: 0
                }}>
                  PROJECTS
                </h2>
              </div>

              <div style={{position: 'relative', paddingLeft: '1.5rem'}}>
                <div style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: '#d1d5db'
                }}></div>
                
                {data.projects.map((project) => (
                  <div key={project.id} style={{position: 'relative', marginBottom: '1rem'}}>
                    <div style={{
                      position: 'absolute',
                      left: '-0.875rem',
                      top: '0.375rem',
                      width: '0.375rem',
                      height: '0.375rem',
                      backgroundColor: '#334155',
                      borderRadius: '50%'
                    }}></div>

                    <div style={{marginBottom: '0.375rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div>
                          <h3 style={{fontSize: '1rem', fontWeight: 'bold', color: '#334155', margin: '0 0 0.125rem 0'}}>
                            {project.name}
                          </h3>
                          <p style={{color: '#4b5563', fontWeight: 500, margin: '0 0 0.125rem 0', fontSize: '0.875rem'}}>
                            {project.role}
                          </p>
                        </div>
                        <div style={{display: 'flex', gap: '0.375rem'}}>
                          {project.liveDemoLink && (
                            <ExternalLink style={{width: '0.875rem', height: '0.875rem', color: '#3b82f6'}} />
                          )}
                          {project.githubLink && (
                            <Github style={{width: '0.875rem', height: '0.875rem', color: '#6b7280'}} />
                          )}
                        </div>
                      </div>
                    </div>

                    {project.description && (
                      <p style={{color: '#374151', fontSize: '0.8rem', marginBottom: '0.5rem', whiteSpace: 'pre-line', margin: '0 0 0.5rem 0'}}>
                        {project.description}
                      </p>
                    )}

                    <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.375rem'}}>
                      {project.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: '#dbeafe',
                            color: '#334155',
                            padding: '0.125rem 0.375rem',
                            borderRadius: '0.2rem',
                            fontSize: '0.7rem'
                          }}
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
            <div style={{marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem'}}>
                <Award style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  backgroundColor: '#334155',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '0.2rem',
                  marginRight: '0.5rem'
                }} />
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#334155',
                  borderBottom: '2px solid #334155',
                  paddingBottom: '0.2rem',
                  flex: 1,
                  margin: 0
                }}>
                  CERTIFICATIONS & AWARDS
                </h2>
              </div>

              <div style={{position: 'relative', paddingLeft: '1.5rem'}}>
                <div style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  backgroundColor: '#d1d5db'
                }}></div>
                
                {data.certifications.map((cert) => (
                  <div key={cert.id} style={{position: 'relative', marginBottom: '0.75rem'}}>
                    <div style={{
                      position: 'absolute',
                      left: '-0.875rem',
                      top: '0.375rem',
                      width: '0.375rem',
                      height: '0.375rem',
                      backgroundColor: '#334155',
                      borderRadius: '50%'
                    }}></div>

                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <div>
                        <h3 style={{fontSize: '0.9rem', fontWeight: 'bold', color: '#334155', margin: '0 0 0.125rem 0'}}>
                          {cert.title}
                        </h3>
                        <p style={{color: '#4b5563', fontSize: '0.8rem', margin: 0}}>
                          {cert.issuingOrganization}
                        </p>
                      </div>
                      <span style={{color: '#6b7280', fontSize: '0.75rem'}}>
                        {formatDate(cert.dateObtained)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}