"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"

export type MeTabWebLayoutProps = {
  profileHero: ReactNode
  /** Left column — activity timeline (always visible) */
  timelinePanel?: ReactNode
  /** Right column — settings cards */
  settingsPanel?: ReactNode
  /** @deprecated Use timelinePanel (+ settingsPanel) */
  activityTimeline?: ReactNode
  overlays?: ReactNode
}

/** Web Me — profile header + timeline (left) · settings (right) */
export function MeTabWebLayout({
  profileHero,
  timelinePanel,
  settingsPanel,
  activityTimeline,
  overlays,
}: MeTabWebLayoutProps) {
  const timeline = timelinePanel ?? activityTimeline

  if (!settingsPanel) {
    return (
      <div className={cn("relative h-full min-h-0 overflow-y-auto bg-transparent")} data-me-layout="web">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_20%_0%,rgba(186,230,253,0.14),transparent_55%)]"
          aria-hidden
        />
        <div className={cn("relative mx-auto w-full max-w-[1000px]", web.pagePadWide)}>
          <header className={cn("rounded-3xl px-6 py-7 lg:px-8 lg:py-8", web.surfaceCard)}>{profileHero}</header>
          {timeline ? <div className="mt-5 min-h-0 min-w-0">{timeline}</div> : null}
        </div>
        {overlays}
      </div>
    )
  }

  return (
    <div className={cn("relative h-full min-h-0 overflow-hidden bg-transparent")} data-me-layout="web">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_70%_at_15%_-5%,rgba(125,211,252,0.22),transparent_55%),radial-gradient(ellipse_75%_50%_at_92%_0%,rgba(196,181,253,0.14),transparent_48%)]"
        aria-hidden
      />
      <div className="relative h-full min-h-0 overflow-y-auto">
        <div className={cn("mx-auto w-full max-w-[1160px]", web.pagePadWide)}>
          <header className={cn("rounded-3xl px-6 py-7 lg:px-8 lg:py-8", web.surfaceCard)}>{profileHero}</header>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
            <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">{timeline}</div>
            <div className="min-w-0">{settingsPanel}</div>
          </div>
        </div>
      </div>
      {overlays}
    </div>
  )
}
