import {
  registrationReadEndpoints,
  registrationWriteEndpoints,
} from '@/features/registration/endpoints'
import { createRegistrationFormData } from '@/features/registration/form-data'
import {
  extractRegistrationRecord,
  readRegistrationText,
} from '@/features/registration/mapper'
import type {
  BasicDetails,
  ContactDetails,
  EducationDetails,
  FamilyDetails,
  HoroscopeDetails,
  NriDetails,
  PartnerPreferenceDetails,
  RegistrationAccount,
  RegistrationAccountOutcome,
  RegistrationApiRecord,
  RegistrationEnvelope,
  RegistrationMutationOutcome,
} from '@/features/registration/types'
import { api } from '@/services/api'
import { ApiError } from '@/services/api-error'

const MATRI_ID_KEYS = ['MatriID', 'matri_id', 'profileId', 'profile_id'] as const

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

function ensureJsonBody(data: unknown): asserts data is RegistrationEnvelope<unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ApiError({
      message: 'The server returned an unexpected response. Please try again.',
    })
  }
}

function readMessage(body: RegistrationEnvelope<unknown>): string | null {
  return readRegistrationText(body as RegistrationApiRecord, [
    'message',
    'Message',
    'msg',
  ])
}

function findTextByKeys(
  value: unknown,
  keys: readonly string[],
  depth = 0,
): string | null {
  if (depth > 4 || value === null || value === undefined) return null

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findTextByKeys(item, keys, depth + 1)
      if (found) return found
    }
    return null
  }

  if (typeof value !== 'object') return null

  const record = value as Record<string, unknown>

  for (const [key, child] of Object.entries(record)) {
    if (!keys.some((wanted) => wanted.toLowerCase() === key.toLowerCase())) continue
    if (typeof child === 'string' && child.trim()) return child.trim()
    if (typeof child === 'number') return String(child)
  }

  for (const child of Object.values(record)) {
    const found = findTextByKeys(child, keys, depth + 1)
    if (found) return found
  }

  return null
}

function readMatriId(body: RegistrationEnvelope<unknown>): string | null {
  return findTextByKeys(body, MATRI_ID_KEYS)
}

async function postForm(
  path: string,
  values: object,
  fallbackMessage: string,
): Promise<RegistrationEnvelope<unknown>> {
  const { data } = await api.post<RegistrationEnvelope<unknown>>(
    path,
    createRegistrationFormData(values),
  )

  ensureJsonBody(data)

  if (isFailure(data.status)) {
    throw new ApiError({ message: readMessage(data) ?? fallbackMessage })
  }

  return data
}

async function readRecord(
  path: string,
  matriId: string,
  fallbackMessage: string,
): Promise<RegistrationApiRecord> {
  const body = createRegistrationFormData({ MatriID: matriId })
  const { data } = await api.post<RegistrationEnvelope<unknown>>(path, body)

  ensureJsonBody(data)

  if (isFailure(data.status)) {
    throw new ApiError({ message: readMessage(data) ?? fallbackMessage })
  }

  return extractRegistrationRecord(data)
}

async function submitSection(
  path: string,
  values: object,
  fallbackMessage: string,
): Promise<RegistrationMutationOutcome> {
  const data = await postForm(path, values, fallbackMessage)
  return { matriId: readMatriId(data), message: readMessage(data) }
}

export interface RegistrationService {
  registerAccount: (payload: RegistrationAccount) => Promise<RegistrationAccountOutcome>
  submitNriDetails: (payload: NriDetails) => Promise<RegistrationMutationOutcome>
  submitBasicDetails: (payload: BasicDetails) => Promise<RegistrationMutationOutcome>
  submitContactDetails: (
    payload: ContactDetails,
  ) => Promise<RegistrationMutationOutcome>
  submitEducationDetails: (
    payload: EducationDetails,
  ) => Promise<RegistrationMutationOutcome>
  submitFamilyDetails: (payload: FamilyDetails) => Promise<RegistrationMutationOutcome>
  submitHoroscopeDetails: (
    payload: HoroscopeDetails,
  ) => Promise<RegistrationMutationOutcome>
  submitPartnerPreference: (
    payload: PartnerPreferenceDetails,
  ) => Promise<RegistrationMutationOutcome>
  getBasicDetails: (matriId: string) => Promise<RegistrationApiRecord>
  getContactDetails: (matriId: string) => Promise<RegistrationApiRecord>
  getEducationDetails: (matriId: string) => Promise<RegistrationApiRecord>
  getFamilyDetails: (matriId: string) => Promise<RegistrationApiRecord>
  getHoroscopeDetails: (matriId: string) => Promise<RegistrationApiRecord>
  getPartnerPreference: (matriId: string) => Promise<RegistrationApiRecord>
}

const registrationServiceImpl: RegistrationService = {
  async registerAccount(payload) {
    const data = await postForm(
      registrationWriteEndpoints.account,
      payload,
      'Could not create your account.',
    )
    const matriId = readMatriId(data)

    if (!matriId) {
      throw new ApiError({
        message:
          readMessage(data) ?? 'Registration succeeded but the profile id was missing.',
      })
    }

    return { matriId, message: readMessage(data) }
  },

  async submitNriDetails(payload) {
    return submitSection(
      registrationWriteEndpoints.nri,
      payload,
      'Could not save your NRI details.',
    )
  },

  async submitBasicDetails(payload) {
    return submitSection(
      registrationWriteEndpoints.basic,
      payload,
      'Could not save your basic details.',
    )
  },

  async submitContactDetails(payload) {
    return submitSection(
      registrationWriteEndpoints.contact,
      payload,
      'Could not save your contact details.',
    )
  },

  async submitEducationDetails(payload) {
    return submitSection(
      registrationWriteEndpoints.education,
      payload,
      'Could not save your education details.',
    )
  },

  async submitFamilyDetails(payload) {
    return submitSection(
      registrationWriteEndpoints.family,
      payload,
      'Could not save your family details.',
    )
  },

  async submitHoroscopeDetails(payload) {
    return submitSection(
      registrationWriteEndpoints.horoscope,
      payload,
      'Could not save your horoscope details.',
    )
  },

  async submitPartnerPreference(payload) {
    return submitSection(
      registrationWriteEndpoints.partner,
      payload,
      'Could not save your partner preference.',
    )
  },

  async getBasicDetails(matriId) {
    return readRecord(
      registrationReadEndpoints.basic,
      matriId,
      'Could not load your basic details.',
    )
  },

  async getContactDetails(matriId) {
    return readRecord(
      registrationReadEndpoints.contact,
      matriId,
      'Could not load your contact details.',
    )
  },

  async getEducationDetails(matriId) {
    return readRecord(
      registrationReadEndpoints.education,
      matriId,
      'Could not load your education details.',
    )
  },

  async getFamilyDetails(matriId) {
    return readRecord(
      registrationReadEndpoints.family,
      matriId,
      'Could not load your family details.',
    )
  },

  async getHoroscopeDetails(matriId) {
    return readRecord(
      registrationReadEndpoints.horoscope,
      matriId,
      'Could not load your horoscope details.',
    )
  },

  async getPartnerPreference(matriId) {
    return readRecord(
      registrationReadEndpoints.partner,
      matriId,
      'Could not load your partner preference.',
    )
  },
}

export const registrationService: RegistrationService = registrationServiceImpl
