import { Heart } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { ErrorState } from '@/components/states/ErrorState'
import { routes } from '@/config/routes'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { matchesService } from '@/features/matches/services/matches.service'
import type { ProfilePreview } from '@/features/profiles/types'
import { Spinner } from '@/components/loading/Spinner'

/** Profiles the member has been matched with. */
export function MatchesPage() {
  const { user } = useAuth()
  const profileId = user?.profileId
  const [matches, setMatches] = useState<ProfilePreview[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!profileId) {
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)
    setMatches([])
    setPage(1)
    setHasMore(true)

    matchesService
      .fetchMutualMatches(profileId, 1, 12)
      .then((res) => {
        if (cancelled) return
        setMatches(res.profiles)
        const p = res.pagination
        if (p && p.current_page && p.total_pages && p.current_page >= p.total_pages) {
          setHasMore(false)
        } else if (p && p.has_next === false) {
          setHasMore(false)
        } else if (res.profiles.length === 0) {
          setHasMore(false)
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load matches')
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [profileId, reloadNonce])

  const loadMore = useCallback(async () => {
    if (!profileId || loadingMore || !hasMore || loading) return
    setLoadingMore(true)
    try {
      const nextPage = page + 1
      const res = await matchesService.fetchMutualMatches(profileId, nextPage, 12)
      if (res.profiles.length === 0) {
        setHasMore(false)
        return
      }
      setMatches((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        const merged = [...prev]
        for (const p of res.profiles) {
          if (!seen.has(p.id)) merged.push(p)
        }
        return merged
      })
      setPage(nextPage)
      const p = res.pagination
      if (p && p.current_page && p.total_pages && p.current_page >= p.total_pages) {
        setHasMore(false)
      } else if (p && p.has_next === false) {
        setHasMore(false)
      }
    } catch {
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [profileId, loadingMore, hasMore, loading, page])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      { rootMargin: '300px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  const retry = useCallback(() => setReloadNonce((value) => value + 1), [])

  return (
    <AppScreen>
      <ScreenHeader title="My matches" />
      <main className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-y-contain px-4 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Spinner className="size-6" />
            <p className="mt-3 text-sm text-muted">Loading matches...</p>
          </div>
        ) : error ? (
          <div className="pt-6">
            <ErrorState
              title="Could not load matches"
              description={error}
              onRetry={retry}
            />
          </div>
        ) : matches.length ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Suggested matches</h2>
              <span className="text-xs text-muted">{matches.length} profiles</span>
            </div>
            <ul className="grid grid-cols-1 gap-4">
              {matches.map((profile) => (
                <li key={profile.id}>
                  <ProfileCard profile={profile} className="w-full" />
                </li>
              ))}
            </ul>
            {loadingMore ? (
              <div className="flex items-center justify-center py-3">
                <Spinner className="size-5" />
              </div>
            ) : null}
            <div ref={sentinelRef} className="h-1" />
          </>
        ) : (
          <div className="rounded-2xl border border-line bg-white px-5 py-10 text-center text-sm text-muted">
            <Heart className="mx-auto mb-3 size-7 text-maroon" aria-hidden="true" />
            <p>No matches yet.</p>
            <Link
              to={routes.search}
              className="mt-2 inline-block text-xs font-semibold text-maroon hover:text-maroon-dark"
            >
              Find your match
            </Link>
          </div>
        )}
      </main>
    </AppScreen>
  )
}
