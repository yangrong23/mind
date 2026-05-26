/**
 * Mirrors app/landing/layout.tsx + app/landing/page.tsx (Next.js) in one React tree.
 * Do not mount via Vue or imperative createRoot — use <LandingPage /> from the React router.
 */
import { useEffect } from 'react'
import { MindLandingPage } from '@/components/mind-landing/mind-landing-page'
import { LandingMeshBackground } from '@/components/mind-landing/landing-mesh-background'

export function MindLandingRoute() {
  useEffect(() => {
    document.documentElement.classList.add('mind-landing-active')
    return () => document.documentElement.classList.remove('mind-landing-active')
  }, [])

  return (
    <div lang="en" className="mind-landing-root relative min-h-screen w-full">
      <LandingMeshBackground />
      <div className="relative z-10">
        <MindLandingPage />
      </div>
    </div>
  )
}
