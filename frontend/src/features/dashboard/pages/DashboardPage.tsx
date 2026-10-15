import { Sparkles, UserPlus } from 'lucide-react'

import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { PreviewNotice } from '@/components/feedback/PreviewNotice'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnnouncementsCard } from '@/features/dashboard/components/AnnouncementsCard'
import { CompletionCard } from '@/features/dashboard/components/CompletionCard'
import { ContactFooter } from '@/features/dashboard/components/ContactFooter'
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton'
import { HeroBanner } from '@/features/dashboard/components/HeroBanner'
import { ProfileSummaryCard } from '@/features/dashboard/components/ProfileSummaryCard'
import { PromoRail } from '@/features/dashboard/components/PromoRail'
import { QuickAccessGrid } from '@/features/dashboard/components/QuickAccessGrid'
import { SuccessStories } from '@/features/dashboard/components/SuccessStories'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { ProfileCarousel } from '@/features/profiles/components/ProfileCarousel'
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

  const {
    summary,
    recommended,
    recentlyAdded,
    successStories,
    announcements,
    todayMatches,
  } = state.data
  const firstName = (user?.name ?? summary.name).split(' ')[0]

  return (
    <div className="space-y-6 px-4 pt-4 pb-6">
      <HeroBanner name={firstName} />

      {isPreview ? <PreviewNotice /> : null}

      {todayMatches > 0 ? (
        <section aria-label="New matches">
          <SectionHeading
            title="Today's matches"
            subtitle={`${todayMatches} new matches since your last visit`}
          />
          <PromoRail />
        </section>
      ) : null}

      <ProfileSummaryCard summary={summary} />

      <CompletionCard summary={summary} />

      <section aria-label="Quick access">
        <SectionHeading title="Quick access" />
        <QuickAccessGrid />
      </section>

      <section aria-label="Recommended profiles">
        <SectionHeading
          title="Recommended matches"
          subtitle="Based on your preferences"
        />
        {recommended.length > 0 ? (
          <ProfileCarousel profiles={recommended} />
        ) : (
          <EmptyState
            icon={<Sparkles className="size-5" aria-hidden="true" />}
            title="No recommendations yet"
            description="Recommendations will appear here once your profile is complete."
          />
        )}
      </section>

      <section aria-label="Recently added profiles">
        <SectionHeading title="Recently added" />
        {recentlyAdded.length > 0 ? (
          <ProfileCarousel profiles={recentlyAdded} />
        ) : (
          <EmptyState
            icon={<UserPlus className="size-5" aria-hidden="true" />}
            title="New profiles coming soon"
            description="Newly registered profiles will appear here."
          />
        )}
      </section>

      {successStories.length > 0 ? <SuccessStories stories={successStories} /> : null}

      {announcements.length > 0 ? (
        <section aria-label="Notifications">
          <AnnouncementsCard announcements={announcements} />
        </section>
      ) : null}

      <ContactFooter />
    </div>
  )
}
