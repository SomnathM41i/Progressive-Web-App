import axios from 'axios'

/**
 * Normalised error shape for anything that leaves the API layer.
 *
 * The backend response envelope has not been confirmed yet, so `details` is
 * intentionally loose: it carries whatever validation payload the API returns
 * once the collection is integrated, without the UI depending on its shape.
 */
export class ApiError extends Error {
  readonly status: number | null
  readonly code: string | null
  readonly details: unknown
  readonly isNetworkError: boolean

  constructor(options: {
    message: string
    status?: number | null
    code?: string | null
    details?: unknown
    isNetworkError?: boolean
  }) {
    super(options.message)
    this.name = 'ApiError'
    this.status = options.status ?? null
    this.code = options.code ?? null
    this.details = options.details ?? null
    this.isNetworkError = options.isNetworkError ?? false
  }
}

/** Raised when a feature is wired up but its API endpoint is not available yet. */
export class ApiNotIntegratedError extends ApiError {
  constructor(feature: string) {
    super({
      message: `${feature} is not connected to the API yet.`,
    })
    this.name = 'ApiNotIntegratedError'
  }
}

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.'

/** Converts any thrown value into an ApiError the UI can render safely. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return new ApiError({
        message: 'You appear to be offline. Check your connection and retry.',
        isNetworkError: true,
        code: error.code ?? null,
      })
    }

    const { status, data } = error.response
    const body = data as Record<string, unknown> | undefined

    return new ApiError({
      status,
      message:
        (typeof body?.message === 'string' && body.message) ||
        error.message ||
        FALLBACK_MESSAGE,
      code: typeof body?.code === 'string' ? body.code : null,
      details: body?.errors ?? body?.details ?? null,
    })
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message })
  }

  return new ApiError({ message: FALLBACK_MESSAGE })
}
