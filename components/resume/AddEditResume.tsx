"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";
import type { CreateCVData, CV } from "@/lib/redux/service/cvService";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  getPersonas,
  type PersonaResponse,
} from "@/lib/redux/service/pasonaService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CVTemplates } from "./ChooseResumeTemplte";
import { useForm } from "react-hook-form";

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
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const data = await getPersonas(user.id.toString());
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
  }, [user?.id, personaId, editingCV?.personas_id]);

  const handleTemplateSelect = (template: { id: string; name: string }) => {
    setSelectedTemplate(template);
    setSelectedTemplateId(template.id);
    setValue("layout_id", template.id);
  };

  const handleFinalSubmit = async (templateId: string) => {
    setIsLoading(true);
    try {
      const formData = getValues();
      await onSave({
        ...formData,
        user_id: user?.id?.toString() || "",
        layout_id: templateId,
        personas_id: selectedPersonaId || formData.personas_id,
        job_description: formData.job_description || "",
      });
    } catch (error) {
      console.error("Error saving CV:", error);
      setApiError("Failed to save CV. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = () => {
    if (editingCV) {
      // Redirect to the CV client page with personaId and templateId
      router.push(
        `/create-cv?personaId=${editingCV.personas_id}&templateId=${editingCV.layout_id}`
      );
    } else {
      const formData = getValues();
      setFormData({
        ...formData,
        job_description: formData.job_description || "",
      });
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
        <DialogContent className="w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto w-[70vw] ">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">
              Choose a Template
            </DialogTitle>
            <p className="text-sm text-gray-500 mb-6">
              Select a template for your CV. You can preview each template
              before making your selection.
            </p>
          </DialogHeader>
          <CVTemplates
            onTemplateSelect={handleTemplateSelect}
            selectedTemplate={selectedTemplate?.id || ""}
          />
          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTemplateSelector(false)}
            >
              Cancel
            </Button>

            <div className="flex gap-2">
              {selectedTemplate && selectedPersonaId && (
                <Button
                  onClick={() => {
                    router.push(
                      `/create-cv?personaId=${selectedPersonaId}&templateId=${selectedTemplate.id}`
                    );
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Create AI CV
                </Button>
              )}
            </div>
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
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                Template:{" "}
                {selectedTemplate?.name || selectedTemplateId || "Not selected"}
              </Badge>
            </div>
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
                  value={currentPersonaId || selectedPersonaId}
                  onValueChange={(value) => {
                    setSelectedPersonaId(value);
                    setValue("personas_id", value);
                  }}
                  disabled={!!personaId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedPersona?.full_name || "Select a persona"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading ? (
                      <div className="p-2 text-center text-sm text-gray-500">
                        Loading...
                      </div>
                    ) : personas.length > 0 ? (
                      personas.map((persona) => (
                        <SelectItem
                          key={persona.id}
                          value={persona.id.toString()}
                        >
                          <div className="flex items-center gap-2">
                            {persona.full_name}
                            <Badge variant="outline" className="text-xs">
                              {persona.job_title}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-gray-500">
                        No personas found
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {errors.personas_id && (
                  <p className="text-sm text-red-600">
                    {errors.personas_id.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="job_description">Job Description</Label>
              <Textarea
                id="job_description"
                {...register("job_description")}
                placeholder="Enter the job description..."
                className="min-h-[200px]"
                rows={10}
              />
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
            className="bg-gradient-to-r from-blue-600 to-purple-600 cursor-pointer"
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