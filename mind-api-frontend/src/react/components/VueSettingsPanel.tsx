import { useEffect, useRef } from 'react'
import {
  mountSettingsPanel,
  unmountSettingsPanel,
} from '@/vue-platform/settings-panel-bridge'
import type { PlatformSettingsSection } from '@/lib/platform-settings-sections'

/** Mounts legacy Vue settings panels (API logic unchanged) inside React shell. */
export function VueSettingsPanel({ section }: { section: PlatformSettingsSection }) {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    mountSettingsPanel(host, section)
    return () => unmountSettingsPanel()
  }, [section])

  return <div ref={hostRef} className="platform-settings-vue-host" />
}
