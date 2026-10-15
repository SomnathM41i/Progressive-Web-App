import { Quote } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { routes } from '@/config/routes'
import type { SuccessStory } from '@/features/dashboard/types'

interface SuccessStoriesProps {
  stories: SuccessStory[]
}

/** Social proof: recent couples the centre helped bring together. */
export function SuccessStories({ stories }: SuccessStoriesProps) {
  return (
    <section aria-label="Success stories">
      <SectionHeading
        title="Success stories"
        subtitle="जोड्या जुळल्या, घरं सजली"
        action={
          <Link
            to={routes.successStories}
            className="text-xs font-semibold text-maroon hover:text-maroon-dark"
          >
            View all
          </Link>
        }
      />

      <ul className="space-y-3">
        {stories.map((story) => (
          <li key={story.id}>
            <Card className="relative overflow-hidden">
              <Quote
                className="absolute top-4 right-4 size-6 text-rose"
                aria-hidden="true"
              />
              <p className="pr-8 text-sm leading-relaxed text-ink">“{story.quote}”</p>
              <p className="mt-3 text-xs font-semibold text-maroon">{story.couple}</p>
              <p className="mt-0.5 text-2xs text-muted">
                {story.place} · {story.year}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}
