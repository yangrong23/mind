/** Mirrors `navItems` in views/settings/Settings.vue — keep keys in sync for deep links. */
export type PlatformSettingsSection =
  | 'general'
  | 'ollama'
  | 'weknoracloud'
  | 'models'
  | 'websearch'
  | 'chathistory'
  | 'vectorstore'
  | 'parser'
  | 'storage'
  | 'mcp'
  | 'system'
  | 'tenant'
  | 'api'

export type PlatformSettingsNavItem = {
  key: PlatformSettingsSection
  /** i18n path resolved via `@/i18n/core` `t()` */
  labelKey: string
  /** Fallback when key missing from locale bundle */
  fallbackLabel: string
  icon: 'setting' | 'server' | 'cloud-w' | 'models' | 'globe' | 'chat' | 'database' | 'file' | 'cloud' | 'tools' | 'info' | 'user' | 'lock'
}

export const PLATFORM_SETTINGS_NAV: PlatformSettingsNavItem[] = [
  { key: 'general', labelKey: 'general.title', fallbackLabel: 'General', icon: 'setting' },
  { key: 'ollama', labelKey: 'settings.ollama', fallbackLabel: 'Ollama', icon: 'server' },
  { key: 'weknoracloud', labelKey: 'settings.weknoraCloud', fallbackLabel: 'WeKnora Cloud', icon: 'cloud-w' },
  { key: 'models', labelKey: 'settings.modelManagement', fallbackLabel: 'Model management', icon: 'models' },
  { key: 'websearch', labelKey: 'settings.webSearchConfig', fallbackLabel: 'Web search', icon: 'globe' },
  { key: 'chathistory', labelKey: 'chatHistorySettings.title', fallbackLabel: 'Chat history', icon: 'chat' },
  { key: 'vectorstore', labelKey: 'settings.vectorStoreEngine', fallbackLabel: 'Vector store', icon: 'database' },
  { key: 'parser', labelKey: 'settings.parserEngine', fallbackLabel: 'Parser engine', icon: 'file' },
  { key: 'storage', labelKey: 'settings.storageEngine', fallbackLabel: 'Storage engine', icon: 'cloud' },
  { key: 'mcp', labelKey: 'settings.mcpService', fallbackLabel: 'MCP services', icon: 'tools' },
  { key: 'system', labelKey: 'settings.systemSettings', fallbackLabel: 'System info', icon: 'info' },
  { key: 'tenant', labelKey: 'settings.tenantInfo', fallbackLabel: 'Tenant info', icon: 'user' },
  { key: 'api', labelKey: 'settings.apiInfo', fallbackLabel: 'API info', icon: 'lock' },
]

const SECTION_SET = new Set<string>(PLATFORM_SETTINGS_NAV.map((n) => n.key))

export function normalizePlatformSettingsSection(
  value: string | null | undefined
): PlatformSettingsSection {
  if (value && SECTION_SET.has(value)) return value as PlatformSettingsSection
  return 'general'
}

export function platformSettingsPath(section?: PlatformSettingsSection): string {
  const s = section ?? 'general'
  return `/platform/settings?section=${encodeURIComponent(s)}`
}

/** Works from React shell or legacy Vue menu (full navigation). */
export function openPlatformSettings(section?: PlatformSettingsSection): void {
  window.location.assign(platformSettingsPath(section))
}
