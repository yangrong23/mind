import { getCurrentUser } from '@/api/auth'
import { STORAGE_KEYS } from './session'
import type { UserInfo, TenantInfo } from '@/api/auth'

export function clearOIDCCallbackState(path = '/') {
  window.history.replaceState({}, document.title, path)
}

export function decodeOIDCResult(encoded: string) {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
  const binary = window.atob(padded)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes)) as {
    success?: boolean
    token?: string
    refresh_token?: string
    message?: string
  }
}

export async function syncOIDCUserContext(): Promise<void> {
  const currentUserResponse = await getCurrentUser()
  if (!currentUserResponse.success || !currentUserResponse.data?.user) {
    throw new Error(currentUserResponse.message || 'Failed to get user information')
  }

  const { user, tenant } = currentUserResponse.data
  const userInfo: UserInfo = {
    id: user.id || '',
    username: user.username || '',
    email: user.email || '',
    avatar: user.avatar,
    tenant_id: String(user.tenant_id || tenant?.id || ''),
    can_access_all_tenants: user.can_access_all_tenants || false,
    role: user.role || '',
    created_at: user.created_at || new Date().toISOString(),
    updated_at: user.updated_at || new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userInfo))

  if (tenant) {
    const tenantInfo: TenantInfo = {
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
    }
    localStorage.setItem(STORAGE_KEYS.tenant, JSON.stringify(tenantInfo))
  }
}

export async function persistOIDCLoginResponse(response: {
  token?: string
  refresh_token?: string
  message?: string
}): Promise<void> {
  if (!response.token) {
    throw new Error(response.message || 'OIDC login failed')
  }
  localStorage.setItem(STORAGE_KEYS.token, response.token)
  if (response.refresh_token) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, response.refresh_token)
  }
  await syncOIDCUserContext()
}

export function clearAuthFromStorage() {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.refreshToken)
  localStorage.removeItem(STORAGE_KEYS.user)
  localStorage.removeItem(STORAGE_KEYS.tenant)
}

export async function handleGlobalOIDCCallback(
  navigate: (path: string, opts?: { replace?: boolean }) => void
): Promise<void> {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
  if (!hash) return

  const params = new URLSearchParams(hash)
  const oidcError = params.get('oidc_error')
  const oidcErrorDescription = params.get('oidc_error_description')
  const oidcResult = params.get('oidc_result')

  if (!oidcError && !oidcResult) return

  if (oidcError) {
    clearOIDCCallbackState('/login')
    navigate('/login', { replace: true })
    throw new Error(oidcErrorDescription || 'OIDC login failed')
  }

  try {
    if (!oidcResult) {
      clearOIDCCallbackState('/login')
      navigate('/login', { replace: true })
      throw new Error('OIDC login failed')
    }

    const response = decodeOIDCResult(oidcResult)
    if (response.success) {
      clearOIDCCallbackState('/')
      await persistOIDCLoginResponse(response)
      navigate('/web', { replace: true })
      return
    }

    clearOIDCCallbackState('/login')
    navigate('/login', { replace: true })
    throw new Error(response.message || 'OIDC login failed')
  } catch (error) {
    clearAuthFromStorage()
    clearOIDCCallbackState('/login')
    navigate('/login', { replace: true })
    throw error
  }
}
