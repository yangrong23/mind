import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import TDesign from 'tdesign-vue-next'
import 'tdesign-vue-next/es/style/index.css'
import '@/assets/fonts.css'
import '@/assets/theme/theme.css'
import '@/assets/dropdown-menu.less'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import i18n from '@/i18n'
import { initTheme } from '@/composables/useTheme'
import { initFont } from '@/composables/useFont'
import { installTDesignIconOfflineGuard } from '@/utils/tdesign-icon-offline'
import PlatformApp from '@/PlatformApp.vue'
import { createPlatformVueRouter } from '@/router/platform-vue-router'

installTDesignIconOfflineGuard()
initTheme()
initFont()

let platformVueApp: VueApp | null = null
let platformRouter = createPlatformVueRouter()

export function getPlatformVueRouter() {
  return platformRouter
}

export async function mountPlatformVue(host: HTMLElement, path: string) {
  if (platformVueApp) {
    await platformRouter.replace(path)
    return platformVueApp
  }

  const pinia = createPinia()
  platformVueApp = createApp(PlatformApp)
  platformVueApp.use(TDesign)
  platformVueApp.use(pinia)
  platformVueApp.use(platformRouter)
  platformVueApp.use(i18n)

  await platformRouter.isReady()
  if (platformRouter.currentRoute.value.fullPath !== path) {
    await platformRouter.replace(path)
  }

  platformVueApp.mount(host)
  return platformVueApp
}

export function unmountPlatformVue() {
  if (platformVueApp) {
    platformVueApp.unmount()
    platformVueApp = null
    platformRouter = createPlatformVueRouter()
  }
}

export async function syncPlatformVuePath(path: string) {
  if (!platformVueApp) return
  const current = platformRouter.currentRoute.value.fullPath
  if (current !== path) {
    await platformRouter.replace(path)
  }
}
