import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { business } from '@/config/business'
import { routes } from '@/config/routes'
import { heroStats } from '@/features/dashboard/config/banners'

interface HeroBannerProps {
  /** Member's display name, used in the greeting. */
  name: string
}

/**
 * The dashboard's brand hero.
 *
 * Carries the greeting, the centre's promise and the primary route into search,
 * with the trust statistics the centre advertises (years, members, verified).
 */
export function HeroBanner({ name }: HeroBannerProps) {
  return (
    <section
      aria-label="Welcome"
      className="relative overflow-hidden rounded-card bg-gradient-to-br from-maroon-dark via-maroon to-maroon-deep p-5 text-white shadow-lift"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-12 -right-10 size-40 rounded-full bg-rose/10 blur-2xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 -left-10 size-40 rounded-full bg-white/5 blur-2xl"
      />

      <div className="relative">
        <p className="text-2xs font-semibold tracking-[0.16em] text-white/70 uppercase">
          {business.subBrand}
        </p>
        <h1 className="mt-1.5 font-display text-2xl text-white">नमस्कार, {name}</h1>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-white/75">
          {business.tagline}
        </p>

        <Link
          to={routes.search}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-maroon shadow-soft transition hover:bg-rose active:scale-[0.98]"
        >
          Search matches
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>

        <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-white/15 pt-4">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-display text-lg leading-none text-white">
                  {stat.value}
                </span>
                <span className="mt-1 block text-2xs text-white/70">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
