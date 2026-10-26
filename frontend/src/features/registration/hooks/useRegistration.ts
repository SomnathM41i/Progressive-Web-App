import { useContext } from 'react'

import {
  RegistrationContext,
  type RegistrationContextValue,
} from '@/features/registration/context/registration-context'

export function useRegistration(): RegistrationContextValue {
  const context = useContext(RegistrationContext)

  if (!context) {
    throw new Error('useRegistration must be used inside <RegistrationProvider>.')
  }

  return context
}
