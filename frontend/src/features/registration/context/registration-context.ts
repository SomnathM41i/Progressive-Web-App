import { createContext } from 'react'

import type {
  ProfileLocationType,
  RegistrationSectionId,
  RegistrationStepId,
} from '@/features/registration/constants'
import type {
  RegistrationAccount,
  RegistrationDraft,
  RegistrationSections,
} from '@/features/registration/types'

export type EditableRegistrationSectionId = Exclude<RegistrationSectionId, 'account'>

export interface RegistrationContextValue {
  draft: RegistrationDraft
  matriId: string | null
  profileLocationType: ProfileLocationType | ''
  completedSections: RegistrationSectionId[]
  saveAccount: (account: RegistrationAccount, matriId: string) => void
  saveSection: <K extends EditableRegistrationSectionId>(
    section: K,
    values: RegistrationSections[K],
  ) => void
  setProfileLocationType: (value: ProfileLocationType | '') => void
  isSectionComplete: (section: RegistrationSectionId) => boolean
  isStepComplete: (step: RegistrationStepId) => boolean
  reset: () => void
}

export const RegistrationContext = createContext<RegistrationContextValue | null>(null)
