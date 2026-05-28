"use client"

import { MeActivityTimeline } from "@/components/mind-v2/me-activity-timeline"
import {
  DEMO_CAPTURE_DIARY,
  getDayUploads,
} from "@/lib/me-capture-diary-helpers"
import type { ActivityTimelineDay } from "@/lib/mock-activity-timeline"
import { getTodayTimelineDay } from "@/lib/mock-activity-timeline"

/** Full capture timeline — list of all days */
export function WebMeTimelinePage({
  displayName,
  onBack,
  onOpenDay,
  onShare,
}: {
  displayName: string
  onBack: () => void
  onOpenDay: (day: ActivityTimelineDay) => void
  onShare?: (day: ActivityTimelineDay) => void
}) {
  const today = getTodayTimelineDay(DEMO_CAPTURE_DIARY)

  return (
    <MeActivityTimeline
      presentation="page"
      webLayout
      days={DEMO_CAPTURE_DIARY}
      initialDate={today.isoDate}
      initialActivity={today.activity}
      displayName={displayName}
      listFirst
      onClose={onBack}
      onNavigateToDay={onOpenDay}
      onShare={onShare}
      getUploads={getDayUploads}
    />
  )
}

/** Single-day capture log */
export function WebMeTimelineDayPage({
  isoDate,
  activity,
  displayName,
  onBack,
  onShare,
}: {
  isoDate: string
  activity: number
  displayName: string
  onBack: () => void
  onShare?: (day: ActivityTimelineDay) => void
}) {
  return (
    <MeActivityTimeline
      presentation="page"
      webLayout
      days={DEMO_CAPTURE_DIARY}
      initialDate={isoDate}
      initialActivity={activity}
      displayName={displayName}
      listFirst={false}
      onClose={onBack}
      onShare={onShare}
      getUploads={getDayUploads}
    />
  )
}
