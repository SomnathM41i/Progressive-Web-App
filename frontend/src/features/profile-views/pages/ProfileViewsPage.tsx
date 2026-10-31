import { useCallback, useEffect, useRef, useState } from 'react'
import { Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { Spinner } from '@/components/loading/Spinner'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { profileViewsService } from '@/features/profile-views/services/profile-views.service'
import type {
  ProfileViewEntry,
  ProfileViewsListResult,
  ProfileViewsTab,
} from '@/features/profile-views/types'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { formatApiDate } from '@/features/profiles/dates'

const TABS: Array<{ key: ProfileViewsTab; label: string }> = [
  { key: 'viewedMe', label: 'Viewed me' },
  { key: 'iViewed', label: 'I viewed' },
]

interface TabState {
  entries: ProfileViewEntry[] | null
  page: number
  totalPages: number
  totalRecords: number
  error: string | null
  pendingMore: boolean
  moreError: string | null
}

const INITIAL_TAB: TabState = {
  entries: null,
  page: 0,
  totalPages: 0,
  totalRecords: 0,
  error: null,
  pendingMore: false,
  moreError: null,
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Failed to load profile views'
}

/**
 * Profile views: members who opened the member's profile
 * (`get-list-WhoViewedMyProfile.php`) and profiles the member opened
 * (`get-list-MyViewedProfiles.php`). Both lists are paginated (8 per page) and
 * each tab loads lazily the first time it is shown.
 */
export function ProfileViewsPage() {
  const { user } = useAuth()
  const profileId = user?.profileId

  const [tab, setTab] = useState<ProfileViewsTab>('viewedMe')
  const [lists, setLists] = useState<Record<ProfileViewsTab, TabState>>({
    viewedMe: INITIAL_TAB,
    iViewed: INITIAL_TAB,
  })
  const [nonce, setNonce] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const request = useCallback(
    (which: ProfileViewsTab, page: number): Promise<ProfileViewsListResult> => {
      if (!profileId) {
        return Promise.reject(
          new Error('Your profile ID is unavailable. Sign out and sign in again.'),
        )
      }
      return which === 'viewedMe'
        ? profileViewsService.fetchWhoViewedMe(profileId, page)
        : profileViewsService.fetchMyViewed(profileId, page)
    },
    [profileId],
  )

  const current = lists[tab]
  const needsFirstPage = current.entries === null && !current.error

  useEffect(() => {
    if (!profileId || !needsFirstPage) return

    let cancelled = false
    const which = tab

    request(which, 1)
      .then((result) => {
        if (cancelled) return
        setLists((prev) => ({
          ...prev,
          [which]: {
            ...INITIAL_TAB,
            entries: result.entries,
            page: result.page,
            // An empty page is always the last one.
            totalPages: result.entries.length ? result.totalPages : result.page,
            totalRecords: result.totalRecords,
          },
        }))
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setLists((prev) => ({ ...prev, [which]: { ...INITIAL_TAB, error: errorMessage(err) } }))
      })

    return () => {
      cancelled = true
    }
  }, [tab, profileId, needsFirstPage, request, nonce])

  function changeTab(nextTab: ProfileViewsTab) {
    setTab(nextTab)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }

  function retry() {
    setLists((prev) => ({ ...prev, [tab]: INITIAL_TAB }))
    setNonce((value) => value + 1)
  }

  function loadMore() {
    if (current.pendingMore || !current.entries) return
    const which = tab
    const page = current.page + 1

    setLists((prev) => ({
      ...prev,
      [which]: { ...prev[which], pendingMore: true, moreError: null },
    }))

    request(which, page)
      .then((result) => {
        setLists((prev) => {
          const existing = prev[which].entries ?? []
          const seen = new Set(existing.map((entry) => entry.id))
          const fresh = result.entries.filter((entry) => !seen.has(entry.id))
          return {
            ...prev,
            [which]: {
              ...prev[which],
              entries: [...existing, ...fresh],
              page: result.page,
              totalPages: result.entries.length ? result.totalPages : result.page,
              totalRecords: result.totalRecords || prev[which].totalRecords,
              pendingMore: false,
            },
          }
        })
      })
      .catch((err: unknown) => {
        // A failed "load more" keeps the pages already on screen.
        setLists((prev) => ({
          ...prev,
          [which]: { ...prev[which], pendingMore: false, moreError: errorMessage(err) },
        }))
      })
  }

  const hasMore = current.entries !== null && current.page < current.totalPages
  const headerCount = current.totalRecords || current.entries?.length || 0

  function renderBody() {
    if (!profileId) {
      return (
        <div className="py-6">
          <ErrorState
            title="Sign in required"
            description="Your profile ID is unavailable. Sign out and sign in again to see profile views."
            onRetry={retry}
          />
        </div>
      )
    }

    if (current.error) {
      return (
        <div className="py-6">
          <ErrorState description={current.error} onRetry={retry} />
        </div>
      )
    }

    if (current.entries === null) {
      return (
        <div className="flex flex-col items-center justify-center py-14">
          <Spinner className="size-8" />
          <p className="mt-3.5 text-sm text-muted">Loading profile views...</p>
        </div>
      )
    }

    if (!current.entries.length) {
      return tab === 'viewedMe' ? (
        <EmptyState
          icon={<Eye className="size-5" aria-hidden="true" />}
          title="No one has viewed your profile yet"
          description="When another member opens your profile, they will appear here."
        />
      ) : (
        <EmptyState
          icon={<Eye className="size-5" aria-hidden="true" />}
          title="You haven't viewed any profiles yet"
          description="Profiles you open will appear here."
          action={
            <Link
              to={routes.home}
              className="text-xs font-semibold text-maroon hover:text-maroon-dark"
            >
              Browse matches
            </Link>
          }
        />
      )
    }

    return (
      <>
        <ul className="grid grid-cols-1 gap-4">
          {current.entries.map((profile) => {
            const viewedOn = formatApiDate(profile.viewedOn)
            return (
              <li key={profile.id}>
                <ProfileCard profile={profile} className="w-full" />
                {viewedOn ? (
                  <p className="mt-1.5 px-1 text-2xs text-muted">Viewed on {viewedOn}</p>
                ) : null}
              </li>
            )
          })}
        </ul>

        {hasMore ? (
          <div className="flex flex-col items-center gap-2 py-3">
            {current.moreError ? (
              <p role="alert" className="text-xs text-danger">
                {current.moreError}
              </p>
            ) : null}
            <button
              type="button"
              disabled={current.pendingMore}
              onClick={loadMore}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-2.5 text-sm font-semibold text-maroon hover:bg-rose disabled:opacity-55"
            >
              {current.pendingMore ? (
                <Spinner className="size-3.5" label="Loading more" />
              ) : null}
              {current.pendingMore ? 'Loading…' : current.moreError ? 'Retry' : 'Load more'}
            </button>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Profile views"
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
        {renderBody()}
      </main>
    </AppScreen>
  )
}
