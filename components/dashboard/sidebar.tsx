"use client"

import { useEffect, useState } from "react"
import { FileText, Mail, CheckCircle, UserCircle, Sparkles, BarChart3, LogOut, ChevronDown } from "lucide-react"
import Link from "next/link"
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
  onExportPDF?: () => Promise<void>
  onExportDOCX?: () => Promise<void>
  onExportPNG?: () => Promise<void>
  exportMode?: boolean
}

const menuItems = [
  {
    id: "create-persona",
    label: "Persona",
    icon: Sparkles,
  },
  {
    id: "resumes",
    label: "Resumes",
    badge: "AI",
    // badgeColor: "resumaic-gradient-green text-white shadow-lg",
    icon: FileText,
  },
  {
    id: "cover-letter",
    label: "Cover Letters",
    badge: "AI",
    // badgeColor: "resumaic-gradient-green text-white ",
    icon: Mail,
  },
  {
    id: "ats-checker",
    label: "ATS Checker",
    icon: CheckCircle,
    badge: "Pro",
    badgeColor: "resumaic-gradient-orange text-white shadow-lg",
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
  },
]

export function Sidebar({
  activePage,
  setActivePage,
  onExportPDF,
  onExportDOCX,
  onExportPNG,
  exportMode = false,
}: SidebarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/")
  }

  return (
    <SidebarPrimitive
      className={`border-r border-gray-200/60 bg-white/95 backdrop-blur-xl shadow-xl ${!isMounted ? "invisible" : "animate-slide-in-left"}`}
      aria-hidden={!isMounted}
    >
      <Link href="/">
        <SidebarHeader className="p-6 pb-4">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl resumaic-gradient-green text-white shadow-xl transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <FileText className="h-6 w-6" />
            </div>
            <div className="animate-fade-in-up">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Resumaic
              </h1>
              <p className="text-xs text-gray-500 font-medium">AI Resume Builder</p>
            </div>
          </div>
          {user && (
            <div className="mt-4 p-4 bg-gradient-to-br from-green-50/80 to-white rounded-2xl border border-green-100/50 shadow-sm animate-fade-in-up animation-delay-200">
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
        </SidebarHeader>
      </Link>

      <SidebarContent className="px-4">
        <SidebarMenu className="space-y-2">
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={item.id} className={`animate-fade-in-up animation-delay-${(index + 1) * 100}`}>
              <SidebarMenuButton
                onClick={() => setActivePage(item.id)}
                isActive={activePage === item.id}
                className={`
                  w-full justify-start gap-3 px-4 py-3.5 text-left rounded-2xl transition-all duration-300
                  hover:bg-gradient-to-r hover:from-green-50/80 hover:to-orange-50/30 hover:shadow-lg hover:scale-[1.02]
                  data-[active=true]:resumaic-gradient-subtle data-[active=true]:text-gray-900 data-[active=true]:shadow-xl 
                  data-[active=true]:border data-[active=true]:border-green-200/50 data-[active=true]:scale-[1.02]
                  group cursor-pointer transform
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <item.icon className="h-5 w-5 text-gray-600 group-data-[active=true]:text-green-700 transition-all duration-300 group-hover:scale-110" />
                  <span className="font-semibold text-gray-700 group-data-[active=true]:text-gray-900 group-hover:text-gray-900">
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <Badge
                    className={`text-xs px-3 py-1 font-bold rounded-full transform transition-all duration-300 group-hover:scale-110 ${item.badgeColor || "bg-gray-100 text-gray-700"}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto space-y-4">
        {exportMode ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between rounded-2xl border-2 border-green-200/50 hover:border-green-300 hover:bg-green-50/50 transition-all duration-300 bg-transparent"
              >
                <span className="font-semibold">Export</span>
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl border-green-200/50 shadow-xl">
              <DropdownMenuItem onClick={onExportPDF} className="rounded-xl">
                <FileText className="mr-2 h-4 w-4" />
                <span>PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportDOCX} className="rounded-xl">
                <FileText className="mr-2 h-4 w-4" />
                <span>DOCX</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPNG} className="rounded-xl">
                <FileText className="mr-2 h-4 w-4" />
                <span>PNG</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          /* Updated usage stats card with Resumaic branding and enhanced animations */
          <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50/80 via-white to-orange-50/30 border border-green-200/50  ">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl resumaic-gradient-green shadow-lg">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Usage Stats</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">Personas created</span>
              <span className="text-sm font-bold ">3/10</span>
            </div>
            <div className="w-full bg-gray-200/80 rounded-full h-2 shadow-inner">
              <div
                className="resumaic-gradient-green h-2 rounded-full shadow-sm animate-pulse-slow"
                style={{ width: "30%" }}
              ></div>
            </div>
          </div>
        )}

        <Button
          variant="outline"
          className="w-full bg-transparent rounded-2xl border-2 border-gray-200/80 hover:border-red-300 hover:bg-red-50/50 hover:text-red-600 transition-all duration-300 transform hover:scale-[1.02] font-semibold"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </SidebarPrimitive>
  )
}
