"use client";

import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
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
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import type { CVData } from "../../types/cv-data";
import { PersonaCreationOptions } from "./AddEditPersona";
import { PersonaForm } from "./PersonaForm";
import {
  getAllPersonas,
  getPersonas,
  getPersonaById,
  createPersona,
  updatePersona,
  deletePersona,
  uploadPersonaProfilePicture,
  deletePersonaProfilePicture,
  type PersonaData,
  type PersonaResponse,
} from "../../lib/redux/service/pasonaService";
import { createCheckoutSession } from "../../lib/redux/service/paymentService";
import { toast } from "sonner";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Crown, UserCircle } from "lucide-react";
import { PageProps } from "../../types/page-props";

function CreatePersonaPage({ user }: PageProps) {
  const [personas, setPersonas] = useState<CVData[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingPersona, setEditingPersona] = useState<CVData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [prefilledData, setPrefilledData] = useState<Partial<
    Omit<CVData, "id" | "createdAt">
  > | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setIsLoading(true);

        let data: PersonaResponse[] = [];

        if (user?.role?.toLowerCase() === 'admin') {
          data = await getAllPersonas();
        } else {
          data = await getPersonas(userId?.toString() || "");
        }

        const safeData: PersonaResponse[] = Array.isArray(data) ? data : [];
        const formattedPersonas = safeData.map((persona: PersonaResponse) => ({
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
          createdAt: persona.updated_at || new Date().toISOString(),
          generatedPersona: "",
        }));

        setPersonas(formattedPersonas);
      } catch (error) {
        console.error("Error fetching personas:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchPersonas();
    }
  }, [user, userId]);


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
      console.log('Raw persona data from API:', data);
      console.log('Profile picture from API:', data.profile_picture);

      // The profile picture URL is now constructed in the service layer
      const profilePictureUrl = data.profile_picture || "";
      console.log('Profile picture URL:', profilePictureUrl);

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
          profilePicture: profilePictureUrl,
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
          ? data.languages.map((lang: any, index: number) => ({
            id: lang.id || `lang-${Date.now()}-${index}`,
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
        createdAt: data.updated_at || new Date().toISOString(),
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
          profilePicture: profilePictureUrl, // Use the constructed URL instead of data.profile_picture
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
          ? data.languages.map((lang: any, index: number) => ({
            id: lang.id || `lang-${Date.now()}-${index}`,
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
    // Check CV limit for free plan users
    if (user?.plan === 'free' && user?.profile?.cvs_count !== undefined && user.profile.cvs_count >= 3 && (user?.role?.toLowerCase() !== 'admin')) {
      toast.error("Free plan users can only create up to 3 CVs. Please upgrade your plan to create more.");
      return;
    }

    window.open(`/create-cv?personaId=${persona.id}`, '_blank')
  }

  const handlePersonaGenerated = async (newPersona: CVData, profilePictureFile?: File | null) => {
    console.log("handlePersonaGenerated called with:", {
      newPersona: newPersona.personalInfo.fullName,
      profilePictureFile: profilePictureFile ? {
        name: profilePictureFile.name,
        size: profilePictureFile.size,
        type: profilePictureFile.type
      } : null
    });
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
        // Update persona first
        response = await updatePersona(Number.parseInt(editingPersona.id), personaData);

        // Then handle profile picture changes in edit flow
        if (profilePictureFile) {
          try {
            const updatedResponse = await uploadPersonaProfilePicture(response.id, profilePictureFile);
            response = updatedResponse;
          } catch (profilePictureError) {
            console.error("Error uploading profile picture:", profilePictureError);
            toast("Persona updated, but failed to upload profile picture");
          }
        } else {
          // Detect explicit removal: new persona has empty picture but original had one
          const removed = !newPersona.personalInfo.profilePicture && !!editingPersona.personalInfo.profilePicture;
          if (removed) {
            try {
              await deletePersonaProfilePicture(response.id);
              // Ensure downstream state reflects deletion
              response.profile_picture = "";
            } catch (deleteError) {
              console.error("Error deleting profile picture:", deleteError);
              toast("Persona updated, but failed to delete profile picture");
            }
          }
        }
      } else {
        // Step 1: Create persona without profile picture
        console.log("Creating persona with data:", personaData);
        response = await createPersona(personaData);
        console.log("Create persona response:", response);

        if (!response || !response.id) {
          console.error("Invalid response from createPersona:", response);
          throw new Error("Failed to create persona: Invalid response from server");
        }

        // Step 2: Upload profile picture if provided
        if (profilePictureFile) {
          try {
            console.log("Uploading profile picture for persona ID:", response.id);
            const updatedResponse = await uploadPersonaProfilePicture(response.id, profilePictureFile);
            console.log("Profile picture upload response:", updatedResponse);
            response = updatedResponse;
          } catch (profilePictureError) {
            console.error("Error uploading profile picture:", profilePictureError);
            toast("Persona created successfully, but failed to upload profile picture");
          }
        }
      }

      const updatedPersona: CVData = {
        ...newPersona,
        id: response.id?.toString() || Date.now().toString(),
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
        createdAt: response.updated_at || new Date().toISOString(),
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

      toast.success(editingPersona ? "Persona updated successfully" : "Persona created successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="fixed inset-0 flex justify-center items-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        {/* Left Section */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-3 text-center sm:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white mb-2 sm:mb-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl dark:text-gray-100 font-bold text-gray-900 dark:text-gray-100">
              Create Personas
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-1 sm:mt-0">
              Generate professional personas from complete CV information
            </p>
          </div>
        </div>

        {/* Button Section */}
        <div className="flex justify-center sm:justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="resumaic-gradient-green hover:opacity-90 hover-lift button-press dark:text-gray-100"
                onClick={async (e) => {

                  if ((user as any)?.plan_type?.toLowerCase() === "free" && personas.length >= 3 && (user?.role?.toLowerCase() !== 'admin')) {
                    e.preventDefault();
                    setIsUpgradeDialogOpen(true);
                    return;
                  }
                  setShowForm(false);
                  setPrefilledData(null);
                  setEditingPersona(null);
                  setIsDialogOpen(true);
                }}
              >
                Create Persona
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] !max-w-none max-h-[90vh] overflow-hidden dark:border-0 dark:p-[1px] dark:bg-transparent">
              <div className="hidden dark:block absolute inset-0 gradient-border-moving -z-10" />
              <div className="dark:bg-[#0B0F1A] dark:rounded-2xl p-6 h-full w-full overflow-y-auto custom-scrollbar max-h-[calc(90vh-2px)]">
                <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
                  <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
                  <DialogTitle className="text-2xl font-bold dark:text-gray-100">
                    {editingPersona ? 'Edit Persona' : 'Create New Persona'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500 dark:text-gray-400">
                    {editingPersona
                      ? 'Update the persona details below.'
                      : 'Create a new persona by filling in the details below.'}
                  </DialogDescription>
                </DialogHeader>
                {/* {!showForm && (
                  <div className="flex justify-end hidden lg:flex">
                    <span className="inline-flex items-center rounded-md bg-[#EA580C]/20 px-2.5 py-0.5 text-xs font-medium text-[#EA580C] font-inter">
                      Coming Soon
                    </span>
                  </div>
                )} */}
                


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
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upgrade Plan Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-0 shadow-xl rounded-xl dark:border-0 dark:p-[1px] dark:bg-transparent">
          <div className="hidden dark:block absolute inset-0 gradient-border-moving -z-10" />
          <div className="dark:bg-[#0B0F1A] dark:rounded-xl overflow-hidden h-full w-full">
            <div className="relative resumaic-gradient-green p-6 text-white rounded-t-xl animate-pulse-glow">
              <div className="absolute inset-x-0 top-0 h-0.5 shimmer-effect opacity-70" />
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6" />
                <DialogTitle className="text-lg font-semibold">Upgrade Required</DialogTitle>
              </div>
              <DialogDescription className="mt-2 text-sm opacity-90">
                You’ve reached the maximum number of personas for the Free plan. Upgrade your plan to create more!
              </DialogDescription>
              <div className="absolute -right-10 -top-10 w-32 h-32 resumaic-gradient-orange rounded-full blur-2xl opacity-30" />
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full resumaic-gradient-green" />
                  <span>Create more personas beyond 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full resumaic-gradient-orange" />
                  <span>Faster AI generation</span>
                </div>
              </div>
              <div className="space-y-3">
                <Button
                  className="w-full resumaic-gradient-orange text-white hover:opacity-90 button-press"
                  onClick={async () => {
                    try {
                      await createCheckoutSession();
                    } catch (err) {
                      console.error("Checkout error:", err);
                    }
                  }}
                >
                  Upgrade Now
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-2 border-[#70E4A8] text-[#2d3639] hover:bg-[#70E4A8]/10 dark:text-gray-100 dark:border-[#70E4A8]/70 dark:hover:bg-[#70E4A8]/15"
                  onClick={() => setIsUpgradeDialogOpen(false)}
                >
                  Not Now
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {personas.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Title section - always full width */}
                <div className="w-full">
                  <h3 className="text-lg font-semibold">
                    Generated Personas ({filteredPersonas.length})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    View and manage your AI-generated personas
                  </p>
                </div>

                {/* Controls section - improved mobile layout */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    <Input
                      placeholder="Search personas by name, job title, skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  {/* Hide view mode controls on mobile and tablet, show only on large screens */}
                  <div className="hidden lg:flex gap-2 flex-shrink-0">
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

          {/* Show table view only on large screens, card view on mobile/tablet */}
          {viewMode === "table" && (
            <Card className="hidden lg:block">
              <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                <div className="overflow-x-auto">
                  <Table className="table-fixed w-full">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[20%] px-4">Profile</TableHead>
                        <TableHead className="w-[15%] px-4">Job Title</TableHead>
                        {/* <TableHead className="w-[12%] px-4">Experience</TableHead> */}
                        {/* <TableHead className="w-[20%] px-4">Skills</TableHead> */}
                        {/* <TableHead className="w-[12%] px-4">Education</TableHead> */}
                        <TableHead className="w-[11%] px-4">Last Modified</TableHead>
                        <TableHead className="w-[10%] px-4 text-right pr-5">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPersonas.map((persona) => (
                        <TableRow key={persona.id}>
                          <TableCell className="w-[20%] px-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-400 transition-colors flex-shrink-0">
                                {persona.personalInfo.profilePicture && (
                                  <AvatarImage
                                    src={persona.personalInfo.profilePicture}
                                    alt={persona.personalInfo.fullName}
                                  />
                                )}
                                <AvatarFallback
                                  className={`bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8] font-semibold ${user?.role === 'admin'
                                    ? ''
                                    : 'bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8]'
                                    }`}
                                >
                                  {user?.role === 'admin' ? (
                                    <Crown className="h-5 w-5 text-[#EA580C]" />
                                  ) : persona.personalInfo.fullName ? (
                                    persona.personalInfo.fullName.charAt(0).toUpperCase()
                                  ) : (
                                    <UserCircle className="h-5 w-5 text-[#70E4A8]" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <div
                                  className="font-medium truncate cursor-help"
                                  title={persona.personalInfo.fullName}
                                >
                                  {persona.personalInfo.fullName}
                                </div>
                                <div
                                  className="text-sm text-gray-600 dark:text-gray-300 truncate cursor-help"
                                  title={persona.personalInfo.email}
                                >
                                  {persona.personalInfo.email}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="w-[15%] px-4">
                            <div
                              className="truncate cursor-help"
                              title={persona.personalInfo.jobTitle}
                            >
                              {persona.personalInfo.jobTitle}
                            </div>
                          </TableCell>
                          {/* <TableCell className="w-[12%] px-4">
                            <div 
                              className="truncate cursor-help" 
                              title={`${persona.experience.length} positions`}
                            >
                              {persona.experience.length} positions
                            </div>
                          </TableCell> */}
                          {/* <TableCell className="w-[20%] px-4">
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                              {(Array.isArray(persona.skills.technical)
                                ? persona.skills.technical.slice(0, 2)
                                : []
                              ).map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="text-xs truncate max-w-20"
                                  title={skill}
                                >
                                  {skill}
                                </Badge>
                              ))}
                              {Array.isArray(persona.skills.technical) &&
                                persona.skills.technical.length > 2 && (
                                  <Badge 
                                    variant="outline" 
                                    className="text-xs cursor-help"
                                    title={`Additional skills: ${persona.skills.technical.slice(2).join(', ')}`}
                                  >
                                    {'+'}{persona.skills.technical.length - 2}
                                  </Badge>
                                )}
                            </div>
                          </TableCell> */}
                          {/* <TableCell className="w-[12%] px-4">
                            <div 
                              className="truncate cursor-help" 
                              title={`${persona.education.length} degrees`}
                            >
                              {persona.education.length} degrees
                            </div>
                          </TableCell> */}
                          <TableCell className="w-[11%] px-4">
                            <div
                              className="truncate cursor-help text-sm"
                              title={new Date(persona.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            >
                              {new Date(persona.createdAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="w-[10%] px-4 text-right">
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                className="cursor-pointer h-8 w-8 p-0"
                                size="sm"
                                onClick={() => handleEdit(persona)}
                                title="Edit persona"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <ConfirmDialog
                                title="Delete Persona"
                                description={`Are you sure you want to delete the persona ${persona.personalInfo.fullName}? This action is irreversible and cannot be undone.`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => handleDelete(persona)}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 cursor-pointer h-8 w-8 p-0"
                                    title="Delete persona"
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
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card view - always show on mobile/tablet, conditionally on large screens */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${viewMode === "table" ? "lg:hidden" : ""}`}>
            {filteredPersonas.map((persona) => (
              <Card
                key={persona.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-400 transition-colors">
                        {persona.personalInfo.profilePicture && (
                          <AvatarImage
                            src={persona.personalInfo.profilePicture}
                            alt={persona.personalInfo.fullName}
                          />
                        )}
                        <AvatarFallback
                          className={`bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8] font-semibold ${user?.role === 'admin'
                            ? ''
                            : 'bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8]'
                            }`}
                        >
                          {user?.role === 'admin' ? (
                            <Crown className="h-5 w-5 text-[#EA580C]" />
                          ) : persona.personalInfo.fullName ? (
                            persona.personalInfo.fullName.charAt(0).toUpperCase()
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
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {persona.experience.length}
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
                            {'+'}{persona.skills.technical.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* <div>
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
                    </div> */}

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Last Modified:{" "}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(persona)}
                        className="bg-transparent p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <ConfirmDialog
                        title="Delete Persona"
                        description={`Are you sure you want to delete the persona ${persona.personalInfo.fullName}? This action is irreversible and cannot be undone.`}
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
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Empty State */}
      {filteredPersonas.length === 0 && personas.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-900 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No personas found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
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
            <div className="rounded-full bg-gray-100 dark:bg-gray-900 p-6 mb-4">
              <Sparkles className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No personas created yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first AI persona by clicking the "Create Persona"
              button above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="animate-slide-up-delay-3 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-rubik text-[#2D3639] dark:text-gray-100">
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
                <h4 className="font-semibold text-[#2D3639] dark:text-gray-100 font-rubik">
                  Complete Information
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-inter">
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
                <h4 className="font-semibold text-[#2D3639] dark:text-gray-100 font-rubik">
                  Detailed Experience
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-inter">
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
                className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] dark:text-gray-100 font-rubik">
                  Relevant Skills
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-inter">
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

export default CreatePersonaPage;
