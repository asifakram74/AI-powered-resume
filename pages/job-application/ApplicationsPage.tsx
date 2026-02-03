"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useAppSelector } from "../../lib/redux/hooks"
import type { RootState } from "../../lib/redux/store"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Select as UISelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import Select from "react-select"
import { useTheme } from "next-themes"
import { showErrorToast, showSuccessToast } from "../../components/ui/toast"
import { getCVs, type CV } from "../../lib/redux/service/resumeService"
import {
  createJobApplication,
  createPipeline,
  deleteJobApplication,
  deletePipeline,
  listJobApplications,
  listPipelines,
  updatePipeline,
  updateJobApplication,
  reorderPipelines,
  type CreateJobApplicationPayload,
  type JobApplication,
  type Pipeline,
} from "../../lib/redux/service/jobTrackerService"
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  Target,
  Award,
  Users,
  Briefcase,
  Calendar,
  Building,
  FileText,
  ChevronRight,
  MoveRight,
  CheckCircle,
  XCircle,
  GripVertical,
  Move
} from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"

const pipelinePalette = [
  "#70E4A8", // Green
  "#EA580C", // Orange
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#10B981", // Emerald
  "#6366F1", // Indigo
]

function todayYMD() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

function normalizePipelineColor(p: Pipeline, index: number) {
  const c = (p as any)?.color
  if (typeof c === "string" && c.trim()) return c.trim()
  return pipelinePalette[index % pipelinePalette.length]
}

function nameEquals(p: Pipeline, name: string) {
  return (p.name || "").trim().toLowerCase() === name.toLowerCase()
}

export default function ApplicationsPage() {
  const { user, profile } = useAppSelector((state: RootState) => state.auth)
  const userId = user?.id
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [cvs, setCvs] = useState<CV[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [dragOverPipelineId, setDragOverPipelineId] = useState<string | null>(null)
  const [orderByPipeline, setOrderByPipeline] = useState<Record<string, string[]>>({})
  const [dragOverApplicationId, setDragOverApplicationId] = useState<string | null>(null)
  const [draggingPipelineId, setDraggingPipelineId] = useState<string | null>(null)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addCompany, setAddCompany] = useState("")
  const [addTitle, setAddTitle] = useState("")
  const [addDate, setAddDate] = useState(todayYMD())
  const [addPipelineId, setAddPipelineId] = useState<string>("")
  const [addCvId, setAddCvId] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)

  const [isCreatePipelineOpen, setIsCreatePipelineOpen] = useState(false)
  const [newPipelineName, setNewPipelineName] = useState("")
  const [newPipelineColor, setNewPipelineColor] = useState(pipelinePalette[0])
  const [isCreatingPipeline, setIsCreatingPipeline] = useState(false)

  const [isEditApplicationOpen, setIsEditApplicationOpen] = useState(false)
  const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null)
  const [editCompany, setEditCompany] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [editDate, setEditDate] = useState(todayYMD())
  const [editPipelineId, setEditPipelineId] = useState<string>("")
  const [editCvId, setEditCvId] = useState<string>("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  const [isDeleteApplicationOpen, setIsDeleteApplicationOpen] = useState(false)
  const [deletingApplicationId, setDeletingApplicationId] = useState<string | null>(null)
  const [isDeletingApplication, setIsDeletingApplication] = useState(false)

  const [isEditPipelineOpen, setIsEditPipelineOpen] = useState(false)
  const [editingPipelineId, setEditingPipelineId] = useState<string | null>(null)
  const [editPipelineName, setEditPipelineName] = useState("")
  const [editPipelineColor, setEditPipelineColor] = useState(pipelinePalette[0])
  const [isSavingPipeline, setIsSavingPipeline] = useState(false)

  const [isDeletePipelineOpen, setIsDeletePipelineOpen] = useState(false)
  const [deletingPipelineId, setDeletingPipelineId] = useState<string | null>(null)
  const [isDeletingPipeline, setIsDeletingPipeline] = useState(false)

  const [isMovePipelineDialogOpen, setIsMovePipelineDialogOpen] = useState(false)
  const [movingPipelineId, setMovingPipelineId] = useState<string | null>(null) // For internal list drag state

  const wishlistPipelineId = useMemo(() => {
    const wishlist = pipelines.find((p) => nameEquals(p, "Wishlist"))
    return wishlist?.id ? String(wishlist.id) : ""
  }, [pipelines])

  useEffect(() => {
    if (!addPipelineId && wishlistPipelineId) setAddPipelineId(wishlistPipelineId)
  }, [addPipelineId, wishlistPipelineId])

  useEffect(() => {
    if (!addCvId && cvs.length > 0) setAddCvId(String(cvs[0].id))
  }, [addCvId, cvs])

  const refreshAll = useCallback(async () => {
    try {
      setIsLoading(true)
      const [pipelinesRes, applicationsRes, cvsRes] = await Promise.all([
        listPipelines().catch(() => [] as Pipeline[]),
        listJobApplications().catch(() => [] as JobApplication[]),
        userId ? getCVs(String(userId)).catch(() => [] as CV[]) : (Promise.resolve([]) as Promise<CV[]>),
      ])
      
      // Sort pipelines by position
      const sortedPipelines = pipelinesRes.sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      setPipelines(sortedPipelines)
      
      setApplications(applicationsRes)
      setCvs(cvsRes)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  useEffect(() => {
    const next: Record<string, string[]> = {}
    for (const pipeline of pipelines) {
      const pid = String(pipeline.id)
      const currentApps = applications
        .filter((a) => String(a.pipeline_id) === pid)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      next[pid] = currentApps.map((a) => String(a.id))
    }
    setOrderByPipeline(next)
  }, [applications, pipelines])

  const stats = useMemo(() => {
    const total = applications.length
    const wishlist = pipelines.find((p) => nameEquals(p, "Wishlist"))
    const applied = pipelines.find((p) => nameEquals(p, "Applied"))
    const interview = pipelines.find((p) => nameEquals(p, "Interview"))
    const offer = pipelines.find((p) => nameEquals(p, "Offer"))
    const rejected = pipelines.find((p) => nameEquals(p, "Rejected"))

    const countByPipeline = (pipeline?: Pipeline) => {
      if (!pipeline?.id) return 0
      return applications.filter((a) => String(a.pipeline_id) === String(pipeline.id)).length
    }

    return {
      total,
      wishlist: countByPipeline(wishlist),
      applied: countByPipeline(applied),
      interview: countByPipeline(interview),
      offer: countByPipeline(offer),
      rejected: countByPipeline(rejected),
    }
  }, [applications, pipelines])

  const appById = useMemo(() => {
    const map = new Map<string, JobApplication>()
    for (const a of applications) map.set(String(a.id), a)
    return map
  }, [applications])

  const getOrderedApps = useCallback(
    (pipelineId: string) => {
      const ids = orderByPipeline[pipelineId] || []
      return ids.map((id) => appById.get(id)).filter(Boolean) as JobApplication[]
    },
    [appById, orderByPipeline],
  )

  const movePipeline = useCallback((fromPipelineId: string, toPipelineId: string | null) => {
    setPipelines((prev) => {
      const fromId = String(fromPipelineId)
      const toId = toPipelineId ? String(toPipelineId) : null
      const fromIndex = prev.findIndex((p) => String(p.id) === fromId)
      if (fromIndex < 0) return prev

      const next = prev.slice()
      const [moved] = next.splice(fromIndex, 1)

      let targetIndex = next.length
      if (toId) {
        const toIndex = next.findIndex((p) => String(p.id) === toId)
        if (toIndex >= 0) {
          targetIndex = toIndex
        }
      }

      next.splice(targetIndex, 0, moved)

      // Recalculate positions for all pipelines
      const reordered = next.map((p, index) => ({
        ...p,
        position: index + 1,
      }))

      // Update backend with new order
      const updatePayload = reordered.map(p => ({
        id: p.id,
        position: p.position!
      }))
      
      reorderPipelines(updatePayload).catch(console.error)

      return reordered
    })
  }, [])

  const moveInOrder = useCallback(
    async (payload: any, toPipelineId: string, beforeId?: string | null) => {
      const appId = payload?.id !== undefined && payload?.id !== null ? String(payload.id) : null
      if (!appId) return

      const current = appById.get(appId)
      const fromPipelineId = current ? String(current.pipeline_id) : String(payload?.fromPipelineId || "")
      if (!fromPipelineId) return

      const targetPid = String(toPipelineId)
      
      // Calculate new position using orderByPipeline to find neighbors
      const targetIds = orderByPipeline[targetPid] || []
      const filteredIds = targetIds.filter(id => id !== appId)
      
      let insertIndex = filteredIds.length
      if (beforeId) {
        const idx = filteredIds.indexOf(String(beforeId))
        if (idx >= 0) insertIndex = idx
      }

      // We still use floating point for apps unless backend changes for apps too.
      // Assuming backend ONLY changed for pipelines as per user input.
      const prevId = insertIndex > 0 ? filteredIds[insertIndex - 1] : null
      const nextId = insertIndex < filteredIds.length ? filteredIds[insertIndex] : null
      
      const prevApp = prevId ? appById.get(prevId) : null
      const nextApp = nextId ? appById.get(nextId) : null
      
      const p1 = prevApp?.position ?? 0
      const p2 = nextApp?.position ?? (p1 + 60000)
      const newPos = (p1 + p2) / 2

      // Update local state
      setApplications((all) => all.map((a) => (String(a.id) === appId ? { ...a, pipeline_id: targetPid, position: newPos } : a)))

      try {
        await updateJobApplication(appId, { pipeline_id: targetPid, position: newPos })
        showSuccessToast("Application updated", "Moved to new stage")
      } catch (e: any) {
        showErrorToast("Failed to move application", e?.message || "Please try again")
        await refreshAll()
      }
    },
    [appById, refreshAll, orderByPipeline],
  )

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
      setIsAddOpen(false)
      setAddCompany("")
      setAddTitle("")
      setAddDate(todayYMD())
      await refreshAll()
    } catch (e: any) {
      showErrorToast("Failed to create application", e?.message || "Please try again")
    } finally {
      setIsAdding(false)
    }
  }

  const submitCreatePipeline = async () => {
    if (!newPipelineName.trim()) {
      showErrorToast("Pipeline name required")
      return
    }
    try {
      setIsCreatingPipeline(true)
      
      const maxPos = Math.max(0, ...pipelines.map(p => p.position ?? 0))
      
      await createPipeline({ 
        name: newPipelineName.trim(), 
        color: newPipelineColor,
        // Backend auto-assigns position, but we send something just in case, 
        // though typically we should reload or let backend handle it.
        // Actually the backend guide says: "Backend automatically appends it to the end of the list."
      })
      showSuccessToast("Pipeline created")
      setIsCreatePipelineOpen(false)
      setNewPipelineName("")
      setNewPipelineColor(pipelinePalette[0])
      await refreshAll()
    } catch (e: any) {
      showErrorToast("Failed to create pipeline", e?.message || "Please try again")
    } finally {
      setIsCreatingPipeline(false)
    }
  }

  const createDefaultPipelines = async () => {
    try {
      setIsCreatingPipeline(true)
      const defaults = [
        { name: "Wishlist", color: pipelinePalette[0] },
        { name: "Applied", color: pipelinePalette[1] },
        { name: "Interview", color: pipelinePalette[2] },
        { name: "Offer", color: pipelinePalette[3] },
        { name: "Rejected", color: pipelinePalette[4] },
      ]
      for (let i = 0; i < defaults.length; i++) {
        const p = defaults[i]
        const exists = pipelines.some((x) => nameEquals(x, p.name))
        // We let backend handle positions for new default pipelines
        if (!exists) await createPipeline({ ...p })
      }
      showSuccessToast("Pipelines created")
      await refreshAll()
    } catch (e: any) {
      showErrorToast("Failed to create default pipelines", e?.message || "Please try again")
    } finally {
      setIsCreatingPipeline(false)
    }
  }

  const openEditApplication = (app: JobApplication) => {
    setEditingApplicationId(String(app.id))
    setEditCompany(app.company_name || "")
    setEditTitle(app.job_title || "")
    setEditDate(app.application_date || todayYMD())
    setEditPipelineId(String(app.pipeline_id))
    setEditCvId(String(app.cv_id))
    setIsEditApplicationOpen(true)
  }

  const submitEditApplication = async () => {
    if (!editingApplicationId) return
    if (!editCompany.trim() || !editTitle.trim() || !editDate.trim() || !editPipelineId || !editCvId) {
      showErrorToast("Missing fields", "Please fill all fields")
      return
    }
    const previous = appById.get(String(editingApplicationId))
    const prevPipelineId = previous ? String(previous.pipeline_id) : null
    try {
      setIsSavingEdit(true)
      await updateJobApplication(editingApplicationId, {
        company_name: editCompany.trim(),
        job_title: editTitle.trim(),
        application_date: editDate,
        pipeline_id: editPipelineId,
        cv_id: editCvId,
      })

      setApplications((all) =>
        all.map((a) =>
          String(a.id) === String(editingApplicationId)
            ? {
              ...a,
              company_name: editCompany.trim(),
              job_title: editTitle.trim(),
              application_date: editDate,
              pipeline_id: editPipelineId,
              cv_id: editCvId,
            }
            : a,
        ),
      )

      if (prevPipelineId && prevPipelineId !== String(editPipelineId)) {
        setOrderByPipeline((prev) => {
          const next: Record<string, string[]> = { ...prev }
          const fromArr = (next[prevPipelineId] || []).filter((id) => id !== String(editingApplicationId))
          const toArr = (next[String(editPipelineId)] || []).filter((id) => id !== String(editingApplicationId))
          next[prevPipelineId] = fromArr
          next[String(editPipelineId)] = [...toArr, String(editingApplicationId)]
          return next
        })
      }

      showSuccessToast("Application updated")
      setIsEditApplicationOpen(false)
    } catch (e: any) {
      showErrorToast("Failed to update application", e?.message || "Please try again")
      await refreshAll()
    } finally {
      setIsSavingEdit(false)
    }
  }

  const openDeleteApplication = (appId: string) => {
    setDeletingApplicationId(appId)
    setIsDeleteApplicationOpen(true)
  }

  const confirmDeleteApplication = async () => {
    if (!deletingApplicationId) return
    const appId = String(deletingApplicationId)
    const previous = appById.get(appId)
    try {
      setIsDeletingApplication(true)
      setApplications((all) => all.filter((a) => String(a.id) !== appId))
      setOrderByPipeline((prev) => {
        const next: Record<string, string[]> = { ...prev }
        for (const k of Object.keys(next)) {
          next[k] = (next[k] || []).filter((id) => id !== appId)
        }
        return next
      })
      await deleteJobApplication(appId)
      showSuccessToast("Application deleted")
      setIsDeleteApplicationOpen(false)
      setDeletingApplicationId(null)
    } catch (e: any) {
      showErrorToast("Failed to delete application", e?.message || "Please try again")
      if (previous) await refreshAll()
    } finally {
      setIsDeletingApplication(false)
    }
  }

  const openEditPipeline = (pipeline: Pipeline, fallbackColor: string) => {
    setEditingPipelineId(String(pipeline.id))
    setEditPipelineName(pipeline.name || "")
    setEditPipelineColor((pipeline as any)?.color || fallbackColor)
    setIsEditPipelineOpen(true)
  }

  const submitEditPipeline = async () => {
    if (!editingPipelineId) return
    if (!editPipelineName.trim()) {
      showErrorToast("Pipeline name required")
      return
    }
    try {
      setIsSavingPipeline(true)
      await updatePipeline(editingPipelineId, { name: editPipelineName.trim(), color: editPipelineColor })
      setPipelines((all) =>
        all.map((p) =>
          String(p.id) === String(editingPipelineId)
            ? ({ ...p, name: editPipelineName.trim(), color: editPipelineColor } as any)
            : p,
        ),
      )
      showSuccessToast("Pipeline updated")
      setIsEditPipelineOpen(false)
    } catch (e: any) {
      showErrorToast("Failed to update pipeline", e?.message || "Please try again")
      await refreshAll()
    } finally {
      setIsSavingPipeline(false)
    }
  }

  const openDeletePipeline = (pipelineId: string) => {
    setDeletingPipelineId(pipelineId)
    setIsDeletePipelineOpen(true)
  }

  const confirmDeletePipeline = async () => {
    if (!deletingPipelineId) return
    const pid = String(deletingPipelineId)
    try {
      setIsDeletingPipeline(true)
      await deletePipeline(pid)
      setPipelines((all) => all.filter((p) => String(p.id) !== pid))
      setApplications((all) => all.filter((a) => String(a.pipeline_id) !== pid))
      setOrderByPipeline((prev) => {
        const next: Record<string, string[]> = { ...prev }
        delete next[pid]
        return next
      })
      showSuccessToast("Pipeline deleted")
      setIsDeletePipelineOpen(false)
      setDeletingPipelineId(null)
    } catch (e: any) {
      showErrorToast("Failed to delete pipeline", e?.message || "Please try again")
      await refreshAll()
    } finally {
      setIsDeletingPipeline(false)
    }
  }

  const getCompanyInitials = (company: string) => {
    return company
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-4 text-center sm:text-left">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl resumaic-gradient-green text-white shadow-lg shadow-[#70E4A8]/25 mb-3 sm:mb-0 transition-transform hover:scale-105 duration-300">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Application Tracker
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-md mx-auto sm:mx-0">
              Track and manage all your job applications
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center w-full sm:w-auto">
          {pipelines.length === 0 ? (
            <Button
              className="resumaic-gradient-green text-white hover:opacity-90 button-press shadow-md shadow-[#70E4A8]/20 w-full sm:w-auto"
              onClick={createDefaultPipelines}
              disabled={isCreatingPipeline}
            >
              {isCreatingPipeline ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Default Stages"
              )}
            </Button>
          ) : null}

          <Button
            className="resumaic-gradient-green text-white hover:opacity-90 button-press shadow-md shadow-[#70E4A8]/20 w-full sm:w-auto"
            onClick={() => setIsAddOpen(true)}
            disabled={pipelines.length === 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Application
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#70E4A8]/25 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Applications</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.total}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#70E4A8]/10">
                <Briefcase className="h-5 w-5 text-[#70E4A8]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#3B82F6]/25 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Applied</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.applied}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#3B82F6]/10">
                <CheckCircle className="h-5 w-5 text-[#3B82F6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#8B5CF6]/25 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Interviews</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.interview}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#8B5CF6]/10">
                <Users className="h-5 w-5 text-[#8B5CF6]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-[#10B981]/25 hover:shadow-lg transition-shadow duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Offers</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stats.offer}</div>
              </div>
              <div className="p-2 rounded-lg bg-[#10B981]/10">
                <Award className="h-5 w-5 text-[#10B981]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      {pipelines.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-900 p-6 mb-4">
              <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No pipelines yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Create pipelines to start tracking your job applications
            </p>
            <Button
              className="resumaic-gradient-green text-white hover:opacity-90 button-press shadow-md shadow-[#70E4A8]/20"
              onClick={createDefaultPipelines}
              disabled={isCreatingPipeline}
            >
              {isCreatingPipeline ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Default Stages"
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Application Pipeline
            </h2>
            <Badge variant="outline" className="border-[#70E4A8]/30 text-[#70E4A8]">
              {applications.length} Applications
            </Badge>
          </div>

          <div
            className="flex gap-4 overflow-x-auto custom-scrollbar pb-4"
            onDragOver={(e) => {
              e.preventDefault()
            }}
            onDrop={(e) => {
              e.preventDefault()
              setDragOverPipelineId(null)
              setDragOverApplicationId(null)
              try {
                const payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}")
                if (payload?.type === "pipeline" && payload?.id !== undefined && payload?.id !== null) {
                  movePipeline(String(payload.id), null)
                }
              } catch { }
            }}
          >
            {pipelines.map((pipeline, index) => {
              const pid = String(pipeline.id)
              const color = normalizePipelineColor(pipeline, index)
              const items = getOrderedApps(pid)

              return (
                <div
                  key={pid}
                  className={`min-w-[320px] w-[320px] rounded-xl border-2 ${dragOverPipelineId === pid
                      ? "border-dashed border-[#70E4A8] shadow-lg"
                      : "border-gray-200/60 dark:border-gray-800/60"
                    } bg-white/50 dark:bg-gray-900/30 backdrop-blur-sm transition-all duration-300`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverPipelineId(pid)
                    setDragOverApplicationId(null)
                  }}
                  onDragLeave={() => setDragOverPipelineId((v) => (v === pid ? null : v))}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOverPipelineId(null)
                    setDragOverApplicationId(null)
                    try {
                      const payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}")
                      if (payload?.type === "pipeline" && payload?.id !== undefined && payload?.id !== null) {
                        movePipeline(String(payload.id), pid)
                        return
                      }
                      moveInOrder(payload, pid, null)
                    } catch { }
                  }}
                >
                  {/* Pipeline Header */}
                  <div className="p-4 border-b border-gray-200/60 dark:border-gray-800/60">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-2 flex-1 select-none group">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                              <span className="truncate">{pipeline.name}</span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                              <span>{items.length} applications</span>
                              {items.length > 0 && (
                                <span className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                                  style={{ backgroundColor: `${color}20`, color: color }}>
                                  {items.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                openEditPipeline(pipeline, color)
                              }}
                              className="cursor-pointer"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault()
                                setIsMovePipelineDialogOpen(true)
                              }}
                              className="cursor-pointer"
                            >
                              <Move className="h-4 w-4 mr-2" />
                              Move Column
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={(e) => {
                                e.preventDefault()
                                openDeletePipeline(pid)
                              }}
                              className="cursor-pointer"
                              disabled={pipeline.is_default}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Column
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>

                  {/* Applications List */}
                  <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {items.map((app) => (
                      <div
                        key={String(app.id)}
                        className={`group bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing select-none relative hover:shadow-md transition-all duration-200 ${dragOverApplicationId === String(app.id)
                            ? "border-dashed border-[#70E4A8] ring-1 ring-[#70E4A8]"
                            : "border-gray-200/60 dark:border-gray-800/60"
                          }`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", JSON.stringify({ id: app.id, fromPipelineId: pid }))
                          e.dataTransfer.effectAllowed = "move"
                        }}
                        onDragOver={(e) => {
                          e.preventDefault()
                          setDragOverPipelineId(pid)
                          setDragOverApplicationId(String(app.id))
                        }}
                        onDragLeave={() =>
                          setDragOverApplicationId((v) => (v === String(app.id) ? null : v))
                        }
                        onDrop={(e) => {
                          e.preventDefault()
                          setDragOverPipelineId(null)
                          setDragOverApplicationId(null)
                          try {
                            const payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}")
                            if (payload?.type === "pipeline") return
                            moveInOrder(payload, pid, String(app.id))
                          } catch { }
                        }}
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 hover:bg-gray-100/70 dark:hover:bg-gray-800/50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault()
                                  openEditApplication(app)
                                }}
                                className="cursor-pointer"
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={(e) => {
                                  e.preventDefault()
                                  openDeleteApplication(String(app.id))
                                }}
                                className="cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-800">
                            <AvatarFallback
                              className="text-sm font-semibold"
                              style={{ backgroundColor: `${color}20`, color: color }}
                            >
                              {getCompanyInitials(app.company_name || "")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                              {app.company_name}
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">
                              {app.job_title}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3 w-3" />
                              <span>Applied: {app.application_date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status indicator */}
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {cvs.find(cv => String(cv.id) === String(app.cv_id))?.title || 'No CV attached'}
                            </span>
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {items.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                          <Briefcase className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No applications yet
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Drag & drop applications here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Add Pipeline Button */}
            <button
              type="button"
              className="min-w-[280px] w-[280px] rounded-xl border-2 border-dashed border-[#70E4A8]/50 bg-emerald-50/20 dark:bg-gray-900/30 hover:border-[#70E4A8] hover:bg-emerald-50/40 dark:hover:bg-gray-900/50 transition-all duration-300 flex flex-col items-center justify-center group"
              onClick={() => setIsCreatePipelineOpen(true)}
            >
              <div className="flex flex-col items-center gap-3 text-gray-600 dark:text-gray-400">
                <div className="w-12 h-12 rounded-full bg-[#70E4A8]/10 group-hover:bg-[#70E4A8]/20 flex items-center justify-center transition-colors">
                  <Plus className="h-6 w-6 text-[#70E4A8]" />
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">Add Pipeline</div>
                <p className="text-sm text-center px-4">
                  Create a new stage for your applications
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Tips Section */}
      {applications.length > 0 && (
        <Card className="border-[#70E4A8]/25 hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 font-semibold text-gray-900 dark:text-gray-100">
              <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              Tracking Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#70E4A8]/20 p-3">
                  <MoveRight className="h-5 w-5 text-[#70E4A8]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Drag & Drop</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Move applications between stages by dragging
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#EA580C]/20 p-3">
                  <Calendar className="h-5 w-5 text-[#EA580C]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Stay Updated</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Regularly update application status and dates
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-[#3B82F6]/20 p-3">
                  <FileText className="h-5 w-5 text-[#3B82F6]" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Attach CVs</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Link specific resumes to each application
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Application Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
              onClick={() => setIsAddOpen(false)}
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

      {/* Create Pipeline Dialog */}
      <Dialog open={isCreatePipelineOpen} onOpenChange={setIsCreatePipelineOpen}>
        <DialogContent className="sm:max-w-[520px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
          <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
            <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
            <DialogTitle className="text-xl font-bold dark:text-gray-100">Create New Pipeline</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Add a new stage to track your applications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Pipeline Name</Label>
              <Input
                value={newPipelineName}
                onChange={(e) => setNewPipelineName(e.target.value)}
                placeholder="e.g., Phone Screen, Technical Interview"
                className="dark:bg-gray-900 dark:border-gray-800"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Pipeline Color</Label>
              <div className="grid grid-cols-4 gap-3">
                {pipelinePalette.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-10 rounded-lg border-2 transition-all ${newPipelineColor === c
                        ? "border-gray-900 dark:border-gray-100 scale-105"
                        : "border-gray-200 dark:border-gray-800 hover:scale-105"
                      }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewPipelineColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsCreatePipelineOpen(false)}
              disabled={isCreatingPipeline}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button
              className="resumaic-gradient-green text-white hover:opacity-90 button-press"
              onClick={submitCreatePipeline}
              disabled={isCreatingPipeline}
            >
              {isCreatingPipeline ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Pipeline"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Application Dialog */}
      <Dialog open={isEditApplicationOpen} onOpenChange={setIsEditApplicationOpen}>
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
            <Button variant="outline" onClick={() => setIsEditApplicationOpen(false)} disabled={isSavingEdit} className="border-gray-300 dark:border-gray-700">
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

      {/* Delete Application Dialog */}
      <Dialog open={isDeleteApplicationOpen} onOpenChange={setIsDeleteApplicationOpen}>
        <DialogContent className="sm:max-w-[480px] border-red-200/30 dark:border-red-900/30 dark:bg-[#0B0F1A]">
          <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
            <div className="absolute -left-6 -top-6 w-32 h-32 bg-red-500 opacity-10 blur-3xl -z-10" />
            <DialogTitle className="text-xl font-bold dark:text-gray-100">Delete Application</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              This action cannot be undone. The application will be permanently removed.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDeleteApplicationOpen(false)} disabled={isDeletingApplication} className="border-gray-300 dark:border-gray-700">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteApplication} disabled={isDeletingApplication}>
              {isDeletingApplication ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Pipeline Dialog */}
      <Dialog open={isEditPipelineOpen} onOpenChange={setIsEditPipelineOpen}>
        <DialogContent className="sm:max-w-[520px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
          <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
            <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
            <DialogTitle className="text-xl font-bold dark:text-gray-100">Update Pipeline</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Rename or recolor this pipeline stage
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Pipeline Name</Label>
              <Input value={editPipelineName} onChange={(e) => setEditPipelineName(e.target.value)} placeholder="e.g., Phone Screen" className="dark:bg-gray-900 dark:border-gray-800" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Pipeline Color</Label>
              <div className="grid grid-cols-4 gap-3">
                {pipelinePalette.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`h-10 rounded-lg border-2 transition-all ${editPipelineColor === c
                        ? "border-gray-900 dark:border-gray-100 scale-105"
                        : "border-gray-200 dark:border-gray-800 hover:scale-105"
                      }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setEditPipelineColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsEditPipelineOpen(false)} disabled={isSavingPipeline} className="border-gray-300 dark:border-gray-700">
              Cancel
            </Button>
            <Button
              className="resumaic-gradient-green text-white hover:opacity-90 button-press"
              onClick={submitEditPipeline}
              disabled={isSavingPipeline}
            >
              {isSavingPipeline ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                "Save Pipeline"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Pipeline Dialog */}
      <Dialog open={isDeletePipelineOpen} onOpenChange={setIsDeletePipelineOpen}>
        <DialogContent className="sm:max-w-[480px] border-red-200/30 dark:border-red-900/30 dark:bg-[#0B0F1A]">
          <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
            <div className="absolute -left-6 -top-6 w-32 h-32 bg-red-500 opacity-10 blur-3xl -z-10" />
            <DialogTitle className="text-xl font-bold dark:text-gray-100">Delete Pipeline</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Deleting this pipeline will remove all applications inside it. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDeletePipelineOpen(false)} disabled={isDeletingPipeline} className="border-gray-300 dark:border-gray-700">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeletePipeline} disabled={isDeletingPipeline}>
              {isDeletingPipeline ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete Pipeline"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Pipeline Dialog */}
      <Dialog open={isMovePipelineDialogOpen} onOpenChange={setIsMovePipelineDialogOpen}>
        <DialogContent className="sm:max-w-[480px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
          <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
            <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
            <DialogTitle className="text-xl font-bold dark:text-gray-100">Move Column</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Drag and drop to reorder columns
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar p-1">
            {pipelines.map((p, index) => (
              <div
                key={String(p.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-move select-none ${movingPipelineId === String(p.id)
                    ? "bg-gray-100 dark:bg-gray-800 border-dashed border-[#70E4A8] opacity-50"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-[#70E4A8]/50 hover:shadow-sm"
                  }`}
                draggable
                onDragStart={(e) => {
                  setMovingPipelineId(String(p.id))
                  e.dataTransfer.setData("text/plain", JSON.stringify({ type: "pipeline-reorder", id: p.id }))
                  e.dataTransfer.effectAllowed = "move"
                }}
                onDragOver={(e) => {
                  e.preventDefault()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  const payload = JSON.parse(e.dataTransfer.getData("text/plain") || "{}")
                  if (payload.type === "pipeline-reorder" && payload.id !== undefined) {
                    movePipeline(String(payload.id), String(p.id))
                  }
                  setMovingPipelineId(null)
                }}
                onDragEnd={() => setMovingPipelineId(null)}
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
                <div className="flex-1 font-medium text-gray-900 dark:text-gray-100">{p.name}</div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: normalizePipelineColor(p, index) }}
                />
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button onClick={() => setIsMovePipelineDialogOpen(false)} className="resumaic-gradient-green text-white hover:opacity-90 button-press">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
