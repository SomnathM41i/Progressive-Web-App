import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type { AuthStatus } from '@/features/auth/types'
import { useAuth } from '@/features/auth/hooks/useAuth'
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
import { REGISTRATION_DRAFT_KEY, sessionStore } from '@/lib/storage'

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

function isEmptyDraft(draft: RegistrationDraft): boolean {
  return (
    !draft.matriId &&
    !draft.profileLocationType &&
    draft.completedSections.length === 0 &&
    Object.keys(draft.sections).length === 0
  )
}

/**
 * Keeps the browser draft tied to the signed-in profile.
 *
 * A draft can outlive a session (for example if the tab stays open while a
 * different member logs in), so anything owned by another profile is discarded
 * instead of being shown to the new member.
 */
function reconcileDraft(
  draft: RegistrationDraft,
  status: AuthStatus,
  profileId: string | null,
): RegistrationDraft {
  if (status === 'unknown') return draft

  if (status === 'unauthenticated') {
    return isEmptyDraft(draft) ? draft : createEmptyDraft()
  }

  if (!profileId || draft.matriId === profileId) return draft

  return { ...createEmptyDraft(), matriId: profileId }
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
  const raw = sessionStore.read(REGISTRATION_DRAFT_KEY)
  if (!raw) return createEmptyDraft()

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return createEmptyDraft()

    const matriId =
      typeof parsed.matriId === 'string' && parsed.matriId.trim()
        ? parsed.matriId.trim()
        : null
    const completedSections = Array.isArray(parsed.completedSections)
      ? [...new Set(parsed.completedSections.filter(isSectionId))]
      : []
    const sections = isRecord(parsed.sections)
      ? (parsed.sections as RegistrationDraftSections)
      : {}
    const savedType = sections.account?.profile_location_type
    const profileLocationType = isProfileLocationType(parsed.profileLocationType)
      ? parsed.profileLocationType
      : isProfileLocationType(savedType)
        ? savedType
        : ''

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

interface RegistrationProviderProps {
  children: ReactNode
  /**
   * Keep the draft in memory only.
   *
   * Profile editing saves through the same section methods, but its values
   * must never leak into an in-progress registration draft (or mark
   * registration steps complete), so it disables persistence.
   */
  persist?: boolean
}

export function RegistrationProvider({
  children,
  persist = true,
}: RegistrationProviderProps) {
  const { status, user } = useAuth()
  const profileId = user?.profileId?.trim() || null
  const [draft, setDraft] = useState<RegistrationDraft>(() =>
    persist
      ? reconcileDraft(loadDraft(), status, profileId)
      : { ...createEmptyDraft(), matriId: profileId },
  )

  useEffect(() => {
    if (!persist) return
    sessionStore.write(REGISTRATION_DRAFT_KEY, JSON.stringify(draft))
  }, [draft, persist])

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
    setDraft((current) => {
      const previous = current.sections[section]
      const next =
        isRecord(previous) && isRecord(values)
          ? { ...previous, ...values }
          : values
      return {
        ...current,
        completedSections: withSection(current.completedSections, section),
        sections: {
          ...current.sections,
          [section]: next,
        } as RegistrationDraftSections,
      }
    })
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
