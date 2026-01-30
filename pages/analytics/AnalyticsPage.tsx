"use client"

import { useEffect, useState } from "react"
import { useAppSelector } from "../../lib/redux/hooks"
import { 
  getUserAnalyticsSummary, 
  getAdminAnalyticsSummary, 
  getAdminTopResources,
  type AnalyticsSummary,
  type TopResource 
} from "../../lib/redux/service/analyticsService"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Loader2, BarChart3, Download, Eye, TrendingUp, FileText, User } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { Badge } from "../../components/ui/badge"

export default function AnalyticsPage() {
  const { user, profile } = useAppSelector((state) => state.auth)
  const isAdmin = user?.role?.toLowerCase() === "admin" || profile?.role?.toLowerCase() === "admin"
  
  const [days, setDays] = useState("30")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [topResources, setTopResources] = useState<TopResource[]>([])

  useEffect(() => {
    fetchData()
  }, [days, isAdmin])

  const fetchData = async () => {
    setLoading(true)
    try {
      const daysNum = parseInt(days)
      if (isAdmin) {
        const [summaryData, topData] = await Promise.all([
          getAdminAnalyticsSummary(daysNum),
          getAdminTopResources(daysNum)
        ])
        setSummary(summaryData)
        setTopResources(Array.isArray(topData) ? topData : [])
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

  const StatCard = ({ title, value, icon: Icon, subtext }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
      </CardContent>
    </Card>
  )

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            {isAdmin ? "Global performance overview" : "Track how your content is performing"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={days} onValueChange={setDays}>
            <SelectTrigger className="w-[180px]">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Views" 
          value={summary?.total_views || 0} 
          icon={Eye}
          subtext={`In the last ${days} days`}
        />
        <StatCard 
          title="Total Downloads" 
          value={summary?.total_downloads || 0} 
          icon={Download}
          subtext={`In the last ${days} days`}
        />
        {summary?.unique_visitors !== undefined && (
          <StatCard 
            title="Unique Visitors" 
            value={summary.unique_visitors} 
            icon={User}
            subtext="Estimated unique users"
          />
        )}
        <StatCard 
          title="Conversion Rate" 
          value={`${((summary?.total_downloads || 0) / (summary?.total_views || 1) * 100).toFixed(1)}%`} 
          icon={TrendingUp}
          subtext="Views to Downloads"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {isAdmin && <TabsTrigger value="top-content">Top Content</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Resource Performance</CardTitle>
                <CardDescription>Views by resource type</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="space-y-4 p-4">
                  {summary?.views_by_type && Object.entries(summary.views_by_type).map(([type, count]) => (
                    <div key={type} className="flex items-center">
                      <div className="w-full flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground">{count} views</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div 
                            className="h-full bg-primary" 
                            style={{ width: `${(count / (summary.total_views || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(!summary?.views_by_type || Object.keys(summary.views_by_type).length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No data available for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Downloads Breakdown</CardTitle>
                <CardDescription>Downloads by resource type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 p-4">
                  {summary?.downloads_by_type && Object.entries(summary.downloads_by_type).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between border-b pb-2 last:border-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                      </div>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                  {(!summary?.downloads_by_type || Object.keys(summary.downloads_by_type).length === 0) && (
                    <div className="text-center text-muted-foreground py-8">
                      No data available for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="top-content">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Resources</CardTitle>
                <CardDescription>
                  Most popular content across the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Resource ID</TableHead>
                      <TableHead className="text-right">Total Interactions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(topResources) && topResources.map((resource) => (
                      <TableRow key={`${resource.resource_type}-${resource.resource_id}`}>
                        <TableCell className="font-medium capitalize">
                          {resource.resource_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{resource.resource_id}</TableCell>
                        <TableCell className="text-right">{resource.total}</TableCell>
                      </TableRow>
                    ))}
                    {(!Array.isArray(topResources) || topResources.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
