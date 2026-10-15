import { useEffect, useRef } from 'react'

import { useToast } from '@/hooks/useToast'
import { usePwaUpdate } from '@/hooks/usePwaUpdate'

const UPDATE_TOAST_ID = 'pwa-update'
const OFFLINE_TOAST_ID = 'pwa-offline-ready'

/**
 * Surfaces service-worker updates as a persistent toast with a reload action.
 *
 * Reloading is always the member's choice — swapping the app out from under
 * someone mid-task is worse than running one version behind for a minute.
 */
export function PwaUpdatePrompt() {
  const { needRefresh, offlineReady, applyUpdate } = usePwaUpdate()
  const toast = useToast()
  const announcedUpdate = useRef(false)
  const announcedOffline = useRef(false)

  useEffect(() => {
    if (!offlineReady || announcedOffline.current) return
    announcedOffline.current = true
    toast.success('App is ready to use offline', { id: OFFLINE_TOAST_ID })
  }, [offlineReady, toast])

  useEffect(() => {
    if (!needRefresh || announcedUpdate.current) return
    announcedUpdate.current = true

    toast.info('A new version is available', {
      id: UPDATE_TOAST_ID,
      duration: 0,
      description: 'Reload to update.',
      action: {
        label: 'Reload',
        onClick: () => {
          toast.dismiss(UPDATE_TOAST_ID)
          void applyUpdate()
        },
      },
    })
  }, [needRefresh, toast, applyUpdate])

  return null
}
