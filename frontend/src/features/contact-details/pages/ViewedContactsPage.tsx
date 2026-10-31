import { useEffect, useState } from 'react'
import { Contact, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Spinner } from '@/components/loading/Spinner'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { AppScreen } from '@/components/ui/AppScreen'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { contactDetailsService } from '@/features/contact-details/services/contact-details.service'
import type { ViewedContactEntry } from '@/features/contact-details/types'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { formatApiDate } from '@/features/profiles/dates'

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : 'Failed to load viewed contacts'
}

/**
 * Profiles whose contact details the member has unlocked
 * (`get-list-MyViewedContactDetails.php`, 8 per page). Reading this list spends
 * no credits. Full details stay on the profile screen; each row offers a call
 * shortcut. Rows are held in memory only.
 */
export function ViewedContactsPage() {
  const { user } = useAuth()
  const profileId = user?.profileId

  const [entries, setEntries] = useState<ViewedContactEntry[] | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalRecords, setTotalRecords] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [pendingMore, setPendingMore] = useState(false)
  const [moreError, setMoreError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    if (!profileId) return

    let cancelled = false

    contactDetailsService
      .fetchViewed(profileId, 1)
      .then((result) => {
        if (cancelled) return
        setEntries(result.entries)
        setPage(result.page)
        // An empty page is always the last one.
        setTotalPages(result.entries.length ? result.totalPages : result.page)
        setTotalRecords(result.totalRecords)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err))
      })

    return () => {
      cancelled = true
    }
  }, [profileId, nonce])

  function retry() {
    setEntries(null)
    setError(null)
    setNonce((value) => value + 1)
  }

  function loadMore() {
    if (pendingMore || !profileId) return
    setPendingMore(true)
    setMoreError(null)

    contactDetailsService
      .fetchViewed(profileId, page + 1)
      .then((result) => {
        setEntries((current) => {
          const existing = current ?? []
          const seen = new Set(existing.map((entry) => entry.id))
          return [...existing, ...result.entries.filter((entry) => !seen.has(entry.id))]
        })
        setPage(result.page)
        setTotalPages(result.entries.length ? result.totalPages : result.page)
      })
      .catch((err: unknown) => {
        // A failed "load more" keeps the pages already on screen.
        setMoreError(errorMessage(err))
      })
      .finally(() => setPendingMore(false))
  }

  function renderBody() {
    if (!profileId) {
      return (
        <div className="py-6">
          <ErrorState
            title="Sign in required"
            description="Your profile ID is unavailable. Sign out and sign in again to see your viewed contacts."
          />
        </div>
      )
    }

    if (error) {
      return (
        <div className="py-6">
          <ErrorState description={error} onRetry={retry} />
        </div>
      )
    }

    if (entries === null) {
      return (
        <div className="flex flex-col items-center justify-center py-14">
          <Spinner className="size-8" />
          <p className="mt-3.5 text-sm text-muted">Loading viewed contacts...</p>
        </div>
      )
    }

    if (!entries.length) {
      return (
        <EmptyState
          icon={<Contact className="size-5" aria-hidden="true" />}
          title="No contacts viewed yet"
          description="Contact details you view on a profile will appear here."
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
          {entries.map((profile) => {
            const viewedOn = formatApiDate(profile.viewedOn)
            return (
              <li key={profile.id}>
                <ProfileCard profile={profile} className="w-full" />
                <div className="mt-1.5 flex items-center justify-between gap-3 px-1">
                  <p className="text-2xs text-muted">
                    {viewedOn ? `Viewed on ${viewedOn}` : null}
                  </p>
                  {profile.mobile ? (
                    <a
                      href={`tel:${profile.mobile}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-maroon"
                    >
                      <Phone className="size-3.5" aria-hidden="true" />
                      {profile.mobile}
                    </a>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>

        {page < totalPages ? (
          <div className="flex flex-col items-center gap-2 py-3">
            {moreError ? (
              <p role="alert" className="text-xs text-danger">
                {moreError}
              </p>
            ) : null}
            <button
              type="button"
              disabled={pendingMore}
              onClick={loadMore}
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-2.5 text-sm font-semibold text-maroon hover:bg-rose disabled:opacity-55"
            >
              {pendingMore ? <Spinner className="size-3.5" label="Loading more" /> : null}
              {pendingMore ? 'Loading…' : moreError ? 'Retry' : 'Load more'}
            </button>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Viewed contacts"
        trailing={
          <span className="px-2 text-xs text-muted">
            {totalRecords || entries?.length || 0}
          </span>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        {renderBody()}
      </main>
    </AppScreen>
  )
}
