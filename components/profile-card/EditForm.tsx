import React, { useEffect, useRef, useState } from "react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar"
import {
    Camera, X, FileText, Mail, ExternalLink,
    Trash2, Plus, ArrowLeft, Check, User, GripVertical
} from "lucide-react"
import { CV } from "../../lib/redux/service/resumeService"
import { CoverLetter } from "../../lib/redux/service/coverLetterService"
import { AttachedLink } from "../../lib/redux/service/profileCardService"
import { SectionKey, EditableProfile, gradientOptions, defaultProfileImage } from "../../lib/profile-card/profile-card.shared"
import { LinkPlatformPicker } from "./LinkPlatformPicker"
import { AddLinkDialog } from "./AddLinkDialog"
import { Platform, getPlatformById, detectPlatformFromUrl } from "../../lib/profile-card/platform-data"
import { z } from "zod"

interface EditFormProps {
    sectionKey: SectionKey
    profile: EditableProfile
    draft: EditableProfile
    selectedGradient: typeof gradientOptions[0]
    availableCVs: CV[]
    availableCoverLetters: CoverLetter[]
    customLinkTitle: string
    customLinkUrl: string
    onUpdateDraft: (updates: Partial<EditableProfile>) => void
    onSave: () => void
    onCancel: () => void
    onAddCustomLink: () => void
    onRemoveLink: (index: number) => void
    onAddResourceLink: (type: "cv" | "cover_letter", item: CV | CoverLetter) => void
    onUpdateFullName: (first: string, last: string) => void
    onSelectGradient: (gradient: typeof gradientOptions[0]) => void
    onSetCustomLinkTitle: (title: string) => void
    onSetCustomLinkUrl: (url: string) => void
    onImageUpload: (file?: File) => void
}

// Zod schemas for validation
const displaySchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Username can only contain lowercase letters, numbers, and dashes"),
  job_title: z.string().optional(),
})

const bioSchema = z.object({
  summary: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

const contactSchema = z.object({
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string()
    .min(10, "Phone number must be at least 10 characters")
    .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  city: z.string().min(2, "City must be at least 2 characters").optional().or(z.literal("")),
  country: z.string().min(2, "Country must be at least 2 characters").optional().or(z.literal("")),
})

const linksSchema = z.object({
  additional_link: z.string().url("Invalid URL").optional().or(z.literal("")),
})

export function EditForm({
    sectionKey,
    profile,
    draft,
    selectedGradient,
    availableCVs,
    availableCoverLetters,
    customLinkTitle,
    customLinkUrl,
    onUpdateDraft,
    onSave,
    onCancel,
    onAddCustomLink,
    onRemoveLink,
    onAddResourceLink,
    onUpdateFullName,
    onSelectGradient,
    onSetCustomLinkTitle,
    onSetCustomLinkUrl,
    onImageUpload
}: EditFormProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [errors, setErrors] = useState<Record<string, string>>({})
    
    // New state for link management
    const [isAddingLink, setIsAddingLink] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        if (sectionKey === "display") {
            const parts = (draft.full_name || "").trim().split(" ").filter(Boolean)
            const first = parts.shift() || ""
            const last = parts.join(" ")
            setFirstName(first)
            setLastName(last)
        }
    }, [sectionKey, draft.full_name])

    // Validate on change or section switch
    useEffect(() => {
        validateSection()
    }, [sectionKey, draft, firstName, lastName])

    const validateSection = () => {
        let result
        let newErrors: Record<string, string> = {}

        if (sectionKey === "display") {
            result = displaySchema.safeParse({
                firstName,
                lastName,
                username: draft.username,
                job_title: draft.job_title
            })
        } else if (sectionKey === "bio") {
            result = bioSchema.safeParse({ summary: draft.summary })
        } else if (sectionKey === "contact") {
            result = contactSchema.safeParse({
                email: draft.email,
                phone: draft.phone,
                city: draft.city,
                country: draft.country
            })
        } else if (sectionKey === "links") {
            result = linksSchema.safeParse({ additional_link: draft.additional_link })
        }

        if (result && !result.success) {
            result.error.issues.forEach((issue) => {
                // Ensure the key is a string
                const key = String(issue.path[0]);
                newErrors[key] = issue.message
            })
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSave = () => {
        if (validateSection()) {
            onSave()
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        onImageUpload(file)
    }

    const handleRemoveImage = () => {
        onUpdateDraft({ profile_picture: defaultProfileImage })
        if (fileInputRef.current) {
            fileInputRef.current.value = ""
        }
        onImageUpload(undefined)
    }

    const handlePlatformSelect = (platform: Platform) => {
        setSelectedPlatform(platform)
        setIsDialogOpen(true)
    }

    const handleLinkConfirm = (url: string, title?: string) => {
        if (!selectedPlatform) return

        // Handle predefined social fields
        if (selectedPlatform.id === 'linkedin') {
            onUpdateDraft({ linkedin: url })
        } else if (selectedPlatform.id === 'github') {
            onUpdateDraft({ github: url })
        } else if (selectedPlatform.id === 'twitter') {
            onUpdateDraft({ twitter: url })
        } else {
            // Handle custom links
            const newLink: AttachedLink = {
                id: Date.now().toString(),
                type: 'custom',
                title: title || selectedPlatform.name,
                url: url,
                platformId: selectedPlatform.id
            }
            const currentLinks = draft.social_links?.custom_links || []
            onUpdateDraft({
                social_links: {
                    ...draft.social_links,
                    custom_links: [...currentLinks, newLink]
                }
            })
        }
        
        setIsAddingLink(false)
    }

    const handleRemoveSpecialLink = (field: 'linkedin' | 'github' | 'twitter') => {
        onUpdateDraft({ 
            [field]: "",
            social_links: { ...draft.social_links, [field]: "" }
        })
    }

    const renderDisplayForm = () => (
        <div className="space-y-5">
            <div className="space-y-4">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-800 shadow-xl">
                            <AvatarImage
                                src={draft.profile_picture || defaultProfileImage}
                                alt="Profile preview"
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
                                <User className="h-12 w-12" />
                            </AvatarFallback>
                        </Avatar>

                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-full cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}>
                            <Camera className="h-8 w-8 text-white" />
                        </div>

                        {draft.profile_picture !== defaultProfileImage && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-1 -right-1 h-7 w-7 rounded-full shadow-lg"
                                onClick={handleRemoveImage}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    <div className="text-center">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold rounded-lg border-gray-200 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change Photo
                        </Button>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 uppercase tracking-wider font-medium">
                            JPG, PNG or WebP. Max 2MB.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input
                            value={firstName}
                            onChange={(e) => {
                                const next = e.target.value
                                setFirstName(next)
                                onUpdateFullName(next, lastName)
                            }}
                            placeholder="First name"
                            className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input
                            value={lastName}
                            onChange={(e) => {
                                const next = e.target.value
                                setLastName(next)
                                onUpdateFullName(firstName, next)
                            }}
                            placeholder="Last name"
                            className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input
                        value={draft.job_title || ""}
                        onChange={(e) => onUpdateDraft({ job_title: e.target.value })}
                        placeholder="Creative Technologist"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Username</Label>
                    <Input
                        value={draft.username}
                        onChange={(e) => onUpdateDraft({ username: e.target.value })}
                        placeholder="your.handle"
                        className={errors.username ? "border-red-500" : ""}
                    />
                    {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                </div>
            </div>
        </div>
    )

    const renderBioForm = () => (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                    value={draft.summary || ""}
                    onChange={(e) => onUpdateDraft({ summary: e.target.value })}
                    rows={6}
                    placeholder="Tell people about you"
                    className={`min-h-[150px] ${errors.summary ? "border-red-500" : ""}`}
                />
                {errors.summary && <p className="text-xs text-red-500">{errors.summary}</p>}
                <p className="text-xs text-gray-500">Tip: Keep it concise and highlight your key skills and passions.</p>
            </div>
        </div>
    )

    const renderContactForm = () => (
        <div className="space-y-5">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                        value={draft.email || ""}
                        onChange={(e) => onUpdateDraft({ email: e.target.value })}
                        placeholder="you@example.com"
                        className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                        value={draft.phone || ""}
                        onChange={(e) => onUpdateDraft({ phone: e.target.value })}
                        placeholder="+1 555 000 0000"
                        className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                            value={draft.city || ""}
                            onChange={(e) => onUpdateDraft({ city: e.target.value })}
                            placeholder="City"
                            className={errors.city ? "border-red-500" : ""}
                        />
                        {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                            value={draft.country || ""}
                            onChange={(e) => onUpdateDraft({ country: e.target.value })}
                            placeholder="Country"
                            className={errors.country ? "border-red-500" : ""}
                        />
                        {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
                    </div>
                </div>
            </div>
        </div>
    )

    const renderLinksForm = () => {
        if (isAddingLink) {
            return (
                <div className="flex flex-col h-full -m-4">
                    <div className="flex-1 overflow-hidden">
                        <LinkPlatformPicker onSelect={handlePlatformSelect} />
                    </div>
                    <AddLinkDialog 
                        open={isDialogOpen} 
                        onOpenChange={setIsDialogOpen} 
                        selectedPlatform={selectedPlatform} 
                        onConfirm={handleLinkConfirm}
                    />
                </div>
            )
        }

        const activeLinks = [
            // Standard social links (from old fields, keeping for backward compatibility if data exists)
            draft.linkedin ? { id: 'linkedin', title: 'LinkedIn', url: draft.linkedin, type: 'social', platform: getPlatformById('linkedin') } : null,
            draft.github ? { id: 'github', title: 'GitHub', url: draft.github, type: 'social', platform: getPlatformById('github') } : null,
            draft.twitter ? { id: 'twitter', title: 'Twitter', url: draft.twitter, type: 'social', platform: getPlatformById('twitter') } : null,
            // Custom links
            ...(draft.social_links?.custom_links || []).map(link => ({
                ...link,
                platform: (link.platformId ? getPlatformById(link.platformId) : undefined) || detectPlatformFromUrl(link.url) || getPlatformById('custom')
            }))
        ].filter(Boolean)

        return (
            <div className="space-y-5">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Website</Label>
                        <Input
                            value={draft.additional_link || ""}
                            onChange={(e) => onUpdateDraft({ additional_link: e.target.value })}
                            placeholder="https://"
                            className={errors.additional_link ? "border-red-500" : ""}
                        />
                        {errors.additional_link && <p className="text-xs text-red-500">{errors.additional_link}</p>}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Active Links</Label>
                        </div>

                        <div className="space-y-2">
                            {activeLinks.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-xl border-gray-200 dark:border-gray-800">
                                    <p className="text-sm text-gray-500">No links added yet</p>
                                    <Button variant="link" onClick={() => setIsAddingLink(true)}>
                                        Add your first link
                                    </Button>
                                </div>
                            ) : (
                                activeLinks.map((link: any, index) => {
                                    const Icon = link.platform?.icon || ExternalLink
                                    const color = link.platform?.color || "bg-gray-500"
                                    
                                    return (
                                        <div key={link.id || index} className="flex items-center gap-3 p-3 border rounded-xl bg-white dark:bg-gray-900 shadow-sm group">
                                            <div className="cursor-grab text-gray-400 hover:text-gray-600">
                                                <GripVertical className="h-4 w-4" />
                                            </div>
                                            
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white ${color.startsWith('bg-') ? color : 'bg-gray-500'}`}>
                                                <Icon className="h-4 w-4" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{link.title}</div>
                                                <div className="text-xs text-gray-500 truncate">{link.url}</div>
                                            </div>

                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => {
                                                        if (link.type === 'social') {
                                                            handleRemoveSpecialLink(link.id)
                                                        } else {
                                                            // Find index in custom_links
                                                            const customIndex = (draft.social_links?.custom_links || []).findIndex(l => l.id === link.id)
                                                            if (customIndex !== -1) onRemoveLink(customIndex)
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <Button 
                            onClick={() => setIsAddingLink(true)} 
                            className="w-full h-12 border-2 border-dashed border-gray-200 dark:border-gray-800 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 shadow-none"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Link
                        </Button>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
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
                                    availableCVs.map((cv) => (
                                        <DropdownMenuItem key={cv.id} onClick={() => onAddResourceLink("cv", cv)}>
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
                                    availableCoverLetters.map((cl) => (
                                        <DropdownMenuItem key={cl.id} onClick={() => onAddResourceLink("cover_letter", cl)}>
                                            {cl.job_description?.substring(0, 20) || `CL #${cl.id}`}...
                                        </DropdownMenuItem>
                                    ))
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
        )
    }

    const renderAppearanceForm = () => (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label>Background Gradient</Label>
                <div className="grid grid-cols-2 gap-3">
                    {gradientOptions.map((option) => (
                        <button
                            key={option.id}
                            type="button"
                            onClick={() => onSelectGradient(option)}
                            className={`h-20 rounded-xl border ${selectedGradient.id === option.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-gray-200 dark:border-gray-800"} bg-gradient-to-b ${option.className}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    )

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-50 dark:border-gray-800">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                        onClick={isAddingLink ? () => setIsAddingLink(false) : onCancel}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {sectionKey === "display" && "Edit Display"}
                        {sectionKey === "bio" && "Edit Bio"}
                        {sectionKey === "contact" && "Edit Contact Info"}
                        {sectionKey === "links" && (isAddingLink ? "Add New Link" : "Edit Featured Links")}
                        {sectionKey === "appearance" && "Edit Appearance"}
                    </h3>
                </div>
                {!isAddingLink && (
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleSave}
                            disabled={Object.keys(errors).length > 0}
                            className={`h-8 text-xs font-medium resumaic-gradient-green text-white hover:opacity-90 shadow-md shadow-emerald-200 dark:shadow-none ${
                                Object.keys(errors).length > 0 ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Update
                        </Button>
                    </div>
                )}
            </div>

            {/* Form Content */}
            <div className="p-4 space-y-5 flex-1 overflow-y-auto">
                {sectionKey === "display" && renderDisplayForm()}
                {sectionKey === "bio" && renderBioForm()}
                {sectionKey === "contact" && renderContactForm()}
                {sectionKey === "links" && renderLinksForm()}
                {sectionKey === "appearance" && renderAppearanceForm()}
            </div>
        </div>
    )
}
