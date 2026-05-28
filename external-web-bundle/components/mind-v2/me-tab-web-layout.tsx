"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"

export type MeTabWebLayoutProps = {
  profileHero: ReactNode
  /** Left column — activity timeline */
  timelinePanel?: ReactNode
  /** Right column — settings */
  settingsPanel?: ReactNode
  /** @deprecated Use timelinePanel (+ optional settingsPanel) */
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
      <div className={cn("relative h-full min-h-0 overflow-y-auto bg-[#f4f5f8] dark:bg-zinc-950")}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,rgba(196,181,253,0.2),transparent),radial-gradient(ellipse_60%_40%_at_90%_10%,rgba(153,246,228,0.15),transparent)]" />
        <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[1280px] flex-col gap-5 px-5 pt-5 pb-8 lg:gap-6 lg:px-6 lg:pt-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-teal-500 p-[1px] shadow-lg shadow-violet-900/10">
            <div className="rounded-[15px] bg-white/95 p-5 backdrop-blur-sm dark:bg-zinc-900/95">{profileHero}</div>
          </div>
          {timeline}
        </div>
        {overlays}
      </div>
    )
  }

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
            <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">{timeline}</div>
            <div className="min-w-0">{settingsPanel}</div>
          </div>
        </div>
      </div>
      {overlays}
    </div>
  )
}
