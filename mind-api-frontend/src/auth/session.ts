import { autoSetup, getCurrentUser } from '@/api/auth'
import type { LoginResponse, UserInfo, TenantInfo } from '@/api/auth'

export const STORAGE_KEYS = {
  user: 'weknora_user',
  tenant: 'weknora_tenant',
  token: 'weknora_token',
  refreshToken: 'weknora_refresh_token',
  knowledgeBases: 'weknora_knowledge_bases',
  currentKb: 'weknora_current_kb',
  selectedTenantId: 'weknora_selected_tenant_id',
  selectedTenantName: 'weknora_selected_tenant_name',
  liteMode: 'weknora_lite_mode',
  autoSetupFailed: 'weknora_auto_setup_failed',
  liteLastPath: 'weknora_lite_last_path',
} as const

export type AuthStoreLike = {
  token: string
  refreshToken: string
  user: UserInfo | null
  isLiteMode: boolean
  isLoggedIn: boolean
  setUser: (user: UserInfo) => void
  setTenant: (tenant: TenantInfo) => void
  setToken: (token: string) => void
  setRefreshToken: (token: string) => void
  setLiteMode: (value: boolean) => void
}

export function readStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.user)
    return raw ? (JSON.parse(raw) as UserInfo) : null
  } catch {
    return null
  }
}

export function isLoggedInFromStorage(): boolean {
  return Boolean(localStorage.getItem(STORAGE_KEYS.token) && readStoredUser())
}

export function shouldTryAutoSetup(): boolean {
  return localStorage.getItem(STORAGE_KEYS.autoSetupFailed) !== 'true'
}

export function markAutoSetupFailed(): void {
  localStorage.setItem(STORAGE_KEYS.autoSetupFailed, 'true')
}

export function persistLoginResponseToStorage(response: LoginResponse): boolean {
  if (!response.user || !response.tenant || !response.token) return false

  const user: UserInfo = {
    id: response.user.id || '',
    username: response.user.username || '',
    email: response.user.email || '',
    avatar: response.user.avatar,
    tenant_id: String(response.user.tenant_id ?? response.tenant.id ?? ''),
    can_access_all_tenants: response.user.can_access_all_tenants || false,
    role: '',
    created_at: response.user.created_at || new Date().toISOString(),
    updated_at: response.user.updated_at || new Date().toISOString(),
  }
  const tenant: TenantInfo = {
    id: String(response.tenant.id) || '',
    name: response.tenant.name || '',
    api_key: response.tenant.api_key || '',
    owner_id: response.user.id || '',
    created_at: response.tenant.created_at || new Date().toISOString(),
    updated_at: response.tenant.updated_at || new Date().toISOString(),
  }

  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
  localStorage.setItem(STORAGE_KEYS.tenant, JSON.stringify(tenant))
  localStorage.setItem(STORAGE_KEYS.token, response.token)
  if (response.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, response.refresh_token)
  }
  return true
}

export function persistLoginResponse(authStore: AuthStoreLike, response: LoginResponse): boolean {
  if (!persistLoginResponseToStorage(response)) return false

  const storedUser = readStoredUser()
  let storedTenant: TenantInfo | null = null
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.tenant)
    storedTenant = raw ? (JSON.parse(raw) as TenantInfo) : null
  } catch {
    storedTenant = null
  }

  if (storedUser) authStore.setUser(storedUser)
  if (storedTenant) authStore.setTenant(storedTenant)
  if (response.token) authStore.setToken(response.token)
  if (response.refresh_token) authStore.setRefreshToken(response.refresh_token)
  return true
}

export async function hydrateSessionFromToken(authStore: AuthStoreLike): Promise<boolean> {
  const token = localStorage.getItem(STORAGE_KEYS.token)
  if (!token) return false

  if (!authStore.token) {
    authStore.setToken(token)
  }

  const storedRefreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken)
  if (storedRefreshToken && !authStore.refreshToken) {
    authStore.setRefreshToken(storedRefreshToken)
  }

  try {
    const response = await getCurrentUser()
    const user = response.data?.user
    if (!response.success || !user) {
      return false
    }

    authStore.setUser({
      id: user.id || '',
      username: user.username || '',
      email: user.email || '',
      avatar: user.avatar,
      tenant_id: String(user.tenant_id || response.data?.tenant?.id || ''),
      can_access_all_tenants: user.can_access_all_tenants || false,
      role: user.role || '',
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString(),
    })

    const tenant = response.data?.tenant
    if (tenant) {
      authStore.setTenant({
        id: String(tenant.id) || '',
        name: tenant.name || '',
        api_key: tenant.api_key || '',
        owner_id: tenant.owner_id || user.id || '',
        description: tenant.description,
        status: tenant.status,
        business: tenant.business,
        storage_quota: tenant.storage_quota,
        storage_used: tenant.storage_used,
        created_at: tenant.created_at || new Date().toISOString(),
        updated_at: tenant.updated_at || new Date().toISOString(),
      })
    }

    return true
  } catch {
    return false
  }
}

export async function tryAutoSetup(authStore: AuthStoreLike): Promise<boolean> {
  if (!shouldTryAutoSetup()) return false
  try {
    const response = await autoSetup()
    if (response.success) {
      persistLoginResponse(authStore, response)
      authStore.setLiteMode(true)
      return true
    }
    markAutoSetupFailed()
    return false
  } catch {
    markAutoSetupFailed()
    return false
  }
}

export function hasPendingOIDCCallback(): boolean {
  if (typeof window === 'undefined') return false
  const hash = window.location.hash || ''
  return hash.includes('oidc_result=') || hash.includes('oidc_error=')
}

export function isLiteEdition(authStore: AuthStoreLike): boolean {
  return authStore.isLiteMode || localStorage.getItem(STORAGE_KEYS.liteMode) === 'true'
}

export function isLiteSpaDefaultEntry(pathname: string, routeName?: string | symbol | null): boolean {
  return (
    pathname === '/' ||
    pathname === '/web' ||
    pathname === '/platform' ||
    pathname === '/platform/knowledge-bases' ||
    routeName === 'knowledgeBaseList'
  )
}

export function isSafeLiteRestoreTarget(path: string): boolean {
  return path.startsWith('/platform/') && !path.startsWith('/platform/organizations')
}

/** In-memory adapter for router guards (syncs to localStorage via persist helpers) */
export function createStorageAuthAdapter(): AuthStoreLike {
  let lite = localStorage.getItem(STORAGE_KEYS.liteMode) === 'true'
  return {
    get token() {
      return localStorage.getItem(STORAGE_KEYS.token) || ''
    },
    get refreshToken() {
      return localStorage.getItem(STORAGE_KEYS.refreshToken) || ''
    },
    get user() {
      return readStoredUser()
    },
    get isLiteMode() {
      return lite
    },
    get isLoggedIn() {
      return isLoggedInFromStorage()
    },
    setUser(user: UserInfo) {
      localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user))
    },
    setTenant(tenant: TenantInfo) {
      localStorage.setItem(STORAGE_KEYS.tenant, JSON.stringify(tenant))
    },
    setToken(token: string) {
      localStorage.setItem(STORAGE_KEYS.token, token)
    },
    setRefreshToken(token: string) {
      localStorage.setItem(STORAGE_KEYS.refreshToken, token)
    },
    setLiteMode(value: boolean) {
      lite = value
      if (value) localStorage.setItem(STORAGE_KEYS.liteMode, 'true')
      else localStorage.removeItem(STORAGE_KEYS.liteMode)
    },
  }
}
