import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import type { Plugin } from 'vite'

const WEB_ROOT = resolve(__dirname, '../../..') // parent monorepo (Mindar UI source)
const FRONTEND_SRC = resolve(__dirname, '..')

const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.vue']

function resolveWithExtensions(basePath: string): string | null {
  for (const ext of EXTENSIONS) {
    const candidate = basePath + ext
    if (existsSync(candidate)) return candidate
  }
  for (const ext of EXTENSIONS) {
    const candidate = resolve(basePath, 'index' + ext)
    if (existsSync(candidate)) return candidate
  }
  if (existsSync(basePath) && !basePath.endsWith('/')) return basePath
  return null
}

export function resolveAtAlias(source: string): string | null {
  if (source === 'next/link') {
    return resolve(FRONTEND_SRC, 'shims/next-link.tsx')
  }
  if (source === 'next/image') {
    return resolve(FRONTEND_SRC, 'shims/next-image.tsx')
  }
  if (!source.startsWith('@/')) return null

  if (source === '@/lib/mind-landing-copy') {
    return resolve(FRONTEND_SRC, 'lib/mind-landing-copy.ts')
  }
  if (source === '@/lib/landing-photo-assets') {
    return resolve(FRONTEND_SRC, 'lib/landing-photo-assets.ts')
  }
  if (source === '@/lib/mindar-logo') {
    return resolve(FRONTEND_SRC, 'lib/mindar-logo.ts')
  }

  const sub = source.slice(2)
  const webResolved = resolveWithExtensions(resolve(WEB_ROOT, sub))
  const srcResolved = resolveWithExtensions(resolve(FRONTEND_SRC, sub))

  if (webResolved && srcResolved) {
    if (
      sub.startsWith('api/') ||
      sub.startsWith('stores/') ||
      sub.startsWith('views/') ||
      sub.startsWith('utils/') ||
      sub.startsWith('router/') ||
      sub.startsWith('hooks/') ||
      sub.startsWith('composables/') ||
      sub.startsWith('assets/') ||
      sub.startsWith('i18n/') ||
      sub.startsWith('types/') ||
      sub.startsWith('auth/') ||
      sub.startsWith('react/') ||
      sub.startsWith('vue-platform/') ||
      sub.startsWith('web-api/') ||
      sub.startsWith('web-connected/') ||
      sub.startsWith('landing-react/') ||
      sub.startsWith('components/mind-v2/mindar-logo') ||
      sub.startsWith('app/') ||
      (sub.startsWith('components/') &&
        !sub.startsWith('components/mind-landing/') &&
        !sub.startsWith('components/mind-v2/mind-use-case-guide-panel') &&
        !sub.startsWith('components/mind-v2/mind-use-case') &&
        !sub.startsWith('components/ui/'))
    ) {
      return srcResolved
    }
    return webResolved
  }

  return webResolved ?? srcResolved
}

export function webMonorepoAlias(): Plugin {
  return {
    name: 'web-monorepo-alias',
    enforce: 'pre',
    resolveId(source) {
      const resolved = resolveAtAlias(source)
      return resolved ?? null
    },
  }
}
