import { SearchX, Sparkles, UserPlus } from 'lucide-react'

import { PageLoader } from '@/components/loading/PageLoader'
import { EmptyState } from '@/components/states/EmptyState'
import { ErrorState } from '@/components/states/ErrorState'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AnnouncementsCard } from '@/features/dashboard/components/AnnouncementsCard'
import { CompletionCard } from '@/features/dashboard/components/CompletionCard'
import { PreviewNotice } from '@/components/feedback/PreviewNotice'
import { ProfileSummaryCard } from '@/features/dashboard/components/ProfileSummaryCard'
import { ProfileRail } from '@/features/dashboard/components/ProfilePreviewCard'
import { QuickActions } from '@/features/dashboard/components/QuickActions'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { useAuth } from '@/features/auth/hooks/useAuth'

export function DashboardPage() {
  const { state, reload } = useDashboard()
  const { user, isPreview } = useAuth()

  if (state.status === 'loading') {
    return <PageLoader label="Loading dashboard…" />
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

  const { summary, recommended, recentlyAdded, announcements } = state.data
  const firstName = (user?.name ?? summary.name).split(' ')[0]

  return (
    <div className="space-y-6 px-4 pt-4 pb-6">
      <section aria-label="Greeting">
        <p className="text-xs text-muted">Hello,</p>
        <h1 className="mt-0.5 text-2xl text-maroon">{firstName}</h1>
        <p className="mt-1 text-xs text-muted">
          See matches picked for you.
        </p>
      </section>

      {isPreview ? <PreviewNotice /> : null}

      <ProfileSummaryCard summary={summary} />

      <section aria-label="Quick actions">
        <SectionHeading title="Quick actions" />
        <QuickActions />
      </section>

      <CompletionCard summary={summary} />

      <section aria-label="Recommended profiles">
        <SectionHeading
          title="Recommended profiles"
          subtitle="Based on your preferences"
        />
        {recommended.length > 0 ? (
          <ProfileRail profiles={recommended} />
        ) : (
          <EmptyState
            icon={<Sparkles className="size-5" aria-hidden="true" />}
            title="No recommendations yet"
            description="Recommendations will appear here once your profile is complete."
          />
        )}
      </section>

      <section aria-label="Recently added profiles">
        <SectionHeading title="Recently added profiles" />
        {recentlyAdded.length > 0 ? (
          <ProfileRail profiles={recentlyAdded} />
        ) : (
          <EmptyState
            icon={<UserPlus className="size-5" aria-hidden="true" />}
            title="New profiles coming soon"
            description="Newly registered profiles will appear here."
          />
        )}
      </section>

      {announcements.length > 0 ? (
        <section aria-label="Notifications">
          <AnnouncementsCard announcements={announcements} />
        </section>
      ) : (
        <section aria-label="Notifications">
          <SectionHeading title="Notifications" />
          <EmptyState
            icon={<SearchX className="size-5" aria-hidden="true" />}
            title="No notifications"
            description="New notifications will appear here."
          />
        </section>
      )}
    </div>
  )
}
