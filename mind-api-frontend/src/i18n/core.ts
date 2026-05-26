import enUS from './locales/en-US'

type MessageTree = Record<string, unknown>

function resolvePath(messages: MessageTree, key: string): string | undefined {
  const parts = key.split('.')
  let cur: unknown = messages
  for (const part of parts) {
    if (cur == null || typeof cur !== 'object') return undefined
    cur = (cur as MessageTree)[part]
  }
  return typeof cur === 'string' ? cur : undefined
}

export function getLocale(): string {
  try {
    return localStorage.getItem('locale') || 'en-US'
  } catch {
    return 'en-US'
  }
}

/** Framework-agnostic i18n for API layer (request.ts) and React shell */
export function t(key: string, params?: Record<string, string | number>): string {
  const raw = resolvePath(enUS as MessageTree, key) ?? key
  if (!params) return raw
  return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))
}
