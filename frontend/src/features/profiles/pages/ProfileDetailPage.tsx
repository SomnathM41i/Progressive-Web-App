import { useCallback, useEffect, useState } from 'react'
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { ErrorState } from '@/components/states/ErrorState'
import { ScreenHeader } from '@/components/navigation/ScreenHeader'
import { AppScreen } from '@/components/ui/AppScreen'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { routes } from '@/config/routes'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { ContactDetailsSection } from '@/features/contact-details/components/ContactDetailsSection'
import { useRecordProfileView } from '@/features/profile-views/hooks/useRecordProfileView'
import { useSentInterests } from '@/features/interests/hooks/useSentInterests'
import { interestsService } from '@/features/interests/services/interests.service'
import type { ProfilePreview } from '@/features/profiles/types'
import {
  publicProfileService,
  type PublicProfile,
  type PublicProfileField,
  type PublicProfileSection,
} from '@/features/profiles/services/public-profile.service'
import { useShortlist } from '@/features/shortlist/hooks/useShortlist'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'

/** One label/value line. Missing values stay visible as "Not provided". */
function FieldRows({ fields }: { fields: PublicProfileField[] }) {
  return (
    <dl className="divide-y divide-line/70">
      {fields.map((field) => (
        <div
          key={field.label}
          className="flex items-start justify-between gap-4 py-2.5"
        >
          <dt className="shrink-0 text-xs text-muted">{field.label}</dt>
          <dd
            className={cn(
              'min-w-0 text-right text-sm break-words',
              field.value ? 'text-ink' : 'text-muted/60',
            )}
          >
            {field.value ?? 'Not provided'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

function SectionBlock({ section }: { section: PublicProfileSection }) {
  const notes = section.notes.filter((note) => note.value !== null)

  return (
    <section className="px-4 pt-5">
      <SectionHeading title={section.title} />
      {section.fields.length ? (
        <Card flush>
          <div className="px-[var(--card-padding)]">
            <FieldRows fields={section.fields} />
          </div>
        </Card>
      ) : null}
      {notes.map((note) => (
        <Card key={note.label} className="mt-3">
          <p className="text-xs font-semibold text-muted">{note.label}</p>
          <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-ink">
            {note.value}
          </p>
        </Card>
      ))}
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[4/5] max-h-[62vh] w-full bg-rose" />
      <div className="space-y-3 px-4 pt-4">
        <div className="h-4 w-1/2 rounded bg-rose" />
        <div className="h-3 w-2/3 rounded bg-rose/70" />
        <div className="h-40 rounded-2xl bg-rose/50" />
        <div className="h-40 rounded-2xl bg-rose/40" />
      </div>
    </div>
  )
}

export function ProfileDetailPage() {
  const { profileId } = useParams<{ profileId?: string }>()
  const toast = useToast()
  const { user } = useAuth()
  const { isShortlisted, toggle } = useShortlist()
  const { hasSent, markSent } = useSentInterests(user?.profileId)

  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [sendingInterest, setSendingInterest] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  useEffect(() => {
    if (!profileId) {
      setStatus('error')
      setError('No profile was selected.')
      return
    }

    let cancelled = false
    setStatus('loading')
    setError(null)

    publicProfileService
      .fetchDetails(profileId)
      .then((data) => {
        if (cancelled) return
        setProfile(data)
        setStatus('ready')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load this profile.')
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [profileId, reloadNonce])

  useEffect(() => {
    if (!lightboxOpen || !profile) return
    const count = profile.photos.length

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setLightboxOpen(false)
      if (event.key === 'ArrowRight' && count > 1) {
        setLightboxIndex((index) => (index + 1) % count)
      }
      if (event.key === 'ArrowLeft' && count > 1) {
        setLightboxIndex((index) => (index - 1 + count) % count)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, profile])

  // Only a successfully loaded profile counts as a view.
  useRecordProfileView(user?.profileId, status === 'ready' ? profile?.id : null)

  const retry = useCallback(() => setReloadNonce((value) => value + 1), [])

  if (status === 'loading') {
    return (
      <AppScreen>
        <ScreenHeader title="Profile details" />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          <DetailSkeleton />
        </main>
      </AppScreen>
    )
  }

  if (status === 'error' || !profile) {
    return (
      <AppScreen>
        <ScreenHeader title="Profile details" />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6">
          <ErrorState
            title="Profile unavailable"
            description={error ?? 'Could not load this profile.'}
            onRetry={retry}
          />
          <div className="mt-4 text-center">
            <Link to={routes.home} className="text-xs font-semibold text-maroon">
              Back to dashboard
            </Link>
          </div>
        </main>
      </AppScreen>
    )
  }

  const preview: ProfilePreview = {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    location:
      [profile.taluka, profile.district, profile.city].filter(Boolean).join(', ') ||
      profile.locationType ||
      'Location not provided',
    occupation: profile.occupation,
    gender: profile.gender,
    education: profile.education,
    height: profile.height,
    maritalStatus: profile.maritalStatus,
    photoUrl: profile.photoUrl,
  }

  const saved = isShortlisted(profile.id)
  const interestSent = hasSent(profile.id)
  const meta = [
    profile.age > 0 ? `${profile.age} yrs` : null,
    profile.height,
    profile.maritalStatus,
  ]
    .filter(Boolean)
    .join(' · ')

  async function handleSendInterest() {
    const myId = user?.profileId
    if (!myId || interestSent || sendingInterest) return

    setSendingInterest(true)
    try {
      await interestsService.sendInterest(myId, profile!.id)
      markSent(profile!.id)
      toast.success('Interest sent')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send the interest')
    } finally {
      setSendingInterest(false)
    }
  }

  return (
    <AppScreen>
      <ScreenHeader
        title="Profile details"
        trailing={
          <button
            type="button"
            aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
            aria-pressed={saved}
            onClick={() => toggle(preview)}
            className={cn(
              'inline-flex size-9 items-center justify-center rounded-full border transition active:scale-95',
              saved
                ? 'border-maroon bg-maroon text-white'
                : 'border-line bg-white text-maroon',
            )}
          >
            <Bookmark className="size-4.5" fill={saved ? 'currentColor' : 'none'} />
          </button>
        }
      />

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              if (profile.photos.length) {
                setLightboxIndex(0)
                setLightboxOpen(true)
              }
            }}
            aria-label={profile.photoUrl ? 'View full photo' : undefined}
            className="block w-full text-left"
          >
            <div className="relative aspect-[4/5] max-h-[62vh] w-full overflow-hidden bg-gradient-to-br from-rose to-rose-dark">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={`${profile.name}'s profile`}
                  fetchPriority="high"
                  className="size-full object-cover object-top"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center gap-2 text-maroon">
                  <span className="text-6xl font-semibold">
                    {profile.name.slice(0, 1)}
                  </span>
                  <span className="text-xs text-muted">Photo not available</span>
                </div>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-4 pt-16 pb-4">
                <h2 className="text-xl font-semibold text-white drop-shadow-sm">
                  {profile.name}
                </h2>
                <p className="mt-0.5 text-sm text-white/85">{meta}</p>
                <p className="mt-0.5 truncate text-xs text-white/75">
                  {preview.location}
                </p>
              </div>

              {profile.photos.length > 1 ? (
                <span className="absolute top-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
                  1 / {profile.photos.length}
                </span>
              ) : null}
            </div>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 px-4 pt-3">
          {[
            profile.gender,
            profile.maritalStatus,
            profile.locationType,
            profile.education,
          ]
            .filter(Boolean)
            .map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-muted"
              >
                {tag}
              </span>
            ))}
        </div>

        <section className="px-4 pt-5">
          <SectionHeading title="Profile overview" />
          <Card flush>
            <div className="px-[var(--card-padding)]">
              <FieldRows fields={profile.overview} />
            </div>
          </Card>
        </section>

        {user?.profileId && user.profileId !== profile.id ? (
          <ContactDetailsSection
            key={profile.id}
            memberId={user.profileId}
            profileId={profile.id}
          />
        ) : null}

        {profile.sections.map((section) => (
          <SectionBlock key={section.key} section={section} />
        ))}
      </main>

      <footer className="shrink-0 border-t border-line bg-white px-4 py-3">
        <button
          type="button"
          onClick={() => void handleSendInterest()}
          disabled={interestSent || sendingInterest}
          className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-maroon px-4 text-sm font-semibold text-maroon hover:bg-rose disabled:cursor-not-allowed disabled:opacity-55"
        >
          <Heart className="size-4" />
          {interestSent
            ? 'Interest sent'
            : sendingInterest
              ? 'Sending…'
              : 'Send interest'}
        </button>
      </footer>

      {lightboxOpen && profile.photos.length ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${profile.name}'s photo`}
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black"
        >
          <button
            type="button"
            aria-label="Close photo"
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 z-10 inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          <img
            src={profile.photos[lightboxIndex] ?? profile.photos[0]}
            alt={`${profile.name}'s profile`}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full object-contain"
          />

          {profile.photos.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={(event) => {
                  event.stopPropagation()
                  setLightboxIndex(
                    (index) =>
                      (index - 1 + profile.photos.length) % profile.photos.length,
                  )
                }}
                className="absolute left-3 inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={(event) => {
                  event.stopPropagation()
                  setLightboxIndex((index) => (index + 1) % profile.photos.length)
                }}
                className="absolute right-3 inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm"
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
              <span className="absolute bottom-6 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {lightboxIndex + 1} / {profile.photos.length}
              </span>
            </>
          ) : null}
        </div>
      ) : null}
    </AppScreen>
  )
}
