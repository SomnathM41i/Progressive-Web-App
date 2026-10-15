import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  ShortlistContext,
  type ShortlistContextValue,
} from '@/features/shortlist/context/shortlist-context'
import type { ProfilePreview } from '@/features/profiles/types'
import { localStore } from '@/lib/storage'

const STORAGE_KEY = 'svr.shortlist.v1'

function readStored(): ProfilePreview[] {
  const raw = localStore.read(STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as ProfilePreview[]) : []
  } catch {
    return []
  }
}

/**
 * Holds the member's shortlisted profiles.
 *
 * Shortlisting is a client-side action until the API collection exists, so the
 * list is persisted to localStorage. The storage access is guarded, and a
 * failure to persist degrades to an in-memory list rather than an error.
 */
export function ShortlistProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<ProfilePreview[]>(readStored)

  useEffect(() => {
    localStore.write(STORAGE_KEY, JSON.stringify(profiles))
  }, [profiles])

  const toggle = useCallback((profile: ProfilePreview) => {
    setProfiles((current) =>
      current.some((item) => item.id === profile.id)
        ? current.filter((item) => item.id !== profile.id)
        : [profile, ...current],
    )
  }, [])

  const remove = useCallback((profileId: string) => {
    setProfiles((current) => current.filter((item) => item.id !== profileId))
  }, [])

  const value = useMemo<ShortlistContextValue>(
    () => ({
      profiles,
      count: profiles.length,
      isShortlisted: (profileId) => profiles.some((item) => item.id === profileId),
      toggle,
      remove,
    }),
    [profiles, toggle, remove],
  )

  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>
}
