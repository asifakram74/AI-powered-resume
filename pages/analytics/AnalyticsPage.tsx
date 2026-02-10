"use client"

import { useEffect, useState, useMemo } from "react"
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
import { Button } from "../../components/ui/button"
import { Loader2, Eye, Download, TrendingUp, Share2, FileText, User, Crown, Copy, MousePointerClick, QrCode, MoveVertical, FolderOpen, PieChart as PieChartIcon, BarChart3, Activity, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { cn } from "../../lib/utils"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// --- Updated Theme & Constants with More Distinct Colors ---
const COLORS = {
  view: "#10b981",      // emerald-500 (green)
  download: "#3b82f6",  // blue-500 (blue)
  share: "#ec4899",     // pink-500 (pink - was violet)
  copy: "#f97316",      // orange-500
  click: "#8b5cf6",     // violet-500 (violet - swapped with share)
  other: "#94a3b8",     // slate-400
}

const EVENT_CONFIG: Record<string, { label: string, icon: any, color: string, hex: string }> = {
  view: { label: "Views", icon: Eye, color: "text-emerald-600", hex: COLORS.view },
  download: { label: "Downloads", icon: Download, color: "text-blue-600", hex: COLORS.download },
  share: { label: "Shares", icon: Share2, color: "text-pink-600", hex: COLORS.share },
  copy: { label: "Copies", icon: Copy, color: "text-orange-600", hex: COLORS.copy },
  click: { label: "Clicks", icon: MousePointerClick, color: "text-violet-600", hex: COLORS.click },
  qr_scan: { label: "QR Scans", icon: QrCode, color: "text-rose-600", hex: "#e11d48" },
  scroll: { label: "Scrolls", icon: MoveVertical, color: "text-gray-600", hex: "#4b5563" },
  upgrade_click: { label: "Upgrades", icon: Crown, color: "text-yellow-600", hex: "#ca8a04" },
  directory_view: { label: "Dir Views", icon: FolderOpen, color: "text-teal-600", hex: "#0d9488" },
}

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

  // --- Data Transformation for Charts ---

  const dailyViewsData = useMemo(() => {
    if (!summary?.daily) return []
    return summary.daily.map(d => ({
      date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      fullDate: d.date,
      views: Number(d.view || 0),
      downloads: Number(d.download || 0),
      shares: Number(d.share || 0)
    }))
  }, [summary])

  const eventDistributionData = useMemo(() => {
    if (!summary?.totals) return []
    // Filter out 0 values and map to chart format
    return Object.entries(summary.totals)
      .filter(([key, value]) => value > 0 && key !== 'view') // Exclude views from pie chart as it dominates
      .map(([key, value]) => ({
        name: EVENT_CONFIG[key]?.label || key,
        value: Number(value),
        color: EVENT_CONFIG[key]?.hex || COLORS.other
      }))
      .sort((a, b) => b.value - a.value)
  }, [summary])

  const resourceTypeData = useMemo(() => {
    if (!summary?.by_resource_type) return []
    return Object.entries(summary.by_resource_type).map(([type, stats]) => ({
      name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      views: Number(stats.view || 0),
      downloads: Number(stats.download || 0),
      shares: Number(stats.share || 0)
    }))
  }, [summary])

  // Calculate trends (simple comparison if we had previous period, here we just show total)
  const totalViews = summary?.totals?.view || 0
  const totalDownloads = summary?.totals?.download || 0
  const totalShares = summary?.totals?.share || 0
  const conversionRate = totalViews > 0 ? ((Number(totalDownloads) / Number(totalViews)) * 100).toFixed(1) : "0.0"

  // --- Render Components ---

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-lg shadow-lg">
          <p className="text-sm font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="capitalize text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  const handleExport = () => {
    if (!summary) return
    
    const csvContent = [
      ["Date", "Views", "Downloads", "Shares"],
      ...summary.daily.map(d => [d.date, d.views, d.downloads, d.shares])
    ].map(e => e.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `analytics_${days}days_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading && !summary) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50 dark:bg-gray-950">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm sm:text-base">
            <Activity className="h-4 w-4 flex-shrink-0" />
            {isAdmin ? "Global performance overview & leaderboards" : "Track your content performance across all platforms"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap hidden lg:inline-block">
              Time Range:
            </span>
            <Select value={days} onValueChange={setDays}>
              <SelectTrigger className="w-[140px] sm:w-[160px] h-9 bg-white dark:bg-gray-900 shadow-sm text-xs sm:text-sm">
                <div className="flex items-center gap-2 truncate">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <SelectValue placeholder="Select period" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 3 months</SelectItem>
                <SelectItem value="180">Last 6 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExport} 
            disabled={loading || !summary} 
            className="bg-white dark:bg-gray-900 shadow-sm h-9 px-3 text-xs sm:text-sm"
          >
            <Download className="h-3.5 w-3.5 mr-2" />
            <span className="hidden sm:inline">Export Report</span>
            <span className="sm:hidden">Export</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards - Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-emerald-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-500 font-medium flex items-center mr-1">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> 
                Top
              </span> 
              metric this period
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Valid downloads
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Views to Downloads
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-pink-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-pink-500 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(totalShares).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Social shares & links
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-full overflow-auto">
          <div className="flex min-w-max">
            <TabsTrigger value="overview" className="gap-2 flex-1 sm:flex-none">
              <BarChart3 className="h-4 w-4" /> 
              <span className="hidden xs:inline">Overview</span>
              <span className="xs:hidden">View</span>
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="leaderboard" className="gap-2 flex-1 sm:flex-none">
                <Crown className="h-4 w-4" /> 
                <span className="hidden xs:inline">Leaderboards</span>
                <span className="xs:hidden">Leaders</span>
              </TabsTrigger>
            )}
          </div>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
          {/* Main Traffic Overview with Shares */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Traffic Overview</CardTitle>
                  <CardDescription>
                    Daily views, downloads, and shares over the last {days} days
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-xs text-muted-foreground">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs text-muted-foreground">Downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                    <span className="text-xs text-muted-foreground">Shares</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-[300px] sm:h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart 
                    data={dailyViewsData} 
                    margin={{ 
                      top: 10, 
                      right: 0, 
                      left: 0, 
                      bottom: 0 
                    }}
                  >
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.view} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.view} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.download} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.download} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.share} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.share} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      vertical={false} 
                      stroke="#e5e7eb" 
                      className="dark:stroke-gray-800" 
                    />
                    <XAxis 
                      dataKey="date" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 11, fill: '#6b7280' }} 
                      dy={10}
                      minTickGap={20}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fontSize: 11, fill: '#6b7280' }} 
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      name="Views"
                      stroke={COLORS.view} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="downloads" 
                      name="Downloads"
                      stroke={COLORS.download} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorDownloads)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="shares" 
                      name="Shares"
                      stroke={COLORS.share} 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorShares)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Charts Row - Responsive Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Event Distribution Pie Chart */}
            <Card className="lg:col-span-1 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Engagement Distribution</CardTitle>
                <CardDescription className="text-sm">Actions breakdown (excluding views)</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full relative px-2">
                  {eventDistributionData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={eventDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {eventDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Center Text Overlay */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[65%] text-center pointer-events-none">
                        <div className="text-2xl font-bold">
                          {eventDistributionData.reduce((acc, curr) => acc + curr.value, 0)}
                        </div>
                        <div className="text-xs text-muted-foreground">Actions</div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                      No engagement data yet
                    </div>
                  )}
                </div>
                {/* Legend - Below chart on mobile */}
                <div className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    {eventDistributionData.slice(0, 4).map((entry, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate text-muted-foreground">{entry.name}</span>
                        <span className="font-medium ml-auto">{entry.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resource Performance with Shares */}
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Resource Performance</CardTitle>
                <CardDescription className="text-sm">Views, Downloads & Shares by content type</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[300px] w-full px-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={resourceTypeData} 
                      margin={{ 
                        top: 20, 
                        right: 10, 
                        left: 0, 
                        bottom: 10 
                      }}
                      barGap={4}
                      barSize={24}
                    >
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="#e5e7eb" 
                        className="dark:stroke-gray-800" 
                      />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        tick={{ fontSize: 11, fill: '#6b7280' }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar 
                        dataKey="views" 
                        name="Views" 
                        fill={COLORS.view} 
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar 
                        dataKey="downloads" 
                        name="Downloads" 
                        fill={COLORS.download} 
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar 
                        dataKey="shares" 
                        name="Shares" 
                        fill={COLORS.share} 
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats Grid */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>Breakdown of all tracked events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {Object.entries(EVENT_CONFIG).map(([key, config]) => {
                  const value = summary?.totals?.[key] || 0
                  if (value === 0 && key !== 'view') return null // Skip empty non-view events
                  
                  return (
                    <div 
                      key={key} 
                      className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className={`p-2 rounded-full bg-white dark:bg-gray-800 shadow-sm mr-3 ${config.color}`}>
                        <config.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground truncate">{config.label}</p>
                        <p className="text-lg font-bold truncate">{value.toLocaleString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && adminDashboard && (
          <TabsContent value="leaderboard" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Top CVs */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    Top CVs
                  </CardTitle>
                  <CardDescription className="text-sm">Most viewed resumes</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3">User</TableHead>
                          <TableHead className="px-4 py-3 text-right">Views</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminDashboard.top_cvs.map((item) => (
                          <TableRow key={item.cv_id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <TableCell className="px-4 py-3">
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate">{item.owner?.name || 'Unknown'}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {item.owner?.email || 'No email'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <div className="font-bold text-emerald-600">{item.views}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {adminDashboard.top_cvs.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                              No data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Top Cover Letters */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="h-5 w-5 text-purple-500 flex-shrink-0" />
                    Top Cover Letters
                  </CardTitle>
                  <CardDescription className="text-sm">Most downloaded letters</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3">User</TableHead>
                          <TableHead className="px-4 py-3 text-right">Downloads</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminDashboard.top_cover_letters.map((item) => (
                          <TableRow key={item.cover_letter_id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <TableCell className="px-4 py-3">
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate">{item.owner?.name || 'Unknown'}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {item.owner?.email || 'No email'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <div className="font-bold text-blue-600">{item.downloads}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {adminDashboard.top_cover_letters.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                              No data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Top Profiles */}
              <Card className="border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Crown className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    Top Profiles
                  </CardTitle>
                  <CardDescription className="text-sm">Most shared profiles</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="px-4 py-3">User</TableHead>
                          <TableHead className="px-4 py-3 text-right">Shares</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {adminDashboard.top_profiles.map((item) => (
                          <TableRow key={item.profile_id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                            <TableCell className="px-4 py-3">
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium truncate">{item.owner?.name || 'Unknown'}</span>
                                <span className="text-xs text-muted-foreground truncate">
                                  {item.owner?.email || 'No email'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="px-4 py-3 text-right">
                              <div className="font-bold text-pink-600">{item.shares}</div>
                            </TableCell>
                          </TableRow>
                        ))}
                        {adminDashboard.top_profiles.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                              No data available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}