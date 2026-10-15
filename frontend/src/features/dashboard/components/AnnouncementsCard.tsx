import { Bell, Info, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Card } from '@/components/ui/Card'
import type { Announcement } from '@/features/dashboard/types'
import { cn } from '@/lib/cn'

const toneStyles: Record<Announcement['tone'], { icon: LucideIcon; wrap: string }> = {
  info: { icon: Info, wrap: 'bg-info-soft text-info' },
  success: { icon: Bell, wrap: 'bg-success-soft text-success' },
  warning: { icon: TriangleAlert, wrap: 'bg-warning-soft text-warning' },
}

const dateFormatter = new Intl.DateTimeFormat('mr-IN', {
  day: 'numeric',
  month: 'short',
})

interface AnnouncementsCardProps {
  announcements: Announcement[]
}

/** Account notifications and platform announcements. */
export function AnnouncementsCard({ announcements }: AnnouncementsCardProps) {
  return (
    <Card flush>
      <h2 className="border-b border-line px-5 py-3.5 text-base text-maroon">
        Notifications
      </h2>

      <ul className="divide-y divide-line">
        {announcements.map((announcement) => {
          const { icon: Icon, wrap } = toneStyles[announcement.tone]

          return (
            <li key={announcement.id} className="flex gap-3 px-5 py-3.5">
              <span
                className={cn(
                  'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
                  wrap,
                )}
              >
                <Icon className="size-4.5" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">
                    {announcement.title}
                  </p>
                  <time
                    dateTime={announcement.createdAt}
                    className="shrink-0 text-2xs text-muted"
                  >
                    {dateFormatter.format(new Date(announcement.createdAt))}
                  </time>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {announcement.body}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
