import { Eye } from 'lucide-react'

import { EmptyState } from '@/components/states/EmptyState'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SectionState } from '@/features/profiles/components/SectionState'
import { VisibilityBadge } from '@/features/profiles/components/VisibilityBadge'
import { DetailRow } from '@/features/profiles/components/DetailRow'
import { useProfileResource } from '@/features/profiles/hooks/useProfileResource'
import { profileService } from '@/features/profiles/services/profile.service'
import type { ProfileSettings } from '@/features/profiles/types'

const EMPTY: ProfileSettings = {
  horoscopeVisibility: null,
  phoneVisibility: null,
  photoVisibility: null,
  extra: [],
}

/** Human labels for the settings keys carried in `extra`. */
function humanise(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim()
}

export function ProfileSettingsPage() {
  const { status, data, error, reload } = useProfileResource<ProfileSettings>(
    profileService.fetchSettings,
    EMPTY,
  )

  const settings = data ?? EMPTY
  const hasVisibility =
    settings.horoscopeVisibility || settings.phoneVisibility || settings.photoVisibility

  return (
    <SectionState title="Privacy settings" status={status} error={error} reload={reload} skeletonRows={4}>
      {hasVisibility ? (
        <section>
          <SectionHeading
            title="Visibility"
            subtitle="Who can see each part of your profile"
          />
          <Card flush>
            <div className="divide-y divide-line px-[var(--card-padding)]">
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-ink">Photo</span>
                <VisibilityBadge setting="photo" value={settings.photoVisibility} />
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-ink">Horoscope</span>
                <VisibilityBadge setting="horoscope" value={settings.horoscopeVisibility} />
              </div>
              <div className="flex items-center justify-between gap-4 py-3">
                <span className="text-sm text-ink">Phone number</span>
                <VisibilityBadge setting="phone" value={settings.phoneVisibility} />
              </div>
            </div>
          </Card>
        </section>
      ) : null}

      {settings.extra.length ? (
        <section>
          <SectionHeading title="Other settings" />
          <Card flush>
            <dl className="divide-y divide-line px-[var(--card-padding)]">
              {settings.extra.map((item) => (
                <DetailRow key={item.key} label={humanise(item.key)} value={item.value} />
              ))}
            </dl>
          </Card>
        </section>
      ) : null}

      {!hasVisibility && !settings.extra.length ? (
        <EmptyState
          icon={<Eye className="size-6" aria-hidden="true" />}
          title="No settings found"
          description="Your privacy settings will appear here once they are saved."
        />
      ) : null}
    </SectionState>
  )
}
