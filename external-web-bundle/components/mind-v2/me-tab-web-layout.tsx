"use client"

import type { ReactNode } from "react"

export type MeTabWebLayoutProps = {
  profileHero: ReactNode
  activityTimeline: ReactNode
  overlays?: ReactNode
}

/** Web Me tab: profile + capture diary timeline. */
export function MeTabWebLayout({
  profileHero,
  activityTimeline,
  overlays,
}: MeTabWebLayoutProps) {
  return (
    <div className="relative h-full min-h-0 overflow-y-auto bg-[#f4f5f8] dark:bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,rgba(196,181,253,0.2),transparent),radial-gradient(ellipse_60%_40%_at_90%_10%,rgba(153,246,228,0.15),transparent)]" />
      <div className="relative mx-auto flex h-full min-h-0 w-full max-w-[1280px] flex-col gap-5 px-5 pt-5 pb-8 lg:gap-6 lg:px-6 lg:pt-6">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-teal-500 p-[1px] shadow-lg shadow-violet-900/10">
          <div className="rounded-[15px] bg-white/95 p-5 backdrop-blur-sm dark:bg-zinc-900/95">{profileHero}</div>
        </div>
        {activityTimeline}
      </div>
      {overlays}
    </div>
  )
}
