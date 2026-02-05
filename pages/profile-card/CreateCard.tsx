import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "../../components/ui/button"
import { createProfileCard, CreateProfileCardData, AttachedLink, getProfileCardById, updateProfileCard, uploadProfilePicture } from "../../lib/redux/service/profileCardService"
import { getPersonaById } from "../../lib/redux/service/pasonaService"
import { useAppSelector } from "../../lib/redux/hooks"
import { getAllCVs, getCVs, getCVById, CV } from "../../lib/redux/service/resumeService"
import { getAllCoverLetters, getCoverLetters, CoverLetter } from "../../lib/redux/service/coverLetterService"
import { toast } from "sonner"
import { ProfileCardLoading } from "../../components/profile-card/ProfileCardLoading"
import {
    ArrowLeft, Check, IdCard, Phone,
    Briefcase, Link2, Globe, Palette, User
} from "lucide-react"
import { ProfileSection } from "../../components/profile-card/ProfileSection"
import { EditForm } from "../../components/profile-card/EditForm"
import { ProfilePreview } from "../../components/profile-card/ProfilePreview"
import { SectionKey, EditableProfile, gradientOptions, dummyProfiles, defaultDummyProfile, defaultProfileImage } from "../../lib/profile-card/profile-card.shared"

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
        full_name: "",
        username: "",
        job_title: "",
        summary: "",
        email: "",
        phone: "",
        city: "",
        country: "",
        additional_link: "",
        profile_picture: defaultProfileImage,
        linkedin: "",
        github: "",
        twitter: "",
        social_links: {
            linkedin: "",
            github: "",
            twitter: "",
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
                        username: persona.full_name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
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
                        username: (personalInfo.fullName || cv.title || "").toLowerCase().replace(/[^a-z0-9]/g, '-'),
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
                // Initialize with empty profile instead of dummy data
                setProfile({
                    full_name: "Your Name",
                    username: "username",
                    job_title: "Job Title",
                    summary: "Write a short bio about yourself...",
                    email: "",
                    phone: "",
                    city: "",
                    country: "",
                    additional_link: "",
                    profile_picture: defaultProfileImage,
                    linkedin: "",
                    github: "",
                    twitter: "",
                    social_links: {
                        linkedin: "",
                        github: "",
                        twitter: "",
                        custom_links: []
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
                linkedin: draft.linkedin,
                github: draft.github,
                twitter: draft.twitter,
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
            url = `${origin}/resume/${cv.public_slug}`
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

        const payload: CreateProfileCardData & { public_slug?: string } = {
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
                // Include public_slug (username) when updating
                if (profile.username) {
                    payload.public_slug = profile.username;
                }
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
                                <ProfilePreview
                                    profile={profile}
                                    selectedGradient={selectedGradient}
                                    fileInputRef={fileInputRef}
                                    handleImageUpload={handleImageUpload}
                                    onEditLinks={() => editSection("links")}
                                    sections={sections}
                                />
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
