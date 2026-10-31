import type { LucideIcon } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/cn'

export interface ProfileSectionLink {
  label: string
  to: string
  icon: LucideIcon
  /**
   * One-line preview of the section. `null` means the section was loaded and
   * is empty ("Not added yet"); `undefined` means no summary is known, so no
   * line is shown rather than wrongly claiming the section is empty.
   */
  summary?: string | null
  loading?: boolean
}

interface ProfileSectionListProps {
  links: ProfileSectionLink[]
}

/**
 * Overview jump links: one row per profile section with a short summary of its
 * current value. Summaries load asynchronously, so a row shows a skeleton until
 * its section resolves.
 */
export function ProfileSectionList({ links }: ProfileSectionListProps) {
  return (
    <Card flush>
      <ul className="divide-y divide-line">
        {links.map((link) => (
          <li key={link.to}>
            <Link
              to={link.to}
              className="flex items-center gap-3 px-[var(--card-padding)] py-3.5 transition hover:bg-rose/60"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose text-maroon">
                <link.icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{link.label}</span>
                {link.loading ? (
                  <Skeleton className="mt-1.5 h-3 w-32 rounded-full" />
                ) : link.summary === undefined ? null : (
                  <span
                    className={cn(
                      'mt-0.5 block truncate text-xs',
                      link.summary ? 'text-muted' : 'text-muted/60',
                    )}
                  >
                    {link.summary ?? 'Not added yet'}
                  </span>
                )}
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted/50" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
