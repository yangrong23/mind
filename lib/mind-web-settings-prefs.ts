/** Web settings persisted in localStorage (demo-friendly). */

export const MIND_WEB_SETTINGS_KEY = "mind-v2-web-settings"

export type AiModelId = "light" | "balanced" | "frontier"

export type WebSettingsPrefs = {
  language: string
  notifCaptureReady: boolean
  notifDigest: boolean
  frontierInsights: boolean
  autoSaveNotes: boolean
  privacyCrashReports: boolean
  browserExtensionLinked: boolean
  cloudSyncEnabled: boolean
  cloudSyncWifiOnly: boolean
  aiModel: AiModelId
  cacheMb: number
  lastSyncedAt: string | null
}

const DEFAULTS: WebSettingsPrefs = {
  language: "en",
  notifCaptureReady: true,
  notifDigest: false,
  frontierInsights: true,
  autoSaveNotes: true,
  privacyCrashReports: true,
  browserExtensionLinked: false,
  cloudSyncEnabled: false,
  cloudSyncWifiOnly: true,
  aiModel: "light",
  cacheMb: 7.7,
  lastSyncedAt: null,
}

export function readWebSettingsPrefs(): WebSettingsPrefs {
  if (typeof window === "undefined") return { ...DEFAULTS }
  try {
    const raw = localStorage.getItem(MIND_WEB_SETTINGS_KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function writeWebSettingsPrefs(patch: Partial<WebSettingsPrefs>) {
  const next = { ...readWebSettingsPrefs(), ...patch }
  try {
    localStorage.setItem(MIND_WEB_SETTINGS_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}

export function clearAppCacheExceptEssentials() {
  const keep = new Set([
    MIND_WEB_SETTINGS_KEY,
    "mind-v2-font-zoom-percent",
    "mind-v2-demo-auth",
  ])
  const remove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && !keep.has(k)) remove.push(k)
  }
  remove.forEach((k) => localStorage.removeItem(k))
  writeWebSettingsPrefs({ cacheMb: 0.1 })
}

export const AI_MODEL_LABELS: Record<AiModelId, string> = {
  light: "Light",
  balanced: "Balanced",
  frontier: "Frontier",
}
