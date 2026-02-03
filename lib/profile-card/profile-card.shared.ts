import { CreateProfileCardData } from "../redux/service/profileCardService"

export type SectionKey = "display" | "bio" | "contact" | "links" | "appearance"

export type EditableProfile = CreateProfileCardData & {
    username: string
    linkedin: string
    github: string
    twitter: string
}

export const defaultProfileImage = "/profile-img.png"

export const gradientOptions = [
    { id: "emerald", className: "from-emerald-400 via-teal-500 to-black" },
    { id: "purple", className: "from-purple-400 via-fuchsia-500 to-black" },
    { id: "orange", className: "from-amber-400 via-orange-500 to-black" },
    { id: "blue", className: "from-sky-400 via-indigo-500 to-black" }
]

// Professional dummy data templates
export const dummyProfiles = [
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

export const defaultDummyProfile = dummyProfiles[0]
