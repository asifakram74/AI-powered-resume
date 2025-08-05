"use client"

import { useEffect, useState } from "react"
import { FileText, Mail, CheckCircle, Settings, UserCircle, Sparkles, BarChart3, Crown, LogOut } from "lucide-react"

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
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
}

const menuItems = [
  {
    id: "create-persona",
    label: "Persona",
    icon: Sparkles,
    badge: "AI",
    badgeColor: "bg-gradient-to-r from-blue-500 to-purple-500 text-white",
  },
  {
    id: "resumes",
    label: "Resumes",
    icon: FileText,
  },
  {
    id: "cover-letter",
    label: "Cover Letters",
    icon: Mail,
  },
  {
    id: "ats-checker",
    label: "ATS Checker",
    icon: CheckCircle,
    badge: "Pro",
    badgeColor: "bg-gradient-to-r from-orange-500 to-red-500 text-white",
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
]

export function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user } = useAppSelector((state) => state.auth)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/auth/signin")
  }

  return (
    <SidebarPrimitive
      className={`border-r border-gray-200/60 bg-white ${!isMounted ? "invisible" : ""}`}
      aria-hidden={!isMounted}
    >
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
            <Crown className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">CV Builder AI</h1>
            <p className="text-xs text-gray-500">Professional Resume Tool</p>
          </div>
        </div>
        {user && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActivePage(item.id)}
                isActive={activePage === item.id}
                className={`
                  w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200
                  hover:bg-gray-50 hover:shadow-sm
                  data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 
                  data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100
                  group
                `}
              >
                <div className="flex items-center gap-3 flex-1">
                  <item.icon className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
                  <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">{item.label}</span>
                </div>
                {item.badge && (
                  <Badge
                    className={`text-xs px-2 py-0.5 font-medium ${item.badgeColor || "bg-gray-100 text-gray-700"}`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-100 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Usage Stats</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Personas created</span>
            <span className="text-sm font-bold text-blue-600">3/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
              style={{ width: "30%" }}
            ></div>
          </div>
        </div>

        <Button variant="outline" className="w-full bg-transparent" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </SidebarPrimitive>
  )
}
