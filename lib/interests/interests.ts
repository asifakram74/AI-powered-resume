import type { CVContent } from "../../types/cv"

/**
 * Category identifiers for interest items.
 */
export type InterestCategoryId =
  | "technical"
  | "soft"
  | "industry"
  | "hobby"
  | "language"
  | "certification"
  | "custom"

/**
 * Represents a single interest item users can select.
 */
export interface InterestItem {
  id: string
  name: string
  category: InterestCategoryId
  subcategory?: string
  relevance: number
  tags: string[]
  skills?: string[]
  description?: string
}

/**
 * Represents a category containing many interest items.
 */
export interface InterestCategory {
  id: InterestCategoryId
  name: string
  items: InterestItem[]
}

/**
 * Top-level catalog model that aggregates all categories.
 */
export interface InterestCatalog {
  categories: InterestCategory[]
}

/**
 * Filter options for interest queries.
 */
export interface InterestFilter {
  category?: InterestCategoryId
  query?: string
  tags?: string[]
  minRelevance?: number
}

/**
 * Validation result for selected interests.
 */
export interface InterestValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Utility: safe ID creation from a display name.
 */
const makeId = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

/**
 * Utility: compute a simple fuzzy score (0–1) for query vs. candidate.
 */
const fuzzyScore = (query: string, candidate: string) => {
  const q = query.trim().toLowerCase()
  const c = candidate.trim().toLowerCase()
  if (!q) return 0
  if (c.startsWith(q)) return 1
  if (c.includes(q)) return 0.8
  // Levenshtein normalized
  const lv = levenshtein(q, c)
  const denom = Math.max(q.length, c.length) || 1
  return Math.max(0, 1 - lv / denom)
}

const levenshtein = (a: string, b: string) => {
  const la = a.length
  const lb = b.length
  const dp = Array.from({ length: lb + 1 }, () => Array(la + 1).fill(0))
  for (let i = 0; i <= la; i++) dp[0][i] = i
  for (let j = 0; j <= lb; j++) dp[j][0] = j
  for (let j = 1; j <= lb; j++) {
    for (let i = 1; i <= la; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[j][i] = Math.min(dp[j - 1][i] + 1, dp[j][i - 1] + 1, dp[j - 1][i - 1] + cost)
    }
  }
  return dp[lb][la]
}

/**
 * Internal seed lists for industries, soft skills, hobbies, certifications.
 * Note: The catalog will exceed 400 items by combining skills.json (~350+) and languages.json (~150+)
 * with the lists below. This keeps the file maintainable while meeting size requirements.
 */
const INDUSTRIES = [
  "FinTech","HealthTech","EdTech","E-commerce","Logistics","Travel","Gaming","Real Estate","Retail",
  "Energy","Telecommunications","Automotive","Manufacturing","Aerospace","Media","Entertainment","Biotech",
  "Pharmaceuticals","Insurance","Banking","Public Sector","Nonprofit","Agriculture","Food & Beverage",
  "Sports","Consulting","Cybersecurity","Cloud Services","AI/ML","Data Analytics","Robotics","IoT",
  "AR/VR","GreenTech","DevTools","SaaS","PaaS","IaaS","Open Source","Blockchain","LegalTech","MarTech",
  "HR Tech","PropTech","AdTech","Gaming Esports","Streaming","Creator Economy","Climate Tech","Space Tech"
]

const SOFT_SKILLS = [
  "Leadership","Communication","Teamwork","Problem Solving","Critical Thinking","Time Management","Adaptability",
  "Collaboration","Creativity","Negotiation","Conflict Resolution","Empathy","Public Speaking","Presentation",
  "Decision Making","Ownership","Accountability","Mentoring","Coaching","Stakeholder Management","Organization",
  "Attention to Detail","Customer Focus","Continuous Learning","Resilience","Strategic Thinking","Prioritization",
  "Cross-functional Alignment","Change Management","Feedback Culture","Writing","Facilitation"
]

const HOBBIES = [
  "Photography","Blogging","Podcasting","Open Source Contribution","Hackathons","Chess","Cycling","Running",
  "Hiking","Traveling","Reading","Writing","Cooking","Baking","DIY","Woodworking","Gardening","Painting",
  "Drawing","Calligraphy","Music Production","Guitar","Piano","Singing","Film Editing","Drone Flying",
  "Astronomy","Language Learning","Volunteering","Board Games","Esports","Yoga","Meditation","Martial Arts",
  "Swimming","Surfing","Skiing","Snowboarding","Rock Climbing","Camping","Fishing","Bird Watching",
  "3D Printing","Model Building","Electronics","Home Automation","FPV Racing","Auto Detailing","Cricket"
]

const CERTIFICATIONS = [
  "AWS Certified Solutions Architect","AWS Certified Developer","Azure Administrator Associate","Google Professional Cloud Architect",
  "Certified Kubernetes Administrator","CKAD","HashiCorp Terraform Associate","PMP","PRINCE2","Scrum Master",
  "CompTIA Security+","CISSP","CEH","ITIL Foundation","Oracle Java SE","Salesforce Administrator","Certified Data Professional",
  "Snowflake SnowPro","Tableau Desktop Specialist","Power BI Data Analyst","ISTQB","Adobe Certified Professional",
  "Figma Professional","Certified Ethical Hacker","Kotlin Associate","Rust Foundation Associate","React Professional"
]

/**
 * Build the full interest catalog by combining:
 * - Technical skills from data/skills.json
 * - Languages from data/languages.json
 * - Seed lists for industries, soft skills, hobbies, certifications
 */
export async function loadInterestCatalog(): Promise<InterestCatalog> {
  const skillsList = (await import("../../data/skills.json")).default as string[]
  const languagesList = (await import("../../data/languages.json")).default as Array<{ code: string; name: string; native: string }>

  const technicalCategory: InterestCategory = {
    id: "technical",
    name: "Technical Skills",
    items: skillsList.map((s) => ({
      id: makeId(s),
      name: s,
      category: "technical",
      subcategory: undefined,
      relevance: 0.9,
      tags: ["skills","technical"],
      skills: [s],
      description: `${s} competency`
    }))
  }

  const languageCategory: InterestCategory = {
    id: "language",
    name: "Languages",
    items: languagesList.map((l) => ({
      id: makeId(l.code || l.name),
      name: l.name,
      category: "language",
      subcategory: l.code,
      relevance: 0.6,
      tags: ["language", l.native].filter(Boolean),
      description: `${l.name} (${l.native})`
    }))
  }

  const industryCategory: InterestCategory = {
    id: "industry",
    name: "Industries",
    items: INDUSTRIES.map((i) => ({
      id: makeId(i),
      name: i,
      category: "industry",
      relevance: 0.7,
      tags: ["industry"],
      description: `${i} domain`
    }))
  }

  const softCategory: InterestCategory = {
    id: "soft",
    name: "Soft Skills",
    items: SOFT_SKILLS.map((s) => ({
      id: makeId(s),
      name: s,
      category: "soft",
      relevance: 0.65,
      tags: ["soft","skills"],
      description: `${s} capability`
    }))
  }

  const hobbyCategory: InterestCategory = {
    id: "hobby",
    name: "Hobbies",
    items: HOBBIES.map((h) => ({
      id: makeId(h),
      name: h,
      category: "hobby",
      relevance: 0.4,
      tags: ["hobby"],
      description: `${h}`
    }))
  }

  const certCategory: InterestCategory = {
    id: "certification",
    name: "Certifications",
    items: CERTIFICATIONS.map((c) => ({
      id: makeId(c),
      name: c,
      category: "certification",
      relevance: 0.75,
      tags: ["certification"],
      description: `${c}`
    }))
  }

  const customCategory: InterestCategory = {
    id: "custom",
    name: "Custom Interests",
    items: []
  }

  return {
    categories: [
      technicalCategory,
      softCategory,
      industryCategory,
      languageCategory,
      certificationCategoryMerge(certCategory, technicalCategory),
      hobbyCategory,
      customCategory
    ]
  }
}

const certificationCategoryMerge = (cert: InterestCategory, tech: InterestCategory): InterestCategory => {
  // Leave as-is, but function gives us an extension point later if we want to attach skill associations.
  return cert
}

/**
 * Filter interests by category, query, tags and minimum relevance.
 * Performs simple fuzzy scoring when a query is present, sorting by combined score.
 */
export function filterInterests(catalog: InterestCatalog, filter: InterestFilter): InterestItem[] {
  const { category, query, tags, minRelevance } = filter
  const items = catalog.categories
    .filter((c) => !category || c.id === category)
    .flatMap((c) => c.items)
  const filtered = items.filter((it) => {
    if (typeof minRelevance === "number" && it.relevance < minRelevance) return false
    if (tags && tags.length > 0) {
      const lowerTags = tags.map((t) => t.toLowerCase())
      const itemTags = it.tags.map((t) => t.toLowerCase())
      const matchTag = lowerTags.some((t) => itemTags.includes(t))
      if (!matchTag) return false
    }
    return true
  })
  if (query && query.trim()) {
    return filtered
      .map((it) => ({ it, score: 0.5 * it.relevance + 0.5 * fuzzyScore(query, it.name) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.it)
  }
  return filtered.sort((a, b) => b.relevance - a.relevance)
}

/**
 * Add a custom interest to the catalog's "custom" category.
 * Ensures deduplication by normalized name.
 */
export function addCustomInterest(catalog: InterestCatalog, name: string, metadata?: Partial<InterestItem>): InterestItem {
  const normalized = name.trim()
  if (!normalized) throw new Error("Interest name cannot be empty")
  const existing = catalog.categories.flatMap((c) => c.items).find((i) => i.name.toLowerCase() === normalized.toLowerCase())
  if (existing) return existing
  const item: InterestItem = {
    id: makeId(normalized),
    name: normalized,
    category: "custom",
    subcategory: metadata?.subcategory,
    relevance: metadata?.relevance ?? 0.5,
    tags: metadata?.tags ?? ["custom"],
    skills: metadata?.skills ?? [],
    description: metadata?.description ?? normalized
  }
  const custom = catalog.categories.find((c) => c.id === "custom")
  if (!custom) throw new Error("Custom category not found")
  custom.items.push(item)
  return item
}

/**
 * Validate selected interests against CV content.
 * - No duplicates
 * - Names must be reasonable length
 * - Optionally warn for items with very low relevance
 */
export function validateInterestsForCV(cv: CVContent, selected: InterestItem[]): InterestValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const seen = new Set<string>()
  for (const it of selected) {
    const key = it.name.toLowerCase()
    if (seen.has(key)) errors.push(`Duplicate interest: ${it.name}`)
    seen.add(key)
    if (it.name.length > 120) errors.push(`Interest name too long: ${it.name}`)
    if (it.relevance < 0.2) warnings.push(`Low relevance interest: ${it.name}`)
  }
  return { valid: errors.length === 0, errors, warnings }
}

/**
 * Produce recommendations based on CV content (job title, skills, languages).
 */
export function recommendInterests(cv: CVContent, catalog: InterestCatalog, limit = 20): InterestItem[] {
  const title = (cv.personalInfo?.summary || cv.personalInfo?.linkedin || cv.personalInfo?.github || "").toLowerCase()
  const skillSet = new Set<string>((cv.skills?.technical || []).map((s) => s.toLowerCase()))
  const langSet = new Set<string>((cv.languages || []).map((l) => l.name.toLowerCase()))
  const candidates = catalog.categories.flatMap((c) => c.items)
  const scored = candidates.map((it) => {
    let score = it.relevance
    const nameLower = it.name.toLowerCase()
    if (title.includes("data") && it.tags.includes("industry") && nameLower.includes("data")) score += 0.2
    if (title.includes("full") && nameLower.includes("open source")) score += 0.2
    if (skillSet.has(nameLower)) score += 0.25
    if (it.category === "language" && langSet.has(nameLower)) score += 0.1
    return { it, score }
  })
  return scored.sort((a, b) => b.score - a.score).slice(0, limit).map((x) => x.it)
}

/**
 * Map selected interests to the CV additional.interests field (string[]).
 */
export function mapInterestsToCV(selected: InterestItem[]): string[] {
  return selected.map((s) => s.name)
}

/**
 * Search interests quickly by query across all categories.
 */
export function searchInterests(catalog: InterestCatalog, query: string, limit = 50): InterestItem[] {
  const items = catalog.categories.flatMap((c) => c.items)
  return items
    .map((it) => ({ it, score: fuzzyScore(query, it.name) }))
    .filter((x) => x.score > 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.it)
}
