import { useContext } from 'react'

import {
  ShortlistContext,
  type ShortlistContextValue,
} from '@/features/shortlist/context/shortlist-context'

export function useShortlist(): ShortlistContextValue {
  const context = useContext(ShortlistContext)

  if (!context) {
    throw new Error('useShortlist must be used inside <ShortlistProvider>.')
  }

  return context
}
