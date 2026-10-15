import axios, { type AxiosInstance } from 'axios'

import { env } from '@/config/env'
import { toApiError } from '@/services/api-error'

/**
 * Centralised HTTP client.
 *
 * Every feature service goes through this instance, so base URL, timeout and
 * error normalisation are configured exactly once.
 *
 * The APIs live on a separate origin (shivrajmaratha.com) and answer with
 * `Access-Control-Allow-Origin: *`, which is incompatible with credentialed
 * requests — so cookies are not used and `withCredentials` stays off. Only
 * CORS-safelisted headers are sent (`Accept`, form-encoded `Content-Type`) so a
 * browser can POST without triggering a preflight the API does not answer.
 *
 * Authentication is deliberately not baked in. The auth feature registers a
 * token provider and an unauthorised handler, which keeps this module free of
 * auth imports.
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
  withCredentials: false,
  headers: {
    Accept: 'application/json',
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
