"use client"

import { useEffect, useState } from "react"
import { useAppSelector } from "../../lib/redux/hooks"
import {
  getUserAnalyticsSummary,
  getAdminAnalyticsSummary,
  getAdminDashboard,
  type AnalyticsSummary,
  type AdminDashboardData
} from "../../lib/redux/service/analyticsService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Loader2, Eye, Download, TrendingUp, Share2, FileText, User, Crown, Copy, MousePointerClick, QrCode, MoveVertical, FolderOpen } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"
import { cn } from "../../lib/utils"

export default function AnalyticsPage() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const isAdmin = user?.role?.toLowerCase() === "admin" || profile?.role?.toLowerCase() === "admin"

  const [days, setDays] = useState("30")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [adminDashboard, setAdminDashboard] = useState<AdminDashboardData | null>(null)

  useEffect(() => {
    fetchData()
  }, [days, isAdmin])

  const fetchData = async () => {
    setLoading(true)
    try {
      const daysNum = parseInt(days)
      if (isAdmin) {
        const [summaryData, dashboardData] = await Promise.all([
          getAdminAnalyticsSummary(daysNum),
          getAdminDashboard(daysNum)
        ])
        setSummary(summaryData)
        setAdminDashboard(dashboardData)
      } else {
        const summaryData = await getUserAnalyticsSummary(daysNum)
        setSummary(summaryData)
      }
    } catch (error) {
      console.error("Failed to fetch analytics", error)
    } finally {
      setLoading(false)
    }
  }

  const EVENT_CONFIG: Record<string, { label: string, icon: any, color: string }> = {
    view: { label: "Views", icon: Eye, color: "text-emerald-600" },
    download: { label: "Downloads", icon: Download, color: "text-blue-600" },
    share: { label: "Shares", icon: Share2, color: "text-indigo-600" },
    copy: { label: "Copies", icon: Copy, color: "text-orange-600" },
    click: { label: "Clicks", icon: MousePointerClick, color: "text-purple-600" },
    qr_scan: { label: "QR Scans", icon: QrCode, color: "text-pink-600" },
    scroll: { label: "Scrolls", icon: MoveVertical, color: "text-gray-600" },
    upgrade_click: { label: "Upgrades", icon: Crown, color: "text-yellow-600" },
    directory_view: { label: "Dir Views", icon: FolderOpen, color: "text-teal-600" },
  }

  const StatCard = ({ title, value, icon: Icon, subtext, className, iconColor }: any) => (
    <Card className={cn("border-l-4 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconColor || "text-emerald-600")} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
      </CardContent>
    </Card>
  )

  const SimpleBarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    if (!data || data.length === 0) return <div className="text-center py-10 text-muted-foreground">No data available</div>
    const maxValue = Math.max(...data.map(d => d.value)) || 1
    
    // Ensure we have enough bars to look good, or center them
    return (
      <div className="h-64 flex items-end justify-center gap-1 pt-6 pb-2 w-full">
        {data.map((item, i) => (
          <div key={i} className="flex flex-col items-center flex-1 max-w-[40px] group h-full justify-end">
            <div 
              className="w-full bg-emerald-500/20 hover:bg-emerald-500/40 transition-all rounded-t-sm relative group-hover:shadow-md"
              style={{ height: `${Math.max((item.value / maxValue) * 100, 4)}%` }} 
            >
              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                {item.value} views
                <div className="text-[9px] opacity-70">{item.label}</div>
              </div>
            </div>
             {/* Only show every 5th label or if small dataset */}
            <span className="text-[10px] text-muted-foreground mt-2 rotate-45 origin-left truncate w-full text-center h-4">
               {(data.length < 15 || i % Math.ceil(data.length / 7) === 0) ? item.label : ''}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  const dailyViewsData = summary?.daily?.map(d => ({ 
    label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
    value: Number(d.views || 0)
  })) || []

  // Calculate dynamic stats
  const eventTypes = summary?.totals ? Object.keys(summary.totals) : []
  // Ensure we always have views and downloads if they exist or are 0, but respect other keys
  const defaultKeys = ['view', 'download']
  const allKeys = Array.from(new Set([...defaultKeys, ...eventTypes]))

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin ? "Global performance overview & leaderboards" : "Track your content performance"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[160px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {allKeys.map(key => {
            if (summary?.totals[key] === undefined && !defaultKeys.includes(key)) return null
            const config = EVENT_CONFIG[key] || { label: key, icon: FileText, color: "text-gray-600" }
            return (
                <StatCard 
                    key={key}
                    title={`Total ${config.label}`} 
                    value={summary?.totals[key] || 0} 
                    icon={config.icon}
                    iconColor={config.color}
                    className={`border-l-${config.color.replace('text-', '')}`}
                    subtext={`In the last ${days} days`}
                />
            )
        })}

        <StatCard 
          title="Conversion Rate" 
          value={`${((Number(summary?.totals?.download || 0) / Number(summary?.totals?.view || 1)) * 100).toFixed(1)}%`} 
          icon={TrendingUp}
          className="border-l-emerald-500"
          subtext="Views to Downloads"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Overview</TabsTrigger>
          {isAdmin && <TabsTrigger value="leaderboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Leaderboards</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-7">
            {/* Main Chart */}
            <Card className="md:col-span-4 border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Traffic Overview</CardTitle>
                <CardDescription>Daily views over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={dailyViewsData} />
              </CardContent>
            </Card>
            
            {/* Resource Breakdown */}
            <Card className="md:col-span-3 border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader>
                <CardTitle>Engagement by Type</CardTitle>
                <CardDescription>Actions Breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {summary?.by_resource_type && Object.entries(summary.by_resource_type).map(([type, stats]) => {
                     const views = stats.view || 0;
                     const totalActivity = Object.values(stats).reduce((a, b) => Number(a) + Number(b), 0);
                     
                     return (
                      <div key={type} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {type === 'cv' && <FileText className="h-4 w-4 text-blue-500" />}
                            {type === 'cover_letter' && <FileText className="h-4 w-4 text-purple-500" />}
                            {type === 'profile_card' && <User className="h-4 w-4 text-emerald-500" />}
                            <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{views} views</span>
                        </div>
                        
                        {/* Dynamic Progress Bars for non-view events */}
                        <div className="space-y-2">
                             {Object.entries(stats).map(([eventKey, count]) => {
                                 if (eventKey === 'view' || count === 0) return null;
                                 const config = EVENT_CONFIG[eventKey] || { label: eventKey, color: "text-gray-500" };
                                 const percentage = Math.round((Number(count) / (views || 1)) * 100); // Relative to views
                                 
                                 return (
                                     <div key={eventKey} className="text-xs">
                                         <div className="flex justify-between mb-1 text-muted-foreground">
                                             <span>{config.label}</span>
                                             <span>{count} ({percentage}%)</span>
                                         </div>
                                         <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                             <div 
                                                 className={`h-full rounded-full ${config.color.replace('text-', 'bg-')}`} 
                                                 style={{ width: `${Math.min(percentage, 100)}%` }}
                                             />
                                         </div>
                                     </div>
                                 )
                             })}
                        </div>
                      </div>
                    )
                  })}
                  {(!summary?.by_resource_type) && (
                    <div className="text-center py-8 text-muted-foreground">No data available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isAdmin && adminDashboard && (
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Top CVs */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Top CVs
                  </CardTitle>
                  <CardDescription>Most viewed resumes</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Views</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminDashboard.top_cvs.map((item) => (
                        <TableRow key={item.cv_id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.owner?.name || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">{item.owner?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-emerald-600">{item.views}</TableCell>
                        </TableRow>
                      ))}
                      {adminDashboard.top_cvs.length === 0 && (
                        <TableRow>
                           <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">No data</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Top Cover Letters */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    Top Cover Letters
                  </CardTitle>
                  <CardDescription>Most downloaded letters</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Downloads</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminDashboard.top_cover_letters.map((item) => (
                        <TableRow key={item.cover_letter_id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.owner?.name || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">{item.owner?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-purple-600">{item.downloads}</TableCell>
                        </TableRow>
                      ))}
                      {adminDashboard.top_cover_letters.length === 0 && (
                        <TableRow>
                           <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">No data</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Top Profiles */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-blue-500" />
                    Top Profiles
                  </CardTitle>
                  <CardDescription>Most shared profiles</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                   <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Shares</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminDashboard.top_profiles.map((item) => (
                        <TableRow key={item.profile_id}>
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{item.owner?.name || 'Unknown'}</span>
                              <span className="text-xs text-muted-foreground">{item.owner?.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold text-blue-600">{item.shares}</TableCell>
                        </TableRow>
                      ))}
                       {adminDashboard.top_profiles.length === 0 && (
                        <TableRow>
                           <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">No data</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
