import { api } from "../../api"

// --- Interfaces based on Backend Response ---

export interface AnalyticsRange {
  from: string
  to: string
}

export interface AnalyticsTotals {
  [key: string]: number
}

export interface ResourceTypeStats {
  [key: string]: number
}

export interface DailyStat {
  date: string
  [key: string]: number | string
}

export interface AnalyticsSummary {
  range: AnalyticsRange
  totals: AnalyticsTotals
  by_resource_type: {
    cv: ResourceTypeStats
    cover_letter: ResourceTypeStats
    profile_card: ResourceTypeStats
  }
  daily: DailyStat[]
  user?: {
    id: number
    name: string
    email: string
  }
}

/**
 * Extended analytics interface for single resource response
 * Backend returns additional fields for resource-specific endpoints
 */
export interface ResourceAnalytics extends AnalyticsSummary {
  resource_type: string
  resource_id: number
  stats?: {
    [key: string]: TrendStat
  }
  user?: {
    id: number
    name: string
    email: string
  }
}

export interface TopResourceItem {
  resource_type: string
  resource_id: number
  owner_id: number
  user?: {
    id: number
    name: string
    email: string
  }
  views: number
  downloads: number
  total: number
}

export interface TopResourceResponse {
  range: AnalyticsRange
  items: TopResourceItem[]
}

export interface TopCV {
  cv_id: number
  owner: { id: number; name: string; email: string }
  views: number
}

export interface TopCoverLetter {
  cover_letter_id: number
  owner: { id: number; name: string; email: string }
  downloads: number
}

export interface TopProfile {
  profile_id: number
  owner: { id: number; name: string; email: string }
  shares: number
}

export interface AdminDashboardData {
  range: AnalyticsRange
  top_cvs: TopCV[]
  top_cover_letters: TopCoverLetter[]
  top_profiles: TopProfile[]
  events_by_user?: Record<string, number>
}

export interface AnalyticsEvent {
  id: number
  user_id?: number
  resource_type: string
  resource_id: number
  event_type: string
  created_at: string
}

export interface TrendStat {
  count: number
  previous: number
  growth_percent: number
  trend: 'up' | 'down'
}

export interface ResourceStats {
  resource_id: number
  resource_type: 'cv' | 'cover_letter' | 'profile_card'
  title: string
  public_slug: string
  created_at: string
  stats: {
    view?: TrendStat
    download?: TrendStat
    share?: TrendStat
    copy?: TrendStat
    click?: TrendStat
  }
}

export interface ResourceStatsResponse {
  range: AnalyticsRange
  items: ResourceStats[]
}

// --- API Service Functions ---

/**
 * Track an analytics event
 */
export const trackEvent = async (data: {
  resource_type: 'cv' | 'cover_letter' | 'profile_card'
  resource_id?: number
  resource_key?: string // For public slugs
  event_type: 'view' | 'download' | 'click' | 'share' | 'copy' | 'qr_scan' | 'scroll' | 'directory_view' | 'upgrade_click'
  event_context?: string
  referrer?: string
  meta?: any
}) => {
  try {
    await api.post('/analytics/track', data)
  } catch (error) {
    console.error('Failed to track analytics event', error)
  }
}

/**
 * Get analytics summary for the current user
 * GET /analytics/summary?days={days}
 */
export const getUserAnalyticsSummary = async (days: number = 30): Promise<AnalyticsSummary> => {
  const response = await api.get(`/analytics/summary?days=${days}`)
  return response.data
}

/**
 * Get analytics summary for a specific user (admin or own)
 * GET /analytics/summary/{userId}?days={days}
 */
export const getUserSummary = async (
  userId: number,
  days: number = 30
): Promise<AnalyticsSummary> => {
  const response = await api.get(`/analytics/summary/${userId}?days=${days}`)
  return response.data
}

/**
 * Get analytics for a specific resource
 * GET /analytics/resource/{resourceType}/{resourceId}?days={days}
 */
export const getResourceAnalytics = async (
  resourceType: string,
  resourceId: number,
  days: number = 30
): Promise<ResourceAnalytics> => {
  const response = await api.get(`/analytics/resource/${resourceType}/${resourceId}?days=${days}`)
  return response.data
}

/**
 * Get stats for all resources with comparison (growth rates)
 * GET /analytics/resources?days={days}&resource_type={type}
 */
export const getUserResourceStats = async (
  days: number = 30,
  resourceType?: string
): Promise<ResourceStats[]> => {
  const params = new URLSearchParams({ days: days.toString() })
  if (resourceType) params.append('resource_type', resourceType)
  
  const response = await api.get(`/analytics/resources?${params.toString()}`)
  
  // Handle the actual response structure: { range: {...}, items: [...] }
  if (response.data?.items && Array.isArray(response.data.items)) {
    return response.data.items
  }
  
  // Fallback for other possible response structures
  if (Array.isArray(response.data)) {
    return response.data
  }
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data
  }
  
  console.warn("Unexpected response format for user resource stats:", response.data)
  return []
}

/**
 * Get admin analytics summary (admin only)
 * GET /admin/analytics/summary?days={days}&user_id={userId}
 */
export const getAdminAnalyticsSummary = async (
  days: number = 30,
  userId?: number
): Promise<AnalyticsSummary> => {
  const params = new URLSearchParams({ days: days.toString() })
  if (userId) params.append('user_id', userId.toString())
  
  const response = await api.get(`/admin/analytics/summary?${params.toString()}`)
  return response.data
}

/**
 * Get admin summary for all users (admin only)
 * GET /admin/analytics/summary (without user filter)
 */
export const getAdminSummary = async (
  days: number = 30
): Promise<AnalyticsSummary> => {
  const response = await api.get(`/admin/analytics/summary?days=${days}`)
  return response.data
}

/**
 * Get top resources (admin only)
 * GET /admin/analytics/top?days={days}&limit={limit}&resource_type={type}
 */
export const getAdminTopResources = async (
  days: number = 30,
  limit: number = 10,
  resourceType?: string
): Promise<TopResourceResponse> => {
  const params = new URLSearchParams({ 
    days: days.toString(),
    limit: limit.toString()
  })
  if (resourceType) params.append('resource_type', resourceType)

  const response = await api.get(`/admin/analytics/top?${params.toString()}`)
  return response.data
}

/**
 * Get admin dashboard data with leaderboards (admin only)
 * GET /admin/analytics/dashboard?days={days}&limit={limit}&user_id={userId}
 */
export const getAdminDashboard = async (
  days: number = 30,
  limit: number = 10,
  userId?: number
): Promise<AdminDashboardData> => {
  const params = new URLSearchParams({ 
    days: days.toString(),
    limit: limit.toString()
  })
  if (userId) params.append('user_id', userId.toString())

  const response = await api.get(`/admin/analytics/dashboard?${params.toString()}`)
  return response.data
}