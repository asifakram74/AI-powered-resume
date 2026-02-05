"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getPublicProfileBySlug, ProfileCard, SocialLinks } from "../../../lib/redux/service/profileCardService"
import { PublicPageLoading } from "../../../components/shared/public-page-loading"
import { 
  Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, 
  FileText, ExternalLink, Share2 
} from "lucide-react"
import { toast } from "sonner"
import { trackEvent } from "../../../lib/redux/service/analyticsService"
import { detectPlatformFromUrl, getPlatformById } from "../../../lib/profile-card/platform-data"
import { Button } from "../../../components/ui/button"
import { Logo } from "../../../components/ui/logo"

interface ProfileCardPublicClientProps {
  slug: string
}

const PublicHeader = ({ title }: { title: string }) => (
  <div className="w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="hidden md:block">
        <Link href="/">
          <Logo width={150} height={45} className="cursor-pointer" />
        </Link>
      </div>
      <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block" />
      <h1 className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[200px] md:max-w-md capitalize">
        {title}
      </h1>
    </div>
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="hidden sm:flex"
        onClick={() => window.open('https://resumaic.com', '_blank')}
      >
        Create Your Own
      </Button>
    </div>
  </div>
)

const PublicFooter = () => (
  <div className="w-full py-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 mt-auto">
    <p>&copy; {new Date().getFullYear()} Resumaic. All rights reserved.</p>
  </div>
)

export default function ProfileCardPublicClient({ slug }: ProfileCardPublicClientProps) {
  const [card, setCard] = useState<ProfileCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const gradientOptions = [
      { id: "emerald", className: "from-emerald-400 via-teal-500 to-black" },
      { id: "purple", className: "from-purple-400 via-fuchsia-500 to-black" },
      { id: "orange", className: "from-amber-400 via-orange-500 to-black" },
      { id: "blue", className: "from-sky-400 via-indigo-500 to-black" }
  ]
  const selectedGradient = gradientOptions[0] // Default to emerald as it's not saved

  useEffect(() => {
    const fetchCard = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const data = await getPublicProfileBySlug(slug)
        setCard(data)
        
        // Track view
        trackEvent({
          resource_type: 'profile_card',
          resource_key: slug,
          event_type: 'view',
          referrer: document.referrer
        })
      } catch (err) {
        console.error(err)
        setError("Failed to load profile card")
      } finally {
        setLoading(false)
      }
    }

    fetchCard()
  }, [slug])

  if (loading) {
    return <PublicPageLoading type="profile-card" />
  }

  if (error || !card) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">Profile Not Found</h1>
        <p className="text-gray-500">The profile you are looking for does not exist or has been removed.</p>
      </div>
    )
  }

  const socialLinks = (typeof card.social_links === 'string' 
    ? JSON.parse(card.social_links) 
    : (card.social_links || {})) as SocialLinks

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${card.full_name} - Profile`,
        url: window.location.href
      }).catch(console.error)
      
      trackEvent({
        resource_type: 'profile_card',
        resource_id: card.id ? Number(card.id) : 0,
        resource_key: slug,
        event_type: 'share',
        meta: { method: 'native' }
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
      
      trackEvent({
        resource_type: 'profile_card',
        resource_id: card.id ? Number(card.id) : 0,
        resource_key: slug,
        event_type: 'copy',
        meta: { url: window.location.href }
      })
    }
  }

  const profileImage = card.profile_picture || "/profile-img.png"

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
    <div className="min-h-screen bg-gray-100 dark:bg-[#030712] flex flex-col">
      <PublicHeader title={`${card.full_name}'s Profile`} />
      
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl">
          <div className="rounded-[36px] bg-black p-3 shadow-2xl">
              <div className="rounded-[28px] overflow-hidden bg-black">
                  <div className="relative h-[420px] bg-gray-900 group overflow-hidden">
                      {/* Background Image */}
                      <div className="absolute inset-0">
                          <img
                              src={profileImage}
                              alt={card.full_name}
                              className="h-full w-full object-cover object-top transition-transform duration-700 hover:scale-105"
                              onError={(e) => {
                                  e.currentTarget.src = "/profile-img.png"
                              }}
                          />
                          {/* Theme Gradient Overlay */}
                          <div className={`absolute inset-0 bg-gradient-to-b ${selectedGradient.className} opacity-60 mix-blend-overlay`} />
                          {/* Dark Gradient for Text Readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      </div>

                      {/* Share Button */}
                      <button 
                        onClick={handleShare}
                        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 transition-colors"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full px-6 z-20 flex flex-col items-center">
                          <div className="text-center text-3xl font-bold text-white uppercase tracking-wide drop-shadow-lg">
                              {card.full_name}
                          </div>
                          {card.job_title && (
                            <div className="mt-1 text-center text-xs text-white/80 font-medium tracking-wide">
                                {card.job_title}
                            </div>
                          )}
                          <div className="mt-1 text-center text-sm text-white/60">@{card.public_slug || slug}</div>

                          {/* Social Icons Row */}
                          <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                              {socialLinks.linkedin && (
                                  <HeaderSocialIcon 
                                      href={socialLinks.linkedin}
                                      icon={Linkedin}
                                      colorClassName={getPlatformById('linkedin')?.color || "bg-blue-700"}
                                  />
                              )}
                              {socialLinks.github && (
                                  <HeaderSocialIcon 
                                      href={socialLinks.github}
                                      icon={Github}
                                      colorClassName={getPlatformById('github')?.color || "bg-gray-900"}
                                  />
                              )}
                              {socialLinks.twitter && (
                                  <HeaderSocialIcon 
                                      href={socialLinks.twitter}
                                      icon={Twitter}
                                      colorClassName={getPlatformById('twitter')?.color || "bg-black"}
                                  />
                              )}
                              {card.additional_link && (
                                  <HeaderSocialIcon 
                                      href={card.additional_link}
                                      icon={Globe}
                                      colorClassName={getPlatformById('website')?.color || "bg-emerald-600"}
                                  />
                              )}
                              {/* Custom Links (type=custom) */}
                              {socialLinks.custom_links?.filter(l => l.type === 'custom').map(link => {
                                  // Type assertion since backend type might not strictly match frontend interface yet
                                  const platformId = (link as any).platformId;
                                  const platform = (platformId ? getPlatformById(platformId) : undefined) || detectPlatformFromUrl(link.url)
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
                      </div>
                  </div>

                  <div className="bg-black px-4 py-5 space-y-3">
                      {card.summary && (
                          <div className="rounded-2xl bg-white/10 p-4">
                              <div className="text-sm font-semibold text-white mb-2">Bio</div>
                              <div className="text-sm text-white/80 leading-relaxed">{card.summary}</div>
                          </div>
                      )}

                      {(card.email || card.phone || card.city || card.country) && (
                          <div className="rounded-2xl bg-white/10 p-4">
                              <div className="text-sm font-semibold text-white mb-3">Contact</div>
                              <div className="space-y-2">
                                  {card.email && (
                                      <a href={`mailto:${card.email}`} className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                                          <Mail className="h-4 w-4" />
                                          {card.email}
                                      </a>
                                  )}
                                  {card.phone && (
                                      <a href={`tel:${card.phone}`} className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors">
                                          <Phone className="h-4 w-4" />
                                          {card.phone}
                                      </a>
                                  )}
                                  {(card.city || card.country) && (
                                      <div className="flex items-center gap-2 text-sm text-white/80">
                                          <MapPin className="h-4 w-4" />
                                          {[card.city, card.country].filter(Boolean).join(", ")}
                                      </div>
                                  )}
                              </div>
                          </div>
                      )}

                      {socialLinks.custom_links?.some(l => l.type === 'cv') && (
                          <div className="rounded-2xl bg-white/10 p-4">
                              <div className="text-sm font-semibold text-white mb-3">Attached Resumes</div>
                              <div className="space-y-2">
                                  {socialLinks.custom_links.filter(l => l.type === 'cv').map((link) => (
                                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                          <FileText className="h-4 w-4 text-blue-400" />
                                          <span className="text-sm text-white/90 truncate">{link.title}</span>
                                      </a>
                                  ))}
                              </div>
                          </div>
                      )}

                      {socialLinks.custom_links?.some(l => l.type === 'cover_letter') && (
                          <div className="rounded-2xl bg-white/10 p-4">
                              <div className="text-sm font-semibold text-white mb-3">Attached Cover Letters</div>
                              <div className="space-y-2">
                                  {socialLinks.custom_links.filter(l => l.type === 'cover_letter').map((link) => (
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
      
      <PublicFooter />
    </div>
  )
}
