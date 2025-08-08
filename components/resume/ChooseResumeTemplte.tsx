"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Crown, Sparkles, FileText, Target, CheckCircle, Star, ArrowRight, Zap, Shield, Mail, Globe, Menu, X, UserCircle, Settings } from "lucide-react"
import ResumeTemplate from "./ResumeTemplate"
import { sampleCVData } from "@/lib/sample-cv-data"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks"
import { logoutUser } from "@/lib/redux/slices/authSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface CVTemplate {
  id: string
  name: string
  description: string
  category: "modern" | "classic" | "creative" | "minimal"
}

const templates: CVTemplate[] = [
  {
    id: "modern",
    name: "Modern Professional",
    description: "Clean, modern design perfect for tech and business professionals",
    category: "modern",
  },
  {
    id: "classic",
    name: "Classic Traditional",
    description: "Traditional format ideal for conservative industries",
    category: "classic",
  },
  {
    id: "creative",
    name: "Creative Designer",
    description: "Eye-catching design for creative professionals",
    category: "creative",
  },
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Simple, clean layout focusing on content",
    category: "minimal",
  },
]

const dashboardMenuItems = [
  {
    id: "create-persona",
    label: "Persona",
    icon: Sparkles,
    badge: "AI",
    href: "/dashboard?page=create-persona",
  },
  {
    id: "resumes",
    label: "Resumes",
    icon: FileText,
    href: "/dashboard?page=resumes",
  },
  {
    id: "cover-letter",
    label: "Cover Letters",
    icon: Mail,
    href: "/dashboard?page=cover-letter",
  },
  {
    id: "ats-checker",
    label: "ATS Checker",
    icon: CheckCircle,
    badge: "Pro",
    href: "/dashboard?page=ats-checker",
  },
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
    href: "/dashboard?page=profile",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    href: "/dashboard?page=settings",
  },
]

interface CVTemplatesProps {
  onTemplateSelect: (template: CVTemplate) => void
  selectedTemplate?: string
}

export function CVTemplates({ onTemplateSelect, selectedTemplate }: CVTemplatesProps) {
  const [filter, setFilter] = useState<"all" | "modern" | "classic" | "creative" | "minimal">("all")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)

  const filteredTemplates = templates.filter((template) => {
    if (filter === "all") return true
    return template.category === filter
  })

  const handleLogout = async () => {
    await dispatch(logoutUser())
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Matches home page */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <Crown className="h-4 w-4" />
              </div>
              <span className="text-xl font-bold text-gray-900">CV Builder AI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>

              {user ? (
                <>
                  {/* User Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-gray-200 hover:border-blue-300 transition-colors">
                          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                            {user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <div className="space-y-1">
                        {dashboardMenuItems.map((item) => (
                          <DropdownMenuItem key={item.id} className="cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                            <a href={item.href} className="flex items-center gap-3 w-full">
                              <div className="p-1.5 rounded-md bg-gray-100">
                                <item.icon className="h-4 w-4 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900">{item.label}</span>
                                  {item.badge && (
                                    <Badge
                                      variant={item.badge === "AI" ? "default" : "secondary"}
                                      className="text-xs px-1.5 py-0.5"
                                    >
                                      {item.badge}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </a>
                          </DropdownMenuItem>
                        ))}
                      </div>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-gray-50" onClick={handleLogout}>
                        <div className="flex items-center gap-3 w-full">
                          <div className="p-1.5 rounded-md bg-red-100">
                            <ArrowRight className="h-4 w-4 text-red-600 rotate-180" />
                          </div>
                          <span className="font-medium text-gray-900">Sign Out</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Link href="/dashboard">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Dashboard
                    </Button>
                  </Link>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/signin">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
                <Link href="#features" className="text-gray-600 hover:text-gray-900">
                  Features
                </Link>
                <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>

                {/* Mobile User Section */}
                {user && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user?.name || "User"}</p>
                        <p className="text-xs text-gray-500">{user?.email || "user@example.com"}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {dashboardMenuItems.map((item) => (
                        <Link
                          key={item.id}
                          href={item.href}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <item.icon className="h-4 w-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">{item.label}</span>
                          {item.badge && (
                            <Badge variant={item.badge === "AI" ? "default" : "secondary"} className="text-xs ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {user ? (
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent" onClick={handleLogout}>
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Link href="/auth/signin" className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/signup" className="flex-1">
                        <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Professional Templates
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Resume Template</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select from our professionally designed templates that pass ATS systems and impress recruiters
          </p>
        </div>

        {/* Template Selection */}
        <div className="space-y-6">
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            {["all", "modern", "classic", "creative", "minimal"].map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(category as any)}
                className="capitalize"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const isSelected = selectedTemplate === template.id

              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer h-full w-full transition-all duration-200 hover:shadow-lg ${
                    isSelected ? "ring-2 ring-blue-900 border-blue-900" : ""
                  }`}
                  onClick={() => onTemplateSelect(template)}
                >
                  <CardHeader className="p-4">
                    <div className="relative">
                      <div className="w-full overflow-hidden rounded-lg">
                        <div className="flex items-center justify-center">
                          <div className="h-32">
                            <ResumeTemplate
                              className="w-12 h-32"
                              scale={0.2}
                              data={sampleCVData}
                              templateId={template.id}
                              isPreview={true}
                            />
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center">
                          <div className="bg-blue-500 rounded-full p-2">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardTitle className="text-base mb-1">{template.name}</CardTitle>
                    <CardDescription className="text-sm mb-3">{template.description}</CardDescription>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="capitalize">
                        {template.category}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}