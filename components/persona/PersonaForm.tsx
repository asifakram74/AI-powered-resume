"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X, Plus } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { CVData } from "@/types/cv-data";

// Helper function to validate and format URLs
const formatUrl = (url: string): string => {
  if (!url || url.trim() === "") return "";

  const trimmedUrl = url.trim();

  // If it's already a valid URL, return it
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // If it looks like a domain, add https://
  if (trimmedUrl.includes(".") && !trimmedUrl.includes(" ")) {
    return `https://${trimmedUrl}`;
  }

  // If it's not a valid URL format, return empty string
  return "";
};

// Helper function to validate URL
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === "") return true; // Empty is valid

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface PersonaFormProps {
  prefilledData: Partial<Omit<CVData, "id" | "createdAt">> | null;
  editingPersona: CVData | null;
  onPersonaGenerated: (persona: CVData) => void;
  onCancel: () => void;
}

export function PersonaForm({
  prefilledData,
  editingPersona,
  onPersonaGenerated,
  onCancel,
}: PersonaFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state with default empty structure
  const [formData, setFormData] = useState<Omit<CVData, "id" | "createdAt">>({
    personalInfo: {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      profilePicture: "",
      summary: "",
      linkedin: "",
      github: "",
    },
    experience: [],
    education: [],
    skills: {
      technical: [],
      soft: [],
    },
    languages: [],
    certifications: [],
    projects: [],
    additional: {
      interests: [],
    },
  });

  // Individual form states for adding new items
  const [currentExperience, setCurrentExperience] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: [""],
  });

  const [currentEducation, setCurrentEducation] = useState({
    degree: "",
    institutionName: "",
    location: "",
    graduationDate: "",
    gpa: "",
    honors: "",
    additionalInfo: "",
  });

  const [currentLanguage, setCurrentLanguage] = useState({
    name: "",
    proficiency: "Intermediate" as const,
  });

  const [currentCertification, setCurrentCertification] = useState({
    title: "",
    issuingOrganization: "",
    dateObtained: "",
    verificationLink: "",
  });

  const [currentProject, setCurrentProject] = useState({
    name: "",
    role: "",
    description: "",
    technologies: [""],
    liveDemoLink: "",
    githubLink: "",
  });

  const [skillInput, setSkillInput] = useState("");
  const [skillType, setSkillType] = useState<"technical" | "soft">("technical");
  const [interestInput, setInterestInput] = useState("");

  // Load prefilled data when component mounts or prefilledData changes
  useEffect(() => {
    if (prefilledData) {
      setFormData((prev) => ({
        personalInfo: { ...prev.personalInfo, ...prefilledData.personalInfo },
        experience: prefilledData.experience || prev.experience,
        education: prefilledData.education || prev.education,
        skills: { ...prev.skills, ...prefilledData.skills },
        languages: prefilledData.languages || prev.languages,
        certifications: prefilledData.certifications || prev.certifications,
        projects: prefilledData.projects || prev.projects,
        additional: { ...prev.additional, ...prefilledData.additional },
      }));
    }
  }, [prefilledData]);

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: {
          ...prev.skills,
          [skillType]: [...prev.skills[skillType], skillInput.trim()],
        },
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (type: "technical" | "soft", skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter((skill) => skill !== skillToRemove),
      },
    }));
  };

  const addInterest = () => {
    if (interestInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        additional: {
          interests: [...prev.additional.interests, interestInput.trim()],
        },
      }));
      setInterestInput("");
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      additional: {
        interests: prev.additional.interests.filter(
          (interest) => interest !== interestToRemove
        ),
      },
    }));
  };

  const addExperience = () => {
    if (currentExperience.jobTitle && currentExperience.companyName) {
      setFormData((prev) => ({
        ...prev,
        experience: [
          ...prev.experience,
          {
            ...currentExperience,
            id: Date.now().toString(),
          },
        ],
      }));
      setCurrentExperience({
        jobTitle: "",
        companyName: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: [""],
      });
    }
  };

  const addEducation = () => {
    if (currentEducation.degree && currentEducation.institutionName) {
      setFormData((prev) => ({
        ...prev,
        education: [
          ...prev.education,
          {
            ...currentEducation,
            id: Date.now().toString(),
          },
        ],
      }));
      setCurrentEducation({
        degree: "",
        institutionName: "",
        location: "",
        graduationDate: "",
        gpa: "",
        honors: "",
        additionalInfo: "",
      });
    }
  };

  const addLanguage = () => {
    if (currentLanguage.name) {
      setFormData((prev) => ({
        ...prev,
        languages: [
          ...prev.languages,
          {
            ...currentLanguage,
            id: crypto.randomUUID(),
          },
        ],
      }));
      setCurrentLanguage({
        name: "",
        proficiency: "Intermediate",
      });
    }
  };

  const addCertification = () => {
    if (
      currentCertification.title &&
      currentCertification.issuingOrganization
    ) {
      setFormData((prev) => ({
        ...prev,
        certifications: [
          ...prev.certifications,
          {
            ...currentCertification,
            id: Date.now().toString(),
          },
        ],
      }));
      setCurrentCertification({
        title: "",
        issuingOrganization: "",
        dateObtained: "",
        verificationLink: "",
      });
    }
  };

  const addProject = () => {
    if (currentProject.name && currentProject.role) {
      setFormData((prev) => ({
        ...prev,
        projects: [
          ...prev.projects,
          {
            ...currentProject,
            id: Date.now().toString(),
            technologies: currentProject.technologies.filter((tech) =>
              tech.trim()
            ),
          },
        ],
      }));
      setCurrentProject({
        name: "",
        role: "",
        description: "",
        technologies: [""],
        liveDemoLink: "",
        githubLink: "",
      });
    }
  };

  const generatePersona = async () => {
    setIsGenerating(true);

    // Validate and format URLs
    const formattedLinkedIn = formatUrl(formData.personalInfo.linkedin || "");
    const formattedGitHub = formatUrl(formData.personalInfo.github || "");

    // Validate URLs
    if (formData.personalInfo.linkedin && !isValidUrl(formattedLinkedIn)) {
    toast("Please enter a valid LinkedIn URL or leave it empty");
      setIsGenerating(false);
      return;
    }

    if (formData.personalInfo.github && !isValidUrl(formattedGitHub)) {
      toast("Please enter a valid GitHub URL or leave it empty");
      setIsGenerating(false);
      return;
    }

    // Update form data with formatted URLs
    const updatedFormData = {
      ...formData,
      personalInfo: {
        ...formData.personalInfo,
        linkedin: formattedLinkedIn,
        github: formattedGitHub,
      },
      // Ensure these fields are included explicitly to avoid empty arrays
      education: formData.education || [],
      certifications: formData.certifications || [],
      projects: formData.projects || [],
    };

    // Simulate API call
    setTimeout(() => {
      const persona = `Professional Summary for ${
        updatedFormData.personalInfo.fullName
      }:

As a ${updatedFormData.personalInfo.jobTitle} with ${
        updatedFormData.experience.length
      } years of professional experience, you bring a unique combination of technical expertise and leadership skills to drive organizational success.

Professional Experience:
${updatedFormData.experience
  .map(
    (exp) =>
      `• ${exp.jobTitle} at ${exp.companyName} (${exp.startDate} - ${
        exp.current ? "Present" : exp.endDate
      })`
  )
  .join("\n")}

Education:
${updatedFormData.education
  .map((edu) => `• ${edu.degree} from ${edu.institutionName}`)
  .join("\n")}

Core Technical Skills: ${updatedFormData.skills.technical.join(", ")}
Soft Skills: ${updatedFormData.skills.soft.join(", ")}

Languages: ${updatedFormData.languages
        .map((lang) => `${lang.name} (${lang.proficiency})`)
        .join(", ")}

Key Projects:
${updatedFormData.projects
  .map((project) => `• ${project.name} - ${project.role}`)
  .join("\n")}

Career Objective:
Seeking to leverage extensive experience in ${
        updatedFormData.personalInfo.jobTitle
      } to contribute to innovative projects and drive business growth in a dynamic technology environment.

Personal Interests: ${updatedFormData.additional.interests.join(", ")}`;

      const newPersona: CVData = {
        ...updatedFormData,
        id: editingPersona?.id || Date.now().toString(),
        createdAt: editingPersona?.createdAt || new Date().toISOString(),
        generatedPersona: persona,
      };

      setIsGenerating(false);
      onPersonaGenerated(newPersona);
    }, 3000);
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {prefilledData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-green-100 p-1">
              <Sparkles className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-900">
                Data Pre-filled Successfully!
              </h4>
              <p className="text-sm text-green-700">
                Review the information below and complete any missing fields
                before generating your persona.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input
                value={formData.personalInfo.fullName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      fullName: e.target.value,
                    },
                  }))
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input
                value={formData.personalInfo.jobTitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      jobTitle: e.target.value,
                    },
                  }))
                }
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.personalInfo.email}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      email: e.target.value,
                    },
                  }))
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={formData.personalInfo.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      phone: e.target.value,
                    },
                  }))
                }
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={formData.personalInfo.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      city: e.target.value,
                    },
                  }))
                }
                placeholder="San Francisco"
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input
                value={formData.personalInfo.country}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      country: e.target.value,
                    },
                  }))
                }
                placeholder="United States"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.personalInfo.address}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      address: e.target.value,
                    },
                  }))
                }
                placeholder="123 Main St"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={formData.personalInfo.linkedin}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      linkedin: e.target.value,
                    },
                  }))
                }
                placeholder="https://linkedin.com/in/your-profile"
                type="url"
              />
              <p className="text-xs text-gray-500">
                Enter full URL or leave empty
              </p>
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input
                value={formData.personalInfo.github}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    personalInfo: {
                      ...prev.personalInfo,
                      github: e.target.value,
                    },
                  }))
                }
                placeholder="https://github.com/your-username"
                type="url"
              />
              <p className="text-xs text-gray-500">
                Enter full URL or leave empty
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Professional Summary</Label>
            <Textarea
              value={formData.personalInfo.summary}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  personalInfo: {
                    ...prev.personalInfo,
                    summary: e.target.value,
                  },
                }))
              }
              placeholder="Brief professional summary..."
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Work Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input
                value={currentExperience.jobTitle}
                onChange={(e) =>
                  setCurrentExperience((prev) => ({
                    ...prev,
                    jobTitle: e.target.value,
                  }))
                }
                placeholder="Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={currentExperience.companyName}
                onChange={(e) =>
                  setCurrentExperience((prev) => ({
                    ...prev,
                    companyName: e.target.value,
                  }))
                }
                placeholder="Tech Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={currentExperience.location}
                onChange={(e) =>
                  setCurrentExperience((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={currentExperience.startDate}
                onChange={(e) =>
                  setCurrentExperience((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={currentExperience.endDate}
                onChange={(e) =>
                  setCurrentExperience((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                disabled={currentExperience.current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={currentExperience.current}
              onCheckedChange={(checked) =>
                setCurrentExperience((prev) => ({ ...prev, current: checked }))
              }
            />
            <Label>Currently working here</Label>
          </div>

          <div className="space-y-2">
            <Label>Responsibilities</Label>
            {currentExperience.responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={resp}
                  onChange={(e) => {
                    const newResp = [...currentExperience.responsibilities];
                    newResp[index] = e.target.value;
                    setCurrentExperience((prev) => ({
                      ...prev,
                      responsibilities: newResp,
                    }));
                  }}
                  placeholder="Describe your responsibility..."
                />
                {index === currentExperience.responsibilities.length - 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentExperience((prev) => ({
                        ...prev,
                        responsibilities: [...prev.responsibilities, ""],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button onClick={addExperience} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Experience
          </Button>

          {formData.experience.length > 0 && (
            <div className="space-y-2">
              <Label>Added Experiences:</Label>
              {formData.experience.map((exp) => (
                <div key={exp.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">
                    {exp.jobTitle} at {exp.companyName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Select
              value={skillType}
              onValueChange={(value: "technical" | "soft") =>
                setSkillType(value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="soft">Soft Skills</SelectItem>
              </SelectContent>
            </Select>
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="Add a skill..."
              onKeyPress={(e) => e.key === "Enter" && addSkill()}
            />
            <Button onClick={addSkill} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Technical Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.technical.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeSkill("technical", skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Soft Skills</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills.soft.map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeSkill("soft", skill)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Languages */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Languages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={currentLanguage.name}
              onChange={(e) =>
                setCurrentLanguage((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Language name"
            />
            <Select
              value={currentLanguage.proficiency}
              onValueChange={(value: any) =>
                setCurrentLanguage((prev) => ({ ...prev, proficiency: value }))
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Native">Native</SelectItem>
                <SelectItem value="Fluent">Fluent</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addLanguage} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {formData.languages.length > 0 && (
            <div className="space-y-2">
              <Label>Added Languages:</Label>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang, index) => (
                  <Badge 
                    key={`${lang.name}-${lang.proficiency}-${index}`} 
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {lang.name} ({lang.proficiency})
                    <button
                      type="button"
                      onClick={() => removeLanguage(lang.id)}
                      className="ml-1.5 rounded-full bg-white/20 p-0.5 hover:bg-white/30"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Education</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Degree</Label>
              <Input
                value={currentEducation.degree}
                onChange={(e) =>
                  setCurrentEducation((prev) => ({
                    ...prev,
                    degree: e.target.value,
                  }))
                }
                placeholder="Bachelor of Science in Computer Science"
              />
            </div>
            <div className="space-y-2">
              <Label>Institution Name</Label>
              <Input
                value={currentEducation.institutionName}
                onChange={(e) =>
                  setCurrentEducation((prev) => ({
                    ...prev,
                    institutionName: e.target.value,
                  }))
                }
                placeholder="Stanford University"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={currentEducation.location}
                onChange={(e) =>
                  setCurrentEducation((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Stanford, CA"
              />
            </div>
            <div className="space-y-2">
              <Label>Graduation Date</Label>
              <Input
                type="date"
                value={currentEducation.graduationDate}
                onChange={(e) =>
                  setCurrentEducation((prev) => ({
                    ...prev,
                    graduationDate: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>GPA</Label>
              <Input
                value={currentEducation.gpa}
                onChange={(e) =>
                  setCurrentEducation((prev) => ({
                    ...prev,
                    gpa: e.target.value,
                  }))
                }
                placeholder="3.8"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Honors & Awards</Label>
            <Input
              value={currentEducation.honors}
              onChange={(e) =>
                setCurrentEducation((prev) => ({
                  ...prev,
                  honors: e.target.value,
                }))
              }
              placeholder="Summa Cum Laude, Dean's List"
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Information</Label>
            <Textarea
              value={currentEducation.additionalInfo}
              onChange={(e) =>
                setCurrentEducation((prev) => ({
                  ...prev,
                  additionalInfo: e.target.value,
                }))
              }
              placeholder="Relevant coursework, extracurricular activities, etc."
              className="min-h-[80px]"
            />
          </div>

          <Button onClick={addEducation} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>

          {formData.education.length > 0 && (
            <div className="space-y-2">
              <Label>Added Education:</Label>
              {formData.education.map((edu) => (
                <div key={edu.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">
                    {edu.degree} - {edu.institutionName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.location} | {edu.graduationDate}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Certifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Certification Title</Label>
              <Input
                value={currentCertification.title}
                onChange={(e) =>
                  setCurrentCertification((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="AWS Certified Solutions Architect"
              />
            </div>
            <div className="space-y-2">
              <Label>Issuing Organization</Label>
              <Input
                value={currentCertification.issuingOrganization}
                onChange={(e) =>
                  setCurrentCertification((prev) => ({
                    ...prev,
                    issuingOrganization: e.target.value,
                  }))
                }
                placeholder="Amazon Web Services"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date Obtained</Label>
              <Input
                type="date"
                value={currentCertification.dateObtained}
                onChange={(e) =>
                  setCurrentCertification((prev) => ({
                    ...prev,
                    dateObtained: e.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Verification Link</Label>
              <Input
                value={currentCertification.verificationLink}
                onChange={(e) =>
                  setCurrentCertification((prev) => ({
                    ...prev,
                    verificationLink: e.target.value,
                  }))
                }
                placeholder="https://verify.certification.com"
                type="url"
              />
            </div>
          </div>

          <Button onClick={addCertification} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Certification
          </Button>

          {formData.certifications.length > 0 && (
            <div className="space-y-2">
              <Label>Added Certifications:</Label>
              {formData.certifications.map((cert) => (
                <div key={cert.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{cert.title}</div>
                  <div className="text-sm text-gray-600">
                    {cert.issuingOrganization} | {cert.dateObtained}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                value={currentProject.name}
                onChange={(e) =>
                  setCurrentProject((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="E-commerce Platform"
              />
            </div>
            <div className="space-y-2">
              <Label>Your Role</Label>
              <Input
                value={currentProject.role}
                onChange={(e) =>
                  setCurrentProject((prev) => ({
                    ...prev,
                    role: e.target.value,
                  }))
                }
                placeholder="Full Stack Developer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project Description</Label>
            <Textarea
              value={currentProject.description}
              onChange={(e) =>
                setCurrentProject((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the project, its objectives, and your contributions..."
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Technologies Used</Label>
            {currentProject.technologies.map((tech, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={tech}
                  onChange={(e) => {
                    const newTech = [...currentProject.technologies];
                    newTech[index] = e.target.value;
                    setCurrentProject((prev) => ({
                      ...prev,
                      technologies: newTech,
                    }));
                  }}
                  placeholder="React, Node.js, MongoDB..."
                />
                {index === currentProject.technologies.length - 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentProject((prev) => ({
                        ...prev,
                        technologies: [...prev.technologies, ""],
                      }))
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Live Demo Link</Label>
              <Input
                value={currentProject.liveDemoLink}
                onChange={(e) =>
                  setCurrentProject((prev) => ({
                    ...prev,
                    liveDemoLink: e.target.value,
                  }))
                }
                placeholder="https://your-project-demo.com"
                type="url"
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub Link</Label>
              <Input
                value={currentProject.githubLink}
                onChange={(e) =>
                  setCurrentProject((prev) => ({
                    ...prev,
                    githubLink: e.target.value,
                  }))
                }
                placeholder="https://github.com/username/project"
                type="url"
              />
            </div>
          </div>

          <Button onClick={addProject} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>

          {formData.projects.length > 0 && (
            <div className="space-y-2">
              <Label>Added Projects:</Label>
              {formData.projects.map((project) => (
                <div key={project.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-gray-600">{project.role}</div>
                  <div className="text-sm text-gray-500">
                    {project.technologies.join(", ")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Interests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              placeholder="Add an interest..."
              onKeyPress={(e) => e.key === "Enter" && addInterest()}
            />
            <Button onClick={addInterest} size="sm" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.additional.interests.map((interest) => (
              <Badge
                key={interest}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {interest}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-red-500"
                  onClick={() => removeInterest(interest)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={generatePersona}
          disabled={
            !formData.personalInfo.fullName ||
            !formData.personalInfo.jobTitle ||
            isGenerating
          }
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Persona...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Persona
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
