import {
    Instagram, Facebook, Twitter, Linkedin, Github, Youtube,
    Twitch, Mail, Globe, MapPin, Phone, Link,
    Music, Video, CreditCard, ShoppingBag, Gamepad2, Heart,
    Snapchat, TikTok, Pinterest, Spotify, Discord, Telegram,
    WhatsApp, PayPal, Patreon
} from "../../components/profile-card/platform-icons"

export type PlatformCategory = 'social' | 'business' | 'music' | 'payment' | 'entertainment' | 'lifestyle' | 'other'

export interface Platform {
    id: string
    name: string
    category: PlatformCategory
    icon: any
    color: string
    textColor: string
    placeholder: string
    prefix?: string
}

export const platforms: Platform[] = [
    // Social
    { id: 'instagram', name: 'Instagram', category: 'social', icon: Instagram, color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500', textColor: 'text-pink-500', placeholder: 'username', prefix: 'https://instagram.com/' },
    { id: 'snapchat', name: 'Snapchat', category: 'social', icon: Snapchat, color: 'bg-yellow-400', textColor: 'text-yellow-400', placeholder: 'username', prefix: 'https://snapchat.com/add/' },
    { id: 'facebook', name: 'Facebook', category: 'social', icon: Facebook, color: 'bg-blue-600', textColor: 'text-blue-500', placeholder: 'profile URL or username', prefix: 'https://facebook.com/' },
    { id: 'twitter', name: 'X / Twitter', category: 'social', icon: Twitter, color: 'bg-black', textColor: 'text-sky-400', placeholder: 'username', prefix: 'https://x.com/' },
    { id: 'tiktok', name: 'TikTok', category: 'social', icon: TikTok, color: 'bg-black', textColor: 'text-white', placeholder: 'username', prefix: 'https://tiktok.com/@' },
    { id: 'pinterest', name: 'Pinterest', category: 'social', icon: Pinterest, color: 'bg-red-600', textColor: 'text-red-500', placeholder: 'username', prefix: 'https://pinterest.com/' },
    { id: 'discord', name: 'Discord', category: 'social', icon: Discord, color: 'bg-indigo-500', textColor: 'text-indigo-400', placeholder: 'invite link', prefix: 'https://discord.gg/' },
    { id: 'telegram', name: 'Telegram', category: 'social', icon: Telegram, color: 'bg-sky-500', textColor: 'text-sky-400', placeholder: 'username', prefix: 'https://t.me/' },
    { id: 'whatsapp', name: 'WhatsApp', category: 'social', icon: WhatsApp, color: 'bg-green-500', textColor: 'text-green-400', placeholder: 'phone number', prefix: 'https://wa.me/' },
    
    // Business
    { id: 'linkedin', name: 'LinkedIn', category: 'business', icon: Linkedin, color: 'bg-blue-700', textColor: 'text-blue-400', placeholder: 'profile URL', prefix: 'https://linkedin.com/in/' },
    { id: 'email', name: 'Email', category: 'business', icon: Mail, color: 'bg-gray-600', textColor: 'text-gray-400', placeholder: 'email address', prefix: 'mailto:' },
    { id: 'website', name: 'Website', category: 'business', icon: Globe, color: 'bg-emerald-600', textColor: 'text-emerald-400', placeholder: 'https://your-site.com' },
    { id: 'github', name: 'GitHub', category: 'business', icon: Github, color: 'bg-gray-900', textColor: 'text-gray-400', placeholder: 'username', prefix: 'https://github.com/' },
    
    // Music
    { id: 'spotify', name: 'Spotify', category: 'music', icon: Spotify, color: 'bg-green-500', textColor: 'text-green-400', placeholder: 'artist/user URL' },
    { id: 'soundcloud', name: 'SoundCloud', category: 'music', icon: Music, color: 'bg-orange-500', textColor: 'text-orange-400', placeholder: 'profile URL' },
    
    // Entertainment
    { id: 'youtube', name: 'YouTube', category: 'entertainment', icon: Youtube, color: 'bg-red-600', textColor: 'text-red-500', placeholder: 'channel URL' },
    { id: 'twitch', name: 'Twitch', category: 'entertainment', icon: Twitch, color: 'bg-purple-600', textColor: 'text-purple-400', placeholder: 'username', prefix: 'https://twitch.tv/' },
    
    // Payments
    { id: 'paypal', name: 'PayPal', category: 'payment', icon: PayPal, color: 'bg-blue-800', textColor: 'text-blue-400', placeholder: 'paypal.me link' },
    { id: 'patreon', name: 'Patreon', category: 'payment', icon: Patreon, color: 'bg-red-500', textColor: 'text-red-400', placeholder: 'profile URL' },
    { id: 'cashapp', name: 'Cash App', category: 'payment', icon: CreditCard, color: 'bg-green-500', textColor: 'text-green-400', placeholder: '$cashtag' },
    
    // Other
    { id: 'custom', name: 'Custom Link', category: 'other', icon: Link, color: 'bg-gray-500', textColor: 'text-gray-400', placeholder: 'https://...' }
]

export const categories: { id: PlatformCategory; label: string }[] = [
    { id: 'social', label: 'Social' },
    { id: 'business', label: 'Business' },
    { id: 'music', label: 'Music' },
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'payment', label: 'Payments' },
    { id: 'lifestyle', label: 'Lifestyle' },
    { id: 'other', label: 'Others' }
]

export const getPlatformById = (id: string) => platforms.find(p => p.id === id)

export const detectPlatformFromUrl = (url: string): Platform | undefined => {
    if (!url) return undefined
    const lowerUrl = url.toLowerCase()
    
    // Specific checks
    if (lowerUrl.includes('instagram.com')) return getPlatformById('instagram')
    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) return getPlatformById('twitter')
    if (lowerUrl.includes('linkedin.com')) return getPlatformById('linkedin')
    if (lowerUrl.includes('github.com')) return getPlatformById('github')
    if (lowerUrl.includes('facebook.com')) return getPlatformById('facebook')
    if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return getPlatformById('youtube')
    if (lowerUrl.includes('twitch.tv')) return getPlatformById('twitch')
    if (lowerUrl.includes('tiktok.com')) return getPlatformById('tiktok')
    if (lowerUrl.includes('snapchat.com')) return getPlatformById('snapchat')
    if (lowerUrl.includes('pinterest.com')) return getPlatformById('pinterest')
    if (lowerUrl.includes('spotify.com')) return getPlatformById('spotify')
    if (lowerUrl.includes('discord.gg') || lowerUrl.includes('discord.com')) return getPlatformById('discord')
    if (lowerUrl.includes('t.me') || lowerUrl.includes('telegram.me')) return getPlatformById('telegram')
    if (lowerUrl.includes('wa.me') || lowerUrl.includes('whatsapp.com')) return getPlatformById('whatsapp')
    
    return undefined
}
