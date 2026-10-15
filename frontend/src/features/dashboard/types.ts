import type { ProfilePreview } from '@/features/profiles/types'

/**
 * Dashboard data contracts.
 *
 * These describe what the dashboard screens render. Field names will be mapped
 * from the real API resources once the collection is integrated.
 */

export type { ProfilePreview }

export interface ProfileSummary {
  name: string
  profileId: string
  /** Percentage of the profile that is complete, 0–100. */
  completion: number
  photoUrl?: string | null
  isVerified?: boolean
  /** Sections the member still needs to fill in. */
  missingFields: string[]
}

export interface Announcement {
  id: string
  title: string
  body: string
  /** ISO-8601 timestamp. */
  createdAt: string
  tone: 'info' | 'success' | 'warning'
}

export interface SuccessStory {
  id: string
  /** Couple names as published, e.g. "स्नेहा आणि राहुल". */
  couple: string
  place: string
  quote: string
  /** Year the couple married. */
  year: number
}

export interface DashboardData {
  summary: ProfileSummary
  recommended: ProfilePreview[]
  recentlyAdded: ProfilePreview[]
  successStories: SuccessStory[]
  announcements: Announcement[]
  /** Count of new matches since the member last visited. */
  todayMatches: number
}
