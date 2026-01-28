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
  Paperclip,
  X
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
import {
  getAllCVs,
  getCVs,
  CV
} from "../../lib/redux/service/resumeService"
import {
  getAllCoverLetters,
  getCoverLetters,
  CoverLetter
} from "../../lib/redux/service/coverLetterService"

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

  const [availableCVs, setAvailableCVs] = useState<CV[]>([])
  const [availableCoverLetters, setAvailableCoverLetters] = useState<CoverLetter[]>([])

  const [customLinkTitle, setCustomLinkTitle] = useState("")
  const [customLinkUrl, setCustomLinkUrl] = useState("")
  
  const [viewingAttachments, setViewingAttachments] = useState<ProfileCard | null>(null)

  useEffect(() => {
    fetchProfileCards()
  }, [])

  const addCustomLink = () => {
    if (!customLinkTitle || !customLinkUrl) return
    const newLink = {
      id: Date.now().toString(),
      type: 'custom',
      title: customLinkTitle,
      url: customLinkUrl
    } as const
    const currentLinks = formData.social_links?.custom_links || []
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        custom_links: [...currentLinks, newLink]
      }
    })
    setCustomLinkTitle("")
    setCustomLinkUrl("")
  }

  const removeLink = (index: number) => {
    const currentLinks = formData.social_links?.custom_links || []
    const newLinks = [...currentLinks]
    newLinks.splice(index, 1)
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        custom_links: newLinks
      }
    })
  }
  
  const addResourceLink = (type: 'cv' | 'cover_letter', item: CV | CoverLetter) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    let url = ''
    let title = ''
    
    if (type === 'cv') {
      const cv = item as CV
      url = `${origin}/cv-card/${cv.public_slug}`
      title = cv.title || `Resume #${cv.id}`
    } else {
      const cl = item as CoverLetter
      url = `${origin}/cover-letter/${cl.public_slug}`
      title = `Cover Letter for ${cl.job_description?.substring(0, 20)}...`
    }

    const newLink = {
      id: Date.now().toString(),
      type,
      title,
      url
    } as const

    const currentLinks = formData.social_links?.custom_links || []
    setFormData({
      ...formData,
      social_links: {
        ...formData.social_links,
        custom_links: [...currentLinks, newLink]
      }
    })
    
    toast.success(`${type === 'cv' ? 'Resume' : 'Cover Letter'} attached`)
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

  const openCreateDialog = async () => {
    setEditingCard(null)
    resetForm()
    
    // Fetch available resources
    try {
      const isAdmin = user?.role?.toLowerCase() === 'admin'
      const [cvs, cls] = await Promise.all([
        isAdmin ? getAllCVs() : getCVs(user?.id?.toString() || ""),
        isAdmin ? getAllCoverLetters() : getCoverLetters(user?.id?.toString() || "")
      ])
      setAvailableCVs(cvs)
      setAvailableCoverLetters(cls)
    } catch (error) {
      console.error("Failed to fetch resources:", error)
    }

    setIsCreateDialogOpen(true)
  }

  const openEditDialog = async (card: ProfileCard) => {
    setEditingCard(card)
    // Parse social_links string back to object
    let socialLinks: any = { linkedin: "", github: "", twitter: "", custom_links: [] }
    if (card.social_links && typeof card.social_links === 'string') {
      try {
        socialLinks = JSON.parse(card.social_links)
      } catch (e) {
        console.error("Failed to parse social links:", e)
      }
    } else if (typeof card.social_links === 'object') {
      socialLinks = card.social_links
    }
    
    // Ensure custom_links exists
    if (!socialLinks.custom_links) {
      socialLinks.custom_links = []
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
    
    // Fetch available resources
    try {
      const isAdmin = user?.role?.toLowerCase() === 'admin'
      const [cvs, cls] = await Promise.all([
        isAdmin ? getAllCVs() : getCVs(user?.id?.toString() || ""),
        isAdmin ? getAllCoverLetters() : getCoverLetters(user?.id?.toString() || "")
      ])
      setAvailableCVs(cvs)
      setAvailableCoverLetters(cls)
    } catch (error) {
      console.error("Failed to fetch resources:", error)
    }

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
        twitter: "",
        custom_links: []
      }
    })
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

                  {/* Attachments Button */}
                  {(() => {
                    let links: any[] = []
                    try {
                      const social = typeof card.social_links === 'string' ? JSON.parse(card.social_links) : card.social_links
                      links = social?.custom_links || []
                    } catch (e) {}

                    if (links.length > 0) {
                      return (
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors"
                            onClick={() => setViewingAttachments(card)}
                          >
                            <Paperclip className="mr-2 h-3.5 w-3.5" /> 
                            View Attachments ({links.length})
                          </Button>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-900/50 p-4">
                <Button variant="secondary" size="sm" className="w-full text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 transition-colors" asChild>
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

            <div className="space-y-3 pt-2 border-t">
              <Label>Attached Links</Label>
              
              {/* List of links */}
              <div className="space-y-2">
                {formData.social_links?.custom_links?.map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {link.type === 'cv' && <FileText className="h-4 w-4 text-blue-500" />}
                      {link.type === 'cover_letter' && <Mail className="h-4 w-4 text-green-500" />}
                      {link.type === 'custom' && <ExternalLink className="h-4 w-4 text-gray-500" />}
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-medium truncate">{link.title}</span>
                        <span className="text-xs text-gray-500 truncate">{link.url}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeLink(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(!formData.social_links?.custom_links || formData.social_links.custom_links.length === 0) && (
                  <p className="text-sm text-gray-500 italic">No links attached yet.</p>
                )}
              </div>

              {/* Add Resource Buttons */}
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <FileText className="mr-2 h-4 w-4" /> Attach Resume
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {availableCVs.length === 0 ? (
                      <DropdownMenuItem disabled>No resumes found</DropdownMenuItem>
                    ) : (
                      availableCVs.map(cv => (
                        <DropdownMenuItem key={cv.id} onClick={() => addResourceLink('cv', cv)}>
                          {cv.title || `Resume #${cv.id}`}
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Mail className="mr-2 h-4 w-4" /> Attach Cover Letter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {availableCoverLetters.length === 0 ? (
                      <DropdownMenuItem disabled>No cover letters found</DropdownMenuItem>
                    ) : (
                      availableCoverLetters.map(cl => (
                        <DropdownMenuItem key={cl.id} onClick={() => addResourceLink('cover_letter', cl)}>
                          {cl.job_description?.substring(0, 20) || `CL #${cl.id}`}...
                        </DropdownMenuItem>
                      ))
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Add Custom Link */}
              <div className="flex items-end gap-2 pt-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="customLinkTitle" className="text-xs">Custom Link Title</Label>
                  <Input 
                    id="customLinkTitle"
                    value={customLinkTitle}
                    onChange={(e) => setCustomLinkTitle(e.target.value)}
                    placeholder="e.g. My Portfolio"
                    className="h-8"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="customLinkUrl" className="text-xs">URL</Label>
                  <Input 
                    id="customLinkUrl"
                    value={customLinkUrl}
                    onChange={(e) => setCustomLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="h-8"
                  />
                </div>
                <Button onClick={addCustomLink} size="sm" className="h-8 mb-[1px]" disabled={!customLinkTitle || !customLinkUrl}>
                  <Plus className="h-4 w-4" />
                </Button>
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

      {/* Attach CV Dialog (kept from original) - REMOVED */}
      {/* Attach Cover Letter Dialog (kept from original) - REMOVED */}

      {/* View Attachments Dialog */}
      <Dialog open={!!viewingAttachments} onOpenChange={(open) => !open && setViewingAttachments(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Attachments</DialogTitle>
            <DialogDescription>
              Links attached to {viewingAttachments?.full_name}'s profile card.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {(() => {
              if (!viewingAttachments) return null
              let links: any[] = []
              try {
                const social = typeof viewingAttachments.social_links === 'string' 
                  ? JSON.parse(viewingAttachments.social_links) 
                  : viewingAttachments.social_links
                links = social?.custom_links || []
              } catch (e) {}

              if (links.length === 0) return <p className="text-center text-gray-500">No attachments found.</p>

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
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingAttachments(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function ProfileCardListPage() {
  return null
}
