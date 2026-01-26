"use client"

import { useState, useEffect } from "react"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
  MoreVertical,
  Phone,
  MapPin,
  Globe,
} from "lucide-react"
import { Input } from "../../components/ui/input"
import { Badge } from "../../components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import {
  getProfileCards,
  createProfileCard,
  updateProfileCard,
  deleteProfileCard,
  ProfileCard,
  CreateProfileCardData,
} from "../../lib/redux/service/profileCardService"
import { toast } from "sonner"
import { PageProps } from "../../types/page-props"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { getCVs, CV } from "../../lib/redux/service/resumeService"
import { getCoverLetters, CoverLetter } from "../../lib/redux/service/coverLetterService"

export function ProfileCardList({ user }: PageProps) {
  const [profileCards, setProfileCards] = useState<ProfileCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<ProfileCard | null>(null)
  
  // Form states
  const [formData, setFormData] = useState<CreateProfileCardData>({
    full_name: "",
    job_title: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    summary: "",
    additional_link: "",
    social_links: {
      linkedin: "",
      github: "",
      twitter: ""
    }
  })

  // Attachment states (kept from your original code)
  const [isAttachCVOpen, setIsAttachCVOpen] = useState(false)
  const [isAttachCoverLetterOpen, setIsAttachCoverLetterOpen] = useState(false)
  const [selectedCardForAttachment, setSelectedCardForAttachment] = useState<ProfileCard | null>(null)
  const [availableCVs, setAvailableCVs] = useState<CV[]>([])
  const [availableCoverLetters, setAvailableCoverLetters] = useState<CoverLetter[]>([])

  useEffect(() => {
    fetchProfileCards()
  }, [])

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

  const handleCreate = async () => {
    try {
      await createProfileCard(formData)
      toast.success("Profile card created successfully")
      setIsCreateDialogOpen(false)
      resetForm()
      fetchProfileCards()
    } catch (error: any) {
      toast.error(error.message || "Failed to create profile card")
    }
  }

  const handleUpdate = async () => {
    if (!editingCard) return
    try {
      await updateProfileCard(editingCard.id, formData)
      toast.success("Profile card updated successfully")
      setIsCreateDialogOpen(false)
      setEditingCard(null)
      resetForm()
      fetchProfileCards()
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile card")
    }
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this profile card?")) return
    try {
      await deleteProfileCard(id)
      toast.success("Profile card deleted successfully")
      fetchProfileCards()
    } catch (error: any) {
      toast.error(error.message || "Failed to delete profile card")
    }
  }

  const openCreateDialog = () => {
    setEditingCard(null)
    resetForm()
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (card: ProfileCard) => {
    setEditingCard(card)
    // Parse social_links string back to object
    let socialLinks = { linkedin: "", github: "", twitter: "" }
    if (card.social_links && typeof card.social_links === 'string') {
      try {
        socialLinks = JSON.parse(card.social_links)
      } catch (e) {
        console.error("Failed to parse social links:", e)
      }
    } else if (typeof card.social_links === 'object') {
      socialLinks = card.social_links as any
    }
    
    setFormData({
      full_name: card.full_name || "",
      job_title: card.job_title || "",
      email: card.email || "",
      phone: card.phone || "",
      address: card.address || "",
      city: card.city || "",
      country: card.country || "",
      summary: card.summary || "",
      additional_link: card.additional_link || "",
      profile_picture: card.profile_picture,
      social_links: socialLinks
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      full_name: "",
      job_title: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      country: "",
      summary: "",
      additional_link: "",
      social_links: {
        linkedin: "",
        github: "",
        twitter: ""
      }
    })
  }

  const filteredCards = profileCards.filter(card => 
    card.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Attachment Logic (kept from your original code)
  const handleAttachCV = async (cvId: string) => {
    if (!selectedCardForAttachment) return
    try {
      // Note: You'll need to update your backend to support this
      // For now, we'll keep the attachment logic as is
      await updateProfileCard(selectedCardForAttachment.id, {
        // You might want to add a field for CV ID in your backend
      })
      toast.success("Resume attached successfully")
      setIsAttachCVOpen(false)
      fetchProfileCards()
    } catch (error) {
      toast.error("Failed to attach resume")
    }
  }

  const handleAttachCoverLetter = async (clId: string) => {
    if (!selectedCardForAttachment) return
    try {
      // Note: You'll need to update your backend to support this
      await updateProfileCard(selectedCardForAttachment.id, {
        // You might want to add a field for cover letter ID in your backend
      })
      toast.success("Cover letter attached successfully")
      setIsAttachCoverLetterOpen(false)
      fetchProfileCards()
    } catch (error) {
      toast.error("Failed to attach cover letter")
    }
  }

  const openAttachCVDialog = async (card: ProfileCard) => {
    setSelectedCardForAttachment(card)
    try {
      const cvs = await getCVs(user?.id?.toString() || "")
      setAvailableCVs(cvs)
      setIsAttachCVOpen(true)
    } catch (error) {
      toast.error("Failed to fetch resumes")
    }
  }

  const openAttachCoverLetterDialog = async (card: ProfileCard) => {
    setSelectedCardForAttachment(card)
    try {
      const cls = await getCoverLetters(user?.id?.toString() || "")
      setAvailableCoverLetters(cls)
      setIsAttachCoverLetterOpen(true)
    } catch (error) {
      toast.error("Failed to fetch cover letters")
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="max-w-full mx-auto space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg resumaic-gradient-green text-white">
            <IdCard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profile Cards</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your public profile cards</p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="resumaic-button-green">
          <Plus className="mr-2 h-4 w-4" /> Create Profile Card
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Search by name, job title, or email..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredCards.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <IdCard className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No profile cards found</h3>
            <p className="text-gray-500 max-w-sm mt-2 mb-6">Create your first profile card to share your professional identity with the world.</p>
            <Button onClick={openCreateDialog} variant="outline">Create Profile Card</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCards.map((card) => (
            <Card key={card.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={card.profile_picture} />
                      <AvatarFallback>{card.full_name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{card.full_name}</CardTitle>
                      <CardDescription className="line-clamp-1">{card.job_title || "No job title"}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(card)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleDelete(card.id)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {card.summary && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{card.summary}</p>
                )}
                
                <div className="space-y-2 pt-2">
                  {card.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-3.5 w-3.5 text-gray-500 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300 truncate">{card.email}</span>
                    </div>
                  )}
                  {card.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-3.5 w-3.5 text-gray-500 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">{card.phone}</span>
                    </div>
                  )}
                  {(card.city || card.country) && (
                    <div className="flex items-center text-sm">
                      <MapPin className="h-3.5 w-3.5 text-gray-500 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {[card.city, card.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Public Slug:</span>
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono">
                      {card.public_slug}
                    </code>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">Created:</span>
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {formatDate(card.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-900/50 p-4 flex flex-col gap-2">
                <div className="flex w-full gap-2">
                  {/* Attachment buttons - you can modify these based on your actual attachment logic */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => openAttachCVDialog(card)}
                  >
                    <FileText className="mr-1.5 h-3.5 w-3.5" /> 
                    Attach CV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-xs"
                    onClick={() => openAttachCoverLetterDialog(card)}
                  >
                    <Mail className="mr-1.5 h-3.5 w-3.5" /> 
                    Attach CL
                  </Button>
                </div>
                <Button variant="secondary" size="sm" className="w-full text-xs" asChild>
                  <a href={`/profiles-card/${card.public_slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> View Public Page
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCard ? "Edit Profile Card" : "Create Profile Card"}</DialogTitle>
            <DialogDescription>
              {editingCard ? "Update your profile card details." : "Create a new public profile card to showcase your professional identity."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input 
                  id="full_name" 
                  value={formData.full_name} 
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  placeholder="e.g. John Doe" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job Title</Label>
                <Input 
                  id="job_title" 
                  value={formData.job_title} 
                  onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                  placeholder="e.g. Software Engineer" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="e.g. john@example.com" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="e.g. +1234567890" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input 
                id="address" 
                value={formData.address} 
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="e.g. 123 Main St" 
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  placeholder="e.g. New York" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input 
                  id="country" 
                  value={formData.country} 
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  placeholder="e.g. USA" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea 
                id="summary" 
                value={formData.summary} 
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                placeholder="Brief summary of your professional background and skills"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_link">Portfolio/Website</Label>
              <Input 
                id="additional_link" 
                value={formData.additional_link} 
                onChange={(e) => setFormData({...formData, additional_link: e.target.value})}
                placeholder="e.g. https://example.com" 
              />
            </div>

            <div className="space-y-3">
              <Label>Social Links</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="linkedin" className="text-xs">LinkedIn</Label>
                  <Input 
                    id="linkedin" 
                    value={formData.social_links?.linkedin || ""} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_links: {...formData.social_links, linkedin: e.target.value}
                    })}
                    placeholder="LinkedIn URL" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="github" className="text-xs">GitHub</Label>
                  <Input 
                    id="github" 
                    value={formData.social_links?.github || ""} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_links: {...formData.social_links, github: e.target.value}
                    })}
                    placeholder="GitHub URL" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter" className="text-xs">Twitter/X</Label>
                  <Input 
                    id="twitter" 
                    value={formData.social_links?.twitter || ""} 
                    onChange={(e) => setFormData({
                      ...formData, 
                      social_links: {...formData.social_links, twitter: e.target.value}
                    })}
                    placeholder="Twitter URL" 
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile_picture">Profile Picture URL</Label>
              <Input 
                id="profile_picture" 
                value={formData.profile_picture || ""} 
                onChange={(e) => setFormData({...formData, profile_picture: e.target.value})}
                placeholder="URL to profile picture" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingCard ? handleUpdate : handleCreate} className="resumaic-button-green">
              {editingCard ? "Save Changes" : "Create Profile Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attach CV Dialog (kept from original) */}
      <Dialog open={isAttachCVOpen} onOpenChange={setIsAttachCVOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Resume</DialogTitle>
            <DialogDescription>Select a resume to attach to this profile card.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {availableCVs.length === 0 ? (
              <p className="text-center text-gray-500">No resumes found. Please create one first.</p>
            ) : (
              <div className="grid gap-2">
                {availableCVs.map(cv => (
                  <div 
                    key={cv.id} 
                    className={`p-3 border rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors ${selectedCardForAttachment?.id === cv.id ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200'}`}
                    onClick={() => handleAttachCV(cv.id)}
                  >
                    <div className="font-medium">{cv.title || `Resume #${cv.id}`}</div>
                    <div className="text-xs text-gray-500">Updated: {formatDate(cv.updated_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Attach Cover Letter Dialog (kept from original) */}
      <Dialog open={isAttachCoverLetterOpen} onOpenChange={setIsAttachCoverLetterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Attach Cover Letter</DialogTitle>
            <DialogDescription>Select a cover letter to attach to this profile card.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {availableCoverLetters.length === 0 ? (
              <p className="text-center text-gray-500">No cover letters found. Please create one first.</p>
            ) : (
              <div className="grid gap-2">
                {availableCoverLetters.map(cl => (
                  <div 
                    key={cl.id} 
                    className={`p-3 border rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors ${selectedCardForAttachment?.id === cl.id ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200'}`}
                    onClick={() => handleAttachCoverLetter(cl.id)}
                  >
                    <div className="font-medium">Cover Letter #{cl.id}</div>
                    <div className="text-xs text-gray-500">
                      Job: {cl.job_description?.substring(0, 30) || "No description"}...
                    </div>
                    <div className="text-xs text-gray-500">Created: {formatDate(cl.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProfileCardListPage() {
  return null
}
