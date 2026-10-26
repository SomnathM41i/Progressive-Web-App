import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import {
  PROFILE_LOCATION_TYPES,
  REGISTRATION_SECTION_IDS,
  type ProfileLocationType,
  type RegistrationSectionId,
  type RegistrationStepId,
} from '@/features/registration/constants'
import {
  RegistrationContext,
  type EditableRegistrationSectionId,
  type RegistrationContextValue,
} from '@/features/registration/context/registration-context'
import { registrationStepsFor } from '@/features/registration/steps'
import type {
  RegistrationAccount,
  RegistrationDraft,
  RegistrationDraftSections,
  RegistrationSections,
} from '@/features/registration/types'
import { sessionStore } from '@/lib/storage'

const STORAGE_KEY = 'shivaraj.registration'

function createEmptyDraft(): RegistrationDraft {
  return {
    matriId: null,
    profileLocationType: '',
    completedSections: [],
    sections: {},
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isProfileLocationType(value: unknown): value is ProfileLocationType {
  return (
    typeof value === 'string' &&
    PROFILE_LOCATION_TYPES.some((option) => option === value)
  )
}

function isSectionId(value: unknown): value is RegistrationSectionId {
  return (
    typeof value === 'string' &&
    REGISTRATION_SECTION_IDS.some((section) => section === value)
  )
}

function loadDraft(): RegistrationDraft {
  const raw = sessionStore.read(STORAGE_KEY)
  if (!raw) return createEmptyDraft()

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return createEmptyDraft()

    const matriId =
      typeof parsed.matriId === 'string' && parsed.matriId.trim()
        ? parsed.matriId.trim()
        : null
    const profileLocationType = isProfileLocationType(parsed.profileLocationType)
      ? parsed.profileLocationType
      : ''
    const completedSections = Array.isArray(parsed.completedSections)
      ? [...new Set(parsed.completedSections.filter(isSectionId))]
      : []
    const sections = isRecord(parsed.sections)
      ? (parsed.sections as RegistrationDraftSections)
      : {}

    return { matriId, profileLocationType, completedSections, sections }
  } catch {
    return createEmptyDraft()
  }
}

function withSection(
  sections: RegistrationSectionId[],
  section: RegistrationSectionId,
): RegistrationSectionId[] {
  return sections.includes(section) ? sections : [...sections, section]
}

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<RegistrationDraft>(loadDraft)

  useEffect(() => {
    sessionStore.write(STORAGE_KEY, JSON.stringify(draft))
  }, [draft])

  const saveAccount = useCallback((account: RegistrationAccount, matriId: string) => {
    const { pass, ...accountWithoutPassword } = account
    void pass

    setDraft((current) => ({
      ...current,
      matriId: matriId.trim(),
      profileLocationType: account.profile_location_type,
      completedSections: withSection(current.completedSections, 'account'),
      sections: { ...current.sections, account: accountWithoutPassword },
    }))
  }, [])

  const saveSection = useCallback(function saveSection<
    K extends EditableRegistrationSectionId,
  >(section: K, values: RegistrationSections[K]) {
    setDraft((current) => ({
      ...current,
      completedSections: withSection(current.completedSections, section),
      sections: {
        ...current.sections,
        [section]: values,
      } as RegistrationDraftSections,
    }))
  }, [])

  const setProfileLocationType = useCallback((value: ProfileLocationType | '') => {
    setDraft((current) => ({
      ...current,
      profileLocationType: value,
      sections:
        current.sections.account && value
          ? {
              ...current.sections,
              account: {
                ...current.sections.account,
                profile_location_type: value,
              },
            }
          : current.sections,
    }))
  }, [])

  const isSectionComplete = useCallback(
    (section: RegistrationSectionId) => draft.completedSections.includes(section),
    [draft.completedSections],
  )

  const isStepComplete = useCallback(
    (step: RegistrationStepId) => {
      if (step === 'review') {
        const sections = registrationStepsFor(draft.profileLocationType).filter(
          (candidate) => candidate !== 'review',
        )
        return sections.every((section) => draft.completedSections.includes(section))
      }
      return draft.completedSections.includes(step)
    },
    [draft.completedSections, draft.profileLocationType],
  )

  const reset = useCallback(() => setDraft(createEmptyDraft()), [])

  const value = useMemo<RegistrationContextValue>(
    () => ({
      draft,
      matriId: draft.matriId,
      profileLocationType: draft.profileLocationType,
      completedSections: draft.completedSections,
      saveAccount,
      saveSection,
      setProfileLocationType,
      isSectionComplete,
      isStepComplete,
      reset,
    }),
    [
      draft,
      saveAccount,
      saveSection,
      setProfileLocationType,
      isSectionComplete,
      isStepComplete,
      reset,
    ],
  )

  return (
    <RegistrationContext.Provider value={value}>
      {children}
    </RegistrationContext.Provider>
  )
}
