import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog"
import CVTemplates from "../../pages/resume/ChooseResumeTemplte"

interface CVTemplate {
  id: string
  name: string
  description: string
  category: "modern" | "classic" | "creative" | "minimal"
}

interface TemplateSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTemplateSelect: (template: CVTemplate) => void
  selectedTemplateId: string
}

export function TemplateSelectorDialog({
  open,
  onOpenChange,
  onTemplateSelect,
  selectedTemplateId,
}: TemplateSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-[80vw] !max-w-none h-[90vh] flex flex-col p-4 sm:p-6">
        <DialogHeader className="flex flex-row items-center justify-between mb-2">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-lg sm:text-2xl font-bold">
              Choose a Template
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Select a template to update your resume layout.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          <CVTemplates
            onTemplateSelect={onTemplateSelect}
            selectedTemplate={selectedTemplateId}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
