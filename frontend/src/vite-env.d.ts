/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** Base URL of the Laravel API. Empty in development so requests stay relative. */
  readonly VITE_API_BASE_URL?: string
  /** Request timeout in milliseconds. */
  readonly VITE_API_TIMEOUT?: string
  /**
   * Enables the development-only preview of authenticated screens.
   * Ignored unless the app is running in development mode.
   */
  readonly VITE_ENABLE_DEV_PREVIEW?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
