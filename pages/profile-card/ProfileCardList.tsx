"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  IdCard,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  Paperclip,
  Grid,
  List,
  Sparkles,
  Crown,
  UserCircle,
  Users,
  Award,
  Target,
  TrendingUp
} from "lucide-react"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"

import { getAllPersonas, getPersonas, PersonaResponse } from "../../lib/redux/service/pasonaService"
import { getAllCVs, getCVs, CV } from "../../lib/redux/service/resumeService"
import { Select as UISelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import Select from "react-select"
import { useTheme } from "next-themes"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import {
  getProfileCards,
  deleteProfileCard,
  ProfileCard,
} from "../../lib/redux/service/profileCardService"
import { toast } from "sonner"
import { PageProps } from "../../types/page-props"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { ConfirmDialog } from "../../components/ui/ConfirmDialog"
import { CheckCircle2 } from "lucide-react"

export function ProfileCardList({ user }: PageProps) {
  const router = useRouter()
  const [profileCards, setProfileCards] = useState<ProfileCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [viewingAttachments, setViewingAttachments] = useState<ProfileCard | null>(null)
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  // Create Dialog State
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [personas, setPersonas] = useState<PersonaResponse[]>([])
  const [cvs, setCvs] = useState<CV[]>([])
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>("")
  const [selectedResumeId, setSelectedResumeId] = useState<string>("")
  const [creationMode, setCreationMode] = useState<"manual" | "persona" | "resume" | null>(null)
  const [isPersonasLoading, setIsPersonasLoading] = useState(false)
  const [isCvsLoading, setIsCvsLoading] = useState(false)

  useEffect(() => {
    fetchProfileCards()
  }, [])

  useEffect(() => {
    if (isCreateDialogOpen) {
      if (personas.length === 0) fetchPersonas()
      if (cvs.length === 0) fetchCvs()
    }
  }, [isCreateDialogOpen])

  const fetchPersonas = async () => {
     try {
       setIsPersonasLoading(true)
       const isAdmin = user?.role?.toLowerCase() === 'admin'
       const userId = user?.id?.toString() || ""
       const data = isAdmin ? await getAllPersonas() : await getPersonas(userId)
       setPersonas(data)
     } catch (error) {
       console.error("Failed to fetch personas:", error)
       toast.error("Failed to load personas")
     } finally {
       setIsPersonasLoading(false)
     }
   }

   const fetchCvs = async () => {
    try {
      setIsCvsLoading(true)
      const isAdmin = user?.role?.toLowerCase() === 'admin'
      const userId = user?.id?.toString() || ""
      const data = isAdmin ? await getAllCVs() : await getCVs(userId)
      setCvs(data)
    } catch (error) {
      console.error("Failed to fetch CVs:", error)
      toast.error("Failed to load resumes")
    } finally {
      setIsCvsLoading(false)
    }
  }

  const fetchProfileCards = async () => {
    try {
      setIsLoading(true)
      const data = await getProfileCards()
      setProfileCards(data)
    } catch (error) {
      console.error("Failed to fetch profile cards:", error)
      toast.error("Failed to fetch profile cards")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string | number) => {
    try {
      await deleteProfileCard(id)
      toast.success("Profile card deleted successfully")
      fetchProfileCards()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete profile card")
    }
  }

  const handleCreateCard = () => {
    if (creationMode === 'manual') {
      router.push('/dashboard/create-profile')
      setIsCreateDialogOpen(false)
    } else if (creationMode === 'persona' && selectedPersonaId) {
      router.push(`/dashboard/create-profile?personaId=${selectedPersonaId}`)
      setIsCreateDialogOpen(false)
    } else if (creationMode === 'resume' && selectedResumeId) {
      router.push(`/dashboard/create-profile?resumeId=${selectedResumeId}`)
      setIsCreateDialogOpen(false)
    }
  }

  const navigateToCreate = () => {
    setIsCreateDialogOpen(true)
    setCreationMode(null)
    setSelectedPersonaId("")
    setSelectedResumeId("")
  }

  const navigateToEdit = (cardId: string | number) => {
    router.push(`/dashboard/create-profile?id=${cardId}`)
  }

  const filteredCards = profileCards.filter(card => 
    card.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading && profileCards.length === 0) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-white dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        {/* Left Section */}
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-3 text-center sm:text-left">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white mb-2 sm:mb-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
              My Profile Cards
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base mt-1 sm:mt-0">
              View and manage your professional profile cards
            </p>
          </div>
        </div>

        {/* Button Section */}
        <div className="flex justify-center sm:justify-end">
          <Button
            className="resumaic-gradient-green hover:opacity-90 hover-lift button-press dark:text-gray-100"
            onClick={navigateToCreate}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Profile Card
          </Button>
        </div>
      </div>

      {profileCards.length > 0 && (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                {/* Title section - always full width */}
                <div className="w-full">
                  <h3 className="text-lg font-semibold">
                    Your Profile Cards ({filteredCards.length})
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    View and manage your professional profile cards
                  </p>
                </div>

                {/* Controls section - improved mobile layout */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full">
                  <div className="relative flex-1 min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                    <Input
                      placeholder="Search profile cards by name, job title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full"
                    />
                  </div>

                  {/* View mode controls - hidden on mobile/tablet, visible on lg screens */}
                  <div className="hidden lg:flex gap-2 flex-shrink-0">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table view - only visible on large screens */}
          {viewMode === "table" ? (
            <Card className="hidden lg:block">
              <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Profile</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right pr-5">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCards.map((card) => {
                      const socialLinks = typeof card.social_links === 'string' 
                        ? JSON.parse(card.social_links) 
                        : card.social_links
                      const linksCount = socialLinks?.custom_links?.length || 0

                      return (
                        <TableRow key={card.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-400 transition-colors">
                                {card.profile_picture && (
                                  <AvatarImage
                                    src={card.profile_picture}
                                    alt="Profile"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                                    }}
                                  />
                                )}
                                <AvatarFallback
                                  className="bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8] font-semibold"
                                >
                                  {user?.role === "admin" ? (
                                    <Crown className="h-5 w-5 text-[#EA580C]" />
                                  ) : user?.name ? (
                                    user.name.charAt(0).toUpperCase()
                                  ) : (
                                    <UserCircle className="h-5 w-5 text-[#70E4A8]" />
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{card.full_name}</div>
                                {linksCount > 0 && (
                                  <Badge variant="outline" className="mt-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300">
                                    {linksCount} attachment{linksCount !== 1 ? 's' : ''}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {card.job_title || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {card.email && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">{card.email}</div>
                              )}
                              {card.phone && (
                                <div className="text-sm text-gray-600 dark:text-gray-400">{card.phone}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {[card.city, card.country].filter(Boolean).join(', ') || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(card.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 justify-end">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/profiles-card/${card.public_slug}`)} 
                                className="cursor-pointer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigateToEdit(card.id)} 
                                className="cursor-pointer"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <ConfirmDialog
                                title="Delete Profile Card"
                                description={`Are you sure you want to delete the profile card for ${card.full_name}? This action is irreversible and cannot be undone.`}
                                confirmText="Delete"
                                cancelText="Cancel"
                                onConfirm={() => handleDelete(card.id)}
                                trigger={
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                }
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : null}

          {/* Grid/Card view - always visible on mobile/tablet, conditionally visible on lg screens */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${viewMode === "table" ? "lg:hidden" : ""}`}>
            {filteredCards.map((card) => {
              const socialLinks = typeof card.social_links === 'string' 
                ? JSON.parse(card.social_links) 
                : card.social_links
              const linksCount = socialLinks?.custom_links?.length || 0

              return (
                <Card
                  key={card.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-400 transition-colors">
                          {card.profile_picture && (
                            <AvatarImage
                              src={card.profile_picture}
                              alt="Profile"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/placeholder.jpg";
                              }}
                            />
                          )}
                          <AvatarFallback
                            className="bg-[#70E4A8]/20 hover:opacity-90 button-press text-[#70E4A8] font-semibold"
                          >
                            {user?.role === "admin" ? (
                              <Crown className="h-5 w-5 text-[#EA580C]" />
                            ) : user?.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <UserCircle className="h-5 w-5 text-[#70E4A8]" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-lg">{card.full_name}</CardTitle>
                            {linksCount > 0 && (
                              <Badge
                                variant="outline"
                                className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-900/20 dark:text-emerald-300"
                              >
                                {linksCount} attachment{linksCount !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="mt-1">{card.job_title || 'No job title'}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {card.summary && (
                        <div>
                          <Label className="text-sm font-medium">Summary</Label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {card.summary}
                          </p>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        {card.email && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-3.5 w-3.5 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300 truncate">{card.email}</span>
                          </div>
                        )}
                        {card.phone && (
                          <div className="flex items-center text-sm">
                            <Phone className="h-3.5 w-3.5 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{card.phone}</span>
                          </div>
                        )}
                        {(card.city || card.country) && (
                          <div className="flex items-center text-sm">
                            <MapPin className="h-3.5 w-3.5 text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">
                              {[card.city, card.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center justify-between mb-1">
                          <span>Public Slug:</span>
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {card.public_slug.substring(0, 10)}...
                          </code>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Created:</span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {formatDate(card.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Attachments Button */}
                      {linksCount > 0 && (
                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                            onClick={() => setViewingAttachments(card)}
                          >
                            <Paperclip className="mr-2 h-3.5 w-3.5" /> 
                            View Attachments ({linksCount})
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2 items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/profiles-card/${card.public_slug}`)}
                          className="bg-transparent p-2 flex-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToEdit(card.id)}
                          className="bg-transparent p-2 flex-1"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <ConfirmDialog
                          title="Delete Profile Card"
                          description={`Are you sure you want to delete the profile card for ${card.full_name}? This action is irreversible and cannot be undone.`}
                          confirmText="Delete"
                          cancelText="Cancel"
                          onConfirm={() => handleDelete(card.id)}
                          trigger={
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent p-2 flex-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Empty State - Search Results */}
      {filteredCards.length === 0 && profileCards.length > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-900 p-6 mb-4">
              <Search className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No profile cards found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search terms or create a new profile card
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Clear Search
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State - No Cards */}
      {profileCards.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-900 p-6 mb-4">
              <IdCard className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No profile cards created yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create your first professional profile card by clicking the "Create Profile Card" button above
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quick Tips */}
      <Card className="animate-slide-up-delay-3 hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-rubik text-[#2D3639] dark:text-gray-100">
            <div className="p-2 bg-gradient-to-br from-[#70E4A8] to-[#EA580C] rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Profile Card Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tip 1 */}
            <div
              className="flex items-start gap-4 animate-fade-in-stagger"
              style={{ animationDelay: "100ms" }}
            >
              <div
                className="rounded-full bg-[#70E4A8]/20 p-3 animate-float"
                style={{ animationDelay: "0s" }}
              >
                <Target className="h-5 w-5 text-[#70E4A8]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] dark:text-gray-100 font-rubik">
                  Professional Image
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-inter">
                  Use a clear, professional profile picture
                </p>
              </div>
            </div>

            {/* Tip 2 */}
            <div
              className="flex items-start gap-4 animate-fade-in-stagger"
              style={{ animationDelay: "200ms" }}
            >
              <div
                className="rounded-full bg-[#EA580C]/20 p-3 animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <Award className="h-5 w-5 text-[#EA580C]" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] dark:text-gray-100 font-rubik">
                  Attach Resources
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-inter">
                  Link your resumes and cover letters for easy sharing
                </p>
              </div>
            </div>

            {/* Tip 3 */}
            <div
              className="flex items-start gap-4 animate-fade-in-stagger"
              style={{ animationDelay: "300ms" }}
            >
              <div
                className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-3 animate-float"
                style={{ animationDelay: "1s" }}
              >
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-[#2D3639] dark:text-gray-100 font-rubik">
                  Complete Profile
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-inter">
                  Fill all fields to create a comprehensive professional profile
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
       <DialogContent
              className="w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] !max-w-none max-h-[90vh] overflow-x-auto custom-scrollbar dark:border-0 dark:p-[1px] dark:overflow-hidden dark:bg-transparent">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold dark:text-gray-100">Create Profile Card</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Choose how you want to create your profile card.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
             {/* Manual Card */}
             <Card 
                className={`cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all group relative overflow-hidden border-2 ${creationMode === 'manual' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'dark:border-gray-800'}`}
                onClick={() => setCreationMode('manual')}
             >
                <div className={`absolute top-0 right-0 p-4 transition-opacity ${creationMode === 'manual' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Edit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Fill Manually</CardTitle>
                  <CardDescription className="mt-2 text-xs">
                    Start from scratch.
                  </CardDescription>
                </CardHeader>
             </Card>

             {/* Use Persona Card */}
             <Card 
                className={`cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all group relative overflow-hidden border-2 ${creationMode === 'persona' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'dark:border-gray-800'}`}
                onClick={() => setCreationMode('persona')}
             >
                <div className={`absolute top-0 right-0 p-4 transition-opacity ${creationMode === 'persona' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UserCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle>Use Persona</CardTitle>
                  <CardDescription className="mt-2 text-xs">
                    Import from Persona.
                  </CardDescription>
                </CardHeader>
             </Card>

             {/* Use Resume Card */}
             <Card 
                className={`cursor-pointer hover:border-emerald-500 hover:shadow-lg transition-all group relative overflow-hidden border-2 ${creationMode === 'resume' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'dark:border-gray-800'}`}
                onClick={() => setCreationMode('resume')}
             >
                <div className={`absolute top-0 right-0 p-4 transition-opacity ${creationMode === 'resume' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <CardTitle>Use Resume</CardTitle>
                  <CardDescription className="mt-2 text-xs">
                    Import from Resume.
                  </CardDescription>
                </CardHeader>
             </Card>
          </div>

          {creationMode === 'persona' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 mx-auto text-center">
                <Label>Select Persona</Label>
                <div className="text-left w-full">
                  <Select
                    options={personas.map((p) => ({
                      value: p.id.toString(),
                      label: `${p.full_name} (${p.job_title})`,
                    }))}
                    value={
                      personas
                        .map((p) => ({
                          value: p.id.toString(),
                          label: `${p.full_name} (${p.job_title})`,
                        }))
                        .find((option) => option.value === selectedPersonaId) || null
                    }
                    onChange={(option) => {
                      if (option) {
                        setSelectedPersonaId(option.value);
                      }
                    }}
                    isLoading={isPersonasLoading}
                    isSearchable
                    placeholder="Search or select persona..."
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: 40,
                        borderRadius: 6,
                        borderColor: isDark ? "#374151" : "#d1d5db",
                        backgroundColor: isDark ? "#0b1220" : "white",
                        boxShadow: state.isFocused
                          ? isDark
                            ? "0 0 0 1px rgba(112, 228, 168, 0.6)"
                            : base.boxShadow
                          : base.boxShadow,
                        paddingLeft: 4,
                        paddingRight: 4,
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: 6,
                        marginTop: 4,
                        border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                        backgroundColor: isDark ? "#0b1220" : "white",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                        zIndex: 9999,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? isDark
                            ? "rgba(112, 228, 168, 0.25)"
                            : "#eff6ff"
                          : state.isFocused
                            ? isDark
                              ? "#111827"
                              : "#f3f4f6"
                            : isDark
                              ? "#0b1220"
                              : "white",
                        color: isDark ? "#e5e7eb" : "#1f2937",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: isDark ? "#e5e7eb" : "#111827",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: isDark ? "#9ca3af" : "#6b7280",
                      }),
                      input: (base) => ({
                        ...base,
                        color: isDark ? "#e5e7eb" : "#111827",
                      }),
                    }}
                  />
                </div>
            </div>
          )}

          {creationMode === 'resume' && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 max-w-md mx-auto text-center">
                <Label>Select Resume</Label>
                <div className="text-left">
                  <Select
                    options={cvs.map((c) => ({
                      value: c.id.toString(),
                      label: c.title,
                    }))}
                    value={
                      cvs
                        .map((c) => ({
                          value: c.id.toString(),
                          label: c.title,
                        }))
                        .find((option) => option.value === selectedResumeId) || null
                    }
                    onChange={(option) => {
                      if (option) {
                        setSelectedResumeId(option.value);
                      }
                    }}
                    isLoading={isCvsLoading}
                    isSearchable
                    placeholder="Search or select resume..."
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        minHeight: 40,
                        borderRadius: 6,
                        borderColor: isDark ? "#374151" : "#d1d5db",
                        backgroundColor: isDark ? "#0b1220" : "white",
                        boxShadow: state.isFocused
                          ? isDark
                            ? "0 0 0 1px rgba(112, 228, 168, 0.6)"
                            : base.boxShadow
                          : base.boxShadow,
                        paddingLeft: 4,
                        paddingRight: 4,
                      }),
                      menu: (base) => ({
                        ...base,
                        borderRadius: 6,
                        marginTop: 4,
                        border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                        backgroundColor: isDark ? "#0b1220" : "white",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                        zIndex: 9999,
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? isDark
                            ? "rgba(112, 228, 168, 0.25)"
                            : "#eff6ff"
                          : state.isFocused
                            ? isDark
                              ? "#111827"
                              : "#f3f4f6"
                            : isDark
                              ? "#0b1220"
                              : "white",
                        color: isDark ? "#e5e7eb" : "#1f2937",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        color: isDark ? "#e5e7eb" : "#111827",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: isDark ? "#9ca3af" : "#6b7280",
                      }),
                      input: (base) => ({
                        ...base,
                        color: isDark ? "#e5e7eb" : "#111827",
                      }),
                    }}
                  />
                </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button 
                onClick={handleCreateCard} 
                disabled={!creationMode || (creationMode === 'persona' && !selectedPersonaId) || (creationMode === 'resume' && !selectedResumeId)}
                className="resumaic-gradient-green text-white"
            >
                Create Card
            </Button>
          </div>
        </DialogContent>
      </Dialog>


      {/* View Attachments Dialog */}
      <Dialog open={!!viewingAttachments} onOpenChange={(open) => !open && setViewingAttachments(null)}>
        <DialogContent className="w-[95vw] sm:max-w-md p-0 overflow-hidden border-0 shadow-xl rounded-xl dark:border-0 dark:p-[1px] dark:overflow-hidden dark:bg-transparent">
          <div className="hidden dark:block absolute inset-0 gradient-border-moving -z-10" />
          <div className="dark:bg-[#0B0F1A] dark:rounded-2xl p-0 overflow-hidden">
            <div className="relative resumaic-gradient-green p-6 text-white rounded-t-xl animate-pulse-glow">
              <div className="absolute inset-x-0 top-0 h-0.5 shimmer-effect opacity-70" />
              <div className="flex items-center gap-3">
                <Paperclip className="h-6 w-6" />
                <DialogTitle className="text-lg font-semibold">Attachments</DialogTitle>
              </div>
              <DialogDescription className="mt-2 text-sm opacity-90">
                Links attached to {viewingAttachments?.full_name}'s profile card.
              </DialogDescription>
              <div className="absolute -right-10 -top-10 w-32 h-32 resumaic-gradient-orange rounded-full blur-2xl opacity-30" />
            </div>
            <div className="p-6 space-y-3">
              {(() => {
                if (!viewingAttachments) return null
                let links: any[] = []
                try {
                  const social = typeof viewingAttachments.social_links === 'string' 
                    ? JSON.parse(viewingAttachments.social_links) 
                    : viewingAttachments.social_links
                  links = social?.custom_links || []
                } catch (e) {}

                if (links.length === 0) return (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Paperclip className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-center text-gray-500 dark:text-gray-400">No attachments found.</p>
                  </div>
                )

                return links.map((link: any, i: number) => (
                  <a 
                    key={i} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all group overflow-hidden w-full"
                  >
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-105 transition-transform">
                      {link.type === 'cv' && <FileText className="h-5 w-5 text-blue-500" />}
                      {link.type === 'cover_letter' && <Mail className="h-5 w-5 text-green-500" />}
                      {link.type === 'custom' && <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-emerald-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400" title={link.title}>
                        {link.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate group-hover:text-emerald-600/70 dark:group-hover:text-emerald-400/70">
                        {link.type === 'cv' ? 'Resume' : link.type === 'cover_letter' ? 'Cover Letter' : 'External Link'}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ))
              })()}
            </div>
            <div className="p-6 pt-0 border-t dark:border-gray-800">
              <Button 
                variant="outline" 
                onClick={() => setViewingAttachments(null)} 
                className="w-full dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProfileCardListPage() {
  return null
}
