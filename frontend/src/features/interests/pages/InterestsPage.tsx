import { useCallback, useEffect, useRef, useState } from 'react'
import { Heart } from 'lucide-react'

import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { Spinner } from '@/components/loading/Spinner'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { InterestRow } from '@/features/interests/components/InterestRow'
import { interestsService } from '@/features/interests/services/interests.service'
import type {
  InterestEntry,
  InterestListResult,
  InterestTab,
} from '@/features/interests/types'
import { useToast } from '@/hooks/useToast'

interface TabState {
  /** `null` until the first response for this tab arrives. */
  entries: InterestEntry[] | null
  page: number
  hasMore: boolean
  /** Error that blocked the initial load; replaces the whole list. */
  error: string | null
  /** Error from a "load more" attempt; shown inline, list stays visible. */
  moreError: string | null
  /** Load-more request in flight; only set from event handlers. */
  pendingMore: boolean
  /** Ids with an accept/decline in flight, so the row's buttons can disable. */
  busyIds: string[]
}

const initialTabState: TabState = {
  entries: null,
  page: 1,
  hasMore: false,
  error: null,
  moreError: null,
  pendingMore: false,
  busyIds: [],
}

const TABS: Array<{ key: InterestTab; label: string }> = [
  { key: 'received', label: 'Received' },
  { key: 'sent', label: 'Sent' },
]

/**
 * Interest requests: what others sent me (accept / decline) and what I sent
 * that is still pending. Data comes from the legacy interest endpoints through
 * `interestsService`; see that module for the request and envelope contract.
 *
 * The spinner is derived from `entries`, and the effect merges responses
 * through promise callbacks (with cancellation), so it never triggers a
 * synchronous re-render.
 */
export function InterestsPage() {
  const { user } = useAuth()
  const toast = useToast()
  const profileId = user?.profileId

  const [tab, setTab] = useState<InterestTab>('received')
  const [lists, setLists] = useState<Record<InterestTab, TabState>>({
    received: initialTabState,
    sent: initialTabState,
  })
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  /** Fetches one page from the API. Pure — callers merge the result themselves. */
  const requestTab = useCallback(
    async (which: InterestTab, page: number): Promise<InterestListResult> => {
      if (!profileId) {
        throw new Error(
          'Your profile ID is unavailable. Sign out and sign in again to view interests.',
        )
      }
      return which === 'received'
        ? interestsService.fetchReceived(profileId, page)
        : interestsService.fetchSent(profileId, page)
    },
    [profileId],
  )

  const mergeResult = useCallback(
    (which: InterestTab, result: InterestListResult, append: boolean) => {
      setLists((prev) => {
        const current = prev[which]
        const known = new Set((current.entries ?? []).map((entry) => entry.id))
        const merged = append
          ? [
              ...(current.entries ?? []),
              ...result.entries.filter((entry) => !known.has(entry.id)),
            ]
          : result.entries

        // An empty page is always the last one, even if the server omitted
        // pagination meta — this is the failsafe against an endless "Load more".
        const hasMore = result.entries.length === 0 ? false : result.hasMore

        return {
          ...prev,
          [which]: {
            ...current,
            entries: merged,
            page: result.page,
            hasMore,
            error: null,
            moreError: null,
            pendingMore: false,
          },
        }
      })
    },
    [],
  )

  const mergeError = useCallback(
    (which: InterestTab, err: unknown, isLoadMore: boolean) => {
      const message = err instanceof Error ? err.message : 'Failed to load interests'
      setLists((prev) => ({
        ...prev,
        [which]: {
          ...prev[which],
          // A failed "load more" must not wipe the pages already on screen.
          error: isLoadMore ? prev[which].error : message,
          moreError: isLoadMore ? message : null,
          pendingMore: false,
        },
      }))
    },
    [],
  )

  useEffect(() => {
    let cancelled = false

    requestTab(tab, 1)
      .then((result) => {
        if (!cancelled) mergeResult(tab, result, false)
      })
      .catch((err: unknown) => {
        if (!cancelled) mergeError(tab, err, false)
      })

    return () => {
      cancelled = true
    }
  }, [tab, requestTab, mergeResult, mergeError])

  function changeTab(nextTab: InterestTab) {
    setTab(nextTab)
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0
  }

  function retry() {
    setLists((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], error: null, moreError: null, pendingMore: false },
    }))
    requestTab(tab, 1)
      .then((result) => mergeResult(tab, result, false))
      .catch((err: unknown) => mergeError(tab, err, false))
  }

  function loadMore() {
    // Ignore repeat taps while a page is already being fetched.
    if (lists[tab].pendingMore) return

    const page = lists[tab].page + 1
    setLists((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], pendingMore: true, moreError: null },
    }))
    requestTab(tab, page)
      .then((result) => mergeResult(tab, result, true))
      .catch((err: unknown) => mergeError(tab, err, true))
  }

  /** Accepts or declines a received interest, then drops it from the list. */
  async function respond(entry: InterestEntry, action: 'accept' | 'decline') {
    if (!profileId) return

    setLists((prev) => ({
      ...prev,
      received: { ...prev.received, busyIds: [...prev.received.busyIds, entry.id] },
    }))

    try {
      if (action === 'accept') {
        await interestsService.acceptInterest(profileId, entry.id)
        toast.success('Interest accepted')
      } else {
        await interestsService.declineInterest(profileId, entry.id)
        toast.info('Interest declined')
      }

      setLists((prev) => ({
        ...prev,
        received: {
          ...prev.received,
          entries: (prev.received.entries ?? []).filter((item) => item.id !== entry.id),
        },
      }))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update this interest')
    } finally {
      setLists((prev) => ({
        ...prev,
        received: {
          ...prev.received,
          busyIds: prev.received.busyIds.filter((id) => id !== entry.id),
        },
      }))
    }
  }

  const state = lists[tab]
  const loading = state.entries === null && !state.error
  const entries = state.entries ?? []

  return (
    <AppScreen safeBottom={false}>
      <div
        ref={scrollContainerRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
        <ScreenHeader title="Interests" />

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

        <div className="px-4">
          {!profileId ? (
            <div className="py-6">
              <ErrorState
                title="Sign in required"
                description="Your profile ID is unavailable. Sign out and sign in again to view interests."
                onRetry={retry}
              />
            </div>
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-14">
              <Spinner className="size-8" />
              <p className="mt-3.5 text-sm text-muted">Loading interests...</p>
            </div>
          ) : state.error ? (
            <div className="py-6">
              <ErrorState description={state.error} onRetry={retry} />
            </div>
          ) : entries.length ? (
            <>
              <ul className="divide-y divide-line/70">
                {entries.map((entry) => (
                  <InterestRow
                    key={entry.id}
                    entry={entry}
                    meta={tab === 'sent' ? 'Interest sent' : undefined}
                    actions={
                      tab === 'received' ? (
                        <div className="mt-2.5 flex gap-2.5">
                          <button
                            type="button"
                            disabled={state.busyIds.includes(entry.id)}
                            onClick={() => void respond(entry, 'accept')}
                            className="h-10 min-w-[5rem] rounded-full bg-[#2d9b5b] px-5 text-sm font-semibold text-white transition active:opacity-70 disabled:opacity-55"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            disabled={state.busyIds.includes(entry.id)}
                            onClick={() => void respond(entry, 'decline')}
                            className="h-10 min-w-[5rem] rounded-full border border-[#b82b3e] px-5 text-sm font-semibold text-[#a91931] transition active:opacity-70 disabled:opacity-55"
                          >
                            Decline
                          </button>
                        </div>
                      ) : null
                    }
                  />
                ))}
              </ul>

              {state.hasMore ? (
                <div className="flex flex-col items-center gap-2 py-3">
                  {state.moreError ? (
                    <p role="alert" className="text-xs text-danger">
                      {state.moreError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    disabled={state.pendingMore}
                    onClick={loadMore}
                    className="inline-flex items-center gap-2 rounded-full border border-line-strong px-6 py-2.5 text-sm font-semibold text-maroon hover:bg-rose disabled:opacity-55"
                  >
                    {state.pendingMore ? (
                      <Spinner className="size-3.5" label="Loading more" />
                    ) : null}
                    {state.pendingMore
                      ? 'Loading…'
                      : state.moreError
                        ? 'Retry'
                        : 'Load more'}
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState
              icon={<Heart className="size-6" aria-hidden="true" />}
              title={tab === 'received' ? 'No received interests' : 'No sent interests'}
              description={
                tab === 'received'
                  ? 'When someone sends you an interest, it will appear here.'
                  : 'Interests you send to other members will appear here.'
              }
            />
          )}
        </div>
      </div>
    </AppScreen>
  )
}
