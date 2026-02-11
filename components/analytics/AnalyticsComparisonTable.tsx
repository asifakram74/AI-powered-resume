"use client"

import { useEffect, useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../ui/table"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
import { Badge } from "../ui/badge"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  User, 
  File,
  Calendar
} from "lucide-react"
import { getUserResourceStats, type ResourceStats } from "../../lib/redux/service/analyticsService"
import { cn } from "../../lib/utils"

interface AnalyticsComparisonTableProps {
  days: number
}

export function AnalyticsComparisonTable({ days }: AnalyticsComparisonTableProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ResourceStats[]>([])
  const [filterType, setFilterType] = useState<string>("all")

  useEffect(() => {
    fetchData()
  }, [days, filterType])

  const fetchData = async () => {
    setLoading(true)
    try {
      const type = filterType === "all" ? undefined : filterType
      const stats = await getUserResourceStats(days, type)
      setData(stats)
    } catch (error) {
      console.error("Failed to fetch resource stats", error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'cv': return <FileText className="h-4 w-4 text-blue-500" />
      case 'profile_card': return <User className="h-4 w-4 text-violet-500" />
      case 'cover_letter': return <File className="h-4 w-4 text-orange-500" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatType = (type: string) => {
    if (!type) return "Unknown"
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const TrendIndicator = ({ stat }: { stat?: { count: number; growth_percent: number; trend: 'up' | 'down' } }) => {
    if (!stat || stat.count === 0) return <span className="text-muted-foreground">-</span>

    const isPositive = stat.trend === 'up'
    const growthValue = Math.abs(stat.growth_percent)
    
    return (
      <div className="flex items-center gap-2">
        <span className="font-medium">{stat.count}</span>
        {growthValue > 0 && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-[10px] px-1 py-0 h-5 gap-0.5 font-normal border-0",
              isPositive 
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" 
                : "bg-red-50 text-red-600 dark:bg-red-950/30"
            )}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {growthValue.toFixed(1)}%
          </Badge>
        )}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Resource Performance</CardTitle>
              <CardDescription>Compare performance across your documents</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Resource Performance</CardTitle>
            <CardDescription>
              Compare performance across your documents
              {days && ` • Last ${days} days`}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {/* <Calendar className="h-4 w-4 text-muted-foreground" /> */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="cv">CVs</SelectItem>
                <SelectItem value="cover_letter">Cover Letters</SelectItem>
                <SelectItem value="profile_card">Profile Cards</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Resource Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Views
                    <span className="text-[10px] text-muted-foreground font-normal">(growth)</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Downloads
                    <span className="text-[10px] text-muted-foreground font-normal">(growth)</span>
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    Shares
                    <span className="text-[10px] text-muted-foreground font-normal">(growth)</span>
                  </div>
                </TableHead>
                <TableHead className="text-right">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!Array.isArray(data) || data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No resources found for this period
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <TableRow 
                    key={`${item.resource_type}-${item.resource_id}`} 
                    className="group hover:bg-gray-50 dark:hover:bg-gray-900/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getIcon(item.resource_type)}
                        <span className="truncate max-w-[200px]" title={item.title}>
                          {item.title || "Untitled"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {formatType(item.resource_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <TrendIndicator stat={item.stats?.view} />
                    </TableCell>
                    <TableCell>
                      <TrendIndicator stat={item.stats?.download} />
                    </TableCell>
                    <TableCell>
                      <TrendIndicator stat={item.stats?.share} />
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs">
                      {formatDate(item.created_at)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {data.length > 0 && (
            <div className="mt-4 text-xs text-muted-foreground text-right border-t pt-3">
              <span>Showing {data.length} resource{data.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}