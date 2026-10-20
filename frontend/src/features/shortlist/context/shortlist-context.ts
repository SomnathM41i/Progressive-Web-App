import { createContext } from 'react'

import type { ProfilePreview } from '@/features/profiles/types'

export interface ShortlistContextValue {
  profiles: ProfilePreview[]
  count: number
  /**
   * API hydration state. `loading` while the member's server shortlist is
   * being fetched for the first time; signed-out (preview) use is always
   * `ready` because the local list needs no fetching.
   */
  status: 'loading' | 'ready'
  /** Hydration error; lists with content keep showing it alongside `profiles`. */
  error: string | null
  isShortlisted: (profileId: string) => boolean
  toggle: (profile: ProfilePreview) => void
  remove: (profileId: string) => void
  /** Re-runs the hydration fetch after a failure. */
  reload: () => void
}

export const ShortlistContext = createContext<ShortlistContextValue | null>(null)
