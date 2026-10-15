import { createContext } from 'react'

import type { ProfilePreview } from '@/features/profiles/types'

export interface ShortlistContextValue {
  profiles: ProfilePreview[]
  count: number
  isShortlisted: (profileId: string) => boolean
  toggle: (profile: ProfilePreview) => void
  remove: (profileId: string) => void
}

export const ShortlistContext = createContext<ShortlistContextValue | null>(null)
