import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import type { ProfilePreview } from '@/features/profiles/types'

interface ProfileCarouselProps {
  profiles: ProfilePreview[]
}

/** Horizontal, snap-scrolling rail of match cards. */
export function ProfileCarousel({ profiles }: ProfileCarouselProps) {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
      {profiles.map((profile) => (
        <li key={profile.id} className="shrink-0 snap-start">
          <ProfileCard profile={profile} />
        </li>
      ))}
    </ul>
  )
}
