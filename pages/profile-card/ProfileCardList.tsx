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
import { Switch } from "../../components/ui/switch"
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
    slug: "",
    display_name: "",
    headline: "",
    bio: "",
    is_listed: true,
  })

  // Attachment states
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
    setFormData({
      slug: card.slug,
      display_name: card.display_name,
      headline: card.headline,
      bio: card.bio,
      is_listed: card.is_listed,
      avatar_url: card.avatar_url,
    })
    setIsCreateDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      slug: "",
      display_name: "",
      headline: "",
      bio: "",
      is_listed: true,
    })
  }

  const filteredCards = profileCards.filter(card => 
    card.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.headline?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Attachment Logic
  const handleAttachCV = async (cvId: string) => {
    if (!selectedCardForAttachment) return
    try {
      await updateProfileCard(selectedCardForAttachment.id, {
        attachments: {
          ...selectedCardForAttachment.attachments,
          cv_id: cvId
        }
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
      await updateProfileCard(selectedCardForAttachment.id, {
        attachments: {
          ...selectedCardForAttachment.attachments,
          cover_letter_id: clId
        }
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
            placeholder="Search profile cards..." 
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
                      <AvatarImage src={card.avatar_url} />
                      <AvatarFallback>{card.display_name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{card.display_name}</CardTitle>
                      <CardDescription className="line-clamp-1">{card.headline || "No headline"}</CardDescription>
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
              <CardContent className="flex-1 space-y-4">
                {card.bio && <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{card.bio}</p>}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Resume:</span>
                    {card.attachments?.cv_id ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Attached</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Not attached</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Cover Letter:</span>
                     {card.attachments?.cover_letter_id ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Attached</Badge>
                    ) : (
                      <span className="text-gray-400 text-xs italic">Not attached</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500">Public Slug:</span>
                  <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{card.slug}</code>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 dark:bg-gray-900/50 p-4 flex flex-col gap-2">
                 <div className="flex w-full gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => openAttachCVDialog(card)}
                    >
                      <FileText className="mr-1.5 h-3.5 w-3.5" /> 
                      {card.attachments?.cv_id ? "Change CV" : "Attach CV"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => openAttachCoverLetterDialog(card)}
                    >
                      <Mail className="mr-1.5 h-3.5 w-3.5" /> 
                      {card.attachments?.cover_letter_id ? "Change CL" : "Attach CL"}
                    </Button>
                 </div>
                 <Button variant="secondary" size="sm" className="w-full text-xs" asChild>
                    <a href={`/cv-card/${card.slug}`} target="_blank" rel="noopener noreferrer">
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCard ? "Edit Profile Card" : "Create Profile Card"}</DialogTitle>
            <DialogDescription>
              {editingCard ? "Update your profile card details." : "Create a new public profile card to showcase your professional identity."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input 
                id="display_name" 
                value={formData.display_name} 
                onChange={(e) => {
                  setFormData({...formData, display_name: e.target.value})
                  if (!editingCard && !formData.slug) {
                     setFormData(prev => ({...prev, display_name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}))
                  }
                }}
                placeholder="e.g. John Doe" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Public Slug (URL)</Label>
              <Input 
                id="slug" 
                value={formData.slug} 
                onChange={(e) => setFormData({...formData, slug: e.target.value})}
                placeholder="e.g. john-doe-developer" 
              />
              <p className="text-xs text-gray-500">Your profile will be available at /cv-card/{formData.slug || '...'}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="headline">Headline</Label>
              <Input 
                id="headline" 
                value={formData.headline} 
                onChange={(e) => setFormData({...formData, headline: e.target.value})}
                placeholder="e.g. Senior Software Engineer" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input 
                id="bio" 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                placeholder="Short bio about yourself" 
              />
            </div>
             <div className="flex items-center space-x-2">
              <Switch 
                id="is_listed" 
                checked={formData.is_listed}
                onCheckedChange={(checked) => setFormData({...formData, is_listed: checked})}
              />
              <Label htmlFor="is_listed">List publicly</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={editingCard ? handleUpdate : handleCreate} className="resumaic-button-green">
              {editingCard ? "Save Changes" : "Create Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attach CV Dialog */}
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
                    className={`p-3 border rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors ${selectedCardForAttachment?.attachments?.cv_id == cv.id ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200'}`}
                    onClick={() => handleAttachCV(cv.id)}
                   >
                     <div className="font-medium">{cv.title}</div>
                     <div className="text-xs text-gray-500">Updated: {new Date(cv.updated_at).toLocaleDateString()}</div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Attach Cover Letter Dialog */}
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
                    className={`p-3 border rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors ${selectedCardForAttachment?.attachments?.cover_letter_id == cl.id ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200'}`}
                    onClick={() => handleAttachCoverLetter(cl.id)}
                   >
                     <div className="font-medium">Cover Letter #{cl.id}</div>
                     <div className="text-xs text-gray-500">Job: {cl.job_description?.substring(0, 30)}...</div>
                     <div className="text-xs text-gray-500">Created: {new Date(cl.created_at).toLocaleDateString()}</div>
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
