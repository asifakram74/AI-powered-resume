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

// --- API Service Functions ---

export const trackEvent = async (data: {
  resource_type: 'cv' | 'cover_letter' | 'profile_card'
  resource_id?: number
  resource_key?: string // For public slugs
  event_type: 'view' | 'download' | 'click' | 'share' | 'copy' | 'qr_scan' | 'scroll' | 'directory_view' | 'upgrade_click'
  referrer?: string
  meta?: any
}) => {
  try {
    await api.post('/analytics/track', data)
  } catch (error) {
    console.error('Failed to track analytics event', error)
  }
}

export const getUserAnalyticsSummary = async (days: number = 30): Promise<AnalyticsSummary> => {
  const response = await api.get(`/analytics/summary?days=${days}`)
  return response.data
}

export const getResourceAnalytics = async (
  resourceType: string,
  resourceId: number,
  days: number = 30
): Promise<AnalyticsSummary> => {
  const response = await api.get(`/analytics/resource/${resourceType}/${resourceId}?days=${days}`)
  return response.data
}

export const getAdminAnalyticsSummary = async (
  days: number = 30,
  userId?: number
): Promise<AnalyticsSummary> => {
  const params = new URLSearchParams({ days: days.toString() })
  if (userId) params.append('user_id', userId.toString())
  
  const response = await api.get(`/admin/analytics/summary?${params.toString()}`)
  return response.data
}

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
