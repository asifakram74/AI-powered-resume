
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { Calendar, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { JobApplication } from "../../lib/redux/service/jobTrackerService"
import { CV } from "../../lib/redux/service/resumeService"

interface ApplicationCardProps {
  app: JobApplication
  cvs: CV[]
  color: string
  isDraggingOver: boolean
  onDragStart: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  openEdit: (app: JobApplication) => void
  openDelete: (appId: string) => void
}

const getCompanyInitials = (company: string) => {
  return company
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ApplicationCard({
  app,
  cvs,
  color,
  isDraggingOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  openEdit,
  openDelete,
}: ApplicationCardProps) {
  return (
    <div
      className={`group bg-white dark:bg-gray-900 border rounded-lg p-4 shadow-sm cursor-grab active:cursor-grabbing select-none relative hover:shadow-md transition-all duration-200 ${isDraggingOver
          ? "border-dashed border-[#70E4A8] ring-1 ring-[#70E4A8]"
          : "border-gray-200/60 dark:border-gray-800/60"
        }`}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
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
                openEdit(app)
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
                openDelete(String(app.id))
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
  )
}
