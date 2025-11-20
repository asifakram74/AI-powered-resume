"use client"

import { useEffect, useState } from "react"
import { FileText, Mail, CheckCircle, UserCircle, Sparkles, BarChart3, LogOut, ChevronDown, Users } from "lucide-react"
import Link from "next/link"
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarGroup,
} from "../../components/ui/sidebar"
import Image from "next/image"

import { Badge } from "../../components/ui/badge"

import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks"
import { logoutUser } from "../../lib/redux/slices/authSlice"
import { useRouter } from "next/navigation"
import { getCVs } from "../../lib/redux/service/resumeService"

function useResumeCount(userId: string | number | undefined) {
  const [resumeCount, setResumeCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { profile } = useAppSelector((state) => state.auth)

  useEffect(() => {
    const fetchResumeCount = async () => {
      if (!userId) return

      try {
        setLoading(true)
        if (profile?.cvs_count !== undefined) {
          setResumeCount(profile.cvs_count)
        } else {
          const cvs = await getCVs(userId.toString())
          setResumeCount(cvs.length)
        }
      } catch (error) {
        console.error("Failed to fetch resume count:", error)
        setResumeCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchResumeCount()
  }, [userId, profile?.cvs_count])

  return { resumeCount, loading }
}

interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
  user: {
    id: string | number;
    role?: string;
    name?: string;
    email?: string;
    profilePicture?: string;
  } | null
  onExportPDF?: () => Promise<void>
  onExportDOCX?: () => Promise<void>
  onExportPNG?: () => Promise<void>
  exportMode?: boolean
}

const regularMenuItems = [
  {
    id: "create-persona",
    label: "Persona",
    icon: Sparkles,
  },
  {
    id: "resumes",
    label: "Resumes",
    badge: "AI",
    icon: FileText,
  },
  {
    id: "cover-letter",
    label: "Cover Letters",
    badge: "AI",
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
    badge: "",
    badgeColor: "transparent",
  },
]

const adminMenuItems = [
  {
    id: "users",
    label: "User Management",
    icon: Users,
    badge: "",
    badgeColor: "transparent",
  },
]

export function Sidebar({
  activePage,
  setActivePage,
  user,
  onExportPDF,
  onExportDOCX,
  onExportPNG,
  exportMode = false
}: SidebarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { profile } = useAppSelector((state) => state.auth)
  const { resumeCount, loading } = useResumeCount(user?.id)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/")
  }

  const isAdmin = user?.role?.toLowerCase() === "admin"
  const maxResumes = 3
  const progressPercentage = Math.min((resumeCount / maxResumes) * 100, 100)
  const isProUser = profile?.plan_type?.toLowerCase() === 'pro'

  // Function to get user initials
  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <SidebarPrimitive
      className={`w-64 border-r border-gray-200/60 bg-white/95 backdrop-blur-xl shadow-xl ${!isMounted ? "invisible" : "animate-slide-in-left"}`}
      aria-hidden={!isMounted}
    >
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center cursor-pointer">
          <Link href="/" >
            <Image src="/Resumic.png" alt="Logo" width={200} height={120} className="cursor-pointer" />
          </Link>
          {/* <p className="text-xs text-gray-500 font-medium">AI Resume Builder</p> */}

          {/* <div className="animate-fade-in-up">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Resumaic
              </h1>
            </div> */}
        </div>

        {(user || profile) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-top gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <AvatarFallback
                className={`font-semibold ${
                  user?.role === "admin"
                  ? ""
                  : "bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8]"
                  }`}
              >
                {user?.role === "admin" ? (
                  <UserCircle className="h-5 w-5 text-[#EA580C]" />
                ) : profile?.name ? (
                  profile.name.charAt(0).toUpperCase()
                ) : user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <UserCircle className="h-5 w-5 text-[#70E4A8]" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{profile?.name || user?.name}</p>
              <p className="text-xs text-gray-500 break-all">{profile?.email || user?.email}</p>
              
              {
                user?.role?.toLowerCase() === 'admin' && (
                  <Badge className="bg-gradient-to-br resumaic-gradient-green text-white text-xs">
                    Administrator
                  </Badge>
                )}
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {[...regularMenuItems, ...(isAdmin ? adminMenuItems : [])].map((item, index) => (
              <SidebarMenuItem key={item.id} className={`animate-fade-in-up animation-delay-${(index + 1) * 100}`}>
                <SidebarMenuButton
                  onClick={() => setActivePage(item.id)}
                  isActive={activePage === item.id}
                  className={`
                    w-full justify-start gap-3 px-4 py-3.5 text-left rounded-2xl transition-all duration-300
                    data-[active=true]:resumaic-gradient-subtle data-[active=true]:text-gray-900 data-[active=true]:shadow-xl 
                    data-[active=true]:border data-[active=true]:border-green-200/50
                    cursor-pointer transform
                  `}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <item.icon className="h-5 w-5 text-gray-600 group-data-[active=true]:text-green-700" />
                    <span className="font-semibold text-gray-700 data-[active=true]:text-gray-900">
                      {item.label}
                    </span>
                  </div>
                  {item.badge && (
                    item.badge === 'Pro' ? (!!profile && !isProUser) : true
                  ) && (
                    <Badge
                      className={`text-xs px-3 py-1 font-bold rounded-full ${item.badgeColor || "bg-gray-100 text-gray-700"}`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
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
        ) : !isAdmin ? (
          !!profile && !isProUser && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50/80 via-white to-orange-50/30 border border-green-200/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl resumaic-gradient-green shadow-lg">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">Usage Stats</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600">
                  Resumes created
                </span>
                {loading ? (
                  <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  <span className="text-sm font-bold">
                    {resumeCount}/{maxResumes}
                  </span>
                )}
              </div>
              <div className="w-full bg-gray-200/80 rounded-full h-2 shadow-inner">
                {loading ? (
                  <div className="h-2 rounded-full bg-gray-300 animate-pulse"></div>
                ) : (
                  <div
                    className="resumaic-gradient-green h-2 rounded-full shadow-sm transition-all duration-700 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                )}
              </div>
            </div>
          )
        ) : null}
        
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