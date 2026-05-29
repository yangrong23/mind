"use client"

import { MeDailyReview } from "@/components/mind-v2/me-daily-review"
import { getTodayTimelineDay } from "@/lib/mock-activity-timeline"
import { DEMO_CAPTURE_DIARY, getDayUploads } from "@/lib/me-capture-diary-helpers"
import type { MindSharePayload } from "@/lib/mind-share-payload"

export function WebMeDailyReviewPage({
  displayName,
  onBack,
  onOpenTodayActivity,
  onShare,
}: {
  displayName: string
  onBack: () => void
  onOpenTodayActivity: () => void
  onShare: (payload: MindSharePayload) => void
}) {
  const today = getTodayTimelineDay(DEMO_CAPTURE_DIARY)

  return (
    <MeDailyReview
      presentation="page"
      displayName={displayName}
      onClose={onBack}
      onShare={onShare}
      onOpenTodayActivity={() => {
        onBack()
        onOpenTodayActivity()
      }}
      streakDays={7}
      captureCountToday={today.activity > 0 ? 3 : 0}
      days={DEMO_CAPTURE_DIARY}
      getUploads={getDayUploads}
    />
  )
}

