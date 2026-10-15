import { Mail, MapPin, Phone } from 'lucide-react'

import logo from '@/assets/images/shivraj-logo.png'
import { business } from '@/config/business'

const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  business.address.mapsQuery,
)}`

/** Brand footer with the centre's verified contact details. */
export function ContactFooter() {
  return (
    <footer
      aria-label="Centre contact details"
      className="overflow-hidden rounded-card border border-line bg-surface p-5 shadow-soft"
    >
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt=""
          width={40}
          height={40}
          className="size-10 shrink-0 object-contain"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-maroon">{business.name}</p>
          <p className="truncate text-2xs text-muted">{business.subBrand}</p>
        </div>
      </div>

      <ul className="mt-4 space-y-2.5 text-xs">
        <li>
          <a
            href={mapsHref}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2.5 text-muted transition hover:text-maroon"
          >
            <MapPin className="mt-0.5 size-4 shrink-0 text-maroon" aria-hidden="true" />
            <span>
              {business.address.line1}
              <br />
              {business.address.line2}
            </span>
          </a>
        </li>
        <li>
          <a
            href={business.phoneHref}
            className="flex items-center gap-2.5 text-muted transition hover:text-maroon"
          >
            <Phone className="size-4 shrink-0 text-maroon" aria-hidden="true" />
            {business.phone}
          </a>
        </li>
        <li>
          <a
            href={business.emailHref}
            className="flex items-center gap-2.5 text-muted transition hover:text-maroon"
          >
            <Mail className="size-4 shrink-0 text-maroon" aria-hidden="true" />
            {business.email}
          </a>
        </li>
      </ul>

      <p className="mt-5 border-t border-line pt-4 text-2xs text-muted">
        {business.name} {business.subBrand} ® — Since {business.since}
      </p>
    </footer>
  )
}
