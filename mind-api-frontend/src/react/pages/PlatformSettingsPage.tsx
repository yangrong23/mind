import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Cloud,
  Database,
  FileSearch,
  Globe,
  Info,
  Lock,
  MessageSquare,
  Server,
  Settings,
  SlidersHorizontal,
  UserCircle,
  Wrench,
  X,
} from 'lucide-react'
import { t } from '@/i18n/core'
import {
  normalizePlatformSettingsSection,
  PLATFORM_SETTINGS_NAV,
  type PlatformSettingsNavItem,
  type PlatformSettingsSection,
} from '@/lib/platform-settings-sections'
import { VueSettingsPanel } from '@/react/components/VueSettingsPanel'
import '@/react/platform-settings.css'

function NavIcon({ item }: { item: PlatformSettingsNavItem }) {
  const cls = 'h-[18px] w-[18px]'
  switch (item.icon) {
    case 'server':
      return <Server className={cls} aria-hidden />
    case 'cloud-w':
      return (
        <svg className={cls} viewBox="0 0 18 18" fill="none" aria-hidden>
          <rect x="1.5" y="1.5" width="15" height="15" rx="3.5" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M4.5 5.5L6.5 12.5L9 7.5L11.5 12.5L13.5 5.5"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'globe':
      return (
        <svg className={cls} viewBox="0 0 18 18" fill="none" aria-hidden>
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.2" />
          <path d="M9 2v14M2.94 5.5h12.12M2.94 12.5h12.12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )
    case 'models':
      return <SlidersHorizontal className={cls} aria-hidden />
    case 'chat':
      return <MessageSquare className={cls} aria-hidden />
    case 'database':
      return <Database className={cls} aria-hidden />
    case 'file':
      return <FileSearch className={cls} aria-hidden />
    case 'cloud':
      return <Cloud className={cls} aria-hidden />
    case 'tools':
      return <Wrench className={cls} aria-hidden />
    case 'info':
      return <Info className={cls} aria-hidden />
    case 'user':
      return <UserCircle className={cls} aria-hidden />
    case 'lock':
      return <Lock className={cls} aria-hidden />
    case 'setting':
    default:
      return <Settings className={cls} aria-hidden />
  }
}

function navLabel(item: PlatformSettingsNavItem): string {
  const resolved = t(item.labelKey)
  return resolved === item.labelKey ? item.fallbackLabel : resolved
}

export function PlatformSettingsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const section = normalizePlatformSettingsSection(searchParams.get('section'))
  const [activeSection, setActiveSection] = useState<PlatformSettingsSection>(section)

  useEffect(() => {
    setActiveSection(section)
  }, [section])

  const setSection = useCallback(
    (next: PlatformSettingsSection) => {
      setActiveSection(next)
      setSearchParams({ section: next }, { replace: true })
    },
    [setSearchParams]
  )

  useEffect(() => {
    const onNav = (e: Event) => {
      const detail = (e as CustomEvent<{ section?: string }>).detail
      if (detail?.section) {
        setSection(normalizePlatformSettingsSection(detail.section))
      }
    }
    window.addEventListener('settings-nav', onNav)
    return () => window.removeEventListener('settings-nav', onNav)
  }, [setSection])

  const close = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/web', { replace: true })
  }, [navigate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  const sidebarTitle = useMemo(() => {
    const resolved = t('general.settings')
    return resolved === 'general.settings' ? 'Settings' : resolved
  }, [])

  return (
    <div className="platform-settings-overlay" role="dialog" aria-modal="true" aria-label={sidebarTitle}>
      <div className="platform-settings-modal">
        <button type="button" className="platform-settings-close" onClick={close} aria-label={t('general.close')}>
          <X size={20} aria-hidden />
        </button>

        <div className="platform-settings-layout">
          <aside className="platform-settings-sidebar">
            <div className="platform-settings-sidebar-header">
              <h2 className="platform-settings-sidebar-title">{sidebarTitle}</h2>
            </div>
            <nav className="platform-settings-nav" aria-label={sidebarTitle}>
              {PLATFORM_SETTINGS_NAV.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={
                    activeSection === item.key
                      ? 'platform-settings-nav-item platform-settings-nav-item--active'
                      : 'platform-settings-nav-item'
                  }
                  onClick={() => setSection(item.key)}
                >
                  <span className="platform-settings-nav-icon">
                    <NavIcon item={item} />
                  </span>
                  <span>{navLabel(item)}</span>
                </button>
              ))}
            </nav>
          </aside>

          <div className="platform-settings-content">
            <div className="platform-settings-content-inner">
              <VueSettingsPanel section={activeSection} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
