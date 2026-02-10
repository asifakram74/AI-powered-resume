
import { useState, useEffect, useMemo } from "react"
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
  createJobApplication,
  type CreateJobApplicationPayload,
  type JobApplication,
  type Pipeline,
} from "../../lib/redux/service/jobTrackerService"
import type { CV } from "../../lib/redux/service/resumeService"

interface AddApplicationDialogProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  pipelines: Pipeline[]
  applications: JobApplication[]
  cvs: CV[]
  onSuccess: () => Promise<void>
}

function todayYMD() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

function nameEquals(p: Pipeline, name: string) {
  return (p.name || "").trim().toLowerCase() === name.toLowerCase()
}

export function AddApplicationDialog({
  isOpen,
  setIsOpen,
  pipelines,
  applications,
  cvs,
  onSuccess,
}: AddApplicationDialogProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [addCompany, setAddCompany] = useState("")
  const [addTitle, setAddTitle] = useState("")
  const [addDate, setAddDate] = useState(todayYMD())
  const [addPipelineId, setAddPipelineId] = useState<string>("")
  const [addCvId, setAddCvId] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)

  const wishlistPipelineId = useMemo(() => {
    const wishlist = pipelines.find((p) => nameEquals(p, "Wishlist"))
    return wishlist?.id ? String(wishlist.id) : ""
  }, [pipelines])

  useEffect(() => {
    if (isOpen) {
        // Reset form or set defaults when opened
        if (!addPipelineId && wishlistPipelineId) setAddPipelineId(wishlistPipelineId)
        if (!addCvId && cvs.length > 0) setAddCvId(String(cvs[0].id))
        if (!addDate) setAddDate(todayYMD())
    }
  }, [isOpen, wishlistPipelineId, cvs, addPipelineId, addCvId, addDate])

  const submitAddApplication = async () => {
    if (!addCompany.trim() || !addTitle.trim() || !addDate.trim() || !addPipelineId) {
      showErrorToast("Missing fields", "Please fill all fields")
      return
    }
    try {
      setIsAdding(true)
      
      const targetApps = applications.filter(a => String(a.pipeline_id) === addPipelineId)
      const maxPos = Math.max(0, ...targetApps.map(a => a.position ?? 0))
      
      const payload: CreateJobApplicationPayload = {
        company_name: addCompany.trim(),
        job_title: addTitle.trim(),
        application_date: addDate,
        pipeline_id: addPipelineId,
        position: maxPos + 60000,
      }
      if (addCvId) payload.cv_id = addCvId

      await createJobApplication(payload)
      showSuccessToast("Application created")
      setIsOpen(false)
      
      // Reset form
      setAddCompany("")
      setAddTitle("")
      setAddDate(todayYMD())
      
      await onSuccess()
    } catch (e: any) {
      showErrorToast("Failed to create application", e?.message || "Please try again")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[520px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
        <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
          <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
          <DialogTitle className="text-xl font-bold dark:text-gray-100">Add New Application</DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            Create a new application in any stage
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Company Name</Label>
            <Input
              value={addCompany}
              onChange={(e) => setAddCompany(e.target.value)}
              placeholder="e.g., Google, Microsoft, Apple"
              className="dark:bg-gray-900 dark:border-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Job Title</Label>
            <Input
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer, Product Manager"
              className="dark:bg-gray-900 dark:border-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Application Date</Label>
            <Input
              type="date"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
              className="dark:bg-gray-900 dark:border-gray-800"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-700 dark:text-gray-300">Pipeline Stage</Label>
            <UISelect value={addPipelineId} onValueChange={setAddPipelineId}>
              <SelectTrigger className="dark:bg-gray-900 dark:border-gray-800">
                <SelectValue placeholder="Select stage" />
              </SelectTrigger>
              <SelectContent className="dark:bg-[#0B0F1A] dark:border-gray-800">
                {pipelines.map((p) => (
                  <SelectItem key={String(p.id)} value={String(p.id)} className="dark:hover:bg-gray-900">
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
                addCvId
                  ? {
                    value: addCvId,
                    label: cvs.find((c) => c.id.toString() === addCvId)?.title || "Unknown CV",
                  }
                  : null
              }
              onChange={(option) => setAddCvId(option ? option.value : "")}
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
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isAdding}
            className="border-gray-300 dark:border-gray-700"
          >
            Cancel
          </Button>
          <Button
            className="resumaic-gradient-green text-white hover:opacity-90 button-press"
            onClick={submitAddApplication}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding…
              </>
            ) : (
              "Add Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
