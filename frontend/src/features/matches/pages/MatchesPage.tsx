import { Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { routes } from '@/config/routes'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { matchesService } from '@/features/matches/services/matches.service'
import type { ProfilePreview } from '@/features/profiles/types'
import { Spinner } from '@/components/loading/Spinner'

/** Profiles the member has been matched with. */
export function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<ProfilePreview[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    if (!user?.profileId) {
      return
    }

    const fetchMatches = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await matchesService.fetchMutualMatches(user.profileId as string)
        setMatches(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    void fetchMatches()
  }, [user?.profileId])

  const displayMatches = matches

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
          <div className="rounded-2xl border border-line bg-white px-5 py-10 text-center text-sm text-muted">
            <p>{error}</p>
          </div>
        ) : displayMatches.length ? (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Suggested matches</h2>
              <span className="text-xs text-muted">
                {displayMatches.length} profiles
              </span>
            </div>
            <ul className="grid grid-cols-2 gap-3">
              {displayMatches.map((profile) => (
                <li key={profile.id}>
                  <ProfileCard profile={profile} className="w-full" />
                </li>
              ))}
            </ul>
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
