import { ErrorState } from '@/components/states/ErrorState'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnnouncementsCard } from '@/features/dashboard/components/AnnouncementsCard'
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton'
import { HeroBanner } from '@/features/dashboard/components/HeroBanner'
import { QuickAccessGrid } from '@/features/dashboard/components/QuickAccessGrid'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { InfiniteProfileCarousel } from '@/features/profiles/components/InfiniteProfileCarousel'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function DashboardPage() {
  const { state, reload } = useDashboard()
  const { user, isPreview } = useAuth()

  if (state.status === 'loading') {
    return <DashboardSkeleton />
  }

  if (state.status === 'error') {
    return (
      <div className="px-4 py-6">
        <ErrorState
          title="Dashboard unavailable"
          description={state.error.message}
          onRetry={reload}
        />
      </div>
    )
  }

  const { announcements } = state.data
  const firstName = (user?.name ?? 'Member').split(' ')[0]

  return (
    <div className="space-y-6 px-4 pt-4 pb-6">
      <HeroBanner name={firstName} />

      <section aria-label="Quick access">
        <QuickAccessGrid />
      </section>

      <section aria-label="Unmarried bride profiles">
        <SectionHeading title="Unmarried Profiles - Bride" />
        <InfiniteProfileCarousel type="unmarried" gender="Female" initialProfiles={(state.data as any).sections?.unmarriedBride} />
      </section>

      <section aria-label="Unmarried groom profiles">
        <SectionHeading title="Unmarried Profiles - Groom" />
        <InfiniteProfileCarousel type="unmarried" gender="Male" initialProfiles={(state.data as any).sections?.unmarriedGroom} />
      </section>

      <section aria-label="Remarriage bride profiles">
        <SectionHeading title="Remarriage Profiles - Bride" />
        <InfiniteProfileCarousel type="remarriage" gender="Female" initialProfiles={(state.data as any).sections?.remarriageBride} />
      </section>

      <section aria-label="Remarriage groom profiles">
        <SectionHeading title="Remarriage Profiles - Groom" />
        <InfiniteProfileCarousel type="remarriage" gender="Male" initialProfiles={(state.data as any).sections?.remarriageGroom} />
      </section>

      <section aria-label="NRI bride profiles">
        <SectionHeading title="NRI Profiles - Bride" />
        <InfiniteProfileCarousel type="nri" gender="Female" initialProfiles={(state.data as any).sections?.nriBride} />
      </section>

      <section aria-label="NRI groom profiles">
        <SectionHeading title="NRI Profiles - Groom" />
        <InfiniteProfileCarousel type="nri" gender="Male" initialProfiles={(state.data as any).sections?.nriGroom} />
      </section>

      {/* Success stories section removed as per requirements */}

      {announcements.length > 0 && !isPreview ? (
        <section aria-label="Notifications">
          <AnnouncementsCard announcements={announcements} />
        </section>
      ) : null}
    </div>
  )
}
