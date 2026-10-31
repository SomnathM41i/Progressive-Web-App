import { useEffect } from 'react'

import { env } from '@/config/env'
import { profileViewsService } from '@/features/profile-views/services/profile-views.service'

const STORAGE_PREFIX = 'svr.views.recorded.v1.'

function readRecorded(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(key)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

function writeRecorded(key: string, ids: Set<string>): void {
  try {
    sessionStorage.setItem(key, JSON.stringify([...ids]))
  } catch {
    // Storage can be unavailable (private mode); the server de-duplicates anyway.
  }
}

/**
 * Records a profile view once per session per viewer/profile pair.
 *
 * Fire-and-forget: a failure never reaches the UI. Own-profile visits and
 * signed-out viewers are skipped. Pass `profileId` only once the profile has
 * actually loaded so failed deep-links do not count as views.
 */
export function useRecordProfileView(
  viewerId: string | null | undefined,
  profileId: string | null | undefined,
): void {
  useEffect(() => {
    if (!viewerId || !profileId || viewerId === profileId) return

    const key = `${STORAGE_PREFIX}${viewerId}`
    const recorded = readRecorded(key)
    if (recorded.has(profileId)) return

    recorded.add(profileId)
    writeRecorded(key, recorded)

    profileViewsService.recordView(viewerId, profileId).catch((err: unknown) => {
      // Allow a retry on the next visit.
      const current = readRecorded(key)
      current.delete(profileId)
      writeRecorded(key, current)
      if (env.isDevelopment) console.warn('Profile view was not recorded', err)
    })
  }, [viewerId, profileId])
}
