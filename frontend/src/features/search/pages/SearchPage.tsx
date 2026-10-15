import { useMemo, useState } from 'react'
import { Filter, Search } from 'lucide-react'

import { Page } from '@/components/ui/Page'
import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import { PREVIEW_DASHBOARD } from '@/features/dashboard/dev/preview-dashboard'
import { env } from '@/config/env'

const sampleProfiles = env.devPreview
  ? [...PREVIEW_DASHBOARD.recommended, ...PREVIEW_DASHBOARD.recentlyAdded]
  : []

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [gender, setGender] = useState('Bride')
  const [age, setAge] = useState('22–30')
  const [location, setLocation] = useState('Any location')
  const profiles = useMemo(
    () =>
      sampleProfiles.filter((profile) => {
        const [minAge, maxAge] = age.split('–').map(Number)
        const matchesQuery =
          `${profile.name} ${profile.location} ${profile.occupation ?? ''}`
            .toLowerCase()
            .includes(query.toLowerCase())
        return (
          matchesQuery &&
          profile.age >= minAge &&
          profile.age <= maxAge &&
          (location === 'Any location' || profile.location === location) &&
          (!profile.gender || profile.gender === gender)
        )
      }),
    [age, gender, location, query],
  )

  return (
    <Page
      title="Find your match"
      subtitle="Use filters to discover compatible profiles."
    >
      <label className="flex h-12 items-center gap-3 rounded-xl border border-line bg-white px-4 shadow-soft">
        <Search className="size-4 text-maroon" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, city or work"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </label>
      <section className="rounded-2xl border border-line bg-white p-4 shadow-soft">
        <h2 className="mb-4 flex items-center gap-2 text-base text-maroon">
          <Filter className="size-4" /> Advanced filters
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-muted">
            Looking for
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-1 block h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink"
            >
              <option>Bride</option>
              <option>Groom</option>
            </select>
          </label>
          <label className="text-xs text-muted">
            Age range
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="mt-1 block h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink"
            >
              <option>22–30</option>
              <option>25–35</option>
              <option>30–40</option>
            </select>
          </label>
          <label className="col-span-2 text-xs text-muted">
            Location
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 block h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink"
            >
              <option>Any location</option>
              <option value="पुणे">Pune</option>
              <option value="सातारा">Satara</option>
              <option value="मुंबई">Mumbai</option>
            </select>
          </label>
        </div>
      </section>
      <div className="flex items-center justify-between">
        <h2 className="text-base text-ink">Suggested profiles</h2>
        <span className="text-xs text-muted">{profiles.length} profiles</span>
      </div>
      {profiles.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3">
          {profiles.map((profile) => (
            <li key={profile.id}>
              <ProfileCard profile={profile} className="w-full" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-2xl border border-line bg-white px-5 py-10 text-center text-sm text-muted">
          {sampleProfiles.length
            ? 'No matching profiles found. Try changing your filters.'
            : 'Search results will appear here when profile search is connected.'}
        </div>
      )}
      {env.devPreview ? (
        <p className="text-center text-xs text-muted">
          Showing sample profiles in preview mode.
        </p>
      ) : null}
    </Page>
  )
}
