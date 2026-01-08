"use client";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useRouter } from "next/navigation";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner"
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import Select from 'react-select';
import { Badge } from "../../components/ui/badge";
import { Save } from "lucide-react";
import type { CreateCVData, CV } from "../../lib/redux/service/resumeService";
import { useAppSelector } from "../../lib/redux/hooks";
import {
  getAllPersonas,
  getPersonas,
  type PersonaResponse,
} from "../../lib/redux/service/pasonaService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import { CVTemplates } from "./ChooseResumeTemplte";
import { useForm } from "react-hook-form";

interface CVTemplate {
  id: string;
  name: string;
  description: string;
  category: "modern" | "classic" | "creative" | "minimal";
}

interface CVWizardProps {
  editingCV?: CV | null;
  onSave: (data: CreateCVData) => Promise<void>;
  onCancel: () => void;
  personaId?: string;
}

export function CVWizard({
  editingCV,
  onSave,
  onCancel,
  personaId,
}: CVWizardProps) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [formData, setFormData] = useState<CreateCVData | null>(null);
  const [personas, setPersonas] = useState<PersonaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>(
    personaId || editingCV?.personas_id || ""
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    editingCV?.layout_id || ""
  );
  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: string;
    name: string;
  } | null>(
    editingCV?.layout_id
      ? { id: editingCV.layout_id, name: editingCV.layout_id }
      : null
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<CreateCVData>({
    defaultValues: {
      user_id: user?.id?.toString() || "",
      layout_id: selectedTemplateId,
      personas_id: personaId || editingCV?.personas_id || "",
      title: editingCV?.title || "",
      job_description: editingCV?.job_description || "",
    },
  });

  const currentPersonaId = watch("personas_id");

  useEffect(() => {
    const loadPersonas = async () => {
      // For admin users, we don't need user.id to fetch all personas
      if (!user?.id && user?.role?.toLowerCase() !== 'admin') return;

      setIsLoading(true);
      try {
        let data;

        // Conditionally call different APIs based on user role
        if (user?.role?.toLowerCase() === 'admin') {
          data = await getAllPersonas(); // API for admin users
        } else {
          data = await getPersonas(user.id.toString()); // API for regular users
        }

        console.log("Fetched personas:", data);
        setPersonas(data);
        setApiError(null);

        if (personaId || editingCV?.personas_id) {
          const personaExists = data.some(
            (p) => p.id.toString() === (personaId || editingCV?.personas_id)
          );
          if (!personaExists) {
            console.warn("Specified persona not found in fetched list");
          }
        }
      } catch (error) {
        console.error("Error loading personas:", error);
        setApiError("Failed to load personas. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPersonas();
  }, [user?.id, user?.role, personaId, editingCV?.personas_id]);

  const handleTemplateSelect = (template: CVTemplate) => {
    setSelectedTemplate(template);
    setSelectedTemplateId(template.id);
    setValue("layout_id", template.id);
  };

  const handleFinalSubmit = async (templateId: string) => {
    setIsLoading(true);
    try {
      const formData = getValues();
      const dataToPass = {
        ...formData,
        user_id: user?.id?.toString() || "",
        layout_id: templateId,
        personas_id: selectedPersonaId || formData.personas_id,
        job_description: formData.job_description || "",
        // Pass the entire persona object if available
        persona: selectedPersonaId ? personas.find(p => p.id.toString() === selectedPersonaId) : null
      };

      // Save form data to sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("cv_form_data", JSON.stringify(dataToPass));
      }

      // Navigate to CV page
      router.push(
        `/create-cv?templateId=${templateId}`
      );
    } catch (error) {
      console.error("Error saving CV:", error);
      setApiError("Failed to save CV. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = () => {
    if (editingCV) {
      router.push(
        `/create-cv?personaId=${editingCV.personas_id}&templateId=${editingCV.layout_id}`
      );
    } else {
      const formData = getValues();
      setFormData({
        ...formData,
        job_description: formData.job_description || "",
      });
      console.log(formData)
      setShowTemplateSelector(true);
    }
  };

  const selectedPersona = personas.find(
    (p) => p.id.toString() === (currentPersonaId || selectedPersonaId)
  );

  return (
    <div className="space-y-6 overflow-x-auto">
      <Dialog
        open={showTemplateSelector}
        onOpenChange={setShowTemplateSelector}
      >
        <DialogContent className="w-[80vw] !max-w-none h-[90vh] flex flex-col">
          <DialogHeader className="px-6   flex flex-row items-center justify-between">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-2xl font-bold">
                Choose a Template
              </DialogTitle>
              <DialogDescription>
                Select a template to get started with your resume.
              </DialogDescription>
            </div>
            {selectedTemplate && selectedPersonaId && (
              <Button
                onClick={() => {
                  const currentValues = getValues();
                  const dataToPass = {
                    ...currentValues,
                    user_id: user?.id?.toString() || "",
                    layout_id: selectedTemplate.id,
                    personas_id: selectedPersonaId || currentValues.personas_id,
                    job_description: currentValues.job_description || "",
                    persona: selectedPersonaId ? personas.find(p => p.id.toString() === selectedPersonaId) : null
                  };

                  if (typeof window !== "undefined") {
                    sessionStorage.setItem("cv_form_data", JSON.stringify(dataToPass));
                  }

                  router.push(
                    `/create-cv?templateId=${selectedTemplate.id}`
                  );
                }}
                className="resumaic-gradient-green hover:opacity-90 button-press"
              >
                Create CV
              </Button>
            )}
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0 -mx-3 px-6">
            <CVTemplates
              onTemplateSelect={handleTemplateSelect}
              selectedTemplate={selectedTemplate?.id || ""}
            />
          </div>
        </DialogContent>
      </Dialog>
      {apiError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {apiError}
        </div>
      )}
      <form onSubmit={handleSubmit(() => onSubmit())}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">CV Details</CardTitle>
            {/* <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                Template:{" "}
                {selectedTemplate?.name || selectedTemplateId || "Not selected"}
              </Badge>
            </div> */}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="title">CV Title *</Label>
                <Input
                  id="title"
                  {...register("title", { required: "CV title is required" })}
                  placeholder="e.g., Software Engineer Resume"
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2 flex-1">
                <Label>Select Persona</Label>

                <Select
                  options={personas.map((p) => ({
                    value: p.id.toString(),
                    label: `${p.full_name} (${p.job_title})`,
                  }))}
                  value={
                    personas
                      .map((p) => ({
                        value: p.id.toString(),
                        label: `${p.full_name} (${p.job_title})`,
                      }))
                      .find(
                        (option) =>
                          option.value === (currentPersonaId || selectedPersonaId)
                      ) || null
                  }
                  onChange={(option) => {
                    if (option) {
                      setSelectedPersonaId(option.value);
                      setValue("personas_id", option.value);
                    }
                  }}
                  isDisabled={!!personaId}
                  isLoading={isLoading}
                  isSearchable
                  placeholder="Search or select persona..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 40,
                      borderRadius: 6,
                      borderColor: "#d1d5db",
                      paddingLeft: 4,
                      paddingRight: 4,
                    }),
                    menu: (base) => ({
                      ...base,
                      borderRadius: 6,
                      marginTop: 4,
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected
                        ? "#eff6ff"
                        : state.isFocused
                          ? "#f3f4f6"
                          : "white",
                      color: "#1f2937",
                    }),
                  }}
                />

                {errors.personas_id && (
                  <p className="text-sm text-red-600">
                    {errors.personas_id.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_description">Job Description *</Label>
              <Textarea
                id="job_description"
                {...register("job_description", {
                  required: "Job description is required",
                  validate: (value) => {
                    // Trim spaces
                    const input = value.trim();

                    // Minimum length check
                    if (input.length < 30) {
                      return "Job description must be at least 30 characters long.";
                    }

                    // Word count check
                    if (input.split(/\s+/).length < 3) {
                      return "Please provide a more detailed job description (at least 3 words).";
                    }

                    // Regex: reject ONLY numbers or ONLY special chars
                    const onlyNumbers = /^[0-9\s]+$/.test(input);
                    const onlySymbols = /^[^a-zA-Z0-9]+$/.test(input);
                    if (onlyNumbers || onlySymbols) {
                      return "Invalid job description. Please provide meaningful text.";
                    }

                    return true; // ✅ valid input
                  },
                })}
                placeholder="Enter the job description..."
                className="min-h-[200px]"
                rows={10}
              />
              {errors.job_description && (
                <p className="text-sm text-red-600">
                  {errors.job_description.message}
                </p>
              )}
            </div>

          </CardContent>
        </Card>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="resumaic-gradient-green hover:opacity-90  button-press"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {editingCV ? "Edit CV" : "Create CV"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default CVWizard
