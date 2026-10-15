import { useCallback, useEffect, useState } from 'react'

/**
 * `beforeinstallprompt` is Chromium-only and not part of lib.dom, so the bits
 * we use are declared here.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptState {
  /** True when the browser has offered an install prompt we can replay. */
  canInstall: boolean
  /** True once the app is running as an installed PWA. */
  isInstalled: boolean
  promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari exposes this instead of display-mode.
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Captures the install prompt so the UI can offer "Add to home screen". */
export function useInstallPrompt(): InstallPromptState {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(isStandalone)

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // Stop the browser's own mini-infobar so we can place the prompt ourselves.
      event.preventDefault()
      setDeferred(event as BeforeInstallPromptEvent)
    }

    const onInstalled = () => {
      setDeferred(null)
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferred) return 'unavailable' as const

    await deferred.prompt()
    const { outcome } = await deferred.userChoice

    // A prompt can only be used once.
    setDeferred(null)
    return outcome
  }, [deferred])

  return { canInstall: Boolean(deferred) && !isInstalled, isInstalled, promptInstall }
}
