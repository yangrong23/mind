"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"

export type MeTabWebLayoutProps = {
  profileHero: ReactNode
  /** Left column — activity timeline (always visible) */
  timelinePanel: ReactNode
  /** Right column — settings cards */
  settingsPanel: ReactNode
  overlays?: ReactNode
}

/** Web Me — profile header + timeline (left) · settings (right) */
export function MeTabWebLayout({
  profileHero,
  timelinePanel,
  settingsPanel,
  overlays,
}: MeTabWebLayoutProps) {
  return (
    <div className={cn("relative h-full min-h-0 overflow-hidden", web.canvas)} data-me-layout="web">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_12%_0%,rgba(186,230,253,0.35),transparent_55%),radial-gradient(ellipse_55%_40%_at_98%_8%,rgba(191,219,254,0.22),transparent_50%)]"
        aria-hidden
      />
      <div className="relative h-full min-h-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-[1160px] px-6 py-7 pb-12 lg:px-10 lg:py-9">
          <header className="rounded-3xl bg-white px-6 py-7 lg:px-8 lg:py-8">{profileHero}</header>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-start lg:gap-6">
            <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">{timelinePanel}</div>
            <div className="min-w-0">{settingsPanel}</div>
          </div>
        </div>
      </div>
      {overlays}
    </div>
  )
}
