import axios, { type AxiosInstance } from 'axios'

import { env } from '@/config/env'
import { toApiError } from '@/services/api-error'

/**
 * Centralised HTTP client.
 *
 * Every feature service goes through this instance, so base URL, timeout,
 * credentials and error normalisation are configured exactly once.
 *
 * Authentication is deliberately not baked in. The auth feature registers a
 * token provider and an unauthorised handler once the API collection is
 * integrated, which keeps this module free of auth imports.
 */

type TokenProvider = () => string | null
type UnauthorizedHandler = () => void

let tokenProvider: TokenProvider | null = null
let unauthorizedHandler: UnauthorizedHandler | null = null

export function setAuthTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider
}

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler
}

export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

api.interceptors.request.use((config) => {
  const token = tokenProvider?.()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = toApiError(error)

    if (apiError.status === 401) {
      unauthorizedHandler?.()
    }

    return Promise.reject(apiError)
  },
)
