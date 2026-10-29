import type {
  BirthAmPm,
  ChildAcceptance,
  ChildrenStatus,
  Gan,
  Nadi,
  NoOfChildren,
  ProfileLocationType,
  RegistrationSectionId,
} from '@/features/registration/constants'

export type Gender = 'Male' | 'Female'

export interface RegistrationAccount {
  fname: string
  lname: string
  middle_name?: string
  email: string
  pass: string
  gender: Gender
  dob: string
  dobMonth: string
  dobYear: string
  Profilecreatedby: string
  maritalstatus: string
  noofchildren: NoOfChildren | ''
  childrenstatus: ChildrenStatus | ''
  religion: string
  caste: string
  subcaste: string
  countrycode: string
  mobile: string
  aboutus: string
  profile_location_type: ProfileLocationType
  child_acceptance?: ChildAcceptance | ''
  terms_accepted: '1'
  regno: string
  signdate?: string
  Relation_id: string
  franchise_id?: string
}

export interface NriDetails {
  MatriID: string
  nri_type: string
  nri_citizenship: string
  nri_current_country: string
  nri_current_state: string
  nri_current_city: string
  nri_residency_status: string
  nri_visa_type: string
  nri_visa_expiry: string
  nri_years_abroad: string
  nri_overseas_mobile: string
  nri_income_currency: string
  nri_willing_to_relocate: string
  nri_settlement_preference: string
  nri_native_place: string
  nri_preferred_country: string
}

export type NriUpdatePayload = Pick<NriDetails, 'MatriID'> &
  Partial<Omit<NriDetails, 'MatriID'>>

export interface BasicDetails {
  MatriID: string
  Name: string
  DOB: string
  Height: string
  Weight: string
  BloodGroup: string
  Complexion: string
  SpecialCases: string
  SpecialReason?: string
  ConfirmEmail: string
  Gender: Gender
  Profilecreatedby: string
  maritalstatus: string
  PE_HaveChildren: string
  childrenlivingstatus: ChildrenStatus | ''
  religion: string
  caste: string
  subcaste: string
  countrycode: string
  Mobile: string
  aboutus: string
  profile_location_type: ProfileLocationType
  ConfirmPassword?: string
  child_acceptance?: ChildAcceptance | ''
}

export interface ContactDetails {
  MatriID: string
  address: string
  country: string
  state: string
  city: string
  work_phone: string
  dist: string
  taluka: string
  residence: string
  mobile2: string
  mobile: string
  pincode: string
  calling: string
  work_residence: string
  work_address: string
  work_pincode: string
  working_city: string
  working_taluka: string
  working_dist: string
  working_state: string
  working_country: string
}

export interface EducationDetails {
  MatriID: string
  education: string
  edetails: string
  Annualincome: string
  Month_income: string
  occupation: string
  odetails: string
  employedin: string
  workloc: string
  workinghrs: string
  height: string
  weight: string
  bgroup: string
  complexion: string
  scases: string
  otherdist: string
  aboutus: string
  iit: string
  instu: string
}

export interface FamilyDetails {
  MatriID: string
  fvalues: string
  ftype: string
  fstatus: string
  relative: string
  mother_tounge: string
  brothers: string
  sisters: string
  bmarried: string
  smarried: string
  father: string
  fatherOccupation: string
  mother: string
  motheroccupation: string
  living_status: string
  aboufamily: string
  unclename: string
  unclecity: string
  family_wealth: string
  property_types: string[]
  property_details?: string
  investment_types: string[]
  investment_details?: string
  monthly_rental_income?: string
}

export interface HoroscopeDetails {
  MatriID: string
  gothra: string
  star: string
  moonsign: string
  charan: string
  gan: Gan | ''
  nadi: Nadi | ''
  hmatch: string
  shani: string
  manglik: string
  bcountry: string
  bplace: string
  devak: string
  kuldivat: string
  navrasnm: string
  bhour: string
  bminute: string
  bsecond: string
  bampm: BirthAmPm | ''
  fileToUpload?: File | null
}

export interface PartnerPreferenceDetails {
  MatriID: string
  looking: string
  fromage: string
  toage: string
  expectation: string
  heightfrom: string
  heightto: string
  caste1: string
  religion1: string
  complexion1: string
  rstatus1: string
  country1: string
  state1: string
  district1?: string
  taluka1?: string
  city1?: string
  education1: string
  occupation1: string
  income_from: string
  income_to: string
}

export interface RegistrationSections {
  account: RegistrationAccount
  nri: NriDetails
  basic: BasicDetails
  contact: ContactDetails
  education: EducationDetails
  family: FamilyDetails
  horoscope: HoroscopeDetails
  partner: PartnerPreferenceDetails
}

export interface RegistrationDraftSections {
  account?: Omit<RegistrationAccount, 'pass'>
  nri?: NriDetails
  basic?: BasicDetails
  contact?: ContactDetails
  education?: EducationDetails
  family?: FamilyDetails
  horoscope?: Omit<HoroscopeDetails, 'fileToUpload'>
  partner?: PartnerPreferenceDetails
}

export interface RegistrationDraft {
  matriId: string | null
  profileLocationType: ProfileLocationType | ''
  completedSections: RegistrationSectionId[]
  sections: RegistrationDraftSections
}

export type RegistrationApiRecord = Record<string, unknown>

export interface RegistrationEnvelope<T = unknown> {
  status?: unknown
  message?: string
  data?: T
  [key: string]: unknown
}

export interface RegistrationAccountOutcome {
  matriId: string
  message: string | null
}

export interface RegistrationMutationOutcome {
  matriId: string | null
  message: string | null
}

export interface RegistrationAccountResult {
  MatriID?: string
  matri_id?: string
  profileId?: string
  profile_id?: string
}

export interface RegistrationMutationResult {
  MatriID?: string
  message?: string
  [key: string]: unknown
}
