import React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import {
  RotateCcw,
  Plus,
  GripVertical,
  ChevronDown,
  Trash2,
} from "lucide-react"
import type { CVSectionId, PersonalInfoFieldId } from "../../types/cv-data"

const SECTION_LABELS: Record<CVSectionId, string> = {
  personalInfo: "Personal Info",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  interests: "Interests",
}

const PERSONAL_INFO_FIELD_LABELS: Record<PersonalInfoFieldId, string> = {
  fullName: "Full Name",
  jobTitle: "Job Title",
  email: "Email",
  phone: "Phone",
  address: "Address",
  location: "City / Country",
  linkedin: "LinkedIn",
  github: "GitHub",
  summary: "Summary",
}

interface SettingsPanelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hiddenSections: CVSectionId[]
  setHiddenSections: (sections: CVSectionId[]) => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  resetAllSettings: () => void
  availableSectionIds: CVSectionId[]
  visibleSectionOrder: CVSectionId[]
  moveSection: (from: CVSectionId, to: CVSectionId) => void
  hideSection: (sectionId: CVSectionId) => void
  unhideSection: (sectionId: CVSectionId) => void
  isPersonalInfoOpen: boolean
  setIsPersonalInfoOpen: React.Dispatch<React.SetStateAction<boolean>>
  resetPersonalInfoOrder: () => void
  visiblePersonalInfoFieldOrder: PersonalInfoFieldId[]
  movePersonalInfoField: (
    from: PersonalInfoFieldId,
    to: PersonalInfoFieldId
  ) => void
}

export function SettingsPanelDialog({
  open,
  onOpenChange,
  hiddenSections,
  setHiddenSections,
  setHasUnsavedChanges,
  resetAllSettings,
  availableSectionIds,
  visibleSectionOrder,
  moveSection,
  hideSection,
  unhideSection,
  isPersonalInfoOpen,
  setIsPersonalInfoOpen,
  resetPersonalInfoOrder,
  visiblePersonalInfoFieldOrder,
  movePersonalInfoField,
}: SettingsPanelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-0 left-0 h-[100dvh] w-[90vw] sm:w-1/2 max-w-none translate-x-0 translate-y-0 p-0 gap-0 rounded-none border-none data-[state=closed]:-translate-x-full data-[state=open]:translate-x-0 transition-transform duration-300 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col h-full">
          <div className="px-6 py-5 bg-white/70 dark:bg-gray-950/70">
            <div className="flex items-start justify-between gap-4 pr-10">
              <div className="space-y-1">
                <DialogTitle className="text-xl font-bold">
                  Change Settings
                </DialogTitle>
              </div>
              <div className="flex items-center gap-2">
                {hiddenSections.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setHiddenSections([])
                      setHasUnsavedChanges(true)
                    }}
                    className="bg-transparent"
                  >
                    Restore All
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetAllSettings}
                  className="flex items-center gap-2 bg-transparent"
                >
                  <RotateCcw className="h-4 w-4" />
                  Default
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/60 dark:bg-gray-950/40">
            <div className="px-6 py-6">
              {availableSectionIds.length === 0 ? (
                <div className="rounded-2xl border bg-white/60 dark:bg-gray-950/60 p-6">
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    No sections to rearrange yet
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Add experience, education, or projects to enable section
                    ordering.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {hiddenSections.length > 0 && (
                    <div className="rounded-2xl border bg-white/70 dark:bg-gray-950/60 p-4">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          Hidden Sections
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setHiddenSections([])
                            setHasUnsavedChanges(true)
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                          Restore All
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {hiddenSections.map((id) => (
                          <div
                            key={id}
                            className="flex items-center justify-between rounded-xl border bg-white/80 dark:bg-gray-950/70 px-3 py-2"
                          >
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {SECTION_LABELS[id]}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => unhideSection(id)}
                              className="text-gray-600 dark:text-gray-300"
                              aria-label={`Restore ${SECTION_LABELS[id]}`}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    {visibleSectionOrder.map((sectionId) => (
                      <div
                        key={sectionId}
                        className="rounded-2xl border bg-white/80 dark:bg-gray-950/70 shadow-sm overflow-hidden"
                      >
                        <div
                          draggable={availableSectionIds.length > 1}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move"
                            e.dataTransfer.setData("text/plain", sectionId)
                          }}
                          onDragOver={(e) => {
                            e.preventDefault()
                            e.dataTransfer.dropEffect = "move"
                          }}
                          onDrop={(e) => {
                            e.preventDefault()
                            const from = e.dataTransfer.getData(
                              "text/plain"
                            ) as CVSectionId
                            if (from) moveSection(from, sectionId)
                          }}
                          className="group flex items-center justify-between px-4 py-2.5 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="shrink-0 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200 transition-colors">
                              <GripVertical className="h-4 w-4" />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (sectionId === "personalInfo")
                                  setIsPersonalInfoOpen((v) => !v)
                              }}
                              className="min-w-0 flex items-center gap-2 text-left"
                            >
                              <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {SECTION_LABELS[sectionId]}
                              </div>
                              {sectionId === "personalInfo" && (
                                <ChevronDown
                                  className={`h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform ${
                                    isPersonalInfoOpen ? "rotate-180" : ""
                                  }`}
                                />
                              )}
                            </button>
                          </div>
                          <div className="flex items-center gap-1">
                            {sectionId !== "personalInfo" && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => hideSection(sectionId)}
                                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                                aria-label={`Hide ${SECTION_LABELS[sectionId]}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                              Drag
                            </div>
                          </div>
                        </div>
                        {sectionId === "personalInfo" && isPersonalInfoOpen && (
                          <div className="border-t bg-gray-50/70 dark:bg-gray-950/40">
                            <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
                              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wide">
                                Personal Info Fields
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={resetPersonalInfoOrder}
                                className="text-gray-600 dark:text-gray-300"
                              >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                              </Button>
                            </div>
                            <div className="px-4 pb-4">
                              <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                                {visiblePersonalInfoFieldOrder.map(
                                  (fieldId) => (
                                    <div
                                      key={fieldId}
                                      draggable={
                                        visiblePersonalInfoFieldOrder.length > 1
                                      }
                                      onDragStart={(e) => {
                                        e.dataTransfer.effectAllowed = "move"
                                        e.dataTransfer.setData(
                                          "text/plain",
                                          fieldId
                                        )
                                      }}
                                      onDragOver={(e) => {
                                        e.preventDefault()
                                        e.dataTransfer.dropEffect = "move"
                                      }}
                                      onDrop={(e) => {
                                        e.preventDefault()
                                        const from = e.dataTransfer.getData(
                                          "text/plain"
                                        ) as PersonalInfoFieldId
                                        if (from)
                                          movePersonalInfoField(from, fieldId)
                                      }}
                                      className="group flex items-center justify-between rounded-xl border bg-white/80 dark:bg-gray-950/70 px-3 py-1.5"
                                    >
                                      <div className="flex items-center gap-2 min-w-0">
                                        <div className="shrink-0 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors">
                                          <GripVertical className="h-4 w-4" />
                                        </div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                          {PERSONAL_INFO_FIELD_LABELS[fieldId]}
                                        </div>
                                      </div>
                                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Drag
                                      </div>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
