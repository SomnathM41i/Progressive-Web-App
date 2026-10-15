/**
 * Small, typed wrapper around sessionStorage.
 *
 * Storage can throw (private mode, quota, disabled cookies), so every access is
 * guarded instead of assuming it works.
 */
export const sessionStore = {
  read(key: string): string | null {
    try {
      return window.sessionStorage.getItem(key)
    } catch {
      return null
    }
  },

  write(key: string, value: string): void {
    try {
      window.sessionStorage.setItem(key, value)
    } catch {
      // Non-fatal: the app simply behaves as if nothing was persisted.
    }
  },

  remove(key: string): void {
    try {
      window.sessionStorage.removeItem(key)
    } catch {
      // Non-fatal.
    }
  },
}
