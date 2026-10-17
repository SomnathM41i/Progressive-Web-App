import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/states/EmptyState'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { routes } from '@/config/routes'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { useShortlist } from '@/features/shortlist/hooks/useShortlist'

/** Profiles the member has saved, persisted on this device. */
export function ShortlistPage() {
  const { profiles } = useShortlist()

  return (
    <AppScreen>
      <ScreenHeader title="Shortlist" trailing={<span className="px-2 text-xs text-muted">{profiles.length}</span>} />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-4">
        {profiles.length ? <ul className="grid grid-cols-2 gap-3">{profiles.map((profile) => <li key={profile.id}><ProfileCard profile={profile} className="w-full" /></li>)}</ul> : <EmptyState icon={<Bookmark className="size-5" aria-hidden="true" />} title="No saved profiles yet" description="Save profiles you like to find them here." action={<Link to={routes.home} className="text-xs font-semibold text-maroon hover:text-maroon-dark">Browse matches</Link>} />}
      </main>
    </AppScreen>
  )
}
