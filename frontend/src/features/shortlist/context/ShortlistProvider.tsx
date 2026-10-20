import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  ShortlistContext,
  type ShortlistContextValue,
} from '@/features/shortlist/context/shortlist-context'
import { shortlistService } from '@/features/shortlist/services/shortlist.service'
import type { ProfilePreview } from '@/features/profiles/types'
import { useToast } from '@/hooks/useToast'
import { localStore } from '@/lib/storage'

/** Per-member cache key, so one member's shortlist never leaks to another. */
const STORAGE_PREFIX = 'svr.shortlist.v1.'
const ANONYMOUS_KEY = `${STORAGE_PREFIX}anonymous`

function storageKey(memberId: string | undefined): string {
  return memberId ? `${STORAGE_PREFIX}${memberId}` : ANONYMOUS_KEY
}

function readStored(key: string): ProfilePreview[] {
  const raw = localStore.read(key)
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
 * Once signed in, the list is hydrated from
 * `get-list-MyShortlistedProfiles.php`; localStorage stays as an instant
 * pre-hydration cache and as the store for the signed-out preview. The cache is
 * keyed per member, so switching accounts never shows the previous member's
 * list. Toggles update optimistically and call `shortlist-user-profile.php` /
 * `remove-user-from-shortlist.php`, rolling back if the API rejects the change.
 * The hydration effect merges responses through promise callbacks (with
 * cancellation), so it never triggers a synchronous re-render.
 */
export function ShortlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const toast = useToast()
  const memberId = user?.profileId

  const [profiles, setProfiles] = useState<ProfilePreview[]>(() =>
    readStored(storageKey(memberId)),
  )
  const [error, setError] = useState<string | null>(null)
  /** Member id whose hydration attempt has settled (success or failure). */
  const [hydratedFor, setHydratedFor] = useState<string | null>(null)
  const [reloadNonce, setReloadNonce] = useState(0)
  /** Bumped on every local mutation so an in-flight hydration can be ignored. */
  const mutationRef = useRef(0)

  // On member change, swap the in-memory list and persist under that member's
  // key; never carry the previous member's profiles across.
  const keyRef = useRef(storageKey(memberId))
  useEffect(() => {
    const key = storageKey(memberId)
    if (keyRef.current !== key) {
      keyRef.current = key
      mutationRef.current += 1
      setHydratedFor(null)
      setProfiles(readStored(key))
    }
  }, [memberId])

  useEffect(() => {
    localStore.write(keyRef.current, JSON.stringify(profiles))
  }, [profiles])

  useEffect(() => {
    if (!memberId) return

    let cancelled = false
    const mutationAtStart = mutationRef.current

    shortlistService
      .fetchMy(memberId)
      .then(({ entries }) => {
        if (cancelled) return
        // A local toggle made while this request was in flight wins over the
        // server snapshot, so the member's action is not silently reverted.
        if (mutationRef.current === mutationAtStart) {
          setProfiles(entries)
        }
        setError(null)
        setHydratedFor(memberId)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load your shortlist')
        setHydratedFor(memberId)
      })

    return () => {
      cancelled = true
    }
  }, [memberId, reloadNonce])

  const toggle = useCallback(
    (profile: ProfilePreview) => {
      mutationRef.current += 1
      // Derive the current membership inside the updater so the optimistic
      // write and the rollback both see live state, not a stale closure.
      let wasSaved = false
      setProfiles((current) => {
        wasSaved = current.some((item) => item.id === profile.id)
        return wasSaved
          ? current.filter((item) => item.id !== profile.id)
          : [profile, ...current]
      })

      if (!memberId) {
        // Signed-out preview: keep the local-only behaviour.
        toast.success(wasSaved ? 'Removed from shortlist' : 'Added to shortlist')
        return
      }

      const request = wasSaved
        ? shortlistService.remove(memberId, profile.id)
        : shortlistService.add(memberId, profile.id)

      request
        .then(() => {
          toast.success(wasSaved ? 'Removed from shortlist' : 'Added to shortlist')
        })
        .catch((err: unknown) => {
          // Roll the optimistic change back; the list shows the server truth.
          mutationRef.current += 1
          setProfiles((prev) => {
            if (wasSaved) {
              return prev.some((item) => item.id === profile.id)
                ? prev
                : [profile, ...prev]
            }
            return prev.filter((item) => item.id !== profile.id)
          })
          toast.error(
            err instanceof Error ? err.message : 'Could not update the shortlist',
          )
        })
    },
    [memberId, toast],
  )

  const remove = useCallback(
    (profileId: string) => {
      let victim: ProfilePreview | undefined
      mutationRef.current += 1
      setProfiles((current) => {
        victim = current.find((item) => item.id === profileId)
        return victim ? current.filter((item) => item.id !== profileId) : current
      })

      if (!memberId) {
        toast.success('Removed from shortlist')
        return
      }

      shortlistService
        .remove(memberId, profileId)
        .then(() => {
          toast.success('Removed from shortlist')
        })
        .catch((err: unknown) => {
          mutationRef.current += 1
          setProfiles((prev) => {
            if (!victim || prev.some((item) => item.id === profileId)) return prev
            return [victim, ...prev]
          })
          toast.error(
            err instanceof Error ? err.message : 'Could not update the shortlist',
          )
        })
    },
    [memberId, toast],
  )

  const reload = useCallback(() => {
    setError(null)
    setHydratedFor(null)
    setReloadNonce((current) => current + 1)
  }, [])

  const status: ShortlistContextValue['status'] =
    memberId && hydratedFor !== memberId ? 'loading' : 'ready'

  const value = useMemo<ShortlistContextValue>(
    () => ({
      profiles,
      count: profiles.length,
      status,
      error,
      isShortlisted: (profileId) => profiles.some((item) => item.id === profileId),
      toggle,
      remove,
      reload,
    }),
    [profiles, status, error, toggle, remove, reload],
  )

  return <ShortlistContext.Provider value={value}>{children}</ShortlistContext.Provider>
}
