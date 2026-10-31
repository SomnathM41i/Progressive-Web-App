import type {
  ContactApiRecord,
  ContactDetails,
  ContactViewResponse,
  ViewedContactApiRow,
  ViewedContactEntry,
  ViewedContactsResponse,
  ViewedContactsResult,
} from '@/features/contact-details/types'
import { publicProfileService } from '@/features/profiles/services/public-profile.service'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

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

function ensureJsonBody(data: unknown): void {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ApiError({
      message: 'The server returned an unexpected response. Please try again.',
    })
  }
}

function text(value: string | null | undefined): string | null {
  return value?.trim() || null
}

function joinParts(values: Array<string | null | undefined>): string | null {
  const parts = values.map(text).filter((value): value is string => value !== null)
  return parts.length ? parts.join(', ') : null
}

/** The API writes birth times as `:5:45:PM`. */
function formatBirthTime(value: string | null | undefined): string | null {
  const match = /^:?(\d{1,2}):(\d{2}):?\s*(AM|PM)$/i.exec(value?.trim() ?? '')
  return match ? `${match[1]}:${match[2]} ${match[3].toUpperCase()}` : text(value)
}

function mapContact(record: ContactApiRecord): ContactDetails {
  return {
    name: text(record.Name),
    fatherName: text(record.FatherName),
    motherName: text(record.MotherName),
    mobile: text(record.Mobile),
    alternateMobile: text(record.Mobile2),
    email: text(record.Email),
    dateOfBirth: text(record.DOB),
    placeOfBirth: text(record.PlaceOfBirth),
    timeOfBirth: formatBirthTime(record.TimeOfBirth),
    address: joinParts([
      record.Address,
      record.City,
      record.Taluka,
      record.District,
      record.State,
      record.Country,
    ]),
    workAddress: joinParts([
      record.WorkAddress,
      record.WorkCity,
      record.WorkTaluka,
      record.WorkDistrict,
      record.WorkState,
      record.WorkCountry,
    ]),
  }
}

/**
 * List rows carry a raw `Photo` that ignores photo approval, so the card photo
 * comes from the public details endpoint; a failed lookup shows the monogram.
 */
async function mapViewedRow(row: ViewedContactApiRow): Promise<ViewedContactEntry | null> {
  const id = String(row.MatriID ?? '').trim()
  if (!id) return null

  const contact = row.ContactDetails
  const summary = await publicProfileService.fetchSummary(id).catch(() => null)

  return {
    id,
    name: text(contact?.Name) ?? summary?.name ?? id,
    age: Number(row.Age) || summary?.age || 0,
    location:
      joinParts([contact?.District, contact?.State]) || summary?.location || 'Not specified',
    occupation: text(row.Occupation) ?? summary?.occupation,
    education: text(row.Education) ?? summary?.education,
    height: text(row.Height) ?? summary?.height,
    gender: summary?.gender,
    maritalStatus: summary?.maritalStatus,
    photoUrl: summary?.photoUrl ?? null,
    viewedOn: text(row.ViewedOn) ?? undefined,
    mobile: text(contact?.Mobile),
  }
}

export interface ContactDetailsService {
  /** One page of the profiles whose contact details the member has unlocked. */
  fetchViewed: (matriId: string, page?: number) => Promise<ViewedContactsResult>
  /** Contact details if already unlocked, otherwise `null`. Never spends a credit. */
  findUnlocked: (matriId: string, profileId: string) => Promise<ContactDetails | null>
  /** Unlocks the profile's contact details. Spends one credit on the first unlock. */
  unlock: (matriId: string, profileId: string) => Promise<ContactDetails>
}

export const contactDetailsService: ContactDetailsService = {
  async fetchViewed(matriId, page = 1) {
    const body = new URLSearchParams({ MatriID: matriId, page: String(page) })
    const { data } = await api.post<ViewedContactsResponse>(
      '/get-list-MyViewedContactDetails.php',
      body,
    )

    ensureJsonBody(data)

    if (isFailure(data.status)) {
      throw new ApiError({ message: data.message || 'Failed to load viewed contacts' })
    }

    const rows = Array.isArray(data.data) ? data.data : []
    const entries = await Promise.all(rows.map(mapViewedRow))

    return {
      entries: entries.filter((entry): entry is ViewedContactEntry => entry !== null),
      page: Number(data.pagination?.current_page) || page,
      totalPages: Number(data.pagination?.total_pages) || page,
      totalRecords: Number(data.pagination?.total_records) || 0,
    }
  },

  async findUnlocked(matriId, profileId) {
    let page = 1
    let totalPages = 1

    do {
      const body = new URLSearchParams({ MatriID: matriId, page: String(page) })
      const { data } = await api.post<ViewedContactsResponse>(
        '/get-list-MyViewedContactDetails.php',
        body,
      )

      ensureJsonBody(data)

      if (isFailure(data.status)) {
        throw new ApiError({ message: data.message || 'Could not check contact access' })
      }

      const rows = Array.isArray(data.data) ? data.data : []
      const match = rows.find((row) => String(row.MatriID ?? '').trim() === profileId)
      if (match?.ContactDetails) return mapContact(match.ContactDetails)

      // An empty page is always the last one, whatever the pagination says.
      if (!rows.length) return null
      totalPages = Number(data.pagination?.total_pages) || page
      page += 1
    } while (page <= totalPages)

    return null
  },

  async unlock(matriId, profileId) {
    const body = new URLSearchParams({ MatriID: matriId, ProfileID: profileId })
    const { data } = await api.post<ContactViewResponse>('/ViewUserContactDetails.php', body)

    ensureJsonBody(data)

    if (isFailure(data.status) || !data.data) {
      throw new ApiError({ message: data.message || 'Could not load the contact details' })
    }

    return mapContact(data.data)
  },
}
