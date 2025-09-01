"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Sidebar } from "@/components/dashboard/sidebar"
import  CreatePersonaPage  from "@/pages/persona/PersonaList"
import { ResumePage } from "@/pages/resume/ResumeList"
import { CoverLetterPage } from "@/pages/cover-letter/CoverLetterList"
import ATSCheckerPage from "@/pages/ats/ats-checker-page"
import { ProfilePage } from "@/pages/profile/profile-page"
import { UserList } from "@/pages/UsersManagement/UserList"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAppSelector } from "@/lib/redux/hooks"
import { useRouter } from "next/navigation"
// import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export interface PageProps {
  user: {
    id: string | number;
    role?: string;
    name?: string;
    email?: string;
    source?: string;
  } | null;
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("create-persona")
  const [isClient, setIsClient] = useState(false)
  const { user } = useAppSelector((state) => state.auth)
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [user])

  const isAdmin = user?.role?.toLowerCase() === "admin"

  const renderActivePage = () => {
    // if (!isClient) {
    //   // return <LoadingSpinner />
    // }

    switch (activePage) {
      case "create-persona":
        return <CreatePersonaPage user={user} />
      case "resumes":
        return <ResumePage user={user} />
      case "cover-letter":
        return <CoverLetterPage user={user} />
      case "ats-checker":
        return <ATSCheckerPage />
      case "profile":
        return <ProfilePage />
      case "users":
        return isAdmin ? <UserList user={user} /> : <CreatePersonaPage user={user} />
      default:
        return <CreatePersonaPage user={user} />
    }
  }

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            user={user}
          />
          <main className="flex-1 p-6 bg-gray-50 relative">
            {renderActivePage()}
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}