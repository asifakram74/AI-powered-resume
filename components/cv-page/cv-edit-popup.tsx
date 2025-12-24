"use client";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Plus, Trash2, Save, X, Upload } from "lucide-react";
import { uploadPersonaProfilePicture } from "../../lib/redux/service/pasonaService";

interface OptimizedCV {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  workExperience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  certifications: string[];
  languages: string[];
  interests: string[];
}

interface CVEditPopupProps {
  cvData: OptimizedCV;
  onSave: (updatedData: OptimizedCV) => void;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  personaId?: string;
  currentImageUrl?: string;
  onProfilePictureUpdated?: (newUrl: string) => void;
}

export function CVEditPopup({
  cvData,
  onSave,
  isOpen,
  onClose,
  isLoading = false,
  personaId,
  currentImageUrl,
  onProfilePictureUpdated,
}: CVEditPopupProps) {
  const [editingData, setEditingData] = useState<OptimizedCV>(cvData);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | undefined>(currentImageUrl);
  useEffect(() => {
    setProfileImagePreview(currentImageUrl);
  }, [currentImageUrl]);

  // Update editing data when cvData changes
  useEffect(() => {
    setEditingData(cvData);
  }, [cvData]);

  const handlePersonalInfoChange = (
    field: keyof OptimizedCV["personalInfo"],
    value: string
  ) => {
    setEditingData({
      ...editingData,
      personalInfo: {
        ...editingData.personalInfo,
        [field]: value,
      },
    });
  };

  const handleImageFileChange = async (file?: File) => {
    if (!file) return;
    // Local preview
    const localUrl = URL.createObjectURL(file);
    setProfileImagePreview(localUrl);

    // Upload to backend (persona owns the profile picture)
    if (!personaId) return; // if persona not available, just preview locally
    try {
      setIsUploadingImage(true);
      const updatedPersona = await uploadPersonaProfilePicture(personaId, file);
      const newUrl = updatedPersona.profile_picture || localUrl;
      setProfileImagePreview(newUrl);
      onProfilePictureUpdated?.(newUrl);
    } catch (err) {
      console.error("Failed to upload profile image:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const addWorkExperience = () => {
    const newExp = {
      title: "",
      company: "",
      duration: "",
      description: "",
    };
    setEditingData({
      ...editingData,
      workExperience: [...editingData.workExperience, newExp],
    });
  };

  const updateWorkExperience = (
    index: number,
    field: keyof OptimizedCV["workExperience"][0],
    value: string
  ) => {
    const updatedExperience = [...editingData.workExperience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setEditingData({
      ...editingData,
      workExperience: updatedExperience,
    });
  };

  const removeWorkExperience = (index: number) => {
    setEditingData({
      ...editingData,
      workExperience: editingData.workExperience.filter((_, i) => i !== index),
    });
  };

  const addEducation = () => {
    const newEdu = {
      degree: "",
      institution: "",
      year: "",
      gpa: "",
    };
    setEditingData({
      ...editingData,
      education: [...editingData.education, newEdu],
    });
  };

  const updateEducation = (
    index: number,
    field: keyof OptimizedCV["education"][0],
    value: string
  ) => {
    const updatedEducation = [...editingData.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setEditingData({
      ...editingData,
      education: updatedEducation,
    });
  };

  const removeEducation = (index: number) => {
    setEditingData({
      ...editingData,
      education: editingData.education.filter((_, i) => i !== index),
    });
  };

  const addProject = () => {
    const newProject = {
      name: "",
      description: "",
      technologies: [],
    };
    setEditingData({
      ...editingData,
      projects: [...editingData.projects, newProject],
    });
  };

  const updateProject = (
    index: number,
    field: keyof OptimizedCV["projects"][0],
    value: string | string[]
  ) => {
    const updatedProjects = [...editingData.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setEditingData({
      ...editingData,
      projects: updatedProjects,
    });
  };

  const removeProject = (index: number) => {
    setEditingData({
      ...editingData,
      projects: editingData.projects.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editingData);
    } catch (error) {
      console.error("Error saving CV:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingData(cvData); // Reset to original data
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto w-[70vw]">
        <DialogHeader>
          <DialogTitle>Edit CV Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profile Image Upload */}
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={profileImagePreview || currentImageUrl || "/placeholder-user.jpg"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-user.jpg";
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="profile-image-input">
                        <input
                          id="profile-image-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(e.target.files?.[0])}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-9 px-4"
                          onClick={() => {
                            const input = document.getElementById("profile-image-input") as HTMLInputElement | null;
                            input?.click();
                          }}
                          disabled={isUploadingImage}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {isUploadingImage ? "Uploading..." : "Change"}
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG. Updates persona image used in templates.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Full Name"
                      value={editingData.personalInfo.name}
                      onChange={(e) =>
                        handlePersonalInfoChange("name", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Email"
                      type="email"
                      value={editingData.personalInfo.email}
                      onChange={(e) =>
                        handlePersonalInfoChange("email", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Phone"
                      value={editingData.personalInfo.phone}
                      onChange={(e) =>
                        handlePersonalInfoChange("phone", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Location"
                      value={editingData.personalInfo.location}
                      onChange={(e) =>
                        handlePersonalInfoChange("location", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="LinkedIn"
                      value={editingData.personalInfo.linkedin}
                      onChange={(e) =>
                        handlePersonalInfoChange("linkedin", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Website"
                      value={editingData.personalInfo.website}
                      onChange={(e) =>
                        handlePersonalInfoChange("website", e.target.value)
                      }
                    />
                  </div>
                  <Textarea
                    placeholder="Professional Summary"
                    value={editingData.summary}
                    onChange={(e) =>
                      setEditingData({
                        ...editingData,
                        summary: e.target.value,
                      })
                    }
                    rows={4}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Work Experience Tab */}
            <TabsContent value="experience" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Work Experience</CardTitle>
                    <Button onClick={addWorkExperience} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Experience
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingData.workExperience.map((exp, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Experience {index + 1}</h4>
                        <Button
                          onClick={() => removeWorkExperience(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Job Title"
                          value={exp.title}
                          onChange={(e) =>
                            updateWorkExperience(index, "title", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Company"
                          value={exp.company}
                          onChange={(e) =>
                            updateWorkExperience(
                              index,
                              "company",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <Input
                        placeholder="Duration (e.g., 2020 - 2023)"
                        value={exp.duration}
                        onChange={(e) =>
                          updateWorkExperience(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                      />
                      <Textarea
                        placeholder="Job Description"
                        value={exp.description}
                        onChange={(e) =>
                          updateWorkExperience(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    <Button onClick={addEducation} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Education
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingData.education.map((edu, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Education {index + 1}</h4>
                        <Button
                          onClick={() => removeEducation(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Degree"
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(index, "degree", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Institution"
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(
                              index,
                              "institution",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          placeholder="Year"
                          value={edu.year}
                          onChange={(e) =>
                            updateEducation(index, "year", e.target.value)
                          }
                        />
                        <Input
                          placeholder="GPA (optional)"
                          value={edu.gpa}
                          onChange={(e) =>
                            updateEducation(index, "gpa", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Projects</CardTitle>
                    <Button onClick={addProject} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Project
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingData.projects.map((project, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Project {index + 1}</h4>
                        <Button
                          onClick={() => removeProject(index)}
                          size="sm"
                          variant="destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Project Name"
                        value={project.name}
                        onChange={(e) =>
                          updateProject(index, "name", e.target.value)
                        }
                      />
                      <Textarea
                        placeholder="Project Description"
                        value={project.description}
                        onChange={(e) =>
                          updateProject(index, "description", e.target.value)
                        }
                        rows={3}
                      />
                      <Textarea
                        placeholder="Technologies (comma-separated)"
                        value={project.technologies.join(", ")}
                        onChange={(e) =>
                          updateProject(
                            index,
                            "technologies",
                            e.target.value
                              .split(",")
                              .map((tech) => tech.trim())
                              .filter((tech) => tech)
                          )
                        }
                        rows={2}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Other Information Tab */}
            <TabsContent value="other" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter skills separated by commas (e.g., JavaScript, React, Node.js)"
                      value={editingData.skills.join(", ")}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          skills: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      rows={3}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter certifications separated by commas"
                      value={editingData.certifications.join(", ")}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          certifications: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      rows={3}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Languages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter languages separated by commas"
                      value={editingData.languages.join(", ")}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          languages: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      rows={2}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Interests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter interests separated by commas"
                      value={editingData.interests.join(", ")}
                      onChange={(e) =>
                        setEditingData({
                          ...editingData,
                          interests: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter((s) => s),
                        })
                      }
                      rows={2}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </ScrollArea>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={isSaving || isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
