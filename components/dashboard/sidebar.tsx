"use client"

import { useEffect, useState } from "react"
import { FileText, Mail, CheckCircle, UserCircle, Sparkles, BarChart3, LogOut, ChevronDown, Users, Crown, Lock } from "lucide-react"
import Link from "next/link"
import {
  Sidebar as SidebarPrimitive,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../../components/ui/sidebar"
import Image from "next/image"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "../../lib/redux/hooks"
import { logoutUser, fetchProfile } from "../../lib/redux/slices/authSlice"
import { useRouter } from "next/navigation"
import { getCVs } from "../../lib/redux/service/resumeService"
import { usePathname } from "next/navigation"

// Define feature access levels
export enum FeatureAccess {
  FREE = 'free',
  PRO = 'pro',
  ADMIN = 'admin'
}

interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  requiredPlan?: FeatureAccess; // Minimum plan required to access
  maxFreeUsage?: number; // Maximum usage for free users
  adminOnly?: boolean; // Only accessible by admins
}

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
  activePage?: string
  setActivePage?: (page: string) => void
  user: {
    id: string | number;
    role?: string;
    name?: string;
    email?: string;
    profilePicture?: string;
    plan_type?: string;
  } | null
  onExportPDF?: () => Promise<void>
  onExportDOCX?: () => Promise<void>
  onExportPNG?: () => Promise<void>
  exportMode?: boolean
}

const regularMenuItems: MenuItem[] = [
  {
    id: "create-persona",
    path: "/dashboard/create-persona",
    label: "Persona",
    icon: Sparkles,
    requiredPlan: FeatureAccess.FREE,
  },
  {
    id: "resumes",
    path: "/dashboard/resumes",
    label: "Resumes",
    badge: "AI",
    icon: FileText,
    requiredPlan: FeatureAccess.FREE,
    maxFreeUsage: 3, // Free users can create up to 3 resumes
  },
  {
    id: "cover-letter",
    path: "/dashboard/cover-letter",
    label: "Cover Letters",
    badge: "AI",
    icon: Mail,
    requiredPlan: FeatureAccess.FREE,
    maxFreeUsage: 3, // Free users can create up to 3 cover letters
  },
  {
    id: "ats-checker",
    path: "/dashboard/ats-checker",
    label: "ATS Checker",
    icon: CheckCircle,
    badge: "Pro",
    badgeColor: "resumaic-gradient-orange text-white shadow-lg",
    requiredPlan: FeatureAccess.PRO, // Only Pro users and above
  },
  {
    id: "profile",
    path: "/dashboard/profile",
    label: "Profile",
    icon: UserCircle,
    requiredPlan: FeatureAccess.FREE,
  },
]

const adminMenuItems: MenuItem[] = [
  {
    id: "users",
    path: "/dashboard/users",
    label: "User Management",
    icon: Users,
    requiredPlan: FeatureAccess.ADMIN,
    adminOnly: true,
  },
]

export function Sidebar({
  activePage: propActivePage,
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
  const pathname = usePathname()
  const { profile } = useAppSelector((state) => state.auth)
  const { resumeCount, loading } = useResumeCount(user?.id)

  useEffect(() => {
    setIsMounted(true)
    if (localStorage.getItem('token')) {
      dispatch(fetchProfile())
    }
  }, [dispatch])

  const handleLogout = async () => {
    await dispatch(logoutUser())
    router.push("/")
  }

  // Helper functions for access control
  const getUserPlan = (): FeatureAccess => {
    if (user?.role?.toLowerCase() === "admin") return FeatureAccess.ADMIN
    if (profile?.plan_type?.toLowerCase() === 'pro' || user?.plan_type?.toLowerCase() === 'pro') return FeatureAccess.PRO
    return FeatureAccess.FREE
  }

  const hasAccess = (item: MenuItem): boolean => {
    const userPlan = getUserPlan()
    
    // Check admin access
    if (item.adminOnly && userPlan !== FeatureAccess.ADMIN) {
      return false
    }

    // Check plan requirements
    const planHierarchy = {
      [FeatureAccess.FREE]: 1,
      [FeatureAccess.PRO]: 2,
      [FeatureAccess.ADMIN]: 3
    }

    const requiredLevel = planHierarchy[item.requiredPlan || FeatureAccess.FREE]
    const userLevel = planHierarchy[userPlan]
    
    return userLevel >= requiredLevel
  }

  const isUsageLimited = (item: MenuItem): boolean => {
    if (getUserPlan() !== FeatureAccess.FREE) return false
    if (!item.maxFreeUsage) return false
    
    // Check if user has exceeded free usage for this feature
    if (item.id === "resumes") {
      return resumeCount >= item.maxFreeUsage
    }
    
    // For other features, you would need to track their usage
    // This is a placeholder - implement based on your actual usage tracking
    return false
  }

  const getMenuItemClassName = (item: MenuItem): string => {
    if (!hasAccess(item)) {
      return "opacity-50 cursor-not-allowed"
    }
    
    if (isUsageLimited(item)) {
      return "opacity-70 cursor-not-allowed"
    }
    
    return ""
  }

  const getTooltipText = (item: MenuItem): string => {
    if (!hasAccess(item)) {
      if (item.requiredPlan === FeatureAccess.PRO) {
        return "Upgrade to Pro to access this feature"
      }
      return "Access denied"
    }
    
    if (isUsageLimited(item)) {
      return `Free limit reached (${item.maxFreeUsage}/${item.maxFreeUsage}). Upgrade to Pro for unlimited access.`
    }
    
    return ""
  }

  const isAdmin = getUserPlan() === FeatureAccess.ADMIN
  const isProUser = getUserPlan() === FeatureAccess.PRO
  const isFreeUser = getUserPlan() === FeatureAccess.FREE

  const maxResumes = 3
  const progressPercentage = Math.min((resumeCount / maxResumes) * 100, 100)

  // Determine active page based on prop or pathname
  const activePage = propActivePage || regularMenuItems.find(item => pathname?.includes(item.path))?.id || adminMenuItems.find(item => pathname?.includes(item.path))?.id || "create-persona"

  // Filter menu items based on user access
  const filteredRegularMenuItems = regularMenuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  )

  // Get user initials
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
        </div>

        {(user || profile) && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <AvatarFallback
                className={`font-semibold ${
                  isAdmin
                  ? "bg-orange-100 text-orange-600"
                  : isProUser
                  ? "bg-purple-100 text-purple-600"
                  : "bg-[#70E4A8]/20 text-[#70E4A8]"
                  }`}
              >
                {isAdmin ? (
                  <Crown className="h-5 w-5" />
                ) : profile?.name ? (
                  profile.name.charAt(0).toUpperCase()
                ) : user?.name ? (
                  user.name.charAt(0).toUpperCase()
                ) : (
                  <UserCircle className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-gray-900">{profile?.name || user?.name}</p>
              
              {isAdmin && (
                <Badge className="resumaic-gradient-orange text-white text-xs">
                  Administrator
                </Badge>
              )}
              {isProUser && !isAdmin && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                  Pro User
                </Badge>
              )}
              {isFreeUser && !isAdmin && (
                <Badge className="bg-gray-100 text-gray-700 text-xs">
                  Free User
                </Badge>
              )}
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarMenu className="space-y-1">
            {filteredRegularMenuItems.map((item, index) => {
              const hasAccessToItem = hasAccess(item)
              const isLimited = isUsageLimited(item)
              const isActive = activePage === item.id
              
              return (
                <SidebarMenuItem 
                  key={item.id} 
                  className={`animate-fade-in-up animation-delay-${(index + 1) * 100} ${getMenuItemClassName(item)}`}
                  title={getTooltipText(item)}
                >
                  {setActivePage ? (
                    <SidebarMenuButton
                      id={`tour-${item.id}`}
                      onClick={() => {
                        if (hasAccessToItem && !isLimited) {
                          setActivePage(item.id)
                        }
                      }}
                      isActive={isActive && hasAccessToItem && !isLimited}
                      disabled={!hasAccessToItem || isLimited}
                      className={`
                        w-full justify-start gap-3 px-4 py-3.5 text-left rounded-2xl transition-all duration-300
                        ${isActive && hasAccessToItem && !isLimited 
                          ? 'resumaic-gradient-subtle text-gray-900 shadow-xl border border-green-200/50' 
                          : 'hover:bg-gray-50'
                        }
                        ${(!hasAccessToItem || isLimited) ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
                        transform
                      `}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <item.icon className={`h-5 w-5 ${
                          isActive && hasAccessToItem && !isLimited 
                            ? 'text-green-700' 
                            : 'text-gray-600'
                        }`} />
                        <span className="font-semibold">
                          {item.label}
                        </span>
                      </div>
                      
                      {/* Lock icon for restricted items */}
                      {(!hasAccessToItem || isLimited) && (
                        <Lock className="h-4 w-4 text-gray-400 ml-2" />
                      )}
                      
                      {/* Badge for feature labels */}
                      {item.badge && hasAccessToItem && (
                        item.badge === 'Pro' ? (!isProUser && !isAdmin) : true
                      ) && (
                        <Badge
                          className={`text-xs px-3 py-1 font-bold rounded-full ${
                            !hasAccessToItem ? 'bg-gray-100 text-gray-400' : 
                            item.badgeColor || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  ) : (
                    <div className={`relative ${(!hasAccessToItem || isLimited) ? 'cursor-not-allowed' : ''}`}>
                      {(!hasAccessToItem || isLimited) ? (
                        <div className="w-full">
                          <SidebarMenuButton
                            id={`tour-${item.id}`}
                            disabled
                            className="w-full justify-start gap-3 px-4 py-3.5 text-left rounded-2xl transition-all duration-300 opacity-70 cursor-not-allowed"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <item.icon className="h-5 w-5 text-gray-400" />
                              <span className="font-semibold text-gray-400">
                                {item.label}
                              </span>
                            </div>
                            <Lock className="h-4 w-4 text-gray-400 ml-2" />
                            {item.badge && (
                              <Badge className="text-xs px-3 py-1 font-bold rounded-full bg-gray-100 text-gray-400">
                                {item.badge}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </div>
                      ) : (
                        <Link href={item.path} className="w-full block">
                          <SidebarMenuButton
                            id={`tour-${item.id}`}
                            isActive={isActive}
                            className={`
                              w-full justify-start gap-3 px-4 py-3.5 text-left rounded-2xl transition-all duration-300
                              data-[active=true]:resumaic-gradient-subtle data-[active=true]:text-gray-900 data-[active=true]:shadow-xl 
                              data-[active=true]:border data-[active=true]:border-green-200/50
                              cursor-pointer transform hover:bg-gray-50
                            `}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <item.icon className="h-5 w-5 text-gray-600 group-data-[active=true]:text-green-700" />
                              <span className="font-semibold text-gray-700 data-[active=true]:text-gray-900">
                                {item.label}
                              </span>
                            </div>
                            {item.badge && (
                              item.badge === 'Pro' ? (!isProUser && !isAdmin) : true
                            ) && (
                              <Badge
                                className={`text-xs px-3 py-1 font-bold rounded-full ${item.badgeColor || "bg-gray-100 text-gray-700"}`}
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </Link>
                      )}
                    </div>
                  )}
                </SidebarMenuItem>
              )
            })}
            
            {/* Admin menu items */}
            {isAdmin && adminMenuItems.map((item, index) => (
              <SidebarMenuItem 
                key={item.id} 
                className={`animate-fade-in-up animation-delay-${(filteredRegularMenuItems.length + index + 1) * 100}`}
              >
                <Link href={item.path} className="w-full block">
                  <SidebarMenuButton
                    id={`tour-${item.id}`}
                    isActive={activePage === item.id}
                    className={`
                      w-full justify-start gap-3 px-4 py-3.5 text-left rounded-2xl transition-all duration-300
                      data-[active=true]:bg-orange-50 data-[active=true]:text-gray-900 data-[active=true]:shadow-xl 
                      data-[active=true]:border data-[active=true]:border-orange-200/50
                      cursor-pointer transform hover:bg-gray-50
                    `}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <item.icon className="h-5 w-5 text-gray-600 group-data-[active=true]:text-orange-700" />
                      <span className="font-semibold text-gray-700 data-[active=true]:text-gray-900">
                        {item.label}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </Link>
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
            </DropdownMenuContent>
          </DropdownMenu>
        ) : !isAdmin ? (
          <>
            {/* Usage stats for free users */}
            {isFreeUser && (
              <div className="p-5 rounded-2xl bg-gradient-to-br from-green-50/80 via-white to-orange-50/30 border border-green-200/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl resumaic-gradient-green shadow-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">Free Plan Usage</p>
                    <p className="text-xs text-gray-500">Upgrade to Pro for unlimited access</p>
                  </div>
                </div>
                
                {/* Resume usage */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        Resumes created
                      </span>
                      {loading ? (
                        <div className="h-4 w-10 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <span className={`text-sm font-bold ${resumeCount >= maxResumes ? 'text-red-500' : 'text-gray-700'}`}>
                          {resumeCount}/{maxResumes}
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200/80 rounded-full h-2 shadow-inner">
                      {loading ? (
                        <div className="h-2 rounded-full bg-gray-300 animate-pulse"></div>
                      ) : (
                        <div
                          className={`h-2 rounded-full shadow-sm transition-all duration-700 ease-out ${
                            resumeCount >= maxResumes 
                              ? 'bg-red-400' 
                              : 'resumaic-gradient-green'
                          }`}
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      )}
                    </div>
                    {resumeCount >= maxResumes && (
                      <p className="text-xs text-red-500 mt-1 font-medium">
                        Limit reached. Upgrade to Pro for more.
                      </p>
                    )}
                  </div>
                  
                  {/* Upgrade CTA */}
                  {resumeCount >= maxResumes - 1 && (
                    <Link href="/pricing" className="block">
                      <Button className="w-full resumaic-gradient-green text-white font-bold rounded-xl hover:opacity-90 transition-all">
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
            
            {/* Pro user badge */}
            {isProUser && (
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-50/50 via-white to-pink-50/20 border border-purple-100 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-md">
                    <Crown className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800 leading-none mb-0.5">
                      Pro Plan Active
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Unlimited access to all features
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
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