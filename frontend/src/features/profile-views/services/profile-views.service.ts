import type {
  ProfileViewActionResponse,
  ProfileViewApiRow,
  ProfileViewEntry,
  ProfileViewsListApiResponse,
  ProfileViewsListResult,
} from '@/features/profile-views/types'
import { resolveMediaUrl } from '@/features/profiles/media'
import { publicProfileService } from '@/features/profiles/services/public-profile.service'
import type { ProfilePreview } from '@/features/profiles/types'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

/**
 * HTTP 200 is returned for failures too, so the JSON `status` decides. Only a
 * recognised failure token raises; the server message is surfaced as-is.
 */
function isFailure(status: unknown): boolean {
  if (status === 0 || status === false) return true
  if (typeof status === 'string') {
    const normalised = status.trim().toLowerCase()
    return (
      normalised === 'error' ||
      normalised === 'failed' ||
      normalised === 'fail' ||
      normalised === '0'
    )
  }
  return false
}

/** Rejects non-JSON bodies (proxy pages, bot challenges) before they are read. */
function ensureJsonBody(data: unknown): void {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ApiError({
      message: 'The server returned an unexpected response. Please try again.',
    })
  }
}

/**
 * "Who viewed me" sends a bare filename (`2026_..._a.jpg`) that only resolves
 * under `/gallary/`; "My viewed profiles" already sends `/gallary/...`.
 */
function rowPhoto(row: ProfileViewApiRow): string | null {
  const value = (row.photo_url ?? row.Photo)?.trim()
  if (!value) return null
  if (value.includes('/')) return resolveMediaUrl(value)
  return resolveMediaUrl(`/gallary/${value}`)
}

function mapRow(row: ProfileViewApiRow): ProfileViewEntry | null {
  if (!row) return null

  const id =
    typeof row.MatriID === 'string'
      ? row.MatriID.trim()
      : typeof row.MatriID === 'number' && Number.isFinite(row.MatriID)
        ? String(row.MatriID)
        : ''
  if (!id) return null

  const occupation = row.Occupation?.trim()

  return {
    id,
    name: id,
    age: Number(row.Age) || 0,
    location: 'Not specified',
    occupation: occupation && occupation !== '-' ? occupation : undefined,
    education: row.Education || undefined,
    height: row.Height || undefined,
    photoUrl: rowPhoto(row),
    viewedOn: row.ViewedOn?.trim() || undefined,
  }
}

/**
 * List rows carry no name, gender or location. Those come from the public
 * details endpoint, cached per profile id so both tabs and later pages share
 * lookups. A failed lookup is dropped from the cache so the next load retries.
 */
const summaryCache = new Map<string, Promise<ProfilePreview>>()

function loadSummary(profileId: string): Promise<ProfilePreview> {
  let pending = summaryCache.get(profileId)
  if (!pending) {
    pending = publicProfileService.fetchSummary(profileId)
    pending.catch(() => summaryCache.delete(profileId))
    summaryCache.set(profileId, pending)
  }
  return pending
}

async function enrich(entries: ProfileViewEntry[]): Promise<ProfileViewEntry[]> {
  const summaries = await Promise.allSettled(entries.map((entry) => loadSummary(entry.id)))

  return entries.map((entry, index) => {
    const result = summaries[index]
    if (result.status !== 'fulfilled') return entry

    const summary = result.value
    return {
      ...entry,
      name: summary.name || entry.name,
      age: summary.age || entry.age,
      location: summary.location || entry.location,
      gender: summary.gender,
      maritalStatus: summary.maritalStatus,
      occupation: entry.occupation ?? summary.occupation,
      education: entry.education ?? summary.education,
      height: entry.height ?? summary.height,
      // The details endpoint applies photo approval, so its answer wins —
      // including "no photo".
      photoUrl: summary.photoUrl,
    }
  })
}

async function fetchList(
  path: string,
  matriId: string,
  page: number,
): Promise<ProfileViewsListResult> {
  const body = new URLSearchParams({ MatriID: matriId, page: String(page) })
  const { data } = await api.post<ProfileViewsListApiResponse>(path, body)

  ensureJsonBody(data)

  if (isFailure(data.status)) {
    throw new ApiError({ message: data.message || 'Failed to load profile views' })
  }

  const rows = Array.isArray(data.data) ? (data.data as ProfileViewApiRow[]) : []
  const entries = rows
    .map(mapRow)
    .filter((entry): entry is ProfileViewEntry => entry !== null)

  return {
    entries: await enrich(entries),
    page: Number(data.pagination?.current_page) || page,
    totalPages: Number(data.pagination?.total_pages) || page,
    totalRecords: Number(data.pagination?.total_records) || 0,
  }
}

export interface ProfileViewsService {
  /** Members who viewed the member's profile. */
  fetchWhoViewedMe: (matriId: string, page?: number) => Promise<ProfileViewsListResult>
  /** Profiles the member has viewed. */
  fetchMyViewed: (matriId: string, page?: number) => Promise<ProfileViewsListResult>
  /** Records that `viewerId` opened `profileId`. */
  recordView: (viewerId: string, profileId: string) => Promise<void>
}

export const profileViewsService: ProfileViewsService = {
  fetchWhoViewedMe(matriId, page = 1) {
    return fetchList('/get-list-WhoViewedMyProfile.php', matriId, page)
  },

  fetchMyViewed(matriId, page = 1) {
    return fetchList('/get-list-MyViewedProfiles.php', matriId, page)
  },

  async recordView(viewerId, profileId) {
    const body = new URLSearchParams({ ViewerID: viewerId, ProfileID: profileId })
    const { data } = await api.post<ProfileViewActionResponse>(
      '/update-ProfileViewCount.php',
      body,
    )

    ensureJsonBody(data)

    if (isFailure(data.status)) {
      throw new ApiError({ message: data.message || 'Could not record the profile view' })
    }
  },
}
