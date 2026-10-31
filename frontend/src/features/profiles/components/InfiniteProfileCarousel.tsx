import { useEffect, useRef, useState } from 'react'

import { ProfileCard } from '@/features/profiles/components/ProfileCard'
import type { ProfilePreview } from '@/features/profiles/types'
import { publicProfileService, type PublicProfileType } from '@/features/profiles/services/public-profile.service'

interface InfiniteProfileCarouselProps {
  type: PublicProfileType
  gender?: 'Male' | 'Female'
  initialProfiles?: ProfilePreview[]
}

export function InfiniteProfileCarousel({ type, gender, initialProfiles = [] }: InfiniteProfileCarouselProps) {
  const [profiles, setProfiles] = useState<ProfilePreview[]>(initialProfiles)
  // An empty rail (its first request failed) starts over from page 1.
  const [page, setPage] = useState(initialProfiles.length ? 1 : 0)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const railRef = useRef<HTMLUListElement | null>(null)
  const sentinelRef = useRef<HTMLLIElement | null>(null)

  useEffect(() => {
    setProfiles(initialProfiles)
    setPage(initialProfiles.length ? 1 : 0)
    setHasMore(true)
  }, [type, gender])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore || loading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore()
        }
      },
      // Watched inside the rail: only sideways scrolling may fetch the next page.
      { root: railRef.current, rootMargin: '0px 200px 0px 200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loading, page])

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await publicProfileService.list(type, { gender, page: nextPage, limit: 12 })
      if (res.profiles.length === 0) {
        setHasMore(false)
        return
      }
      setProfiles((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        const merged = [...prev]
        for (const p of res.profiles) {
          if (!seen.has(p.id)) merged.push(p)
        }
        return merged
      })
      setPage(nextPage)
      const totalPages = res.pagination?.total_pages
      if (totalPages && nextPage >= totalPages) setHasMore(false)
    } catch {
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <ul ref={railRef} className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden">
        {profiles.map((profile) => (
          <li key={profile.id} className="w-40 shrink-0 snap-start">
            <ProfileCard profile={profile} />
          </li>
        ))}
        <li ref={sentinelRef} className="w-1 shrink-0" aria-hidden="true" />
      </ul>
    </div>
  )
}
