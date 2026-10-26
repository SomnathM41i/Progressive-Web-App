export const registrationWriteEndpoints = {
  account: '/register.php',
  nri: '/update-nri-details.php',
  basic: '/update-basic-details.php',
  contact: '/update-contact-details.php',
  education: '/update-education_occupation-details.php',
  family: '/update-family-details.php',
  horoscope: '/update-horoscope-details.php',
  partner: '/update-partner-preference-details.php',
} as const

export const registrationReadEndpoints = {
  basic: '/get-basic-details.php',
  contact: '/get-contact-details.php',
  education: '/get-education_occupation-details.php',
  family: '/get-family-details.php',
  horoscope: '/get-horoscope-details.php',
  partner: '/get-partner-preference-details.php',
} as const

export type RegistrationWriteSection = keyof typeof registrationWriteEndpoints
export type RegistrationReadSection = keyof typeof registrationReadEndpoints
