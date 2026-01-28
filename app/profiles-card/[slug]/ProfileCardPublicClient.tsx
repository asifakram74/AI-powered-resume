"use client"

import { useEffect, useState } from "react"
import { getPublicProfileBySlug, ProfileCard, SocialLinks } from "../../../lib/redux/service/profileCardService"
import { PublicPageLoading } from "../../../components/shared/public-page-loading"
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../components/ui/card"
import { 
  Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, 
  FileText, ExternalLink, Share2 
} from "lucide-react"
import { toast } from "sonner"

interface ProfileCardPublicClientProps {
  slug: string
}

export default function ProfileCardPublicClient({ slug }: ProfileCardPublicClientProps) {
  const [card, setCard] = useState<ProfileCard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCard = async () => {
      if (!slug) return
      try {
        setLoading(true)
        const data = await getPublicProfileBySlug(slug)
        setCard(data)
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
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-emerald-500">
        <CardHeader className="text-center relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5 text-gray-500" />
          </Button>
          
          <div className="flex justify-center mb-4">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={card.profile_picture} alt={card.full_name} />
              <AvatarFallback className="text-4xl bg-emerald-100 text-emerald-600">
                {card.full_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">{card.full_name}</CardTitle>
          {card.job_title && (
            <CardDescription className="text-xl text-emerald-600 font-medium mt-1">
              {card.job_title}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Summary */}
          {card.summary && (
            <div className="text-center max-w-lg mx-auto">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {card.summary}
              </p>
            </div>
          )}

          {/* Contact Info */}
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {card.email && (
              <a href={`mailto:${card.email}`} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                <Mail className="h-4 w-4 text-emerald-500" />
                <span>{card.email}</span>
              </a>
            )}
            {card.phone && (
              <a href={`tel:${card.phone}`} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                <Phone className="h-4 w-4 text-emerald-500" />
                <span>{card.phone}</span>
              </a>
            )}
            {(card.city || card.country) && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                <MapPin className="h-4 w-4 text-emerald-500" />
                <span>{[card.city, card.country].filter(Boolean).join(', ')}</span>
              </div>
            )}
            {card.additional_link && (
              <a href={card.additional_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors">
                <Globe className="h-4 w-4 text-emerald-500" />
                <span>Website</span>
              </a>
            )}
          </div>

          {/* Social Links */}
          {(socialLinks.linkedin || socialLinks.github || socialLinks.twitter) && (
            <div className="flex justify-center gap-4">
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors">
                  <Linkedin className="h-6 w-6" />
                </a>
              )}
              {socialLinks.github && (
                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-100 text-gray-800 rounded-full hover:bg-gray-200 transition-colors">
                  <Github className="h-6 w-6" />
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-sky-50 text-sky-500 rounded-full hover:bg-sky-100 transition-colors">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
            </div>
          )}

          {/* Attached Links (Custom/CV/CL) */}
          {socialLinks.custom_links && socialLinks.custom_links.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Attached Documents & Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {socialLinks.custom_links.map((link, index) => (
                  <a 
                    key={index} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 hover:shadow-md transition-all group bg-white dark:bg-gray-900"
                  >
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-50 dark:bg-gray-800 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 transition-colors">
                      {link.type === 'cv' && <FileText className="h-5 w-5 text-blue-500" />}
                      {link.type === 'cover_letter' && <Mail className="h-5 w-5 text-green-500" />}
                      {link.type === 'custom' && <ExternalLink className="h-5 w-5 text-gray-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-emerald-600 transition-colors">
                        {link.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {link.type === 'cv' ? 'Resume' : link.type === 'cover_letter' ? 'Cover Letter' : 'External Link'}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-emerald-500" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
