"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, X, Save } from "lucide-react"
import type { CV, CVContent, CreateCVData } from "@/types/cv"

interface CVFormProps {
  selectedTemplate: string
  editingCV?: CV | null
  onSave: (cvData: CreateCVData) => void
  onCancel: () => void
}

export function CVForm({ selectedTemplate, editingCV, onSave, onCancel }: CVFormProps) {
  const [isSaving, setIsSaving] = useState(false)

  // Basic CV Info
  const [title, setTitle] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")

  // CV Content
  const [content, setContent] = useState<CVContent>({
    personalInfo: {
      summary: "",
      linkedin: "",
      github: "",
      website: "",
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
      awards: [],
      publications: [],
    },
  })

  // Form states for adding new items
  const [currentExperience, setCurrentExperience] = useState({
    jobTitle: "",
    companyName: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    responsibilities: [""],
  })

  const [currentEducation, setCurrentEducation] = useState({
    degree: "",
    institutionName: "",
    location: "",
    graduationDate: "",
    gpa: "",
    honors: "",
  })

  const [skillInput, setSkillInput] = useState("")
  const [skillType, setSkillType] = useState<"technical" | "soft">("technical")

  // Load editing data
  useEffect(() => {
    if (editingCV) {
      setTitle(editingCV.title)
      setName(editingCV.name)
      setEmail(editingCV.email)
      setPhone(editingCV.phone || "")
      setAddress(editingCV.address || "")
      setContent(editingCV.content || content)
    }
  }, [editingCV])

  const addSkill = () => {
    if (skillInput.trim()) {
      setContent((prev) => ({
        ...prev,
        skills: {
          ...prev.skills!,
          [skillType]: [...(prev.skills?.[skillType] || []), skillInput.trim()],
        },
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (type: "technical" | "soft", skillToRemove: string) => {
    setContent((prev) => ({
      ...prev,
      skills: {
        ...prev.skills!,
        [type]: prev.skills?.[type]?.filter((skill) => skill !== skillToRemove) || [],
      },
    }))
  }

  const addExperience = () => {
    if (currentExperience.jobTitle && currentExperience.companyName) {
      setContent((prev) => ({
        ...prev,
        experience: [
          ...(prev.experience || []),
          {
            ...currentExperience,
            id: Date.now().toString(),
          },
        ],
      }))
      setCurrentExperience({
        jobTitle: "",
        companyName: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        responsibilities: [""],
      })
    }
  }

  const addEducation = () => {
    if (currentEducation.degree && currentEducation.institutionName) {
      setContent((prev) => ({
        ...prev,
        education: [
          ...(prev.education || []),
          {
            ...currentEducation,
            id: Date.now().toString(),
          },
        ],
      }))
      setCurrentEducation({
        degree: "",
        institutionName: "",
        location: "",
        graduationDate: "",
        gpa: "",
        honors: "",
      })
    }
  }

  const handleSave = async () => {
    if (!title || !name || !email) {
      alert("Please fill in all required fields (Title, Name, Email)")
      return
    }

    setIsSaving(true)

    const cvData: CreateCVData = {
      layout_id: selectedTemplate,
      title,
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
      content,
    }

    try {
      await onSave(cvData)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CV Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Software Engineer Resume"
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, State, Country" />
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Professional Summary</Label>
            <Textarea
              value={content.personalInfo?.summary || ""}
              onChange={(e) =>
                setContent((prev) => ({
                  ...prev,
                  personalInfo: { ...prev.personalInfo, summary: e.target.value },
                }))
              }
              placeholder="Brief professional summary..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={content.personalInfo?.linkedin || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, linkedin: e.target.value },
                  }))
                }
                placeholder="https://linkedin.com/in/your-profile"
              />
            </div>
            <div className="space-y-2">
              <Label>GitHub</Label>
              <Input
                value={content.personalInfo?.github || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, github: e.target.value },
                  }))
                }
                placeholder="https://github.com/your-username"
              />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                value={content.personalInfo?.website || ""}
                onChange={(e) =>
                  setContent((prev) => ({
                    ...prev,
                    personalInfo: { ...prev.personalInfo, website: e.target.value },
                  }))
                }
                placeholder="https://your-website.com"
              />
            </div>
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
                onChange={(e) => setCurrentExperience((prev) => ({ ...prev, jobTitle: e.target.value }))}
                placeholder="Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input
                value={currentExperience.companyName}
                onChange={(e) => setCurrentExperience((prev) => ({ ...prev, companyName: e.target.value }))}
                placeholder="Tech Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={currentExperience.location}
                onChange={(e) => setCurrentExperience((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="San Francisco, CA"
              />
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={currentExperience.startDate}
                onChange={(e) => setCurrentExperience((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={currentExperience.endDate}
                onChange={(e) => setCurrentExperience((prev) => ({ ...prev, endDate: e.target.value }))}
                disabled={currentExperience.current}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={currentExperience.current}
              onCheckedChange={(checked) => setCurrentExperience((prev) => ({ ...prev, current: checked }))}
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
                    const newResp = [...currentExperience.responsibilities]
                    newResp[index] = e.target.value
                    setCurrentExperience((prev) => ({ ...prev, responsibilities: newResp }))
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

          {content.experience && content.experience.length > 0 && (
            <div className="space-y-2">
              <Label>Added Experiences:</Label>
              {content.experience.map((exp) => (
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
            <Select value={skillType} onValueChange={(value: "technical" | "soft") => setSkillType(value)}>
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
                {content.skills?.technical?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
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
                {content.skills?.soft?.map((skill) => (
                  <Badge key={skill} variant="outline" className="flex items-center gap-1">
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
                onChange={(e) => setCurrentEducation((prev) => ({ ...prev, degree: e.target.value }))}
                placeholder="Bachelor of Science"
              />
            </div>
            <div className="space-y-2">
              <Label>Institution</Label>
              <Input
                value={currentEducation.institutionName}
                onChange={(e) => setCurrentEducation((prev) => ({ ...prev, institutionName: e.target.value }))}
                placeholder="University Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={currentEducation.location}
                onChange={(e) => setCurrentEducation((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City, State"
              />
            </div>
            <div className="space-y-2">
              <Label>Graduation Date</Label>
              <Input
                type="date"
                value={currentEducation.graduationDate}
                onChange={(e) => setCurrentEducation((prev) => ({ ...prev, graduationDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>GPA (Optional)</Label>
              <Input
                value={currentEducation.gpa}
                onChange={(e) => setCurrentEducation((prev) => ({ ...prev, gpa: e.target.value }))}
                placeholder="3.8"
              />
            </div>
          </div>

          <Button onClick={addEducation} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Education
          </Button>

          {content.education && content.education.length > 0 && (
            <div className="space-y-2">
              <Label>Added Education:</Label>
              {content.education.map((edu) => (
                <div key={edu.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">
                    {edu.degree} - {edu.institutionName}
                  </div>
                  <div className="text-sm text-gray-600">{edu.graduationDate}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!title || !name || !email || isSaving}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving CV...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {editingCV ? "Update CV" : "Create CV"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
