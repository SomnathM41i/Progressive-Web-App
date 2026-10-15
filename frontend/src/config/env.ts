/**
 * Single place where build-time configuration is read.
 *
 * Nothing else in the app should touch `import.meta.env` directly, so that the
 * environment surface stays small and easy to audit.
 */

function readBoolean(value: string | undefined): boolean {
  return value === 'true' || value === '1'
}

function readNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const env = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,

  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  apiTimeout: readNumber(import.meta.env.VITE_API_TIMEOUT, 15_000),

  /**
   * Development-only preview of the authenticated experience.
   *
   * The API collection has not been integrated yet, so there is no real session
   * to restore. When this flag is on we render the dashboard with clearly
   * labelled placeholder data instead of pretending authentication works.
   *
   * It can never be enabled in a production build.
   */
  devPreview:
    import.meta.env.DEV && readBoolean(import.meta.env.VITE_ENABLE_DEV_PREVIEW),
} as const
