import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { mountPlatformVue, syncPlatformVuePath, unmountPlatformVue } from '@/vue-platform/bootstrap'

/** Mounts legacy Vue platform UI (KB, chat, agents, settings) inside React router */
export function VuePlatformHost() {
  const hostRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    const fullPath = location.pathname + location.search + location.hash
    void mountPlatformVue(host, fullPath)

    return () => {
      unmountPlatformVue()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- remount only when host unmounts
  }, [])

  useEffect(() => {
    const fullPath = location.pathname + location.search + location.hash
    void syncPlatformVuePath(fullPath)
  }, [location.pathname, location.search, location.hash])

  return (
    <div
      ref={hostRef}
      className="vue-platform-host"
      style={{ width: '100%', minHeight: '100vh' }}
    />
  )
}
