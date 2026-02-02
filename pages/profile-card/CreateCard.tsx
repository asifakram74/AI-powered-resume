import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Label } from "../../components/ui/label"
import { Switch } from "../../components/ui/switch"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../../components/ui/sheet"
import { createProfileCard, CreateProfileCardData, AttachedLink, getProfileCardById, updateProfileCard, uploadProfilePicture } from "../../lib/redux/service/profileCardService"
import { getPersonaById } from "../../lib/redux/service/pasonaService"
import { useAppSelector } from "../../lib/redux/hooks"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { getAllCVs, getCVs, getCVById, CV } from "../../lib/redux/service/resumeService"
import { getAllCoverLetters, getCoverLetters, CoverLetter } from "../../lib/redux/service/coverLetterService"
import { toast } from "sonner"
import { RootState } from "../../lib/redux/store"
import { ProfileCardLoading } from "../../components/profile-card/ProfileCardLoading"
import {
    Edit2, ChevronUp, ChevronDown, Camera, X, FileText, Mail, ExternalLink,
    Trash2, Plus, ArrowLeft, Lightbulb, Check, IdCard, Phone, MapPin,
    PencilLine, Briefcase, Link2, Globe, Palette, User, Linkedin, Github, Twitter
} from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar"

type SectionKey = "display" | "bio" | "contact" | "links" | "appearance"

type EditableProfile = CreateProfileCardData & {
    username: string
    linkedin: string
    github: string
    twitter: string
}

const defaultProfileImage = "/profile-img.png"

const gradientOptions = [
    { id: "emerald", className: "from-emerald-400 via-teal-500 to-black" },
    { id: "purple", className: "from-purple-400 via-fuchsia-500 to-black" },
    { id: "orange", className: "from-amber-400 via-orange-500 to-black" },
    { id: "blue", className: "from-sky-400 via-indigo-500 to-black" }
]

// Professional dummy data templates
const dummyProfiles = [
    {
        id: "designer",
        full_name: "Alex Morgan",
        username: "alex.morgan",
        job_title: "Senior Product Designer",
        summary: "Creating intuitive digital experiences at the intersection of design and technology. Passionate about user-centered design and accessibility.",
        email: "alex.morgan@creative.design",
        phone: "+1 (415) 555-0123",
        city: "San Francisco",
        country: "USA",
        additional_link: "https://alexmorgan.design",
        linkedin: "https://linkedin.com/in/alexmorgan",
        github: "https://github.com/alexmorgan",
        twitter: "https://twitter.com/alex_morgan",
        company: "TechVision Inc."
    },
    {
        id: "developer",
        full_name: "Sarah Johnson",
        username: "sarah.j",
        job_title: "Full Stack Developer",
        summary: "Building scalable web applications with React, Node.js, and cloud technologies. Open source contributor and tech community advocate.",
        email: "sarah@devsarah.io",
        phone: "+44 20 7946 0958",
        city: "London",
        country: "UK",
        additional_link: "https://devsarah.io",
        linkedin: "https://linkedin.com/in/sarahjohnson",
        github: "https://github.com/devsarah",
        twitter: "https://twitter.com/dev_sarah",
        company: "DigitalFlow Ltd"
    },
    {
        id: "marketing",
        full_name: "Michael Chen",
        username: "michael.chen",
        job_title: "Digital Marketing Director",
        summary: "Driving growth through data-driven marketing strategies and innovative campaigns. Specialized in SaaS and tech startups.",
        email: "michael@marketingpro.com",
        phone: "+1 (646) 555-0189",
        city: "New York",
        country: "USA",
        additional_link: "https://michaelchen.co",
        linkedin: "https://linkedin.com/in/michaelchen",
        github: "",
        twitter: "https://twitter.com/marketing_mike",
        company: "GrowthLab Digital"
    }
]

const defaultDummyProfile = dummyProfiles[0]

// --- Profile Section Component ---
interface ProfileSectionProps {
    sectionId: SectionKey
    title: string
    icon: React.ElementType
    isExpanded: boolean
    onToggleExpand: () => void
    onEdit: () => void
    previewContent?: React.ReactNode
    children?: React.ReactNode
}

function ProfileSection({
    sectionId,
    title,
    icon: Icon,
    isExpanded,
    onToggleExpand,
    onEdit,
    previewContent,
    children
}: ProfileSectionProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200">
            {/* Header */}
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center">
                        <span className="font-bold text-gray-700 dark:text-gray-200 tracking-wide uppercase text-sm">
                            {title}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit()
                        }}
                    >
                        <Edit2 className="h-4 w-4" />
                    </Button>
                    {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    ) : (
                        <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    )}
                </div>
            </div>

            {/* Preview Content (when collapsed) */}
            {!isExpanded && previewContent && (
                <div className="px-4 pb-4">
                    {previewContent}
                </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
                <div className="p-4 border-t border-gray-50 dark:border-gray-800">
                    {children}
                </div>
            )}
        </div>
    )
}

// --- Edit Form Component ---
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

function EditForm({
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

    useEffect(() => {
        if (sectionKey === "display") {
            const parts = (draft.full_name || "").trim().split(" ").filter(Boolean)
            const first = parts.shift() || ""
            const last = parts.join(" ")
            setFirstName(first)
            setLastName(last)
        }
    }, [sectionKey, draft.full_name])

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
                        />
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
                        />
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
                    />
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
                    className="min-h-[150px]"
                />
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
                    />
                </div>
                <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                        value={draft.phone || ""}
                        onChange={(e) => onUpdateDraft({ phone: e.target.value })}
                        placeholder="+1 555 000 0000"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                            value={draft.city || ""}
                            onChange={(e) => onUpdateDraft({ city: e.target.value })}
                            placeholder="City"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                            value={draft.country || ""}
                            onChange={(e) => onUpdateDraft({ country: e.target.value })}
                            placeholder="Country"
                        />
                    </div>
                </div>
            </div>
        </div>
    )

    const renderLinksForm = () => (
        <div className="space-y-5">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Website</Label>
                    <Input
                        value={draft.additional_link || ""}
                        onChange={(e) => onUpdateDraft({ additional_link: e.target.value })}
                        placeholder="https://"
                    />
                </div>

                <div className="space-y-3">
                    <Label>Social Links</Label>
                    <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                            <Label className="text-xs">LinkedIn</Label>
                            <Input
                                value={draft.linkedin || ""}
                                onChange={(e) => onUpdateDraft({ linkedin: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">GitHub</Label>
                            <Input
                                value={draft.github || ""}
                                onChange={(e) => onUpdateDraft({ github: e.target.value })}
                                placeholder="https://github.com/..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs">Twitter/X</Label>
                            <Input
                                value={draft.twitter || ""}
                                onChange={(e) => onUpdateDraft({ twitter: e.target.value })}
                                placeholder="https://x.com/..."
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Attached Links</Label>
                        <span className="text-xs text-gray-500">Shows on your profile</span>
                    </div>
                    <div className="space-y-2">
                        {draft.social_links?.custom_links?.map((link, index) => (
                            <div key={link.id} className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    {link.type === "cv" && <FileText className="h-4 w-4 text-blue-500" />}
                                    {link.type === "cover_letter" && <Mail className="h-4 w-4 text-green-500" />}
                                    {link.type === "custom" && <ExternalLink className="h-4 w-4 text-gray-500" />}
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium truncate">{link.title}</span>
                                        <span className="text-xs text-gray-500 truncate">{link.url}</span>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => onRemoveLink(index)} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {(!draft.social_links?.custom_links || draft.social_links.custom_links.length === 0) && (
                            <p className="text-sm text-gray-500 italic">No links attached yet. Add resumes, cover letters, or custom links.</p>
                        )}
                    </div>

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

                    <div className="pt-4 border-t">
                        <Label className="mb-3">Add Custom Link</Label>
                        <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="customLinkTitle" className="text-xs">Title</Label>
                                <Input
                                    id="customLinkTitle"
                                    value={customLinkTitle}
                                    onChange={(e) => onSetCustomLinkTitle(e.target.value)}
                                    placeholder="e.g. My Portfolio"
                                    className="h-8"
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <Label htmlFor="customLinkUrl" className="text-xs">URL</Label>
                                <Input
                                    id="customLinkUrl"
                                    value={customLinkUrl}
                                    onChange={(e) => onSetCustomLinkUrl(e.target.value)}
                                    placeholder="https://..."
                                    className="h-8"
                                />
                            </div>
                            <Button onClick={onAddCustomLink} size="sm" className="h-8 mb-[1px]" disabled={!customLinkTitle || !customLinkUrl}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

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
                        onClick={onCancel}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                        {sectionKey === "display" && "Edit Display"}
                        {sectionKey === "bio" && "Edit Bio"}
                        {sectionKey === "contact" && "Edit Contact Info"}
                        {sectionKey === "links" && "Edit Featured Links"}
                        {sectionKey === "appearance" && "Edit Appearance"}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        onClick={onSave}
                        className="h-8 text-xs font-medium resumaic-gradient-green text-white hover:opacity-90 shadow-md shadow-emerald-200 dark:shadow-none"
                    >
                        <Check className="h-3 w-3 mr-1" />
                        Update
                    </Button>
                </div>
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

export default function CreateCard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams?.get("id")
    const personaId = searchParams?.get("personaId")
    const resumeId = searchParams?.get("resumeId")
    const { user } = useAppSelector((state) => state.auth)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

    const [profile, setProfile] = useState<EditableProfile>({
        full_name: "Alex Morgan",
        username: "alex.morgan",
        job_title: "Senior Product Designer",
        summary: "Creating intuitive digital experiences at the intersection of design and technology. Passionate about user-centered design and accessibility.",
        email: "alex.morgan@creative.design",
        phone: "+1 (415) 555-0123",
        city: "San Francisco",
        country: "USA",
        additional_link: "https://alexmorgan.design",
        profile_picture: defaultProfileImage,
        linkedin: "https://linkedin.com/in/alexmorgan",
        github: "https://github.com/alexmorgan",
        twitter: "https://twitter.com/alex_morgan",
        social_links: {
            linkedin: "https://linkedin.com/in/alexmorgan",
            github: "https://github.com/alexmorgan",
            twitter: "https://twitter.com/alex_morgan",
            custom_links: []
        }
    })

    const [draft, setDraft] = useState<EditableProfile>(profile)
    const [activeSection, setActiveSection] = useState<SectionKey | null>(null)
    const [selectedGradient, setSelectedGradient] = useState(gradientOptions[0])
    const [sections, setSections] = useState({
        bio: true,
        contact: true,
        featured: true,
        gallery: true,
        contactInfo: true,
        media: true
    })
    const [availableCVs, setAvailableCVs] = useState<CV[]>([])
    const [availableCoverLetters, setAvailableCoverLetters] = useState<CoverLetter[]>([])
    const [customLinkTitle, setCustomLinkTitle] = useState("")
    const [customLinkUrl, setCustomLinkUrl] = useState("")
    const [showDummyProfiles, setShowDummyProfiles] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
        display: false,
        bio: false,
        contact: false,
        links: false,
        appearance: false
    })

    const [isDataLoading, setIsDataLoading] = useState(true)

    // Load profile data
    useEffect(() => {
        const loadData = async () => {
            setIsDataLoading(true)
            if (id) {
                try {
                    const card = await getProfileCardById(id)
                    // Parse social links if string
                    let socialLinks: any = card.social_links || { linkedin: "", github: "", twitter: "", custom_links: [] }
                    if (typeof socialLinks === 'string') {
                        try {
                            socialLinks = JSON.parse(socialLinks)
                        } catch (e) {
                            console.error("Failed to parse social links:", e)
                        }
                    }
                    
                    if (!socialLinks.custom_links) {
                        socialLinks.custom_links = []
                    }

                    setProfile({
                        full_name: card.full_name,
                        username: card.public_slug,
                        job_title: card.job_title || "",
                        summary: card.summary || "",
                        email: card.email || "",
                        phone: card.phone || "",
                        city: card.city || "",
                        country: card.country || "",
                        additional_link: card.additional_link || "",
                        profile_picture: card.profile_picture || defaultProfileImage,
                        linkedin: socialLinks.linkedin || "",
                        github: socialLinks.github || "",
                        twitter: socialLinks.twitter || "",
                        social_links: socialLinks
                    })
                } catch (error) {
                    console.error("Failed to load profile:", error)
                    toast.error("Failed to load profile")
                } finally {
                    setIsDataLoading(false)
                }
            } else if (personaId) {
                try {
                    const persona = await getPersonaById(parseInt(personaId))
                    
                    setProfile({
                        full_name: persona.full_name,
                        username: persona.full_name.toLowerCase().replace(/[^a-z0-9]/g, '.'),
                        job_title: persona.job_title,
                        summary: persona.summary || "",
                        email: persona.email,
                        phone: persona.phone || "",
                        city: persona.city || "",
                        country: persona.country || "",
                        additional_link: "",
                        profile_picture: persona.profile_picture || defaultProfileImage,
                        linkedin: persona.linkedin || "",
                        github: persona.github || "",
                        twitter: "",
                        social_links: {
                            linkedin: persona.linkedin || "",
                            github: persona.github || "",
                            twitter: "",
                            custom_links: []
                        }
                    })
                    toast.success("Data imported from Persona")
                } catch (error) {
                    console.error("Failed to load persona:", error)
                    toast.error("Failed to load persona data")
                } finally {
                    setIsDataLoading(false)
                }
            } else if (resumeId) {
                try {
                    const cv = await getCVById(resumeId)
                    let resumeData: any = {}
                    
                    if (cv.generated_content) {
                        try {
                            resumeData = typeof cv.generated_content === 'string' 
                                ? JSON.parse(cv.generated_content) 
                                : cv.generated_content
                        } catch (e) {
                            console.error("Failed to parse resume content:", e)
                        }
                    }

                    // Extract data from resume content
                    // Assumes standard resume JSON structure
                    const personalInfo = resumeData.personalInfo || {}
                    const socialLinks = {
                        linkedin: personalInfo.linkedin || "",
                        github: personalInfo.github || "",
                        twitter: "",
                        custom_links: []
                    }

                    setProfile({
                        full_name: personalInfo.fullName || personalInfo.name || cv.title || "New Profile",
                        username: (personalInfo.fullName || cv.title || "").toLowerCase().replace(/[^a-z0-9]/g, '.'),
                        job_title: personalInfo.jobTitle || cv.job_description || "",
                        summary: personalInfo.summary || cv.job_description || "",
                        email: personalInfo.email || "",
                        phone: personalInfo.phone || "",
                        city: personalInfo.city || "",
                        country: personalInfo.country || "",
                        additional_link: personalInfo.portfolio || "",
                        profile_picture: defaultProfileImage,
                        linkedin: socialLinks.linkedin,
                        github: socialLinks.github,
                        twitter: "",
                        social_links: socialLinks
                    })
                    toast.success("Data imported from Resume")
                } catch (error) {
                    console.error("Failed to load resume:", error)
                    toast.error("Failed to load resume data")
                } finally {
                    setIsDataLoading(false)
                }
            } else {
                setProfile({
                    ...defaultDummyProfile,
                    profile_picture: defaultProfileImage,
                    social_links: {
                        linkedin: defaultDummyProfile.linkedin,
                        github: defaultDummyProfile.github,
                        twitter: defaultDummyProfile.twitter,
                        custom_links: [
                            {
                                id: "1",
                                type: "custom",
                                title: "Portfolio",
                                url: defaultDummyProfile.additional_link
                            },
                            {
                                id: "2",
                                type: "custom",
                                title: "Design System",
                                url: "https://designsystem.alexmorgan.design"
                            }
                        ]
                    }
                })
                setIsDataLoading(false)
            }
        }

        loadData()
    }, [id, personaId, resumeId])

    // Update draft when profile changes
    useEffect(() => {
        setDraft(profile)
    }, [profile])

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const isAdmin = (user?.role || "").toLowerCase() === "admin"
                const userId = user?.id?.toString() || ""
                const [cvs, cls] = await Promise.all([
                    isAdmin ? getAllCVs() : getCVs(userId),
                    isAdmin ? getAllCoverLetters() : getCoverLetters(userId)
                ])
                setAvailableCVs(cvs)
                setAvailableCoverLetters(cls)
            } catch (error) {
                console.error("Failed to fetch resources:", error)
            }
        }
        fetchResources()
    }, [user?.id, user?.role])

    const toggleSection = (section: SectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }))
    }

    const editSection = (section: SectionKey) => {
        setDraft(profile)
        setActiveSection(section)
    }

    const closeEditForm = () => {
        setActiveSection(null)
    }

    const saveEditForm = () => {
        setProfile(prev => ({
            ...prev,
            ...draft,
            social_links: {
                ...prev.social_links,
                ...draft.social_links,
                custom_links: draft.social_links?.custom_links || []
            }
        }))
        setActiveSection(null)
        toast.success("Changes saved to preview")
    }

    const updateDraft = (updates: Partial<EditableProfile>) => {
        setDraft(prev => ({ ...prev, ...updates }))
    }

    const loadDummyProfile = (profileData: typeof dummyProfiles[0]) => {
        setProfile({
            ...profileData,
            profile_picture: defaultProfileImage,
            social_links: {
                linkedin: profileData.linkedin,
                github: profileData.github,
                twitter: profileData.twitter,
                custom_links: [
                    {
                        id: "1",
                        type: "custom",
                        title: "Portfolio",
                        url: profileData.additional_link
                    },
                    {
                        id: "2",
                        type: "custom",
                        title: profileData.job_title.includes("Design") ? "Design System" : "GitHub Projects",
                        url: profileData.github || profileData.additional_link
                    }
                ]
            }
        })
        setShowDummyProfiles(false)
        toast.success(`Loaded ${profileData.full_name}'s profile template`)
    }

    const addCustomLink = () => {
        if (!customLinkTitle || !customLinkUrl) {
            toast.error("Please fill both title and URL")
            return
        }
        const newLink: AttachedLink = {
            id: Date.now().toString(),
            type: "custom",
            title: customLinkTitle,
            url: customLinkUrl
        }
        const currentLinks = draft.social_links?.custom_links || []
        updateDraft({
            social_links: {
                ...draft.social_links,
                custom_links: [...currentLinks, newLink]
            }
        })
        setCustomLinkTitle("")
        setCustomLinkUrl("")
        toast.success("Link added")
    }

    const removeLink = (index: number) => {
        const currentLinks = draft.social_links?.custom_links || []
        const newLinks = [...currentLinks]
        newLinks.splice(index, 1)
        updateDraft({
            social_links: {
                ...draft.social_links,
                custom_links: newLinks
            }
        })
        toast.success("Link removed")
    }

    const addResourceLink = (type: "cv" | "cover_letter", item: CV | CoverLetter) => {
        const origin = typeof window !== "undefined" ? window.location.origin : ""
        let url = ""
        let title = ""
        if (type === "cv") {
            const cv = item as CV
            url = `${origin}/cv-card/${cv.public_slug}`
            title = cv.title || `Resume #${cv.id}`
        } else {
            const cl = item as CoverLetter
            url = `${origin}/cover-letter/${cl.public_slug}`
            title = `Cover Letter for ${cl.job_description?.substring(0, 20)}...`
        }
        const newLink: AttachedLink = {
            id: Date.now().toString(),
            type,
            title,
            url
        }
        const currentLinks = draft.social_links?.custom_links || []
        updateDraft({
            social_links: {
                ...draft.social_links,
                custom_links: [...currentLinks, newLink]
            }
        })
        toast.success(`${type === "cv" ? "Resume" : "Cover Letter"} attached`)
    }

    const updateFullName = (first: string, last: string) => {
        const fullName = [first, last].filter(Boolean).join(" ").trim()
        updateDraft({ full_name: fullName })
    }

    const handleImageUpload = (file?: File) => {
        if (!file) {
            setSelectedImageFile(null)
            return
        }
        setSelectedImageFile(file)
        const reader = new FileReader()
        reader.onload = () => {
            const result = typeof reader.result === "string" ? reader.result : ""
            if (!result) return
            setProfile((prev) => ({ ...prev, profile_picture: result }))
            updateDraft({ profile_picture: result })
            toast.success("Profile picture selected")
        }
        reader.readAsDataURL(file)
    }

    const handleSaveProfile = async () => {
        if (!profile.full_name.trim()) {
            toast.error("Display name is required")
            return
        }

        const payload: CreateProfileCardData = {
            full_name: profile.full_name,
            job_title: profile.job_title,
            email: profile.email,
            phone: profile.phone,
            city: profile.city,
            country: profile.country,
            summary: profile.summary,
            additional_link: profile.additional_link,
            profile_picture: selectedImageFile 
                ? undefined 
                : (profile.profile_picture?.startsWith('http') ? undefined : (profile.profile_picture || defaultProfileImage)),
            social_links: {
                linkedin: profile.linkedin || undefined,
                github: profile.github || undefined,
                twitter: profile.twitter || undefined,
                custom_links: profile.social_links?.custom_links || []
            }
        }

        try {
            let response;
            if (id) {
                response = await updateProfileCard(id, payload)
                toast.success("Profile card updated successfully")
            } else {
                response = await createProfileCard(payload)
                toast.success("Profile card created successfully")
            }
            
            // Upload profile picture if selected
            if (selectedImageFile && response.id) {
                try {
                    await uploadProfilePicture(response.id, selectedImageFile)
                    toast.success("Profile picture uploaded successfully")
                } catch (uploadError) {
                    console.error("Failed to upload profile picture", uploadError)
                    toast.error("Profile card saved, but failed to upload picture")
                }
            }
            
            // Check if slug is missing and prompt user
            if (!response.public_slug) {
                 // Fallback for missing slug from backend
                 const fallbackSlug = response.public_slug || profile.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                 
                 toast.warning("Public link not generated", {
                    description: "The backend didn't return a public link. Please try saving again or contact support.",
                    action: {
                        label: "Retry Save",
                        onClick: () => handleSaveProfile()
                    }
                 })
                 // We can't really do much if the backend doesn't generate it, 
                 // but we can at least warn the user or try to optimistically redirect using a guessed slug 
                 // (though that might 404).
                 // Better to redirect to the list page as originally intended.
            }

            router.push("/dashboard/profile-card")
        } catch (error: any) {
            toast.error(error?.message || "Failed to save profile card")
        }
    }

    if (isDataLoading) {
        return (
            <ProfileCardLoading 
                loadingText={id ? 'Loading Profile Card' : personaId ? 'Importing from Persona' : resumeId ? 'Importing from Resume' : 'Preparing Editor'}
                subText={id ? 'Fetching your profile card details...' : personaId ? 'Analyzing persona data and setting up your card...' : resumeId ? 'Extracting information from your resume...' : 'Setting up the profile card editor...'}
            />
        )
    }

    const profileImage = profile.profile_picture || defaultProfileImage

    return (
        <div className="bg-[#f9fafb] dark:bg-gray-950 overflow-hidden pt-3 mb-20">
            <div className="w-full px-6 mb-4">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 pl-0 hover:bg-transparent"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>
            <div className="w-full  px-6 h-full">
                <div className="grid grid-cols-1 lg:grid-cols-[60%_40%]  gap-6 h-full ">
                    {/* Left Column - Profile Preview Card (60%) */}
                    <div className="h-full overflow-y-auto  bg-[#f9fafb] dark:bg-gray-950  no-scrollbar ">
                        <div className="flex justify-center h-full">
                            <div className="w-full  bg-[#f9fafb] dark:bg-gray-950">
                                <div className="rounded-[36px] bg-black p-3">
                                    <div className="rounded-[28px] overflow-hidden bg-black">
                                        <div className="relative h-[420px] bg-gray-900 group overflow-hidden">
                                            {/* Background Image */}
                                            <div className="absolute inset-0">
                                                <img
                                                    src={profileImage}
                                                    alt={profile.full_name}
                                                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = defaultProfileImage
                                                    }}
                                                />
                                                {/* Theme Gradient Overlay */}
                                                <div className={`absolute inset-0 bg-gradient-to-b ${selectedGradient.className} opacity-60 mix-blend-overlay`} />
                                                {/* Dark Gradient for Text Readability */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className=" absolute inset-0 flex flex-col items-center justify-center pb-16 gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                            >
                                                <div className="bg-black/30 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-lg">
                                                    <Camera className="h-6 w-6 text-white" />
                                                </div>
                                                <span className="text-xs text-white font-medium drop-shadow-md bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                                    Change Profile Picture
                                                </span>
                                            </button>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleImageUpload(e.target.files?.[0])}
                                            />
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-6 z-20 flex flex-col items-center">
                                                <div className="text-center text-3xl font-bold text-white uppercase tracking-wide drop-shadow-lg">
                                                    {profile.full_name}
                                                </div>
                                                <div className="mt-1 text-center text-xs text-white/80 font-medium tracking-wide">
                                                    {profile.job_title}
                                                </div>
                                                <div className="mt-1 text-center text-sm text-white/60">@{profile.username}</div>
                                                
                                                {/* Action Buttons */}
                                                {/* <div className="flex items-center justify-center gap-3 mt-4">
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                                        <Plus className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform">
                                                        <span className="text-white font-bold text-xs">me</span>
                                                    </div>
                                                </div> */}
                                            </div>
                                        </div>

                                        <div className="bg-black px-4 py-5 space-y-3">
                                            {sections.bio && profile.summary && (
                                                <div className="rounded-2xl bg-white/10 p-4">
                                                    <div className="text-sm font-semibold text-white mb-2">Bio</div>
                                                    <div className="text-sm text-white/80 line-clamp-3">{profile.summary}</div>
                                                </div>
                                            )}

                                            {sections.contactInfo && (
                                                <div className="rounded-2xl bg-white/10 p-4">
                                                    <div className="text-sm font-semibold text-white mb-3">Contact</div>
                                                    <div className="space-y-2">
                                                        {profile.email && (
                                                            <div className="flex items-center gap-2 text-sm text-white/80">
                                                                <Mail className="h-4 w-4" />
                                                                {profile.email}
                                                            </div>
                                                        )}
                                                        {profile.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-white/80">
                                                                <Phone className="h-4 w-4" />
                                                                {profile.phone}
                                                            </div>
                                                        )}
                                                        {(profile.city || profile.country) && (
                                                            <div className="flex items-center gap-2 text-sm text-white/80">
                                                                <MapPin className="h-4 w-4" />
                                                                {[profile.city, profile.country].filter(Boolean).join(", ")}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {sections.featured && (
                                                (profile.social_links?.linkedin || profile.social_links?.github || profile.social_links?.twitter || profile.additional_link || (profile.social_links?.custom_links?.some(l => l.type === 'custom'))) && (
                                                    <div className="rounded-2xl bg-white/10 p-4">
                                                        <div className="text-sm font-semibold text-white mb-3">Social Links</div>
                                                        <div className="space-y-2">
                                                            {profile.social_links?.linkedin && (
                                                                <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                                                    <Linkedin className="h-4 w-4 text-blue-400" />
                                                                    <span className="text-sm text-white/90 truncate">LinkedIn</span>
                                                                </a>
                                                            )}
                                                            {profile.social_links?.github && (
                                                                <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                                                    <Github className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-sm text-white/90 truncate">GitHub</span>
                                                                </a>
                                                            )}
                                                            {profile.social_links?.twitter && (
                                                                <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                                                    <Twitter className="h-4 w-4 text-sky-400" />
                                                                    <span className="text-sm text-white/90 truncate">Twitter</span>
                                                                </a>
                                                            )}
                                                            {profile.additional_link && (
                                                                <a href={profile.additional_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                                                    <Globe className="h-4 w-4 text-emerald-400" />
                                                                    <span className="text-sm text-white/90 truncate">Website</span>
                                                                </a>
                                                            )}
                                                            {/* Custom Links (type=custom) */}
                                                            {profile.social_links?.custom_links?.filter(l => l.type === 'custom').map(link => (
                                                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                                                    <ExternalLink className="h-4 w-4 text-gray-400" />
                                                                    <span className="text-sm text-white/90 truncate">{link.title}</span>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {sections.featured && profile.social_links?.custom_links?.some(l => l.type === 'cv') && (
                                                <div className="rounded-2xl bg-white/10 p-4">
                                                    <div className="text-sm font-semibold text-white mb-3">Attached Resumes</div>
                                                    <div className="space-y-2">
                                                        {profile.social_links.custom_links.filter(l => l.type === 'cv').map((link) => (
                                                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                                                <FileText className="h-4 w-4 text-blue-400" />
                                                                <span className="text-sm text-white/90 truncate">{link.title}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {sections.featured && profile.social_links?.custom_links?.some(l => l.type === 'cover_letter') && (
                                                <div className="rounded-2xl bg-white/10 p-4">
                                                    <div className="text-sm font-semibold text-white mb-3">Attached Cover Letters</div>
                                                    <div className="space-y-2">
                                                        {profile.social_links.custom_links.filter(l => l.type === 'cover_letter').map((link) => (
                                                            <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                                                <Mail className="h-4 w-4 text-green-400" />
                                                                <span className="text-sm text-white/90 truncate">{link.title}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Edit Sections (40%) */}
                    <div className="h-full overflow-y-auto pl-2 no-scrollbar ">
                        {!activeSection ? (
                            <div className="space-y-4">
                                <ProfileSection
                                    sectionId="display"
                                    title="Display"
                                    icon={IdCard}
                                    isExpanded={expandedSections.display}
                                    onToggleExpand={() => toggleSection("display")}
                                    onEdit={() => editSection("display")}
                                    previewContent={
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{profile.full_name}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile.job_title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Edit your display name, profile picture, and professional headline.
                                        </p>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">{profile.full_name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <Briefcase className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">{profile.job_title}</span>
                                            </div>
                                        </div>
                                    </div>
                                </ProfileSection>

                                <ProfileSection
                                    sectionId="bio"
                                    title="Bio"
                                    icon={Link2}
                                    isExpanded={expandedSections.bio}
                                    onToggleExpand={() => toggleSection("bio")}
                                    onEdit={() => editSection("bio")}
                                    previewContent={
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Bio</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                                        {profile.summary || "No bio added yet"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {profile.summary || "Add a bio to introduce yourself to visitors."}
                                        </p>
                                    </div>
                                </ProfileSection>

                                <ProfileSection
                                    sectionId="contact"
                                    title="Contact Info"
                                    icon={Phone}
                                    isExpanded={expandedSections.contact}
                                    onToggleExpand={() => toggleSection("contact")}
                                    onEdit={() => editSection("contact")}
                                    previewContent={
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Contact Info</h4>
                                                    <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                                        {profile.email && <div>{profile.email}</div>}
                                                        {profile.phone && <div>{profile.phone}</div>}
                                                        {(profile.city || profile.country) && (
                                                            <div>{[profile.city, profile.country].filter(Boolean).join(", ")}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Your contact information will be displayed on your profile card.
                                        </p>
                                    </div>
                                </ProfileSection>

                                <ProfileSection
                                    sectionId="links"
                                    title="Featured Links"
                                    icon={Globe}
                                    isExpanded={expandedSections.links}
                                    onToggleExpand={() => toggleSection("links")}
                                    onEdit={() => editSection("links")}
                                    previewContent={
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Featured Links</h4>
                                                    <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                                        {profile.social_links?.custom_links && profile.social_links.custom_links.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1">
                                                                {profile.social_links.custom_links.slice(0, 3).map((link, index) => (
                                                                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                                                                        {link.title}
                                                                    </span>
                                                                ))}
                                                                {profile.social_links.custom_links.length > 3 && (
                                                                    <span className="text-xs text-gray-400">+{profile.social_links.custom_links.length - 3} more</span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            "No links added yet"
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Add links to your resumes, cover letters, portfolio, and social profiles.
                                        </p>
                                    </div>
                                </ProfileSection>

                                <ProfileSection
                                    sectionId="appearance"
                                    title="Appearance"
                                    icon={Palette}
                                    isExpanded={expandedSections.appearance}
                                    onToggleExpand={() => toggleSection("appearance")}
                                    onEdit={() => editSection("appearance")}
                                    previewContent={
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">Appearance</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className={`h-6 w-6 rounded-full bg-gradient-to-b ${selectedGradient.className}`}></div>
                                                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                                            {selectedGradient.id} gradient
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                >
                                    <div className="space-y-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Customize the appearance of your profile card.
                                        </p>
                                    </div>
                                </ProfileSection>

                                <div className="pt-4 pb-8">
                                    <Button
                                        onClick={handleSaveProfile}
                                        className="w-full resumaic-gradient-green text-white hover:opacity-90 h-12 text-base font-medium shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                                    >
                                        <Check className="h-5 w-5 mr-2" />
                                        Save Profile
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <EditForm
                                sectionKey={activeSection}
                                profile={profile}
                                draft={draft}
                                selectedGradient={selectedGradient}
                                availableCVs={availableCVs}
                                availableCoverLetters={availableCoverLetters}
                                customLinkTitle={customLinkTitle}
                                customLinkUrl={customLinkUrl}
                                onUpdateDraft={updateDraft}
                                onSave={saveEditForm}
                                onCancel={closeEditForm}
                                onAddCustomLink={addCustomLink}
                                onRemoveLink={removeLink}
                                onAddResourceLink={addResourceLink}
                                onUpdateFullName={updateFullName}
                                onSelectGradient={setSelectedGradient}
                                onSetCustomLinkTitle={setCustomLinkTitle}
                                onSetCustomLinkUrl={setCustomLinkUrl}
                                onImageUpload={handleImageUpload}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* Add custom scrollbar styles */}
        </div>
    )
}