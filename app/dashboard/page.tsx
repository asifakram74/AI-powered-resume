"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/dashboard/sidebar"
import { CreatePersonaPage } from "@/components/persona/PersonaList"
import { ResumePage } from "@/components/resume/ResumeList"
import { CoverLetterPage } from "@/components/cover-letter/CoverLetterList"
import ATSCheckerPage from "@/components/ats/ats-checker-page"
import { ProfilePage } from "@/components/profile/profile-page"
// import { SettingsPage } from "@/components/settings/settings-page"
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("create-persona")

  const renderActivePage = () => {
    switch (activePage) {
      case "create-persona":
        return <CreatePersonaPage />
      case "resumes":
        return <ResumePage />
      case "cover-letter":
        return <CoverLetterPage />
      case "ats-checker":
        return <ATSCheckerPage />
      case "profile":
        return <ProfilePage />
      // case "settings":
      //   return <SettingsPage />
      default:
        return <CreatePersonaPage />
    }
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar activePage={activePage} setActivePage={setActivePage} />
          <main className="flex-1 p-6 bg-gray-50 relative">{renderActivePage()}</main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
