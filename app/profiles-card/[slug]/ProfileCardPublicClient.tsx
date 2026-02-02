"use client"

import { useEffect, useState } from "react"
import { getPublicProfileBySlug, ProfileCard, SocialLinks } from "../../../lib/redux/service/profileCardService"
import { PublicPageLoading } from "../../../components/shared/public-page-loading"
import { 
  Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, 
  FileText, ExternalLink, Share2 
} from "lucide-react"
import { toast } from "sonner"
import { trackEvent } from "../../../lib/redux/service/analyticsService"

interface ProfileCardPublicClientProps {
  slug: string
}

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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 sm:p-8">
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
                          <div className="mt-1 text-center text-sm text-white/60">@{card.public_slug}</div>
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

                      {(socialLinks.linkedin || socialLinks.github || socialLinks.twitter || card.additional_link || (socialLinks.custom_links?.some(l => l.type === 'custom'))) && (
                          <div className="rounded-2xl bg-white/10 p-4">
                              <div className="text-sm font-semibold text-white mb-3">Social Links</div>
                              <div className="space-y-2">
                                  {socialLinks.linkedin && (
                                      <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                          <Linkedin className="h-4 w-4 text-blue-400" />
                                          <span className="text-sm text-white/90 truncate">LinkedIn</span>
                                      </a>
                                  )}
                                  {socialLinks.github && (
                                      <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                          <Github className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm text-white/90 truncate">GitHub</span>
                                      </a>
                                  )}
                                  {socialLinks.twitter && (
                                      <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                          <Twitter className="h-4 w-4 text-sky-400" />
                                          <span className="text-sm text-white/90 truncate">Twitter</span>
                                      </a>
                                  )}
                                  {card.additional_link && (
                                      <a href={card.additional_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                          <Globe className="h-4 w-4 text-emerald-400" />
                                          <span className="text-sm text-white/90 truncate">Website</span>
                                      </a>
                                  )}
                                  {/* Custom Links (type=custom) */}
                                  {socialLinks.custom_links?.filter(l => l.type === 'custom').map(link => (
                                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-black/40 hover:bg-black/60 transition">
                                          <ExternalLink className="h-4 w-4 text-gray-400" />
                                          <span className="text-sm text-white/90 truncate">{link.title}</span>
                                      </a>
                                  ))}
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
  )
}
