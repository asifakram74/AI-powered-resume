"use client"

import { useState, useEffect } from "react"
import { SidebarProvider, SidebarTrigger } from "../../components/ui/sidebar"
import { Sidebar } from "../../components/dashboard/sidebar"
import  CreatePersonaPage  from "../../pages/persona/PersonaList"
import { ResumePage } from "../../pages/resume/ResumeList"
import { CoverLetterPage } from "../../pages/cover-letter/CoverLetterList"
import ATSCheckerPage from "../../pages/ats/ats-checker-page"
import { ProfilePage } from "../../pages/profile/profile-page"
import { UserList } from "../../pages/UsersManagement/UserList"
import ProtectedRoute from "../../components/auth/ProtectedRoute"
import { useAppSelector } from "../../lib/redux/hooks"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"
// import { LoadingSpinner } from "@/components/ui/LoadingSpinner"

export interface PageProps {
  user: {
    id: string | number;
    role?: string;
    name?: string;
    email?: string;
    source?: string;
    plan?: string;
    profile?: {
      cvs_count?: number;
    };
  } | null;
}

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("create-persona")
  const [isClient, setIsClient] = useState(false)
  const { user } = useAppSelector((state) => state.auth)
  const router = useRouter()

  // Load saved active page from localStorage on component mount
  useEffect(() => {
    const savedActivePage = localStorage.getItem('dashboardActivePage')
    if (savedActivePage) {
      setActivePage(savedActivePage)
    }
    setIsClient(true)
  }, [])

  // Save active page to localStorage whenever it changes
  const handleSetActivePage = (page: string) => {
    setActivePage(page)
    localStorage.setItem('dashboardActivePage', page)
  }
// In your dashboard page
useEffect(() => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    router.push('/auth/signin');
    return;
  }
  
  try {
    const user = JSON.parse(userStr);
    if (!user.id) {
      router.push('/auth/signin');
    }
  } catch (e) {
    router.push('/auth/signin');
  }
}, [router]);

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
            setActivePage={handleSetActivePage}
            user={user}
          />
          <main className="flex-1 bg-gray-50 relative">
            {/* Mobile Header with Sidebar Trigger */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-40">
              <SidebarTrigger className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <h1 className="text-lg font-semibold text-gray-900">
                {activePage === "create-persona" && "Persona"}
                {activePage === "resumes" && "Resumes"}
                {activePage === "cover-letter" && "Cover Letters"}
                {activePage === "ats-checker" && "ATS Checker"}
                {activePage === "profile" && "Profile"}
                {activePage === "users" && "User Management"}
              </h1>
              <div className="w-9" /> {/* Spacer for centering */}
            </div>
            
            {/* Main Content */}
            <div className="p-6">
              {renderActivePage()}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  )
}