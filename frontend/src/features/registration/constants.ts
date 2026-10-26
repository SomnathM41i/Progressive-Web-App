export const PROFILE_LOCATION_TYPES = ['Indian Resident', 'NRI'] as const
export type ProfileLocationType = (typeof PROFILE_LOCATION_TYPES)[number]

export const NO_OF_CHILDREN_OPTIONS = ['None', '1', '2', '3', '4 and above'] as const
export type NoOfChildren = (typeof NO_OF_CHILDREN_OPTIONS)[number]

export const CHILDREN_STATUS_OPTIONS = [
  'Living with me',
  'Not living with me',
  'Some living with me',
] as const
export type ChildrenStatus = (typeof CHILDREN_STATUS_OPTIONS)[number]

export const CHILD_ACCEPTANCE_OPTIONS = [
  'Do Not Accept Children',
  'Boy Child',
  'Girl Child',
  'Both Boy and Girl Child',
] as const
export type ChildAcceptance = (typeof CHILD_ACCEPTANCE_OPTIONS)[number]

export const NADI_OPTIONS = ['Adhya', 'Madhya', 'Antya'] as const
export type Nadi = (typeof NADI_OPTIONS)[number]

export const GAN_OPTIONS = ['Dev Gan', 'Manushya Gan', 'Rakshas Gan'] as const
export type Gan = (typeof GAN_OPTIONS)[number]

export const BIRTH_AMPM_OPTIONS = ['AM', 'PM'] as const
export type BirthAmPm = (typeof BIRTH_AMPM_OPTIONS)[number]

export const BIRTH_HOURS: readonly string[] = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, '0'),
)

export const BIRTH_MINUTES: readonly string[] = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, '0'),
)

export const BIRTH_SECONDS: readonly string[] = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, '0'),
)

export const HEIGHT_CODES: readonly string[] = Array.from({ length: 37 }, (_, index) =>
  String(index + 1),
)

export const WEIGHT_MIN = 40
export const WEIGHT_MAX = 150

export const LIVING_STATUS_OPTIONS: readonly string[] = []

export const FIXED_REGNO = '0'
export const FIXED_RELATION_ID = '0'
export const DEFAULT_PROFILE_CREATED_BY = 'Self'
export const DEFAULT_TERMS_ACCEPTED = '1'
export const DEFAULT_NRI_TYPE = 'NRI'

export const REGISTRATION_SECTION_IDS = [
  'account',
  'nri',
  'basic',
  'contact',
  'education',
  'family',
  'horoscope',
  'partner',
] as const
export type RegistrationSectionId = (typeof REGISTRATION_SECTION_IDS)[number]

export const REGISTRATION_STEP_ORDER = [
  'account',
  'nri',
  'basic',
  'contact',
  'education',
  'family',
  'horoscope',
  'partner',
  'review',
] as const
export type RegistrationStepId = (typeof REGISTRATION_STEP_ORDER)[number]
