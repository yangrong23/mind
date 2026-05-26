import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { login, register, getOIDCAuthorizationURL, getOIDCConfig, autoSetup } from '@/api/auth'
import {
  isLoggedInFromStorage,
  persistLoginResponseToStorage,
  STORAGE_KEYS,
} from '@/auth/session'
import { t } from '@/i18n/core'
import { MindarLogo } from '@/components/mind-v2/mindar-logo'
import '@/assets/theme/mind-auth-web.css'

type AuthStep = 'join' | 'sign-in' | 'register'

type RegisterForm = {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const emptyRegisterForm = (): RegisterForm => ({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

/** Temporary: mock Google until release — set VITE_REAL_GOOGLE_AUTH=true in production. */
const USE_REAL_GOOGLE_AUTH = import.meta.env.VITE_REAL_GOOGLE_AUTH === 'true'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AuthIllustrationPanel() {
  return (
    <aside className="mind-auth-illustration" aria-hidden>
      <svg className="bg-art" viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M320 80c40 60 20 140-30 180M60 520c80-40 120-120 100-200M280 480c-60 20-100-80-70-150"
          stroke="#1a1a1a"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <ellipse cx="200" cy="320" rx="90" ry="28" stroke="#1a1a1a" strokeWidth="1.2" />
        <circle cx="200" cy="280" r="42" stroke="#1a1a1a" strokeWidth="1.2" />
        <path d="M340 120l12-8 8 14-20-6z" fill="#4ade80" stroke="#166534" strokeWidth="0.8" />
        <path
          d="M80 100c20-30 50-40 70-20s10 50-20 60M300 500c-30 40-80 50-110 20"
          stroke="#1a1a1a"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      <h2>
        {t('mindarAuth.illustrationTitle')}
        <br />
        {t('mindarAuth.illustrationTitle2')}
      </h2>
      <p className="tagline">{t('mindarAuth.illustrationTagline')}</p>
    </aside>
  )
}

export function MindAuthWeb() {
  const navigate = useNavigate()
  const [step, setStep] = useState<AuthStep>('join')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [oidcLoading, setOidcLoading] = useState(false)
  const [oidcEnabled, setOidcEnabled] = useState(false)
  const [oidcProviderName, setOidcProviderName] = useState('')
  const [registerData, setRegisterData] = useState<RegisterForm>(emptyRegisterForm)
  const googleLabel =
    oidcProviderName && oidcEnabled
      ? t('auth.oidcLoginWithProvider', { provider: oidcProviderName })
      : t('mindarAuth.continueGoogle')

  const finishLogin = useCallback(() => {
    navigate('/web', { replace: true })
  }, [navigate])

  const loadOIDCConfig = useCallback(async () => {
    try {
      const response = await getOIDCConfig()
      setOidcEnabled(!!response.success && !!response.enabled)
      setOidcProviderName(response.provider_display_name || '')
    } catch {
      setOidcEnabled(false)
      setOidcProviderName('')
    }
  }, [])

  const getBackendOIDCRedirectURI = () => `${window.location.origin}/api/v1/auth/oidc/callback`

  const handleMockGoogleLogin = async () => {
    try {
      setOidcLoading(true)
      const response = await autoSetup()
      if (response.success && persistLoginResponseToStorage(response)) {
        localStorage.setItem(STORAGE_KEYS.liteMode, 'true')
        toast.success(t('auth.loginSuccess'))
        finishLogin()
        return
      }
      toast.error(response.message || t('auth.loginError'))
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('auth.loginErrorRetry')
      toast.error(msg)
    } finally {
      setOidcLoading(false)
    }
  }

  const handleOIDCLogin = async () => {
    if (!USE_REAL_GOOGLE_AUTH) {
      await handleMockGoogleLogin()
      return
    }
    if (!oidcEnabled) {
      toast.message(t('mindarAuth.googleOidcUnavailable'))
      return
    }
    try {
      setOidcLoading(true)
      const response = await getOIDCAuthorizationURL(getBackendOIDCRedirectURI())
      if (!response.success || !response.authorization_url) {
        toast.error(response.message || t('auth.oidcLoginFailed'))
        return
      }
      window.location.href = response.authorization_url
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('auth.oidcLoginFailed')
      toast.error(msg)
    } finally {
      setOidcLoading(false)
    }
  }

  const goSignInWithEmail = () => {
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      toast.error(t('auth.emailInvalid'))
      return
    }
    setEmail(trimmed)
    setPassword('')
    setStep('sign-in')
  }

  const handleEmailContinue = (e: React.FormEvent) => {
    e.preventDefault()
    goSignInWithEmail()
  }

  const goRegister = (prefillEmail?: string) => {
    const trimmed = (prefillEmail ?? email).trim()
    setRegisterData({
      ...emptyRegisterForm(),
      email: trimmed,
    })
    setPassword('')
    setStep('register')
  }

  const goSignInFromRegister = () => {
    const nextEmail = registerData.email.trim() || email.trim()
    if (nextEmail) setEmail(nextEmail)
    setPassword('')
    setStep('sign-in')
  }

  function validateRegister(): string | null {
    if (!registerData.username.trim() || registerData.username.trim().length < 2) {
      return t('auth.usernameMinLength')
    }
    if (!registerData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerData.email)) {
      return t('auth.emailInvalid')
    }
    if (!registerData.password || registerData.password.length < 8) {
      return t('auth.passwordMinLength')
    }
    if (registerData.password !== registerData.confirmPassword) {
      return t('auth.passwordMismatch')
    }
    return null
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateRegister()
    if (err) {
      toast.error(err)
      return
    }

    try {
      setLoading(true)
      const response = await register({
        username: registerData.username.trim(),
        email: registerData.email.trim(),
        password: registerData.password,
      })
      if (response.success) {
        toast.success(t('auth.registerSuccess'))
        setEmail(registerData.email.trim())
        setRegisterData(emptyRegisterForm())
        setStep('sign-in')
      } else {
        toast.error(response.message || t('auth.registerFailed'))
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('auth.registerError')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password) {
      toast.error(t('auth.passwordRequired'))
      return
    }
    if (password.length < 8) {
      toast.error(t('auth.passwordMinLength'))
      return
    }

    try {
      setLoading(true)
      const response = await login({ email, password })
      if (response.success) {
        toast.success(t('auth.loginSuccess'))
        persistLoginResponseToStorage(response)
        finishLogin()
      } else {
        toast.error(response.message || t('auth.loginError'))
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : t('auth.loginErrorRetry')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    try {
      localStorage.setItem('locale', 'en-US')
    } catch {
      /* ignore */
    }
    void loadOIDCConfig()

    if (isLoggedInFromStorage()) {
      finishLogin()
    }
  }, [finishLogin, loadOIDCConfig])

  return (
    <div className="mind-auth-shell">
      <div className="mind-auth-main">
        <div className="mind-auth-card">
          <div className="mind-auth-brand">
            <MindarLogo height={36} priority className="mx-auto" />
          </div>

          {step === 'join' && (
            <>
              <h1 className="mind-auth-title">{t('mindarAuth.joinTitle')}</h1>
              <p className="mind-auth-subtitle">{t('mindarAuth.joinSubtitle')}</p>

              <div className="mind-auth-actions">
                <button
                  type="button"
                  className="mind-auth-btn-social"
                  disabled={oidcLoading}
                  onClick={() => void handleOIDCLogin()}
                >
                  <GoogleMark />
                  {oidcLoading ? t('auth.redirectingToOIDC') : googleLabel}
                </button>
              </div>

              <div className="mind-auth-divider">
                <span />
                <span>{t('mindarAuth.or')}</span>
                <span />
              </div>

              <form className="mind-auth-form" onSubmit={handleEmailContinue}>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoComplete="email"
                  className="mind-auth-input"
                  placeholder={t('mindarAuth.emailPlaceholder')}
                />
                <button type="submit" className="mind-auth-btn-primary" disabled={loading}>
                  {t('mindarAuth.continue')}
                </button>
              </form>

              <p className="mind-auth-switch">
                <span>{t('mindarAuth.noAccount')}</span>{' '}
                <button type="button" className="mind-auth-toggle" onClick={() => goRegister()}>
                  {t('mindarAuth.createAccount')}
                </button>
              </p>

              <p className="mind-auth-legal">
                {t('mindarAuth.legalPrefix')}{' '}
                <a href="#">{t('mindarAuth.terms')}</a> {t('mindarAuth.legalAnd')}{' '}
                <a href="#">{t('mindarAuth.privacy')}</a>.
              </p>
            </>
          )}

          {step === 'sign-in' && (
            <>
              <h1 className="mind-auth-title">{t('auth.login')}</h1>
              <p className="mind-auth-subtitle">
                {t('mindarAuth.signInSubtitle')} <strong>{email}</strong>
              </p>

              <form className="mind-auth-form" style={{ marginTop: '2rem' }} onSubmit={handleLogin}>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="mind-auth-input mind-auth-input--left"
                  placeholder={t('auth.passwordPlaceholder')}
                />
                <button type="submit" className="mind-auth-btn-primary" disabled={loading || !password}>
                  {loading ? t('auth.loggingIn') : t('auth.login')}
                </button>
              </form>

              <div className="mind-auth-divider">
                <span />
                <span>{t('mindarAuth.or')}</span>
                <span />
              </div>

              <div className="mind-auth-actions" style={{ marginTop: 0 }}>
                <button
                  type="button"
                  className="mind-auth-btn-social"
                  disabled={oidcLoading}
                  onClick={() => void handleOIDCLogin()}
                >
                  <GoogleMark />
                  {oidcLoading ? t('auth.redirectingToOIDC') : googleLabel}
                </button>
              </div>

              <button type="button" className="mind-auth-toggle" onClick={() => goRegister(email)}>
                {t('auth.registerNow')}
              </button>

              <button type="button" className="mind-auth-btn-secondary mind-auth-back-only" onClick={() => setStep('join')}>
                {t('mindarAuth.back')}
              </button>
            </>
          )}

          {step === 'register' && (
            <>
              <h1 className="mind-auth-title">{t('auth.register')}</h1>
              <p className="mind-auth-subtitle">{t('auth.registerSubtitle')}</p>

              <form className="mind-auth-form" style={{ marginTop: '2rem' }} onSubmit={handleRegister}>
                <input
                  value={registerData.username}
                  onChange={(e) => setRegisterData((prev) => ({ ...prev, username: e.target.value }))}
                  type="text"
                  autoComplete="username"
                  className="mind-auth-input mind-auth-input--left"
                  placeholder={t('auth.usernamePlaceholder')}
                />
                <input
                  value={registerData.email}
                  onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
                  type="email"
                  autoComplete="email"
                  className="mind-auth-input mind-auth-input--left"
                  placeholder={t('auth.emailPlaceholder')}
                />
                <input
                  value={registerData.password}
                  onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                  type="password"
                  autoComplete="new-password"
                  className="mind-auth-input mind-auth-input--left"
                  placeholder={t('auth.passwordPlaceholder')}
                />
                <input
                  value={registerData.confirmPassword}
                  onChange={(e) =>
                    setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                  }
                  type="password"
                  autoComplete="new-password"
                  className="mind-auth-input mind-auth-input--left"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
                <button type="submit" className="mind-auth-btn-primary" disabled={loading}>
                  {loading ? t('auth.registering') : t('auth.register')}
                </button>
              </form>

              <p className="mind-auth-switch">
                <span>{t('mindarAuth.hasAccount')}</span>{' '}
                <button type="button" className="mind-auth-toggle" onClick={goSignInFromRegister}>
                  {t('auth.login')}
                </button>
              </p>

              <button
                type="button"
                className="mind-auth-btn-secondary mind-auth-back-only"
                onClick={() => setStep('join')}
              >
                {t('mindarAuth.back')}
              </button>
            </>
          )}

          <p className="mind-auth-footer">
            <Link to="/landing">{t('mindarAuth.home')}</Link>
            <span className="dot">·</span>
            <Link to="/web">{t('mindarAuth.backToApp')}</Link>
          </p>
        </div>
      </div>

      <AuthIllustrationPanel />
    </div>
  )
}
