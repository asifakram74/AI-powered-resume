"use client"

import { useEffect, useState } from "react"
import { Download, PlusCircle, Layout, Palette, Layers, Crown, LogOut, Home, FileText, FileOutput, FileInput } from "lucide-react"
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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activePage: string
  setActivePage: (page: string) => void
  onExportPDF: () => void
  onExportDOCX: () => void
  onExportPNG: () => void
}

export function Sidebar({ 
  activePage, 
  setActivePage,
  onExportPDF,
  onExportDOCX,
  onExportPNG 
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

  const handleExport = (format: string) => {
    if (format === "pdf") {
      onExportPDF();
    } else if (format === "docx") {
      onExportDOCX();
    } else if (format === "png") {
      onExportPNG();
    }
  }

  return (
    <SidebarPrimitive
      className={`border-r border-gray-200/60 bg-white ${!isMounted ? "invisible" : ""}`}
      aria-hidden={!isMounted}
    >
      <Link href="/">
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
      </Link>

      <SidebarContent className="px-3">
        <SidebarMenu className="space-y-1">
          {/* Export Resume with dropdown */}
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  isActive={activePage === "export-resume"}
                  className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Download className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
                    <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">
                      Export Resume
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer" 
                  onClick={() => handleExport("pdf")}
                >
                  <FileText className="h-4 w-4" /> PDF
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer" 
                  onClick={() => handleExport("docx")}
                >
                  <FileOutput className="h-4 w-4" /> DOCX
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer" 
                  onClick={() => handleExport("png")}
                >
                  <FileInput className="h-4 w-4" /> PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>

          {/* Other menu items */}
          {/* <SidebarMenuItem>
            <div
              onClick={() => {
                setActivePage("new-section");
                router.push(`/dashboard?page=resumes`);
              }}
              role="button"
              className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group flex items-center cursor-pointer"
              data-active={activePage === "new-section"}
            >
              <PlusCircle className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
              <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">New Section</span>
            </div>
          </SidebarMenuItem> */}

          {/* <SidebarMenuItem>
            <div
              onClick={() => setActivePage("change-template")}
              role="button"
              className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group flex items-center cursor-pointer"
              data-active={activePage === "change-template"}
            >
              <Layout className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
              <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">Change Template</span>
            </div>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActivePage("customize-colors")}
              isActive={activePage === "customize-colors"}
              className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
            >
              <div className="flex items-center gap-3 flex-1">
                <Palette className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
                <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">Customize Colors</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActivePage("layout-options")}
              isActive={activePage === "layout-options"}
              className="w-full justify-start gap-3 px-4 py-3 text-left rounded-xl transition-all duration-200 hover:bg-gray-50 hover:shadow-sm data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 data-[active=true]:text-blue-700 data-[active=true]:shadow-sm data-[active=true]:border data-[active=true]:border-blue-100 group"
            >
              <div className="flex items-center gap-3 flex-1">
                <Layers className="h-5 w-5 text-gray-600 group-data-[active=true]:text-blue-600" />
                <span className="font-medium text-gray-700 group-data-[active=true]:text-blue-700">Layout Options</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto">
        <Button variant="outline" className="w-full bg-transparent mb-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
        <Link href="/dashboard">
          <Button variant="secondary" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </SidebarFooter>
    </SidebarPrimitive>
  )
}