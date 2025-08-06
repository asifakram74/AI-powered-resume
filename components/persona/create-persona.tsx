"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sparkles,
  Grid,
  List,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  TrendingUp,
  User,
  Briefcase,
  
  Target,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { CVData } from "@/types/cv-data"
import { PersonaCreationOptions } from "@/components/persona/PersonaCreationOptions"
import { PersonaForm } from "@/components/persona/PersonaForm"
import {
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  type PersonaData,
  type PersonaResponse,
} from "@/lib/api"
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks"
import { fetchPersonas, setPersonas } from "@/lib/redux/slices/personaSlice"

export function CreatePersonaPage() {
  const dispatch = useAppDispatch()
  const personas = useAppSelector((state) => state.persona.personas)
  const loading = useAppSelector((state) => state.persona.loading)
  const error = useAppSelector((state) => state.persona.error)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPersona, setEditingPersona] = useState<CVData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [prefilledData, setPrefilledData] = useState<Partial<Omit<CVData, "id" | "createdAt">> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!user?.id) {
      console.log("No user ID available - user might not be logged in")
      return
    }
    dispatch(fetchPersonas())
  }, [user?.id, dispatch])

  const handleOptionSelect = (
    option: "manual" | "pdf" | "linkedin",
    data?: Partial<Omit<CVData, "id" | "createdAt">>,
  ) => {
    setPrefilledData(data || null)
    setShowForm(true)
  }

  const handleEdit = async (persona: CVData) => {
    try {
      const data = await getPersonaById(Number.parseInt(persona.id))
      setEditingPersona({
        ...persona,
        personalInfo: {
          fullName: data.full_name || "",
          jobTitle: data.job_title || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          profilePicture: data.profile_picture || "",
          summary: data.summary || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
        },
        experience: data.experience || [],
        education: data.education || [],
        skills: {
          technical: Array.isArray(data.skills?.technical)
            ? data.skills.technical
            : Array.isArray(data.skills)
              ? data.skills
              : [],
          soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
        },
        languages: Array.isArray(data.languages)
          ? data.languages.map((lang: any) => ({
              id: lang.id || Date.now().toString(),
              name: typeof lang === "string" ? lang : lang.name || "",
              proficiency:
                typeof lang === "object" &&
                ["Native", "Fluent", "Advanced", "Intermediate", "Basic"].includes(lang.proficiency)
                  ? (lang.proficiency as "Native" | "Fluent" | "Advanced" | "Intermediate" | "Basic")
                  : "Basic",
            }))
          : [],
        certifications: data.certifications || [],
        projects: data.projects || [],
        additional: {
          interests: Array.isArray(data.additional?.interests)
            ? data.additional.interests
            : Array.isArray(data.additional)
              ? data.additional
              : [],
        },
        createdAt: data.created_at || new Date().toISOString(),
      })

      setPrefilledData({
        personalInfo: {
          fullName: data.full_name || "",
          jobTitle: data.job_title || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          country: data.country || "",
          profilePicture: data.profile_picture || "",
          summary: data.summary || "",
          linkedin: data.linkedin || "",
          github: data.github || "",
        },
        experience: data.experience || [],
        education: data.education || [],
        skills: {
          technical: Array.isArray(data.skills?.technical)
            ? data.skills.technical
            : Array.isArray(data.skills)
              ? data.skills
              : [],
          soft: Array.isArray(data.skills?.soft) ? data.skills.soft : [],
        },
        languages: Array.isArray(data.languages)
          ? data.languages.map((lang: any) => ({
              id: lang.id || Date.now().toString(),
              name: typeof lang === "string" ? lang : lang.name || "",
              proficiency:
                typeof lang === "object" &&
                ["Native", "Fluent", "Advanced", "Intermediate", "Basic"].includes(lang.proficiency)
                  ? (lang.proficiency as "Native" | "Fluent" | "Advanced" | "Intermediate" | "Basic")
                  : "Basic",
            }))
          : [],
        certifications: data.certifications || [],
        projects: data.projects || [],
        additional: {
          interests: Array.isArray(data.additional?.interests)
            ? data.additional.interests
            : Array.isArray(data.additional)
              ? data.additional
              : [],
        },
      })
      setShowForm(true)
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error fetching persona:", error)
    }
  }

  const handleDownload = (persona: CVData) => {
    const dataStr = JSON.stringify(persona, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${persona.personalInfo.fullName.replace(/\s+/g, "_")}_CV_Persona.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleView = (persona: CVData) => {
    alert(`Viewing persona for ${persona.personalInfo.fullName}\n\nGenerated Persona:\n${persona.generatedPersona}`)
  }

  const handleDelete = async (persona: CVData) => {
    if (confirm(`Are you sure you want to delete the persona for ${persona.personalInfo.fullName}?`)) {
      try {
        await deletePersona(Number.parseInt(persona.id))
        dispatch(setPersonas(personas.filter((p) => p.id !== persona.id)))
      } catch (error) {
        console.error("Error deleting persona:", error)
        alert("Failed to delete persona")
      }
    }
  }

  const handlePersonaGenerated = async (newPersona: CVData) => {
    console.log("Persona data being processed:", JSON.stringify(newPersona, null, 2))
    setIsLoading(true)

    try {
      // Validate URLs before processing
      const validateUrl = (url: string): string => {
        if (!url || url.trim() === "") return ""

        const trimmedUrl = url.trim()

        // If it's already a valid URL, return it
        if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
          return trimmedUrl
        }

        // If it looks like a domain, add https://
        if (trimmedUrl.includes(".") && !trimmedUrl.includes(" ")) {
          return `https://${trimmedUrl}`
        }

        // If it's not a valid URL format, return empty string
        return ""
      }

      // Transform to API format with URL validation
      const personaData: PersonaData = {
        personalInfo: {
          full_name: newPersona.personalInfo.fullName || "",
          jobTitle: newPersona.personalInfo.jobTitle || "",
          email: newPersona.personalInfo.email || "",
          phone: newPersona.personalInfo.phone || "",
          address: newPersona.personalInfo.address || "",
          city: newPersona.personalInfo.city || "",
          country: newPersona.personalInfo.country || "",
          profilePicture: newPersona.personalInfo.profilePicture || "",
          summary: newPersona.personalInfo.summary || "",
          linkedin: validateUrl(newPersona.personalInfo.linkedin || ""),
          github: validateUrl(newPersona.personalInfo.github || ""),
        },
        experience: newPersona.experience.map((exp) => ({
          jobTitle: exp.jobTitle || "",
          companyName: exp.companyName || "",
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: exp.current || false,
          responsibilities: exp.responsibilities || [],
        })),
        education: newPersona.education.map((edu) => ({
          degree: edu.degree || "",
          institutionName: edu.institutionName || "",
          location: edu.location || "",
          graduationDate: edu.graduationDate || "",
          gpa: edu.gpa || "",
          honors: edu.honors || "",
          additionalInfo: edu.additionalInfo || "",
        })),
        skills: {
          technical: Array.isArray(newPersona.skills?.technical) ? newPersona.skills.technical : [],
          soft: Array.isArray(newPersona.skills?.soft) ? newPersona.skills.soft : [],
        },
        languages: newPersona.languages.map((lang) => lang.name || ""),
        certifications: newPersona.certifications.map((cert) => ({
          title: cert.title || "",
          issuingOrganization: cert.issuingOrganization || "",
          dateObtained: cert.dateObtained || "",
          verificationLink: cert.verificationLink || "",
        })),
        projects: newPersona.projects.map((proj) => ({
          name: proj.name || "",
          role: proj.role || "",
          description: proj.description || "",
          technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
          liveDemoLink: proj.liveDemoLink || "",
          githubLink: proj.githubLink || "",
        })),
        additional: {
          interests: Array.isArray(newPersona.additional?.interests) ? newPersona.additional.interests : [],
        },
      }

      console.log("Transformed persona data for API:", JSON.stringify(personaData, null, 2))

      let response: PersonaResponse
      if (editingPersona) {
        console.log("Updating existing persona with ID:", editingPersona.id)
        response = await updatePersona(Number.parseInt(editingPersona.id), personaData)
      } else {
        console.log("Creating new persona")
        response = await createPersona(personaData)
        console.log("Persona created successfully with ID:", response.id)
      }

      // Transform back to frontend format
      const updatedPersona: CVData = {
        ...newPersona,
        id: response.id.toString(),
        personalInfo: {
          ...newPersona.personalInfo,
          // Handle the actual Laravel response structure
          fullName: response.full_name || newPersona.personalInfo.fullName,
          jobTitle: response.job_title || newPersona.personalInfo.jobTitle,
          email: response.email || newPersona.personalInfo.email,
          phone: response.phone || "",
          address: response.address || "",
          city: response.city || "",
          country: response.country || "",
          profilePicture: response.profile_picture || "",
          summary: response.summary || "",
          linkedin: response.linkedin || "",
          github: response.github || "",
        },
        experience:
          response.experience?.map((exp: any) => ({
            id: exp.id || Date.now().toString(),
            jobTitle: exp.jobTitle || exp.job_title || "",
            companyName: exp.companyName || exp.company_name || "",
            location: exp.location || "",
            startDate: exp.startDate || exp.start_date || "",
            endDate: exp.endDate || exp.end_date || "",
            current: exp.current || false,
            responsibilities: Array.isArray(exp.responsibilities) ? exp.responsibilities : [],
          })) || [],
        education:
          response.education?.map((edu: any) => ({
            id: edu.id || Date.now().toString(),
            degree: edu.degree || "",
            institutionName: edu.institutionName || edu.institution_name || "",
            location: edu.location || "",
            graduationDate: edu.graduationDate || edu.graduation_date || "",
            gpa: edu.gpa || "",
            honors: edu.honors || "",
            additionalInfo: edu.additionalInfo || edu.additional_info || "",
          })) || [],
        skills: {
          technical: Array.isArray(response.skills?.technical)
            ? response.skills.technical
            : Array.isArray(response.skills)
              ? response.skills
              : [],
          soft: Array.isArray(response.skills?.soft) ? response.skills.soft : [],
        },
        languages:
          response.languages?.map((lang: any) => ({
            id: Date.now().toString(),
            name: typeof lang === "string" ? lang : lang.name || "",
            proficiency: typeof lang === "object" ? lang.proficiency || "Intermediate" : "Intermediate",
          })) || [],
        certifications:
          response.certifications?.map((cert: any) => ({
            id: Date.now().toString(),
            title: cert.title || "",
            issuingOrganization: cert.issuingOrganization || cert.issuing_organization || "",
            dateObtained: cert.dateObtained || cert.date_obtained || "",
            verificationLink: cert.verificationLink || cert.verification_link || "",
          })) || [],
        projects:
          response.projects?.map((proj: any) => ({
            id: Date.now().toString(),
            name: proj.name || "",
            role: proj.role || "",
            description: proj.description || "",
            technologies: Array.isArray(proj.technologies) ? proj.technologies : [],
            liveDemoLink: proj.liveDemoLink || proj.live_demo_link || "",
            githubLink: proj.githubLink || proj.github_link || "",
          })) || [],
        additional: {
          interests: Array.isArray(response.additional?.interests)
            ? response.additional.interests
            : Array.isArray(response.additional)
              ? response.additional
              : [],
        },
        createdAt: response.created_at || new Date().toISOString(),
        generatedPersona: newPersona.generatedPersona,
      }

      if (editingPersona) {
        dispatch(setPersonas(personas.map((p) => (p.id === editingPersona.id ? updatedPersona : p))))
      } else {
        dispatch(setPersonas([updatedPersona, ...personas]))
      }

      setIsDialogOpen(false)
      setShowForm(false)
      setPrefilledData(null)
      setEditingPersona(null)
    } catch (error) {
      console.error("Error saving persona:", error)

      // Provide more specific error messages
      let errorMessage = "Unknown error occurred"
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      alert(`Failed to save persona: ${errorMessage}`)
    } finally {
        setIsLoading(false)
    }
  }

  // Filter personas based on search term
  const filteredPersonas = personas.filter((persona) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      persona.personalInfo.fullName.toLowerCase().includes(searchLower) ||
      persona.personalInfo.jobTitle.toLowerCase().includes(searchLower) ||
      persona.personalInfo.email.toLowerCase().includes(searchLower) ||
      persona.skills.technical.some((skill) => skill.toLowerCase().includes(searchLower)) ||
      persona.skills.soft.some((skill) => skill.toLowerCase().includes(searchLower)) ||
      persona.experience.some(
        (exp) =>
          exp.jobTitle?.toLowerCase().includes(searchLower) || exp.companyName?.toLowerCase().includes(searchLower),
      ) ||
      persona.education.some(
        (edu) =>
          edu.degree?.toLowerCase().includes(searchLower) || edu.institutionName?.toLowerCase().includes(searchLower),
      )
    )
  })

  if (loading && personas.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Personas</h1>
            <p className="text-gray-600">Generate professional personas from complete CV information</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Create Persona
              </Button>
          </DialogTrigger>
          <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
            <DialogHeader>
              <DialogTitle>{editingPersona ? "Edit CV Persona" : "Create Complete CV Persona"}</DialogTitle>
              <DialogDescription>Choose how you'd like to create your professional persona</DialogDescription>
            </DialogHeader>

            {!showForm ? (
              <PersonaCreationOptions onOptionSelect={handleOptionSelect} />
            ) : (
              <PersonaForm
                prefilledData={prefilledData}
                editingPersona={editingPersona}
                onPersonaGenerated={handlePersonaGenerated}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setShowForm(false)
                  setPrefilledData(null)
                  setEditingPersona(null)
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* View Toggle and Personas Display */}
      {personas.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Generated Personas ({filteredPersonas.length})</h3>
                  <p className="text-sm text-gray-600">View and manage your AI-generated personas</p>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search personas by name, job title, skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {viewMode === "table" ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profile</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Education</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPersonas.map((persona) => (
                      <TableRow key={persona.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={persona.personalInfo.profilePicture || "/placeholder.svg"} />
                              <AvatarFallback>
                                {persona.personalInfo.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{persona.personalInfo.fullName}</div>
                              <div className="text-sm text-gray-600">{persona.personalInfo.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{persona.personalInfo.jobTitle}</TableCell>
                        <TableCell>{persona.experience.length} positions</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(persona.skills.technical) ? persona.skills.technical.slice(0, 3) : []).map(
                              (skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ),
                            )}
                            {Array.isArray(persona.skills.technical) && persona.skills.technical.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{persona.skills.technical.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{persona.education.length} degrees</TableCell>
                        <TableCell>{new Date(persona.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleView(persona)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(persona)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDownload(persona)}>
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(persona)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPersonas.map((persona) => (
                <Card key={persona.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={persona.personalInfo.profilePicture || "/placeholder.svg"} />
                          <AvatarFallback>
                            {persona.personalInfo.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{persona.personalInfo.fullName}</CardTitle>
                          <CardDescription>{persona.personalInfo.jobTitle}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">Experience</Label>
                        <p className="text-sm text-gray-600">{persona.experience.length} positions</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Top Skills</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.skills.technical.slice(0, 4).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {persona.skills.technical.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{persona.skills.technical.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Education</Label>
                        <p className="text-sm text-gray-600">{persona.education.length} degrees</p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Languages</Label>
                        <p className="text-sm text-gray-600">{persona.languages.length} languages</p>
                      </div>

                      <div className="text-xs text-gray-500">
                        Created: {new Date(persona.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleView(persona)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleEdit(persona)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleDownload(persona)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(persona)}
                          className="text-red-600 hover:text-red-700 bg-transparent"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {filteredPersonas.length === 0 && personas.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No personas found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search terms or create a new persona</p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}
      {personas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <Sparkles className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No personas created yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first AI persona by clicking the "Create Persona" button above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Pro Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Complete Information</h4>
                <p className="text-sm text-gray-600">Fill in all sections for the most comprehensive persona</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <Briefcase className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Detailed Experience</h4>
                <p className="text-sm text-gray-600">Include specific responsibilities and achievements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-purple-100 p-2">
                <Target className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Relevant Skills</h4>
                <p className="text-sm text-gray-600">Focus on skills that match your career goals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
