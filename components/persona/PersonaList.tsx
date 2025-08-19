"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Bot,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { CVData } from "@/types/cv-data";
import { PersonaCreationOptions } from "@/components/persona/AddEditPersona";
import { PersonaForm } from "@/components/persona/PersonaForm";
import {
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  type PersonaData,
  type PersonaResponse,
} from "@/lib/redux/service/pasonaService";
import { useAppSelector, useAppDispatch } from "@/lib/redux/hooks";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Crown,UserCircle } from "lucide-react";

export function CreatePersonaPage() {
  const [personas, setPersonas] = useState<CVData[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPersona, setEditingPersona] = useState<CVData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [prefilledData, setPrefilledData] = useState<Partial<
    Omit<CVData, "id" | "createdAt">
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.id;

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoading(true);
        const data = await getPersonas(userId?.toString() || '');
        const formattedPersonas = data.map((persona: PersonaResponse) => ({
          id: persona.id.toString(),
          personalInfo: {
            fullName: persona.full_name || "",
            jobTitle: persona.job_title || "",
            email: persona.email || "",
            phone: persona.phone || "",
            address: persona.address || "",
            city: persona.city || "",
            country: persona.country || "",
            profilePicture: persona.profile_picture || "",
            summary: persona.summary || "",
            linkedin: persona.linkedin || "",
            github: persona.github || "",
          },
          experience: persona.experience || [],
          education: persona.education || [],
          skills: {
            technical: Array.isArray(persona.skills?.technical)
              ? persona.skills.technical
              : Array.isArray(persona.skills)
                ? persona.skills
                : [],
            soft: Array.isArray(persona.skills?.soft) ? persona.skills.soft : [],
          },
          languages: persona.languages || [],
          certifications: persona.certifications || [],
          projects: persona.projects || [],
          additional: {
            interests: Array.isArray(persona.additional?.interests)
              ? persona.additional.interests
              : Array.isArray(persona.additional)
                ? persona.additional
                : [],
          },
          createdAt: persona.created_at || new Date().toISOString(),
          generatedPersona: "",
        }));
        setPersonas(formattedPersonas);
      } catch (error) {
        console.error("Error fetching personas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchPersonas();
    }
  }, [userId]);

  const handleOptionSelect = (
    option: "manual" | "pdf" | "linkedin",
    data?: Partial<Omit<CVData, "id" | "createdAt">>
  ) => {
    setPrefilledData(data || null);
    setShowForm(true);
  };

  const handleEdit = async (persona: CVData) => {
    try {
      const data = await getPersonaById(Number.parseInt(persona.id));
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
                [
                  "Native",
                  "Fluent",
                  "Advanced",
                  "Intermediate",
                  "Basic",
                ].includes(lang.proficiency)
                ? (lang.proficiency as
                  | "Native"
                  | "Fluent"
                  | "Advanced"
                  | "Intermediate"
                  | "Basic")
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
      });

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
                [
                  "Native",
                  "Fluent",
                  "Advanced",
                  "Intermediate",
                  "Basic",
                ].includes(lang.proficiency)
                ? (lang.proficiency as
                  | "Native"
                  | "Fluent"
                  | "Advanced"
                  | "Intermediate"
                  | "Basic")
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
      });
      setShowForm(true);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching persona:", error);
    }
  };

  const handleDownload = (persona: CVData) => {
    const dataStr = JSON.stringify(persona, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${persona.personalInfo.fullName.replace(
      /\s+/g,
      "_"
    )}_CV_Persona.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleView = (persona: CVData) => {
    toast(
      `Viewing persona for ${persona.personalInfo.fullName}\n\nGenerated Persona:\n${persona.generatedPersona}`
    );
  };

  const handleDelete = async (persona: CVData) => {
    try {
      await deletePersona(Number.parseInt(persona.id));
      setPersonas(personas.filter((p) => p.id !== persona.id));
      toast.success("Persona deleted successfully");
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast.error("Failed to delete persona");
    }
  };

  const handleCreateAICV = (persona: CVData) => {
    window.open(`/create-cv?personaId=${persona.id}`, '_blank')
  }

  const handlePersonaGenerated = async (newPersona: CVData) => {
    setIsLoading(true);

    try {
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
          linkedin: newPersona.personalInfo.linkedin || "",
          github: newPersona.personalInfo.github || "",
        },
        experience: newPersona.experience || [],
        education: newPersona.education || [],
        skills: {
          technical: Array.isArray(newPersona.skills?.technical)
            ? newPersona.skills.technical
            : [],
          soft: Array.isArray(newPersona.skills?.soft)
            ? newPersona.skills.soft
            : [],
        },
        languages: newPersona.languages.map(lang => lang.name) || [],
        certifications: newPersona.certifications || [],
        projects: newPersona.projects || [],
        additional: {
          interests: Array.isArray(newPersona.additional?.interests)
            ? newPersona.additional.interests
            : [],
        },
      };

      let response: PersonaResponse;
      if (editingPersona) {
        response = await updatePersona(Number.parseInt(editingPersona.id), personaData);
      } else {
        response = await createPersona(personaData);
      }

      const updatedPersona: CVData = {
        ...newPersona,
        id: response.id.toString(),
        personalInfo: {
          ...newPersona.personalInfo,
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
        experience: response.experience || [],
        education: response.education || [],
        skills: {
          technical: Array.isArray(response.skills?.technical)
            ? response.skills.technical
            : Array.isArray(response.skills)
              ? response.skills
              : [],
          soft: Array.isArray(response.skills?.soft)
            ? response.skills.soft
            : [],
        },
        languages: response.languages || [],
        certifications: response.certifications || [],
        projects: response.projects || [],
        additional: {
          interests: Array.isArray(response.additional?.interests)
            ? response.additional.interests
            : Array.isArray(response.additional)
              ? response.additional
              : [],
        },
        createdAt: response.created_at || new Date().toISOString(),
        generatedPersona: newPersona.generatedPersona,
      };

      if (editingPersona) {
        setPersonas(personas.map(p => p.id === editingPersona.id ? updatedPersona : p));
      } else {
        setPersonas([updatedPersona, ...personas]);
      }

      setIsDialogOpen(false);
      setShowForm(false);
      setPrefilledData(null);
      setEditingPersona(null);
    } catch (error) {
      console.error("Error saving persona:", error);
      toast(`Failed to save persona: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter personas based on search term
  const filteredPersonas = personas.filter((persona) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      persona.personalInfo.fullName.toLowerCase().includes(searchLower) ||
      persona.personalInfo.jobTitle.toLowerCase().includes(searchLower) ||
      persona.personalInfo.email.toLowerCase().includes(searchLower) ||
      persona.skills.technical.some((skill) =>
        skill.toLowerCase().includes(searchLower)
      ) ||
      persona.skills.soft.some((skill) =>
        skill.toLowerCase().includes(searchLower)
      ) ||
      persona.experience.some(
        (exp) =>
          exp.jobTitle?.toLowerCase().includes(searchLower) ||
          exp.companyName?.toLowerCase().includes(searchLower)
      ) ||
      persona.education.some(
        (edu) =>
          edu.degree?.toLowerCase().includes(searchLower) ||
          edu.institutionName?.toLowerCase().includes(searchLower)
      )
    );
  });

  if (isLoading && personas.length === 0) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Create Personas
            </h1>
            <p className="text-gray-600">
              Generate professional personas from complete CV information
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="resumaic-gradient-green  hover:opacity-90  hover-lift button-press "
              onClick={() => {
                setShowForm(false);
                setPrefilledData(null);
                setEditingPersona(null);
                setIsDialogOpen(true);
              }}
            >
              Create Persona
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPersona ? 'Edit Persona' : 'Create New Persona'}
              </DialogTitle>
              <DialogDescription>
                {editingPersona 
                  ? 'Update the persona details below.'
                  : 'Create a new persona by filling in the details below.'}
              </DialogDescription>
            </DialogHeader>
            {!showForm ? (
              <PersonaCreationOptions onOptionSelect={handleOptionSelect} />
            ) : (
              <PersonaForm
                prefilledData={prefilledData}
                editingPersona={editingPersona}
                onPersonaGenerated={handlePersonaGenerated}
                onCancel={() => {
                  setIsDialogOpen(false);
                  setShowForm(false);
                  setPrefilledData(null);
                  setEditingPersona(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {personas.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Generated Personas ({filteredPersonas.length})
                  </h3>
                  <p className="text-sm text-gray-600">
                    View and manage your AI-generated personas
                  </p>
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
                            <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                            <AvatarFallback
  className={`bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8] font-semibold ${
    user?.role === 'admin'
      ? ''
      : 'bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8]'
  }`}
>
  {user?.role === 'admin' ? (
    <Crown className="h-5 w-5 text-[#EA580C]" /> // Orange crown for admin
  ) : user?.name ? (
    user.name.charAt(0).toUpperCase()
  ) : (
    <UserCircle className="h-5 w-5 text-[#70E4A8]" />
  )}
</AvatarFallback>

                                                   </Avatar>
                            <div>
                              <div className="font-medium">
                                {persona.personalInfo.fullName}
                              </div>
                              <div className="text-sm text-gray-600">
                                {persona.personalInfo.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{persona.personalInfo.jobTitle}</TableCell>
                        <TableCell>
                          {persona.experience.length} positions
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(persona.skills.technical)
                              ? persona.skills.technical.slice(0, 3)
                              : []
                            ).map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs"
                              >
                                {skill}
                              </Badge>
                            ))}
                            {Array.isArray(persona.skills.technical) &&
                              persona.skills.technical.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{persona.skills.technical.length - 3}
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {persona.education.length} degrees
                        </TableCell>
                        <TableCell>
                          {new Date(persona.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {/* <Button
                              className="cursor-pointer"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(persona)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button> */}
                            <Button
                              variant="ghost"
                              className="cursor-pointer"
                              size="sm"
                              onClick={() => handleEdit(persona)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* <Button
                              variant="ghost"
                              className="cursor-pointer"
                              size="sm"
                              onClick={() => handleCreateAICV(persona)}
                              title="Create AI CV"
                            >
                              <Bot className="h-4 w-4" />
                            </Button> */}
                            {/* <Button
                              variant="ghost"
                              className="cursor-pointer"
                              size="sm"
                              onClick={() => handleDownload(persona)}
                            >
                              <Download className="h-4 w-4" />
                            </Button> */}
                            <ConfirmDialog
                              title={`Delete "${persona.personalInfo.fullName}"`}
                              description={`Are you sure you want to delete the persona for ${persona.personalInfo.fullName}?`}
                              confirmText="Delete"
                              cancelText="Cancel"
                              onConfirm={() => handleDelete(persona)}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              }
                            />
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
                <Card
                  key={persona.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                      <AvatarFallback
  className={`bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8] font-semibold ${
    user?.role === 'admin'
      ? ''
      : 'bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8]'
  }`}
>
  {user?.role === 'admin' ? (
    <Crown className="h-5 w-5 text-[#EA580C]" /> // Orange crown for admin
  ) : user?.name ? (
    user.name.charAt(0).toUpperCase()
  ) : (
    <UserCircle className="h-5 w-5 text-[#70E4A8]" />
  )}
</AvatarFallback>

                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {persona.personalInfo.fullName}
                          </CardTitle>
                          <CardDescription>
                            {persona.personalInfo.jobTitle}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium">
                          Experience
                        </Label>
                        <p className="text-sm text-gray-600">
                          {persona.experience.length} positions
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">
                          Top Skills
                        </Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {persona.skills.technical.slice(0, 4).map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-xs"
                            >
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
                        <p className="text-sm text-gray-600">
                          {persona.education.length} degrees
                        </p>
                      </div>

                      <div>
                        <Label className="text-sm font-medium">Languages</Label>
                        <p className="text-sm text-gray-600">
                          {persona.languages.length} languages
                        </p>
                      </div>

                      <div className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(persona.createdAt).toLocaleDateString()}
                      </div>

                      {/* <div className="flex gap-2">
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
                      </div>*/}

                      {/* <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleCreateAICV(persona)}
                        >
                          <Bot className="h-4 w-4 mr-1" />
                          AI CV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => handleDownload(persona)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Export
                        </Button>
                      </div> */}

                      <div className="flex gap-2 items-center">
                        <ConfirmDialog
                          title={`Delete "${persona.personalInfo.fullName}"`}
                          description={`Are you sure you want to delete the persona for ${persona.personalInfo.fullName}?`}
                          confirmText="Delete"
                          cancelText="Cancel"
                          onConfirm={() => handleDelete(persona)}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(persona)}
                          className="bg-transparent p-2"
                        >
                          <Edit className="h-4 w-4" />
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No personas found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or create a new persona
            </p>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No personas created yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first AI persona by clicking the "Create Persona"
              button above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="animate-slide-up-delay-3 hover:shadow-lg transition-all duration-300">
  <CardHeader>
    <CardTitle className="flex items-center gap-3 font-rubik text-[#2D3639]">
      <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
        <TrendingUp className="h-5 w-5 text-white" />
      </div>
      Pro Tips
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Tip 1 */}
      <div
        className="flex items-start gap-4 animate-fade-in-stagger"
        style={{ animationDelay: "100ms" }}
      >
        <div
          className="rounded-full bg-[#70E4A8]/20 p-3 animate-float"
          style={{ animationDelay: "0s" }}
        >
          <User className="h-5 w-5 text-[#70E4A8]" />
        </div>
        <div>
          <h4 className="font-semibold text-[#2D3639] font-rubik">
            Complete Information
          </h4>
          <p className="text-sm text-gray-600 font-inter">
            Fill in all sections for the most comprehensive persona
          </p>
        </div>
      </div>

      {/* Tip 2 */}
      <div
        className="flex items-start gap-4 animate-fade-in-stagger"
        style={{ animationDelay: "200ms" }}
      >
        <div
          className="rounded-full bg-[#EA580C]/20 p-3 animate-float"
          style={{ animationDelay: "0.5s" }}
        >
          <Briefcase className="h-5 w-5 text-[#EA580C]" />
        </div>
        <div>
          <h4 className="font-semibold text-[#2D3639] font-rubik">
            Detailed Experience
          </h4>
          <p className="text-sm text-gray-600 font-inter">
            Include specific responsibilities and achievements
          </p>
        </div>
      </div>

      {/* Tip 3 */}
      <div
        className="flex items-start gap-4 animate-fade-in-stagger"
        style={{ animationDelay: "300ms" }}
      >
        <div
          className="rounded-full bg-blue-100 p-3 animate-float"
          style={{ animationDelay: "1s" }}
        >
          <Target className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-semibold text-[#2D3639] font-rubik">
            Relevant Skills
          </h4>
          <p className="text-sm text-gray-600 font-inter">
            Focus on skills that match your career goals
          </p>
        </div>
      </div>
    </div>
  </CardContent>
</Card>

    </div>
  );
}
