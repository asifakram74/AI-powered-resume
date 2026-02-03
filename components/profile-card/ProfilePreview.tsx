import React from "react"
import { Camera, Mail, Phone, MapPin, Linkedin, Github, Twitter, Globe, ExternalLink, FileText, Plus } from "lucide-react"
import { EditableProfile, gradientOptions, defaultProfileImage } from "../../lib/profile-card/profile-card.shared"
import { detectPlatformFromUrl, getPlatformById } from "../../lib/profile-card/platform-data"

interface ProfilePreviewProps {
    profile: EditableProfile
    selectedGradient: typeof gradientOptions[0]
    fileInputRef: React.RefObject<HTMLInputElement | null>
    handleImageUpload: (file?: File) => void
    onEditLinks?: () => void
    sections: {
        bio: boolean
        contact: boolean
        featured: boolean
        gallery: boolean
        contactInfo: boolean
        media: boolean
    }
}

export function ProfilePreview({
    profile,
    selectedGradient,
    fileInputRef,
    handleImageUpload,
    onEditLinks,
    sections
}: ProfilePreviewProps) {
    const profileImage = profile.profile_picture || defaultProfileImage

    const HeaderSocialIcon = ({ href, icon: Icon, colorClassName }: { href: string, icon: any, colorClassName: string }) => (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`h-10 w-10 rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform ${colorClassName.startsWith('bg-') ? colorClassName : 'bg-gray-700'}`}
        >
            <Icon className="h-5 w-5" />
        </a>
    )

    return (
        <div className="h-full overflow-y-auto bg-[#f9fafb] dark:bg-gray-950 no-scrollbar">
            <div className="flex justify-center h-full">
                <div className="w-full bg-[#f9fafb] dark:bg-gray-950">
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
                                    className="absolute inset-0 flex flex-col items-center justify-center pb-16 gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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

                                    {/* Social Icons Row */}
                                    {sections.featured && (
                                        <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                                            {onEditLinks && (
                                                <button
                                                    type="button"
                                                    onClick={onEditLinks}
                                                    className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-pink-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                                >
                                                     <Plus className="h-5 w-5 text-white" />
                                                </button>
                                            )}

                                            {profile.social_links?.linkedin && (
                                                <HeaderSocialIcon 
                                                    href={profile.social_links.linkedin}
                                                    icon={Linkedin}
                                                    colorClassName={getPlatformById('linkedin')?.color || "bg-blue-700"}
                                                />
                                            )}
                                            {profile.social_links?.github && (
                                                <HeaderSocialIcon 
                                                    href={profile.social_links.github}
                                                    icon={Github}
                                                    colorClassName={getPlatformById('github')?.color || "bg-gray-900"}
                                                />
                                            )}
                                            {profile.social_links?.twitter && (
                                                <HeaderSocialIcon 
                                                    href={profile.social_links.twitter}
                                                    icon={Twitter}
                                                    colorClassName={getPlatformById('twitter')?.color || "bg-black"}
                                                />
                                            )}
                                            {profile.additional_link && (
                                                <HeaderSocialIcon 
                                                    href={profile.additional_link}
                                                    icon={Globe}
                                                    colorClassName={getPlatformById('website')?.color || "bg-emerald-600"}
                                                />
                                            )}
                                            {/* Custom Links (type=custom) */}
                                            {profile.social_links?.custom_links?.filter(l => l.type === 'custom').map(link => {
                                                const platform = (link.platformId ? getPlatformById(link.platformId) : undefined) || detectPlatformFromUrl(link.url)
                                                const Icon = platform?.icon || ExternalLink
                                                const color = platform?.color || "bg-gray-500"
                                                
                                                return (
                                                    <HeaderSocialIcon 
                                                        key={link.id}
                                                        href={link.url}
                                                        icon={Icon}
                                                        colorClassName={color}
                                                    />
                                                )
                                            })}
                                        </div>
                                    )}
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
                                    /* Social links moved to header */
                                    null
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
    )
}

