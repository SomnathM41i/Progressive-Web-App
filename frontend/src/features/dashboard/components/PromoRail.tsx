import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { promoBanners } from '@/features/dashboard/config/banners'
import { cn } from '@/lib/cn'

const toneStyles = {
  brand: 'bg-maroon text-white',
  rose: 'bg-rose text-maroon',
} as const

const iconStyles = {
  brand: 'bg-white/15 text-white',
  rose: 'bg-white text-maroon',
} as const

/** Horizontally scrolling promotional banners, driven by `promoBanners`. */
export function PromoRail() {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
      {promoBanners.map((banner) => {
        const Icon = banner.icon

        return (
          <li key={banner.id} className="w-64 shrink-0 snap-start">
            <Link
              to={banner.to}
              className={cn(
                'flex h-full flex-col rounded-card p-4 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-card active:scale-[0.99]',
                toneStyles[banner.tone],
              )}
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-full',
                  iconStyles[banner.tone],
                )}
              >
                <Icon className="size-4.5" aria-hidden="true" />
              </span>

              <p className="mt-3 text-sm font-bold">{banner.title}</p>
              <p
                className={cn(
                  'mt-1 flex-1 text-2xs leading-relaxed',
                  banner.tone === 'brand' ? 'text-white/75' : 'text-maroon/70',
                )}
              >
                {banner.description}
              </p>

              <span className="mt-3 inline-flex items-center gap-1.5 text-2xs font-bold">
                {banner.ctaLabel}
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
