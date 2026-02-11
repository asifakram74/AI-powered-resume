
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Input } from "../../components/ui/input"
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import Select from "react-select"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { showErrorToast, showSuccessToast } from "../../components/ui/toast"
import {
  updateJobApplication,
  type JobApplication,
  type Pipeline,
} from "../../lib/redux/service/jobTrackerService"
import type { CV } from "../../lib/redux/service/resumeService"

interface EditApplicationDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  application: JobApplication | null
  pipelines: Pipeline[]
  cvs: CV[]
  onSuccess: (updatedApp: JobApplication) => Promise<void>
}

function todayYMD() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

export function EditApplicationDialog({
  isOpen,
  setIsOpen,
  application,
  pipelines,
  cvs,
  onSuccess,
}: EditApplicationDialogProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [editCompany, setEditCompany] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editDate, setEditDate] = useState(todayYMD())
  const [editPipelineId, setEditPipelineId] = useState<string>("")
  const [editCvId, setEditCvId] = useState<string>("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  useEffect(() => {
    if (application) {
      setEditCompany(application.company_name || "")
      setEditTitle(application.job_title || "")
      setEditDate(application.application_date || todayYMD())
      setEditPipelineId(String(application.pipeline_id))
      setEditCvId(String(application.cv_id))
    }
  }, [application])

  const submitEditApplication = async () => {
    if (!application) return
    if (!editCompany.trim() || !editTitle.trim() || !editDate.trim() || !editPipelineId || !editCvId) {
      showErrorToast("Missing fields", "Please fill all fields")
      return
    }

    try {
      setIsSavingEdit(true)
      const updatedApp = {
        ...application,
        company_name: editCompany.trim(),
        job_title: editTitle.trim(),
        application_date: editDate,
        pipeline_id: editPipelineId,
        cv_id: editCvId,
      }

      await updateJobApplication(String(application.id), {
        company_name: editCompany.trim(),
        job_title: editTitle.trim(),
        application_date: editDate,
        pipeline_id: editPipelineId,
        cv_id: editCvId,
      })

      showSuccessToast("Application updated")
      setIsOpen(false)
      await onSuccess(updatedApp as JobApplication)
    } catch (e: any) {
      showErrorToast("Failed to update application", e?.message || "Please try again")
    } finally {
      setIsSavingEdit(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[520px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
        <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
          <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
          <DialogTitle className="text-xl font-bold dark:text-gray-100">Update Application</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Edit application details or move to a different stage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Company Name</Label>
            <Input value={editCompany} onChange={(e) => setEditCompany(e.target.value)} placeholder="e.g., Google" className="dark:bg-gray-900 dark:border-gray-800" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Job Title</Label>
            <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="e.g., Senior Engineer" className="dark:bg-gray-900 dark:border-gray-800" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Application Date</Label>
            <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} className="dark:bg-gray-900 dark:border-gray-800" />
          </div>
          <div className="space-y-2 w-full">
            <Label className="text-gray-700 dark:text-gray-300">
              Pipeline Stage
            </Label>

            <UISelect value={editPipelineId} onValueChange={setEditPipelineId}>
              <SelectTrigger
                style={{ width: "100%" }}
                className="dark:bg-gray-900 dark:border-gray-800"
              >
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>

              <SelectContent
                className="dark:bg-[#0B0F1A] dark:border-gray-800 min-w-[var(--radix-select-trigger-width)]"
              >
                {pipelines.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </UISelect>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Attached CV</Label>
            <Select
              value={
                editCvId
                  ? {
                    value: editCvId,
                    label: cvs.find((c) => c.id.toString() === editCvId)?.title || "Unknown CV",
                  }
                  : null
              }
              onChange={(option) => setEditCvId(option ? option.value : "")}
              options={cvs.map((cv) => ({
                value: String(cv.id),
                label: cv.title || `CV ${cv.id}`,
              }))}
              placeholder="Select CV"
              isClearable={false}
              isDisabled={cvs.length === 0}
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: 40,
                  borderRadius: 6,
                  borderColor: isDark ? "#374151" : "#d1d5db",
                  backgroundColor: isDark ? "#0b1220" : "white",
                  boxShadow: state.isFocused
                    ? isDark
                      ? "0 0 0 1px rgba(112, 228, 168, 0.6)"
                      : base.boxShadow
                    : base.boxShadow,
                  paddingLeft: 4,
                  paddingRight: 4,
                }),
                menu: (base) => ({
                  ...base,
                  borderRadius: 6,
                  marginTop: 4,
                  border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                  backgroundColor: isDark ? "#0b1220" : "white",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected
                    ? isDark
                      ? "rgba(112, 228, 168, 0.25)"
                      : "#eff6ff"
                    : state.isFocused
                      ? isDark
                        ? "#111827"
                        : "#f3f4f6"
                      : isDark
                        ? "#0b1220"
                        : "white",
                  color: isDark ? "#e5e7eb" : "#1f2937",
                }),
                singleValue: (base) => ({
                  ...base,
                  color: isDark ? "#e5e7eb" : "#111827",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: isDark ? "#9ca3af" : "#6b7280",
                }),
                input: (base) => ({
                  ...base,
                  color: isDark ? "#e5e7eb" : "#111827",
                }),
              }}
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSavingEdit} className="border-gray-300 dark:border-gray-700">
            Cancel
          </Button>
          <Button
            className="resumaic-gradient-green text-white hover:opacity-90 button-press"
            onClick={submitEditApplication}
            disabled={isSavingEdit}
          >
            {isSavingEdit ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
