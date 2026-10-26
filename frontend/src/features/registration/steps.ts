import {
  REGISTRATION_STEP_ORDER,
  type ProfileLocationType,
  type RegistrationStepId,
} from '@/features/registration/constants'

export interface RegistrationStepMeta {
  id: RegistrationStepId
  title: string
  description: string
}

const STEP_META: Record<RegistrationStepId, Omit<RegistrationStepMeta, 'id'>> = {
  account: {
    title: 'Account',
    description: 'Create your login and primary profile.',
  },
  nri: {
    title: 'NRI details',
    description: 'Add your overseas residency, visa and settlement details.',
  },
  basic: {
    title: 'Basic details',
    description: 'Add your physical details to complete your profile.',
  },
  contact: {
    title: 'Contact details',
    description: 'Add your residential and work contact information.',
  },
  education: {
    title: 'Education and career',
    description: 'Add your education, occupation and income details.',
  },
  family: {
    title: 'Family details',
    description: 'Add your family background, assets and investments.',
  },
  horoscope: {
    title: 'Horoscope',
    description: 'Add your birth details and horoscope information.',
  },
  partner: {
    title: 'Partner preference',
    description: 'Describe the kind of partner you are looking for.',
  },
  review: {
    title: 'Review',
    description: 'Review your details before finishing registration.',
  },
}

export function isRegistrationStep(
  value: string | undefined,
): value is RegistrationStepId {
  return value !== undefined && REGISTRATION_STEP_ORDER.some((step) => step === value)
}

export function registrationStepMeta(step: RegistrationStepId): RegistrationStepMeta {
  return { id: step, ...STEP_META[step] }
}

export function registrationStepsFor(
  profileLocationType: ProfileLocationType | '',
): RegistrationStepId[] {
  return REGISTRATION_STEP_ORDER.filter(
    (step) => step !== 'nri' || profileLocationType === 'NRI',
  )
}

export function registrationStepPath(step: RegistrationStepId): string {
  return `/register/${step}`
}

export function nextRegistrationStep(
  step: RegistrationStepId,
  profileLocationType: ProfileLocationType | '',
): RegistrationStepId | null {
  const steps = registrationStepsFor(profileLocationType)
  const index = steps.indexOf(step)
  return index >= 0 ? (steps[index + 1] ?? null) : null
}

export function previousRegistrationStep(
  step: RegistrationStepId,
  profileLocationType: ProfileLocationType | '',
): RegistrationStepId | null {
  const steps = registrationStepsFor(profileLocationType)
  const index = steps.indexOf(step)
  return index > 0 ? (steps[index - 1] ?? null) : null
}

export function registrationStepProgress(
  step: RegistrationStepId,
  profileLocationType: ProfileLocationType | '',
): number {
  const steps = registrationStepsFor(profileLocationType)
  const index = steps.indexOf(step)
  if (index < 0) return 0
  return ((index + 1) / steps.length) * 100
}
