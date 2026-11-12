import { useEffect } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'

/** Registers the service worker and offers a refresh when a new version is deployed. */
const PwaUpdater = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    if (!needRefresh) return
    toast('A new version of FocusFlow is available.', {
      id: 'pwa-update',
      duration: Infinity,
      action: { label: 'Refresh', onClick: () => updateServiceWorker(true) },
    })
  }, [needRefresh, updateServiceWorker])

  return null
}

export default PwaUpdater
