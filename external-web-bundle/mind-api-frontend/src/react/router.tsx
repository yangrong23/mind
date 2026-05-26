import { lazy, Suspense, useEffect } from 'react'
import {
  createBrowserRouter,
  Outlet,
  redirect,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { toast } from 'sonner'
import { handleGlobalOIDCCallback } from '@/auth/session-oidc'
import {
  createStorageAuthAdapter,
  hasPendingOIDCCallback,
  hydrateSessionFromToken,
  isLiteEdition,
  isLiteSpaDefaultEntry,
  isLoggedInFromStorage,
  isSafeLiteRestoreTarget,
  STORAGE_KEYS,
  tryAutoSetup,
} from '@/auth/session'
import { MindWebShellLayout } from './MindWebShellLayout'
import { LoginPage } from './pages/LoginPage'
import { LandingPage } from './pages/LandingPage'
import { WebPlatformPage } from './pages/WebPlatformPage'
import { PlatformSettingsPage } from './pages/PlatformSettingsPage'
const VuePlatformHost = lazy(() =>
  import('./VuePlatformHost').then((m) => ({ default: m.VuePlatformHost }))
)

function VuePlatformRoute() {
  return (
    <Suspense fallback={null}>
      <VuePlatformHost />
    </Suspense>
  )
}

let autoSetupAttempted = false
let liteDeepLinkRestoreDone = false

async function ensureAuthenticated(): Promise<boolean> {
  if (isLoggedInFromStorage()) return true
  const auth = createStorageAuthAdapter()
  if (await hydrateSessionFromToken(auth)) return true
  if (!autoSetupAttempted) {
    autoSetupAttempted = true
    if (await tryAutoSetup(auth)) return true
  }
  return false
}

async function protectedLoader(request: Request) {
  if (hasPendingOIDCCallback()) return null

  if (!liteDeepLinkRestoreDone) {
    liteDeepLinkRestoreDone = true
    const auth = createStorageAuthAdapter()
    if (isLiteEdition(auth)) {
      const saved = sessionStorage.getItem(STORAGE_KEYS.liteLastPath)
      const url = new URL(request.url)
      if (
        saved &&
        isSafeLiteRestoreTarget(saved) &&
        isLiteSpaDefaultEntry(url.pathname)
      ) {
        if (saved !== url.pathname + url.search) {
          throw redirect(saved)
        }
      }
    }
  }

  const ok = await ensureAuthenticated()
  if (!ok) {
    throw redirect('/login')
  }
  return null
}

async function publicLoader(request: Request) {
  if (hasPendingOIDCCallback()) return null
  const url = new URL(request.url)
  if (url.pathname === '/login' && isLoggedInFromStorage()) {
    throw redirect('/web')
  }
  return null
}

function LitePathTracker() {
  const location = useLocation()
  useEffect(() => {
    const auth = createStorageAuthAdapter()
    if (!isLiteEdition(auth)) return
    if (location.pathname === '/login') return
    if (!location.pathname.startsWith('/platform') && !location.pathname.startsWith('/web')) return
    sessionStorage.setItem(STORAGE_KEYS.liteLastPath, location.pathname + location.search)
  }, [location.pathname, location.search])
  return null
}

function OIDCCallbackMount() {
  const navigate = useNavigate()
  useEffect(() => {
    void handleGlobalOIDCCallback((path, opts) => navigate(path, opts)).catch((err) => {
      toast.error(err instanceof Error ? err.message : 'OIDC login failed')
    })
  }, [navigate])
  return null
}

function AppLayout() {
  return (
    <>
      <OIDCCallbackMount />
      <LitePathTracker />
      <Outlet />
    </>
  )
}

export const reactRouter = createBrowserRouter(
  [
    {
      element: <AppLayout />,
      children: [
        {
          path: '/',
          loader: () => redirect('/web'),
        },
        {
          element: <MindWebShellLayout />,
          children: [
            {
              path: '/web',
              loader: protectedLoader,
              element: <WebPlatformPage />,
            },
            {
              path: '/login',
              loader: publicLoader,
              element: <LoginPage />,
            },
            {
              path: '/landing',
              loader: publicLoader,
              element: <LandingPage />,
            },
          ],
        },
        {
          path: '/join',
          loader: ({ request }) => {
            const url = new URL(request.url)
            const code = url.searchParams.get('code')
            const target = code
              ? `/platform/organizations?invite_code=${encodeURIComponent(code)}`
              : '/platform/organizations'
            throw redirect(target)
          },
        },
        {
          path: '/knowledgeBase',
          loader: ({ request }) => {
            const url = new URL(request.url)
            const id = url.searchParams.get('id')
            if (id) throw redirect(`/platform/knowledge-bases/${id}`)
            throw redirect('/web')
          },
        },
        {
          path: '/platform/knowledge-bases',
          loader: () => redirect('/web'),
        },
        ...(import.meta.env.DEV
          ? [
              {
                path: '/platform/dev/markdown',
                element: <VuePlatformRoute />,
              },
            ]
          : []),
        {
          path: '/platform/settings',
          loader: protectedLoader,
          element: <PlatformSettingsPage />,
        },
        {
          path: '/platform/settings/*',
          loader: protectedLoader,
          element: <PlatformSettingsPage />,
        },
        {
          path: '/platform/knowledge-bases/:kbId',
          loader: protectedLoader,
          element: <VuePlatformRoute />,
        },
        {
          path: '/platform/knowledge-bases/:kbId/*',
          loader: protectedLoader,
          element: <VuePlatformRoute />,
        },
        {
          path: '/platform/chat/:chatid',
          loader: protectedLoader,
          element: <VuePlatformRoute />,
        },
        {
          path: '/platform/agents',
          loader: () => redirect('/web'),
        },
        {
          path: '/platform/organizations',
          loader: protectedLoader,
          element: <VuePlatformRoute />,
        },
        {
          path: '/platform/organizations/*',
          loader: protectedLoader,
          element: <VuePlatformRoute />,
        },
        {
          path: '/platform/*',
          loader: protectedLoader,
          element: <VuePlatformRoute />,
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
)
