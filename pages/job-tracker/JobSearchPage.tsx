"use client"

import { useEffect, useMemo, useState } from "react"
import { useAppSelector } from "../../lib/redux/hooks"
import type { RootState } from "../../lib/redux/store"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select"
import { showErrorToast, showSuccessToast } from "../../components/ui/toast"
import { getCVs, type CV } from "../../lib/redux/service/resumeService"
import {
  createJobApplication,
  googleSearchJobs,
  listPipelines,
  searchJobs,
  type JobSearchResult,
  type Pipeline,
  type JobSearchFilters,
} from "../../lib/redux/service/jobTrackerService"
import { ExternalLink, Loader2, Plus, Search, Sparkles, Building, MapPin, Briefcase, Filter, X, Check, Calendar, DollarSign, Clock, Globe, Tag } from "lucide-react"
import { Badge } from "../../components/ui/badge"
import { Avatar, AvatarFallback } from "../../components/ui/avatar"

function firstString(obj: any, keys: string[]) {
  for (const k of keys) {
    const v = obj?.[k]
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return ""
}

function firstUrl(obj: any) {
  return firstString(obj, ["url", "apply_url", "applyUrl", "job_url", "jobUrl", "link", "redirect_url"])
}

function formatSalary(min?: number, max?: number) {
  if (!min && !max) return null
  
  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
  
  if (min && max && min !== max) {
    return `${fmt(min)} - ${fmt(max)}`
  }
  return fmt(min || max || 0)
}

function todayYMD() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${mm}-${dd}`
}

export default function JobSearchPage() {
  const { user } = useAppSelector((state: RootState) => state.auth)
  const userId = user?.id

  const [activeSource, setActiveSource] = useState<"internal" | "google">("internal")
  
  // Search State
  const [what, setWhat] = useState("")
  const [where, setWhere] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  
  // Dual Storage for Persistence
  const [internalResults, setInternalResults] = useState<JobSearchResult[]>([])
  const [googleResults, setGoogleResults] = useState<JobSearchResult[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  
  const currentResults = activeSource === "internal" ? internalResults : googleResults
  
  const [showFilters, setShowFilters] = useState(false)

  // Load from localStorage
  useEffect(() => {
    const savedInternal = localStorage.getItem('jobSearch_internalResults')
    const savedGoogle = localStorage.getItem('jobSearch_googleResults')
    
    if (savedInternal) {
      try {
        setInternalResults(JSON.parse(savedInternal))
      } catch (e) {
        console.error('Failed to parse saved internal results:', e)
      }
    }
    
    if (savedGoogle) {
      try {
        setGoogleResults(JSON.parse(savedGoogle))
      } catch (e) {
        console.error('Failed to parse saved google results:', e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('jobSearch_internalResults', JSON.stringify(internalResults))
    }
  }, [internalResults, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('jobSearch_googleResults', JSON.stringify(googleResults))
    }
  }, [googleResults, isLoaded])

  const clearResults = (source?: "internal" | "google" | "all") => {
    if (source === "internal" || source === "all") {
      setInternalResults([])
      localStorage.removeItem('jobSearch_internalResults')
    }
    if (source === "google" || source === "all") {
      setGoogleResults([])
      localStorage.removeItem('jobSearch_googleResults')
    }
    if (!source) {
      // Clear current tab results
      if (activeSource === "internal") {
        setInternalResults([])
        localStorage.removeItem('jobSearch_internalResults')
      } else {
        setGoogleResults([])
        localStorage.removeItem('jobSearch_googleResults')
      }
    }
  }

  // Advanced Filters
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "salary">("relevance")
  const [salaryMin, setSalaryMin] = useState("")
  const [salaryMax, setSalaryMax] = useState("")
  const [whatExclude, setWhatExclude] = useState("")
  const [employmentType, setEmploymentType] = useState({
    full_time: false,
    part_time: false,
    permanent: false,
    contract: false,
    temp: false,
  })

  const [pipelines, setPipelines] = useState<Pipeline[]>([])
  const [cvs, setCvs] = useState<CV[]>([])
  const [isLoadingMeta, setIsLoadingMeta] = useState(true)

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [addCompany, setAddCompany] = useState("")
  const [addTitle, setAddTitle] = useState("")
  const [addDate, setAddDate] = useState(todayYMD())
  const [addPipelineId, setAddPipelineId] = useState<string>("")
  const [addCvId, setAddCvId] = useState<string>("")
  const [isAdding, setIsAdding] = useState(false)

  const wishlistPipelineId = useMemo(() => {
    const wishlist = pipelines.find((p) => p.name?.toLowerCase() === "wishlist")
    return wishlist?.id ? String(wishlist.id) : ""
  }, [pipelines])

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        setIsLoadingMeta(true)
        const [pipelinesRes, cvsRes] = await Promise.all([
          listPipelines().catch(() => [] as Pipeline[]),
          userId ? getCVs(String(userId)).catch(() => [] as CV[]) : (Promise.resolve([]) as Promise<CV[]>),
        ])
        if (!alive) return
        setPipelines(pipelinesRes)
        setCvs(cvsRes)
      } finally {
        if (alive) setIsLoadingMeta(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [userId])

  useEffect(() => {
    if (!addPipelineId && wishlistPipelineId) setAddPipelineId(wishlistPipelineId)
  }, [addPipelineId, wishlistPipelineId])

  useEffect(() => {
    if (!addCvId && cvs.length > 0) setAddCvId(String(cvs[0].id))
  }, [addCvId, cvs])

  const runSearch = async () => {
    if (!what.trim()) {
      showErrorToast("Empty Search", "Please enter a job title or keyword")
      return
    }

    try {
      setIsSearching(true)
      let data: JobSearchResult[] = []

      if (activeSource === "google") {
        data = await googleSearchJobs(what.trim())
      } else {
        const filters: JobSearchFilters = {
          what: what.trim(),
          where: where.trim(),
          sort_by: sortBy,
          salary_min: salaryMin ? Number(salaryMin) : undefined,
          salary_max: salaryMax ? Number(salaryMax) : undefined,
          full_time: employmentType.full_time,
          part_time: employmentType.part_time,
          permanent: employmentType.permanent,
          contract: employmentType.contract,
          temp: employmentType.temp,
          what_exclude: whatExclude.trim() || undefined,
        }
        data = await searchJobs(filters)
      }
      
      if (activeSource === "google") {
        setGoogleResults(data)
      } else {
        setInternalResults(data)
      }
      
      if (data.length === 0) {
        showErrorToast("No Results", "Try different keywords or filters")
      }
    } catch (e: any) {
      showErrorToast("Failed to search jobs", e?.message || "Please try again")
      if (activeSource === "google") {
        setGoogleResults([])
      } else {
        setInternalResults([])
      }
    } finally {
      setIsSearching(false)
    }
  }

  const openAddFromResult = (job: JobSearchResult) => {
    const company = typeof job.company === 'object' 
      ? job.company?.display_name 
      : firstString(job, ["company_name", "company", "employer", "organization", "source"])
      
    const title = job.title || firstString(job, ["job_title", "title", "position", "role"])

    setAddCompany(company || "")
    setAddTitle(title || "")
    setAddDate(todayYMD())
    if (wishlistPipelineId) setAddPipelineId(wishlistPipelineId)
    if (cvs.length > 0) setAddCvId(String(cvs[0].id))
    setIsAddOpen(true)
  }

  const submitAdd = async () => {
    if (!addCompany.trim() || !addTitle.trim() || !addDate.trim() || !addPipelineId || !addCvId) {
      showErrorToast("Missing fields", "Please fill all fields")
      return
    }
    try {
      setIsAdding(true)
      await createJobApplication({
        company_name: addCompany.trim(),
        job_title: addTitle.trim(),
        application_date: addDate,
        pipeline_id: addPipelineId,
        cv_id: addCvId,
      })
      showSuccessToast("Added to applications", "You can move it by drag & drop in Applications")
      setIsAddOpen(false)
    } catch (e: any) {
      showErrorToast("Failed to add application", e?.message || "Please try again")
    } finally {
      setIsAdding(false)
    }
  }

  // Get company initials for avatar
  const getCompanyInitials = (company: string) => {
    return company
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const toggleEmployment = (type: keyof typeof employmentType) => {
    setEmploymentType(prev => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-4 text-center sm:text-left">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl resumaic-gradient-green text-white shadow-lg shadow-[#70E4A8]/25 mb-3 sm:mb-0 transition-transform hover:scale-105 duration-300">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Job Search
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base max-w-md mx-auto sm:mx-0">
              Discover opportunities and add them to your pipeline
            </p>
          </div>
        </div>
        
        <Tabs 
          value={activeSource} 
          onValueChange={(v) => {
            try {
              setActiveSource(v as "internal" | "google")
            } catch (e) {
              console.error("Tab switch error", e)
            }
          }} 
          className="w-full sm:w-auto max-w-full"
          aria-label="Job Search Source"
        >
          <TabsList className=" grid grid-cols-2 bg-gray-100/80 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 p-1 rounded-xl h-auto">
            <TabsTrigger 
              value="internal" 
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#70e4a8] data-[state=active]:to-[#4ade80] 
                data-[state=active]:text-white data-[state=active]:shadow-md
                text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50
                focus-visible:ring-2 focus-visible:ring-[#70E4A8] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Search className="h-4 w-4" />
              <span>Internal</span>
            </TabsTrigger>
            <TabsTrigger 
              value="google" 
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
                data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#70e4a8] data-[state=active]:to-[#4ade80] 
                data-[state=active]:text-white data-[state=active]:shadow-md
                text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-800/50
                focus-visible:ring-2 focus-visible:ring-[#70E4A8] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Google</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search Card */}
      <Card className="border-[#70E4A8]/25 bg-white/80 dark:bg-gray-950/30 hover:shadow-lg transition-shadow duration-300">
        <CardContent className="pt-6 space-y-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Input
                  value={what}
                  onChange={(e) => setWhat(e.target.value)}
                  placeholder="Job title, keywords..."
                  className="pl-10 py-6 text-base bg-white text-gray-900 border-gray-200/80 shadow-sm focus-visible:ring-[#70E4A8]/30 dark:bg-[#0B0F1A] dark:text-gray-100 dark:border-gray-800"
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
              <div className="relative">
                <Input
                  value={where}
                  onChange={(e) => setWhere(e.target.value)}
                  placeholder="Location (city, state, zip)..."
                  className="pl-10 py-6 text-base bg-white text-gray-900 border-gray-200/80 shadow-sm focus-visible:ring-[#70E4A8]/30 dark:bg-[#0B0F1A] dark:text-gray-100 dark:border-gray-800"
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                />
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
            </div>

            <div className="flex gap-2">
              {activeSource === "internal" && (
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`h-full px-4 border-gray-200/80 dark:border-gray-800 ${showFilters ? "bg-[#70E4A8]/10 border-[#70E4A8]/30 text-[#70E4A8]" : ""}`}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              )}
              
              <Button
                onClick={runSearch}
                className="resumaic-gradient-green text-white hover:opacity-90 button-press py-6 px-8 shadow-sm min-w-[140px]"
                disabled={isSearching || !what.trim()}
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Searching
                  </>
                ) : (
                  <>
                    <Search className="h-5 w-5 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && activeSource === "internal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2 duration-300">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase">Sort By</Label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className="w-full bg-white dark:bg-[#0B0F1A]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-500 uppercase">Salary Range</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={salaryMin} 
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="bg-white dark:bg-[#0B0F1A]"
                  />
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={salaryMax} 
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="bg-white dark:bg-[#0B0F1A]"
                  />
                </div>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label className="text-xs font-medium text-gray-500 uppercase">Employment Type</Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "full_time", label: "Full Time" },
                    { id: "part_time", label: "Part Time" },
                    { id: "contract", label: "Contract" },
                    { id: "permanent", label: "Permanent" },
                    { id: "temp", label: "Temporary" },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => toggleEmployment(type.id as keyof typeof employmentType)}
                      className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
                        ${employmentType[type.id as keyof typeof employmentType]
                          ? "bg-[#70E4A8]/20 border-[#70E4A8] text-[#0ea5e9] dark:text-[#70E4A8]"
                          : "bg-white dark:bg-[#0B0F1A] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                        }
                      `}
                    >
                      {employmentType[type.id as keyof typeof employmentType] && <Check className="h-3 w-3" />}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 lg:col-span-4">
                 <div className="flex items-center gap-2">
                   <Label className="text-xs font-medium text-gray-500 uppercase">Exclude Keywords</Label>
                 </div>
                 <Input
                    value={whatExclude}
                    onChange={(e) => setWhatExclude(e.target.value)}
                    placeholder="e.g. senior, manager (words to exclude)"
                    className="bg-white dark:bg-[#0B0F1A]"
                 />
              </div>
            </div>
          )}

          {isLoadingMeta && (
            <div className="flex items-center justify-center p-4">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading your pipelines and CVs...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {currentResults.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Found {currentResults.length} {currentResults.length === 1 ? 'Job' : 'Jobs'}
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => clearResults()}
                className="text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              <Badge variant="outline" className="border-[#70E4A8]/30 text-[#70E4A8]">
                {activeSource === 'google' ? 'Google Search' : 'Internal Search'}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentResults.map((job, idx) => {
              // Extract data with fallbacks for nested objects
              const title = job.title || firstString(job, ["job_title", "position", "role"]) || "Untitled role"
              
              // Company handling
              const companyName = typeof job.company === 'object' 
                ? job.company?.display_name 
                : firstString(job, ["company_name", "company", "employer", "organization"]) || "Unknown company"
                
              // Location handling
              const locationName = typeof job.location === 'object' 
                ? job.location?.display_name 
                : firstString(job, ["location", "job_location", "city", "country"])

              // Category handling
              const categoryLabel = typeof job.category === 'object'
                ? job.category?.label
                : job.category

              const url = job.redirect_url || firstUrl(job)
              const salary = formatSalary(job.salary_min, job.salary_max) || firstString(job, ["salary", "compensation", "pay_range"])
              const description = firstString(job, ["description", "snippet", "summary"])
              const created = job.created ? new Date(job.created) : null
              
              const contractTime = job.contract_time ? job.contract_time.replace(/_/g, ' ') : null
              const contractType = job.contract_type ? job.contract_type.replace(/_/g, ' ') : null

              return (
                <Card 
                  key={`${companyName}-${title}-${idx}`} 
                  className="border-[#70E4A8]/20 hover:border-[#70E4A8]/40 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col h-full bg-white dark:bg-[#0B0F1A] p-0 gap-0"
                >
                  <div className="absolute top-0 left-0 w-1 h-full resumaic-gradient-green opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardHeader className="p-4 pb-2 relative">
                     <div className="flex justify-between items-start gap-3">
                         <div className="flex gap-3 overflow-hidden">
                            <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-gray-100 dark:border-gray-800 shrink-0">
                              <AvatarFallback className="bg-gradient-to-br from-[#70E4A8]/20 to-[#70E4A8]/5 text-[#70E4A8] font-bold text-sm sm:text-base">
                                {getCompanyInitials(companyName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                               <h3 className="font-bold text-base sm:text-lg leading-tight pr-2 text-gray-900 dark:text-gray-100 line-clamp-2 sm:line-clamp-3 mb-1" title={title}>
                                 {title}
                               </h3>
                               <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                 <Building className="h-3.5 w-3.5 shrink-0" />
                                 <span className="truncate font-medium">{companyName}</span>
                               </div>
                            </div>
                         </div>
                         {created && (
                            <div className="shrink-0 flex items-center text-[10px] sm:text-xs text-gray-400 whitespace-nowrap bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800 mt-0.5">
                               <Clock className="h-3 w-3 mr-1" />
                               {formatDistanceToNow(created, { addSuffix: true }).replace("about ", "")}
                            </div>
                         )}
                     </div>
                  </CardHeader>
                  
                  <CardContent className="flex-1 space-y-3 p-4 pt-2">
                     {/* Tags Row */}
                     <div className="flex flex-wrap gap-2 text-xs">
                        {locationName && (
                           <Badge variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 border-transparent font-normal">
                             <MapPin className="h-3 w-3 mr-1" />
                             {locationName}
                           </Badge>
                        )}
                        {salary && (
                           <Badge variant="secondary" className="bg-[#70E4A8]/10 text-[#0ea5e9] dark:text-[#70E4A8] hover:bg-[#70E4A8]/20 border-transparent font-normal">
                             <DollarSign className="h-3 w-3 mr-1" />
                             {salary}
                           </Badge>
                        )}
                        {categoryLabel && (
                           <Badge variant="outline" className="text-gray-500 font-normal border-dashed">
                              <Tag className="h-3 w-3 mr-1" />
                              {categoryLabel}
                           </Badge>
                        )}
                        {contractTime && (
                           <Badge variant="outline" className="text-gray-500 capitalize font-normal">
                              {contractTime}
                           </Badge>
                        )}
                        {contractType && (
                           <Badge variant="outline" className="text-gray-500 capitalize font-normal">
                              {contractType}
                           </Badge>
                        )}
                     </div>

                     {/* Description */}
                     {description && (
                       <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">
                         {description.replace(/<[^>]*>/g, '')}
                       </p>
                     )}
                  </CardContent>

                  <CardFooter className="p-4 pt-0 flex flex-col gap-2">
                     <div className="flex w-full gap-2">
                        <Button
                          className="resumaic-gradient-green text-white hover:opacity-90 flex-1 shadow-sm h-10"
                          onClick={() => openAddFromResult(job)}
                          disabled={pipelines.length === 0 || cvs.length === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Wishlist
                        </Button>
                        {url && (
                           <Button
                             variant="outline"
                             className="px-3 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 h-10 w-10 p-0 shrink-0"
                             onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                             title="Apply on site"
                           >
                             <ExternalLink className="h-4 w-4" />
                           </Button>
                        )}
                     </div>
                     
                     {/* Warnings */}
                     {pipelines.length === 0 ? (
                       <div className="w-full text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 py-1.5 rounded">
                         Create pipelines first
                       </div>
                     ) : cvs.length === 0 ? (
                       <div className="w-full text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 py-1.5 rounded">
                         Create CV first
                       </div>
                     ) : null}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isSearching && currentResults.length === 0 && what && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gray-100 dark:bg-gray-900 p-6 mb-4">
              <Search className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
              Try adjusting your search terms or try a different search source
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setWhat("Software Engineer")}
                className="text-sm"
              >
                Software Engineer
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setWhat("Product Manager")}
                className="text-sm"
              >
                Product Manager
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setWhat("Remote Developer")}
                className="text-sm"
              >
                Remote Developer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!isSearching && currentResults.length === 0 && !what && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-[#0B0F1A] dark:to-gray-900/50">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full resumaic-gradient-green p-6 mb-4 animate-float">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Start Your Job Search
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg mb-8">
              Search for your dream job across multiple sources. Add interesting opportunities directly to your application pipeline.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl w-full">
              <Card className="border-[#70E4A8]/20 bg-white/50 dark:bg-gray-900/50">
                <CardContent className="p-4 text-center">
                  <div className="inline-flex p-3 rounded-lg bg-[#70E4A8]/10 mb-3">
                    <Search className="h-6 w-6 text-[#70E4A8]" />
                  </div>
                  <h4 className="font-semibold mb-1">Search Jobs</h4>
                  <p className="text-sm text-gray-500">Find opportunities matching your skills</p>
                </CardContent>
              </Card>
              <Card className="border-[#70E4A8]/20 bg-white/50 dark:bg-gray-900/50">
                <CardContent className="p-4 text-center">
                  <div className="inline-flex p-3 rounded-lg bg-[#70E4A8]/10 mb-3">
                    <Plus className="h-6 w-6 text-[#70E4A8]" />
                  </div>
                  <h4 className="font-semibold mb-1">Add to Pipeline</h4>
                  <p className="text-sm text-gray-500">Save interesting jobs to track later</p>
                </CardContent>
              </Card>
              <Card className="border-[#70E4A8]/20 bg-white/50 dark:bg-gray-900/50">
                <CardContent className="p-4 text-center">
                  <div className="inline-flex p-3 rounded-lg bg-[#70E4A8]/10 mb-3">
                    <Briefcase className="h-6 w-6 text-[#70E4A8]" />
                  </div>
                  <h4 className="font-semibold mb-1">Track Applications</h4>
                  <p className="text-sm text-gray-500">Monitor your job application progress</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isSearching && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#70E4A8] mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Searching for jobs...
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Scanning {activeSource === 'google' ? 'Google Jobs' : 'our database'} for "{what}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Add Application Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[520px] border-[#70E4A8]/30 dark:bg-[#0B0F1A]">
          <DialogHeader className="relative pb-4 mb-4 border-b dark:border-gray-800">
            <div className="absolute -left-6 -top-6 w-32 h-32 resumaic-gradient-green opacity-10 blur-3xl -z-10" />
            <DialogTitle className="text-xl font-bold dark:text-gray-100">Add to Applications</DialogTitle>
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              Save this job to your pipeline. You can drag & drop between stages later.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Company Name</Label>
              <Input 
                value={addCompany} 
                onChange={(e) => setAddCompany(e.target.value)} 
                placeholder="e.g., Google, Microsoft, Apple" 
                className="dark:bg-gray-900 dark:border-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Job Title</Label>
              <Input 
                value={addTitle} 
                onChange={(e) => setAddTitle(e.target.value)} 
                placeholder="e.g., Senior Software Engineer, Product Manager" 
                className="dark:bg-gray-900 dark:border-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Application Date</Label>
              <Input 
                type="date" 
                value={addDate} 
                onChange={(e) => setAddDate(e.target.value)} 
                className="dark:bg-gray-900 dark:border-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Pipeline Stage</Label>
              <Select value={addPipelineId} onValueChange={setAddPipelineId}>
                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#0B0F1A] dark:border-gray-800">
                  {pipelines.map((p) => (
                    <SelectItem key={String(p.id)} value={String(p.id)} className="dark:hover:bg-gray-900">
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 dark:text-gray-300">Attached CV</Label>
              <Select value={addCvId} onValueChange={setAddCvId}>
                <SelectTrigger className="dark:bg-gray-900 dark:border-gray-800">
                  <SelectValue placeholder="Select CV" />
                </SelectTrigger>
                <SelectContent className="dark:bg-[#0B0F1A] dark:border-gray-800">
                  {cvs.map((cv) => (
                    <SelectItem key={String(cv.id)} value={String(cv.id)} className="dark:hover:bg-gray-900">
                      {cv.title || `CV ${cv.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsAddOpen(false)} 
              disabled={isAdding}
              className="border-gray-300 dark:border-gray-700"
            >
              Cancel
            </Button>
            <Button 
              className="resumaic-gradient-green text-white hover:opacity-90 button-press" 
              onClick={submitAdd} 
              disabled={isAdding}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding…
                </>
              ) : (
                "Add to Applications"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
