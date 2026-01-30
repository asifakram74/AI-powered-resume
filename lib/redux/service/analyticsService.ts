import { api } from "../../api"

export interface AnalyticsEvent {
  id: number
  user_id?: number
  resource_type: string
  resource_id: number
  event_type: string
  created_at: string
}

export interface AnalyticsSummary {
  total_views: number
  total_downloads: number
  unique_visitors?: number
  views_by_type?: Record<string, number>
  downloads_by_type?: Record<string, number>
}

export interface TopResource {
  resource_id: number
  resource_type: string
  title?: string // Enriched on frontend or backend if available
  views: number
  downloads: number
  total: number
}

export const trackEvent = async (data: {
  resource_type: 'cv' | 'cover_letter' | 'profile_card'
  resource_id?: number
  resource_key?: string // For public slugs
  event_type: 'view' | 'download'
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
  // Handle wrapped response format if present
  return response.data.summary || response.data
}

export const getAdminTopResources = async (
  days: number = 30,
  limit: number = 10,
  resourceType?: string
): Promise<TopResource[]> => {
  const params = new URLSearchParams({ 
    days: days.toString(),
    limit: limit.toString()
  })
  if (resourceType) params.append('resource_type', resourceType)

  const response = await api.get(`/admin/analytics/top?${params.toString()}`)
  // Handle wrapped response format { range: {...}, items: [...] }
  return response.data.items || response.data
}
