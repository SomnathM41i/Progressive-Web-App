import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { Spinner } from '@/components/loading/Spinner'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import type { ProfilePreview } from '@/features/profiles/types'
import { shortlistService } from '@/features/shortlist/services/shortlist.service'
import { useShortlist } from '@/features/shortlist/hooks/useShortlist'
import type { ShortlistEntry, ShortlistTab } from '@/features/shortlist/types'

const TABS: Array<{ key: ShortlistTab; label: string }> = [
  { key: 'mine', label: 'My shortlist' },
  { key: 'theirs', label: 'Shortlisted me' },
]

/**
 * Shortlist requests: profiles the member saved (hydrated by the provider via
 * `get-list-MyShortlistedProfiles.php`) and members who saved the member's
 * profile (fetched here through `get-list-WhoShortlistedMyProfile.php`).
 *
 * Both tabs render the standard profile cards. The "Shortlisted me" fetch
 * merges responses through promise callbacks (with cancellation), so it never
 * triggers a synchronous re-render.
 */
export function ShortlistPage() {
  const { user } = useAuth()
  const profileId = user?.profileId
  const { profiles, count, status, error, reload } = useShortlist()

  const [tab, setTab] = useState<ShortlistTab>('mine')
  const [theirs, setTheirs] = useState<ShortlistEntry[] | null>(null)
  const [theirsError, setTheirsError] = useState<string | null>(null)
  const [theirsNonce, setTheirsNonce] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const requestTheirs = useCallback(async (): Promise<ShortlistEntry[]> => {
    if (!profileId) {
      throw new Error(
        'Your profile ID is unavailable. Sign out and sign in again to view this list.',
      )
    }
    return (await shortlistService.fetchWhoShortlistedMe(profileId)).entries
  }, [profileId])

  const mergeTheirsResult = useCallback((entries: ShortlistEntry[]) => {
    setTheirs(entries)
    setTheirsError(null)
  }, [])

  const mergeTheirsError = useCallback((err: unknown) => {
    setTheirsError(
      err instanceof Error
        ? err.message
        : 'Failed to load profiles who shortlisted you',
    )
  }, [])

  useEffect(() => {
    if (tab !== 'theirs' || !profileId) return

    let cancelled = false

    requestTheirs()
      .then((entries) => {
        if (!cancelled) mergeTheirsResult(entries)
      })
      .catch((err: unknown) => {
        if (!cancelled) mergeTheirsError(err)
      })

    return () => {
      cancelled = true
    }
  }, [tab, profileId, requestTheirs, mergeTheirsResult, mergeTheirsError, theirsNonce])

  function changeTab(nextTab: ShortlistTab) {
    setTab(nextTab)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }

  function retryMine() {
    reload()
  }

  function retryTheirs() {
    setTheirs(null)
    setTheirsError(null)
    setTheirsNonce((current) => current + 1)
  }

  const mineLoading = status === 'loading'
  const mineError = error
  const theirsLoading = tab === 'theirs' && theirs === null && !theirsError

  const headerCount = tab === 'mine' ? count : (theirs?.length ?? 0)

  function renderList(
    entries: ProfilePreview[],
    emptyTitle: string,
    emptyDescription: string,
    emptyAction?: ReactNode,
  ) {
    return entries.length ? (
      <ul className="grid grid-cols-1 gap-4">
        {entries.map((profile) => (
          <li key={profile.id}>
            <ProfileCard profile={profile} className="w-full" />
          </li>
        ))}
      </ul>
    ) : (
      <EmptyState
        icon={<Bookmark className="size-5" aria-hidden="true" />}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Shortlist"
        trailing={<span className="px-2 text-xs text-muted">{headerCount}</span>}
      />

      <div className="grid h-14 shrink-0 grid-cols-2 border-b border-line bg-white text-center text-base">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => changeTab(key)}
            className={`relative font-semibold ${tab === key ? 'text-maroon' : 'text-muted'}`}
          >
            {label}
            {tab === key ? (
              <span className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-maroon" />
            ) : null}
          </button>
        ))}
      </div>

      <main
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4"
      >
        {tab === 'mine' ? (
          mineLoading ? (
            <div className="flex flex-col items-center justify-center py-14">
              <Spinner className="size-8" />
              <p className="mt-3.5 text-sm text-muted">Loading your shortlist...</p>
            </div>
          ) : mineError && !profiles.length ? (
            <div className="py-6">
              <ErrorState description={mineError} onRetry={retryMine} />
            </div>
          ) : (
            renderList(
              profiles,
              'No saved profiles yet',
              'Save profiles you like to find them here.',
              <Link
                to={routes.home}
                className="text-xs font-semibold text-maroon hover:text-maroon-dark"
              >
                Browse matches
              </Link>,
            )
          )
        ) : !profileId ? (
          <div className="py-6">
            <ErrorState
              title="Sign in required"
              description="Your profile ID is unavailable. Sign out and sign in again to see who shortlisted you."
              onRetry={retryTheirs}
            />
          </div>
        ) : theirsLoading ? (
          <div className="flex flex-col items-center justify-center py-14">
            <Spinner className="size-8" />
            <p className="mt-3.5 text-sm text-muted">
              Loading profiles who saved you...
            </p>
          </div>
        ) : theirsError ? (
          <div className="py-6">
            <ErrorState description={theirsError} onRetry={retryTheirs} />
          </div>
        ) : (
          renderList(
            theirs ?? [],
            'No one has shortlisted you yet',
            'When another member saves your profile, they will appear here.',
          )
        )}
      </main>
    </AppScreen>
  )
}
