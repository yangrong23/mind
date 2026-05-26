import { createApp, type App } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import '@/assets/fonts.css'
import '@/assets/theme/theme.css'
import '@/assets/dropdown-menu.less'
import i18n from '@/i18n'
import { initTheme } from '@/composables/useTheme'
import { initFont } from '@/composables/useFont'
import { installTDesignIconOfflineGuard } from '@/utils/tdesign-icon-offline'
import SettingsPanelHost from '@/views/settings/SettingsPanelHost.vue'
import type { PlatformSettingsSection } from '@/lib/platform-settings-sections'

let pluginsReady = false
let sharedPinia = createPinia()
let panelApp: App | null = null

function ensureGlobalPlugins() {
  if (pluginsReady) return
  installTDesignIconOfflineGuard()
  initTheme()
  initFont()
  setActivePinia(sharedPinia)
  pluginsReady = true
}

function createPanelApp(section: PlatformSettingsSection): App {
  ensureGlobalPlugins()
  const app = createApp(SettingsPanelHost, { section })
  app.use(sharedPinia)
  app.use(i18n)
  app.use(TDesign)
  return app
}

export function mountSettingsPanel(host: HTMLElement, section: PlatformSettingsSection) {
  unmountSettingsPanel()
  panelApp = createPanelApp(section)
  panelApp.mount(host)
}

export function unmountSettingsPanel() {
  if (panelApp) {
    panelApp.unmount()
    panelApp = null
  }
}
