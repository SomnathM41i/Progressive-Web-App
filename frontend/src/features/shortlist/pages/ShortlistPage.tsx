import { Bookmark } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/states/EmptyState'
import { Page } from '@/components/ui/Page'
import { routes } from '@/config/routes'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { useShortlist } from '@/features/shortlist/hooks/useShortlist'

/** Profiles the member has saved, persisted on this device. */
export function ShortlistPage() {
  const { profiles } = useShortlist()

  return (
    <Page title="Shortlist" subtitle="Profiles you have saved.">
      {profiles.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <ProfileCard profile={profile} className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<Bookmark className="size-5" aria-hidden="true" />}
          title="No saved profiles yet"
          description="Tap the bookmark on any profile to save it here."
          action={
            <Link
              to={routes.home}
              className="text-xs font-semibold text-maroon hover:text-maroon-dark"
            >
              Browse matches
            </Link>
          }
        />
      )}
    </Page>
  )
}
