"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { MeTimelineHeatmapGrid } from "@/components/mind-v2/me-activity-timeline"
import { buildDemoActivityTimeline, type ActivityTimelineDay } from "@/lib/mock-activity-timeline"

export function ShareCardTimelineMini({
  className,
  days,
  gridCells = 35,
}: {
  className?: string
  days?: ActivityTimelineDay[]
  gridCells?: number
}) {
  const gridDays = useMemo(() => days ?? buildDemoActivityTimeline(), [days])

  return (
    <div className={cn("relative overflow-visible", className)}>
      <MeTimelineHeatmapGrid
        days={gridDays}
        cellCount={gridCells}
        cols={7}
        sequentialTitles
        size="compact"
        className="shadow-sm shadow-stone-900/[0.03]"
      />
    </div>
  )
}
