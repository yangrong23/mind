"use client"

import { Share2 } from "lucide-react"
import { SettingsScreenShell } from "@/components/mind-v2/me-settings-ui"
import { MindViralShareCard } from "@/components/mind-v2/mind-viral-share-card"
import type { MindSharePayload } from "@/lib/mind-share-payload"
import type { ActivityTimelineDay } from "@/lib/mock-activity-timeline"

export function MeStatsShareInsightPanel({
  displayName,
  sharePayload,
  timelineDays,
  onShare,
  onBack,
}: {
  displayName: string
  sharePayload: MindSharePayload
  timelineDays?: ActivityTimelineDay[]
  onShare: () => void
  onBack: () => void
}) {
  return (
    <SettingsScreenShell title="Your stats" onBack={onBack} zClass="z-[56]">
      <div className="space-y-4">
        <MindViralShareCard
          card={sharePayload.card}
          displayName={displayName}
          timelineDays={timelineDays}
          fullPreview
        />

        <button
          type="button"
          onClick={onShare}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          <Share2 className="h-4 w-4" strokeWidth={2} aria-hidden />
          Share this card
        </button>
      </div>
    </SettingsScreenShell>
  )
}
