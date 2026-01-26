"use client";

import { useState, useEffect, useRef } from "react";
import { useFaceDetection } from "../../hooks/use-face-detection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import {
  Sparkles, X, Plus, Upload, User, Check, Pencil,
  UserCircle, Briefcase, GraduationCap, Code,
  Globe, Award, FolderGit2, Heart, ChevronRight, ChevronLeft
} from "lucide-react";
import { Textarea } from "../../components/ui/textarea";
import { Switch } from "../../components/ui/switch";
import type { CVData } from "../../types/cv-data";
import { isValidEmailFormat } from "../../lib/utils/email-validation";

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

// Helper function to format dates safely for display
const formatDateForPersona = (input?: string) => {
  if (!input) return "";
  const s = input.trim();
  if (!s) return "";
  const normalized = s.replace(/[\u2012-\u2015\u2212]/g, "-");
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  // YYYY-MM or YYYY-MM-DD
  const iso = normalized.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/);
  if (iso) {
    const year = iso[1];
    const month = Math.max(1, Math.min(12, Number.parseInt(iso[2], 10)));
    return `${monthNames[month - 1]} ${year}`;
  }
  // MM/YYYY
  const sl = normalized.match(/^(\d{1,2})\/(\d{4})$/);
  if (sl) {
    const month = Math.max(1, Math.min(12, Number.parseInt(sl[1], 10)));
    const year = sl[2];
    return `${monthNames[month - 1]} ${year}`;
  }
  // Year only
  if (/^\d{4}$/.test(normalized)) return normalized;
  // Month text like "Jan 2020" or "March 2022"
  if (/^([A-Za-z]{3,9})\s+\d{4}$/.test(normalized)) return normalized;
  return normalized;
};

interface PersonaFormProps {
  prefilledData: Partial<Omit<CVData, "id" | "createdAt">> | null;
  editingPersona: CVData | null;
  onPersonaGenerated: (persona: CVData, profilePictureFile?: File | null) => void;
  onCancel: () => void;
}

export function PersonaForm({
  prefilledData,
  editingPersona,
  onPersonaGenerated,
  onCancel,
}: PersonaFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errors, setErrors] = useState<{ fullName?: string; jobTitle?: string; email?: string }>({});
  const [activeTab, setActiveTab] = useState<string>("personal");

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
    employmentType: "",
    industry: "",
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

  // Editing states
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [editingCertificationId, setEditingCertificationId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Profile picture state
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use face detection hook
  const { modelsLoaded, faceDetected, detectionErrorMessage, runFaceDetection } = useFaceDetection();

  // Tab configuration
  const tabs = [
    { id: "personal", label: "Personal", icon: UserCircle },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "skills", label: "Skills", icon: Code },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "languages", label: "Languages", icon: Globe },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "interests", label: "Interests", icon: Heart },
  ];

  // Navigation functions
  const goToNextTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  };

  const goToPreviousTab = () => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1].id);
    }
  };

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

  // Load editing persona data when component mounts or editingPersona changes
  useEffect(() => {
    if (editingPersona) {
      setFormData(editingPersona);
      // Set profile picture preview if it exists
      if (editingPersona.personalInfo.profilePicture) {
        setProfilePicturePreview(editingPersona.personalInfo.profilePicture);
      }
    }
  }, [editingPersona]);

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

  const removeSkill = (type: "technical" | "soft", indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        [type]: prev.skills[type].filter((_, index) => index !== indexToRemove),
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

  // Profile picture handlers
  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      const allowedExtensions = ["jpg", "jpeg", "png", "gif"];
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "";

      // Validate file type by MIME and extension
      if (!allowedTypes.includes(file.type) || !allowedExtensions.includes(fileExt)) {
        toast.error("Unsupported image format. Allowed: JPG, PNG, GIF");
        event.target.value = "";
        setProfilePictureFile(null);
        setProfilePicturePreview("");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        event.target.value = "";
        return;
      }

      // Ensure models are ready
      if (!modelsLoaded) {
        toast("Loading face detection models. Please try again in a moment.");
        return;
      }

      // Read file and run face detection
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        const ok = await runFaceDetection(dataUrl);
        if (!ok) {
          toast.error(detectionErrorMessage || "Please upload a clear photo with a visible face.");
          event.target.value = "";
          setProfilePictureFile(null);
          setProfilePicturePreview("");
          return;
        }
        // Passed detection
        setProfilePictureFile(file);
        setProfilePicturePreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfilePicture = () => {
    setProfilePictureFile(null);
    setProfilePicturePreview("");
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        profilePicture: "",
      },
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
      if (editingExperienceId) {
        setFormData((prev) => ({
          ...prev,
          experience: prev.experience.map((exp) =>
            exp.id === editingExperienceId
              ? {
                ...currentExperience,
                endDate: currentExperience.current ? "" : currentExperience.endDate,
                id: editingExperienceId,
              }
              : exp
          ),
        }));
        setEditingExperienceId(null);
        toast.success("Experience updated successfully");
      } else {
        setFormData((prev) => ({
          ...prev,
          experience: [
            ...prev.experience,
            {
              ...currentExperience,
              endDate: currentExperience.current ? "" : currentExperience.endDate,
              id: Date.now().toString(),
            },
          ],
        }));
        toast.success("Experience added successfully");
      }
      setCurrentExperience({
        jobTitle: "",
        companyName: "",
        location: "",
        employmentType: "",
        industry: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: [""],
      });
    }
  };

  const handleEditExperience = (exp: any) => {
    setCurrentExperience({
      jobTitle: exp.jobTitle || "",
      companyName: exp.companyName || "",
      location: exp.location || "",
      employmentType: exp.employmentType || "",
      industry: exp.industry || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      current: exp.current || false,
      responsibilities: exp.responsibilities || [""],
    });
    setEditingExperienceId(exp.id);
    toast.info("Editing Experience. Please update the fields above.");
  };

  const cancelEditExperience = () => {
    setEditingExperienceId(null);
    setCurrentExperience({
      jobTitle: "",
      companyName: "",
      location: "",
      employmentType: "",
      industry: "",
      startDate: "",
      endDate: "",
      current: false,
      responsibilities: [""],
    });
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    if (currentEducation.degree && currentEducation.institutionName) {
      if (editingEducationId) {
        setFormData((prev) => ({
          ...prev,
          education: prev.education.map((edu) =>
            edu.id === editingEducationId
              ? {
                ...currentEducation,
                id: editingEducationId,
              }
              : edu
          ),
        }));
        setEditingEducationId(null);
        toast.success("Education updated successfully");
      } else {
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
        toast.success("Education added successfully");
      }
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

  const handleEditEducation = (edu: any) => {
    setCurrentEducation({
      degree: edu.degree || "",
      institutionName: edu.institutionName || "",
      location: edu.location || "",
      graduationDate: edu.graduationDate || "",
      gpa: edu.gpa || "",
      honors: edu.honors || "",
      additionalInfo: edu.additionalInfo || "",
    });
    setEditingEducationId(edu.id);
    toast.info("Editing Education. Please update the fields above.");
  };

  const cancelEditEducation = () => {
    setEditingEducationId(null);
    setCurrentEducation({
      degree: "",
      institutionName: "",
      location: "",
      graduationDate: "",
      gpa: "",
      honors: "",
      additionalInfo: "",
    });
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const removeLanguage = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((lang) => lang.id !== id),
    }));
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
      if (editingCertificationId) {
        setFormData((prev) => ({
          ...prev,
          certifications: prev.certifications.map((cert) =>
            cert.id === editingCertificationId
              ? {
                ...currentCertification,
                id: editingCertificationId,
              }
              : cert
          ),
        }));
        setEditingCertificationId(null);
        toast.success("Certification updated successfully");
      } else {
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
        toast.success("Certification added successfully");
      }
      setCurrentCertification({
        title: "",
        issuingOrganization: "",
        dateObtained: "",
        verificationLink: "",
      });
    }
  };

  const handleEditCertification = (cert: any) => {
    setCurrentCertification({
      title: cert.title || "",
      issuingOrganization: cert.issuingOrganization || "",
      dateObtained: cert.dateObtained || "",
      verificationLink: cert.verificationLink || "",
    });
    setEditingCertificationId(cert.id);
    toast.info("Editing Certification. Please update the fields above.");
  };

  const cancelEditCertification = () => {
    setEditingCertificationId(null);
    setCurrentCertification({
      title: "",
      issuingOrganization: "",
      dateObtained: "",
      verificationLink: "",
    });
  };

  const removeCertification = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((cert) => cert.id !== id),
    }));
  };

  const addProject = () => {
    if (currentProject.name && currentProject.role) {
      if (editingProjectId) {
        setFormData((prev) => ({
          ...prev,
          projects: prev.projects.map((project) =>
            project.id === editingProjectId
              ? {
                ...currentProject,
                id: editingProjectId,
                technologies: currentProject.technologies.filter((tech) =>
                  tech.trim()
                ),
              }
              : project
          ),
        }));
        setEditingProjectId(null);
        toast.success("Project updated successfully");
      } else {
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
        toast.success("Project added successfully");
      }
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

  const handleEditProject = (project: any) => {
    setCurrentProject({
      name: project.name || "",
      role: project.role || "",
      description: project.description || "",
      technologies: project.technologies || [""],
      liveDemoLink: project.liveDemoLink || "",
      githubLink: project.githubLink || "",
    });
    setEditingProjectId(project.id);
    toast.info("Editing Project. Please update the fields above.");
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setCurrentProject({
      name: "",
      role: "",
      description: "",
      technologies: [""],
      liveDemoLink: "",
      githubLink: "",
    });
  };

  const removeProject = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      projects: prev.projects.filter((project) => project.id !== id),
    }));
  };

  const generatePersona = async () => {
    // Required field validation
    const newErrors: { fullName?: string; jobTitle?: string; email?: string } = {};
    if (!formData.personalInfo.fullName.trim()) {
      newErrors.fullName = "Full Name is mandatory";
    }
    if (!formData.personalInfo.jobTitle.trim()) {
      newErrors.jobTitle = "Job Title is mandatory";
    }
    if (!formData.personalInfo.email.trim()) {
      newErrors.email = "Email is mandatory";
    } else if (!isValidEmailFormat(formData.personalInfo.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast("Please fill the mandatory fields");
      return;
    }

    setErrors({});
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
    setTimeout(async () => {
      const persona = `Professional Summary for ${updatedFormData.personalInfo.fullName
        }:

As a ${updatedFormData.personalInfo.jobTitle} with ${updatedFormData.experience.length
        } years of professional experience, you bring a unique combination of technical expertise and leadership skills to drive organizational success.

Professional Experience:
${updatedFormData.experience
          .map(
            (exp) => {
              const start = formatDateForPersona(exp.startDate);
              const end = exp.current ? "Present" : formatDateForPersona(exp.endDate);
              const dash = start && end ? " - " : "";
              const range = start || end ? `(${start}${dash}${end})` : "";
              return `• ${exp.jobTitle} at ${exp.companyName} ${range}`;
            }
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
Seeking to leverage extensive experience in ${updatedFormData.personalInfo.jobTitle
        } to contribute to innovative projects and drive business growth in a dynamic technology environment.

Personal Interests: ${updatedFormData.additional.interests.join(", ")}`;

      const newPersona: CVData = {
        ...updatedFormData,
        id: editingPersona?.id || Date.now().toString(),
        createdAt: editingPersona?.createdAt || new Date().toISOString(),
        generatedPersona: persona,
        // profile picture file is passed separately via onPersonaGenerated
      };

      // Await parent handler to finish creating persona and uploading profile image
      await Promise.resolve(onPersonaGenerated(newPersona, profilePictureFile));
      setIsGenerating(false);
    }, 3000);
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto px-2 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      {/* Tabs Navigation */}
      <div className="sticky top-0 z-10 bg-background pt-2 pb-2 border-b">
        <div className="flex items-center justify-between">
          <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="flex space-x-1 w-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center justify-center flex-1 min-w-0 px-1 sm:px-3 py-2 rounded-md text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline truncate">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Personal Information Tab */}
        {activeTab === "personal" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <UserCircle className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    aria-invalid={Boolean(errors.fullName)}
                    className={errors.fullName ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600">{errors.fullName}</p>
                  )}
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
                    aria-invalid={Boolean(errors.jobTitle)}
                    className={errors.jobTitle ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.jobTitle && (
                    <p className="text-sm text-red-600">{errors.jobTitle}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    aria-invalid={Boolean(errors.email)}
                    className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enter full URL or leave empty
                  </p>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="space-y-2">
                <Label>Profile Picture</Label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {profilePicturePreview ? (
                    <div className="relative">
                      <img
                        src={profilePicturePreview}
                        alt="Profile preview"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-800"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                        onClick={removeProfilePicture}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div className="flex flex-col justify-center gap-2 w-full sm:w-auto">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.gif"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-9 px-4 w-full sm:w-auto"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {profilePictureFile ? 'Change' : 'Upload Picture'}
                      </Button>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        JPG, PNG, GIF (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
                {faceDetected === false && (
                  <div className="mt-3">
                    <div className="rounded-md border bg-white dark:bg-gray-950 p-3">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 text-center">TIPS</p>
                      <div className="mt-2 flex items-center justify-center gap-4">
                        {/* Good example 1 */}
                        <div className="text-center">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden border border-green-400">
                            <img src="/men2.png" alt="Good example 1" className="w-full h-full object-cover" />
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                              {/* <Check className="w-3 h-3" /> */}
                            </span>
                          </div>
                          <span className="mt-1 block text-xs text-green-600">Good</span>
                        </div>
                        {/* Good example 2 */}
                        <div className="text-center">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden border border-green-400">
                            <img src="/men.png" alt="Good example 2" className="w-full h-full object-cover" />
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                              {/* <Check className="w-3 h-3" /> */}
                            </span>
                          </div>
                          <span className="mt-1 block text-xs text-green-600">Good</span>
                        </div>
                        {/* Avoid example */}
                        <div className="text-center">
                          <div className="relative w-16 h-16 rounded-md overflow-hidden border border-red-400">
                            <img src="/men3.png" alt="Avoid example" className="w-full h-full object-cover" />
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                              {/* <X className="w-3 h-3" /> */}
                            </span>
                          </div>
                          <span className="mt-1 block text-xs text-red-600">Avoid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  className="min-h-[100px] custom-scrollbar"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Tab */}
        {activeTab === "experience" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <Label>Employment Type</Label>
                  <Input
                    value={currentExperience.employmentType}
                    onChange={(e) =>
                      setCurrentExperience((prev) => ({
                        ...prev,
                        employmentType: e.target.value,
                      }))
                    }
                    placeholder="Full-time"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label>Industry</Label>
                  <Input
                    value={currentExperience.industry}
                    onChange={(e) =>
                      setCurrentExperience((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    placeholder="Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    className="text-gray-500"
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
                    className="text-gray-500"
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
                    setCurrentExperience((prev) => ({
                      ...prev,
                      current: checked,
                      endDate: checked ? "" : prev.endDate,
                    }))
                  }
                />
                <Label>Currently working here</Label>
              </div>

              <div className="space-y-2">
                <Label>Responsibilities</Label>
                {currentExperience.responsibilities.length === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setCurrentExperience((prev) => ({
                        ...prev,
                        responsibilities: [""],
                      }))
                    }
                    className="w-full sm:flex-1"
                  >
                    <Plus className="h-4 w-4 sm:flex-1" />
                    Add Responsibility
                  </Button>
                ) : (
                  currentExperience.responsibilities.map((resp, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
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
                        className="flex-1"
                      />
                      <div className="flex gap-2 w-full sm:w-auto sm:flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newResp = [...currentExperience.responsibilities];
                            newResp.splice(index, 1);
                            setCurrentExperience((prev) => ({
                              ...prev,
                              responsibilities: newResp,
                            }));
                          }}
                          className="flex-1 sm:w-auto sm:flex-none flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </Button>

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
                            className="flex-1 sm:w-auto sm:flex-none flex items-center justify-center gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add</span>
                          </Button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {editingExperienceId ? (
                  <>
                    <Button
                      type="button"
                      onClick={addExperience}
                      className="flex-1"
                      disabled={
                        !currentExperience.companyName ||
                        !currentExperience.jobTitle
                      }
                    >
                      Update Experience
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={cancelEditExperience}
                      className="flex-1"
                    >
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={addExperience}
                      className="flex-1"
                      disabled={
                        !currentExperience.companyName ||
                        !currentExperience.jobTitle
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Experience
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        setCurrentExperience({
                          jobTitle: "",
                          companyName: "",
                          location: "",
                          employmentType: "",
                          industry: "",
                          startDate: "",
                          endDate: "",
                          current: false,
                          responsibilities: [],
                        })
                      }
                      className="flex-1"
                    >
                      Clear
                    </Button>
                  </>
                )}
              </div>

              {formData.experience.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Experience:</Label>
                  {formData.experience.map((exp) => (
                    <div key={exp.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{exp.jobTitle}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{exp.companyName}</div>
                        {(formatDateForPersona(exp.startDate) || exp.current || formatDateForPersona(exp.endDate)) && (
                          <div className="text-sm text-gray-500">
                            {formatDateForPersona(exp.startDate)}
                            {(formatDateForPersona(exp.startDate) && (exp.current || formatDateForPersona(exp.endDate))) ? " - " : ""}
                            {exp.current ? "Present" : formatDateForPersona(exp.endDate)}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-2 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditExperience(exp)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeExperience(exp.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Code className="h-5 w-5 mr-2" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex flex-col sm:flex-row gap-2 flex-1">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    placeholder="Add a skill..."
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    className="flex-1"
                  />
                  <Button onClick={addSkill} size="sm" variant="outline" className="flex-shrink-0 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Your Skills:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.technical.map((skill, index) => (
                      <Badge
                        key={`technical-${skill}-${index}`}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill("technical", index)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Education Tab */}
        {activeTab === "education" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="University of Technology"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    placeholder="San Francisco, CA"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Graduation Date</Label>
                  <Input
                    type="date"
                    className="text-gray-500"
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
                  <Label>CGPA</Label>
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
                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label>Honors</Label>
                  <Input
                    value={currentEducation.honors}
                    onChange={(e) =>
                      setCurrentEducation((prev) => ({
                        ...prev,
                        honors: e.target.value,
                      }))
                    }
                    placeholder="Best Research Paper Award"
                  />
                </div>
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
                  placeholder="Relevant coursework, projects, etc..."
                  className="min-h-[80px] custom-scrollbar"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {editingEducationId ? (
                  <>
                    <Button
                      type="button"
                      onClick={addEducation}
                      variant="default"
                      size="sm"
                      className="w-full sm:flex-1"
                    >
                      <span className="h-4 w-4 mr-1" />
                      Update Education
                    </Button>
                    <Button
                      type="button"
                      onClick={cancelEditEducation}
                      variant="outline"
                      size="sm"
                      className="w-full sm:flex-1"
                    >
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={addEducation}
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Education
                  </Button>
                )}
              </div>

              {formData.education.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Education:</Label>
                  {formData.education.map((edu) => (
                    <div key={edu.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">
                          {edu.degree} - {edu.institutionName}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {edu.location} | {edu.graduationDate}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditEducation(edu)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeEducation(edu.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Languages Tab */}
        {activeTab === "languages" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Input
                    value={currentLanguage.name}
                    onChange={(e) =>
                      setCurrentLanguage((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Spanish"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Proficiency</Label>
                  <Select
                    value={currentLanguage.proficiency}
                    onValueChange={(value) =>
                      setCurrentLanguage((prev) => ({
                        ...prev,
                        proficiency: value as any,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                      <SelectItem value="Native">Native</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={addLanguage} variant="outline" size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-1" />
                Add Language
              </Button>

              {formData.languages.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Languages:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((lang) => (
                      <Badge
                        key={lang.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {lang.name} ({lang.proficiency})
                        <button
                          type="button"
                          onClick={() => removeLanguage(lang.id)}
                          className="hover:text-red-500 cursor-pointer"
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
        )}

        {/* Certifications Tab */}
        {activeTab === "certifications" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date Obtained</Label>
                  <Input
                    className="text-gray-500"
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

              <div className="flex flex-col sm:flex-row gap-2">
                {editingCertificationId ? (
                  <>
                    <Button
                      type="button"
                      onClick={addCertification}
                      variant="default"
                      size="sm"
                      className="w-full sm:flex-1"
                    >
                      <span className="h-4 w-4 mr-1" />
                      Update Certification
                    </Button>
                    <Button
                      type="button"
                      onClick={cancelEditCertification}
                      variant="outline"
                      size="sm"
                      className="w-full sm:flex-1"
                    >
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    onClick={addCertification}
                    variant="outline"
                    size="sm"
                    className="w-full sm:flex-1"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Certification
                  </Button>
                )}
              </div>

              {formData.certifications.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Certifications:</Label>
                  {formData.certifications.map((cert) => (
                    <div key={cert.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{cert.title}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {cert.issuingOrganization} | {cert.dateObtained}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCertification(cert)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeCertification(cert.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FolderGit2 className="h-5 w-5 mr-2" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="Describe the project, your contributions, and key achievements..."
                  className="min-h-[100px] custom-scrollbar"
                />
              </div>

              <div className="space-y-2">
                <Label>Technologies Used</Label>
                {currentProject.technologies.length === 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      setCurrentProject((prev) => ({
                        ...prev,
                        technologies: [""],
                      }))
                    }
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Technology
                  </Button>
                ) : (
                  currentProject.technologies.map((tech, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
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
                        placeholder="Technology used..."
                        className="flex-1"
                      />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newTech = [...currentProject.technologies];
                            newTech.splice(index, 1);
                            setCurrentProject((prev) => ({
                              ...prev,
                              technologies: newTech,
                            }));
                          }}
                          className="w-full sm:w-auto flex items-center justify-center"
                        >
                          <X className="h-4 w-4" />
                        </Button>

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
                            className="w-full sm:w-auto flex items-center justify-center gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Add</span>
                          </Button>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="https://demo-project.com"
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <Label>GitHub Repository</Label>
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

              <div className="flex flex-col sm:flex-row gap-2">
                {editingProjectId ? (
                  <>
                    <Button
                      onClick={addProject}
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      <span className="h-4 w-4 mr-1" />
                      Update Project
                    </Button>
                    <Button
                      onClick={cancelEditProject}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Cancel Edit
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={addProject}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Project
                  </Button>
                )}
              </div>

              {formData.projects.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Projects:</Label>
                  {formData.projects.map((project) => (
                    <div key={project.id} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {project.role}
                        </div>
                        <div className="text-sm text-gray-500">
                          {project.technologies.join(", ")}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-2 flex-shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeProject(project.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Interests Tab */}
        {activeTab === "interests" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  placeholder="Add an interest..."
                  onKeyPress={(e) => e.key === "Enter" && addInterest()}
                  className="flex-1"
                />
                <Button onClick={addInterest} size="sm" variant="outline" className="flex-shrink-0 w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {formData.additional.interests.length > 0 && (
                <div className="space-y-2">
                  <Label>Added Interests:</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.additional.interests.map((interest) => (
                      <Badge
                        key={interest}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="hover:text-red-500 cursor-pointer"
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
        )}
      </div>

      {/* Action Buttons */}
      {activeTab === tabs[tabs.length - 1].id ? (
        <div className="grid grid-cols-3 items-center gap-2 pt-4 border-t">
          <div className="flex justify-start">
            {activeTab !== tabs[0].id && (
              <Button variant="outline" size="icon" onClick={goToPreviousTab} aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground text-center">
            {tabs.findIndex((t) => t.id === activeTab) + 1} of {tabs.length}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={generatePersona}
              disabled={!formData.personalInfo.fullName || !formData.personalInfo.jobTitle || isGenerating}
              className="resumaic-gradient-green hover:opacity-90 button-press w-full sm:w-auto"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Persona...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate Persona
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 items-center gap-2 pt-4 border-t">
          <div className="flex justify-start">
            {activeTab !== tabs[0].id && (
              <Button variant="outline" size="icon" onClick={goToPreviousTab} aria-label="Previous">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground text-center">
            {tabs.findIndex((t) => t.id === activeTab) + 1} of {tabs.length}
          </div>

          <div className="flex justify-end">
            <Button variant="outline" size="icon" onClick={goToNextTab} aria-label="Next">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PersonaFormPage() {
  return null;
}
