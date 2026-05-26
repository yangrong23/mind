"use client"

import { useEffect, useId, useMemo, useState, type CSSProperties } from "react"
import { ArrowRight, ChevronRight, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  activityHeatmapCellClass,
  activityHeatmapCellClassTiny,
} from "@/lib/activity-heatmap-classes"
import { web } from "@/components/mind-v2/web-design"
import { HubItemThumb } from "@/components/mind-v2/mind-media-art"
import { hubItemKindFromLabel } from "@/lib/product-media"
import {
  buildActivityTimelineDay,
  groupTimelineByMonth,
  type ActivityTimelineDay,
} from "@/lib/mock-activity-timeline"
import { buildDayTimelineBrief } from "@/lib/daily-brief-content"
import { DailyBriefView } from "@/components/mind-v2/daily-brief-view"

export type MeActivityTimelineProps = {
  days: ActivityTimelineDay[]
  initialDate: string
  initialActivity: number
  onClose: () => void
  onShare?: (day: ActivityTimelineDay) => void
  onSuggestedPrompt?: (prompt: string) => void
  displayName?: string
  webLayout?: boolean
  /** Mobile: open full day list first; day detail after tapping a row */
  listFirst?: boolean
  getUploads?: (isoDate: string, activity: number) => {
    id: string
    title: string
    time: string
    source: string
  }[]
}

function formatFullDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

const TIMELINE_CYCLE_MS = 2800
/** 1-based: bubbles from row 3, column 5 onward */
const BUBBLE_START_ROW = 3
const BUBBLE_START_COL = 5

function isBubbleEligibleIndex(index: number, cols: number) {
  const row = Math.floor(index / cols) + 1
  const col = (index % cols) + 1
  if (row < BUBBLE_START_ROW) return false
  if (row === BUBBLE_START_ROW) return col >= BUBBLE_START_COL
  return true
}

/** Anchored above a grid cell; arrow points to the cell center */
function TimelineTitleBubble({
  day,
  activeIdx,
}: {
  day: ActivityTimelineDay
  activeIdx: number
}) {
  return (
    <div
      key={`bubble-${day.id}-${activeIdx}`}
      className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 flex w-max max-w-[min(188px,68vw)] -translate-x-1/2 flex-col items-center"
    >
      <div className="animate-[me-timeline-bubble-float_3s_ease-in-out_infinite]">
        <div
          className={cn(
            "relative overflow-hidden rounded-[1.1rem] px-3.5 py-2",
            "border border-sky-200/60 bg-white/95",
            "backdrop-blur-md dark:border-sky-500/25 dark:bg-zinc-900/92",
            "animate-[me-timeline-title-bubble_2.8s_cubic-bezier(0.22,1,0.36,1)_forwards]"
          )}
        >
        <span
          className="pointer-events-none absolute -left-3 -top-3 h-10 w-10 rounded-full bg-sky-300/20 blur-md"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -right-2 bottom-0 h-8 w-8 rounded-full bg-blue-300/15 blur-md"
          aria-hidden
        />
        <span
          className="absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent"
          aria-hidden
        />
        <p
          className={cn(
            "relative text-center font-semibold tracking-[0.06em] text-sky-600/90 dark:text-sky-300/90",
            compact ? "text-[8px]" : "text-[10px]"
          )}
        >
          {day.homeDateLabel}
        </p>
        <p
          className={cn(
            "relative mt-0.5 line-clamp-2 text-center font-semibold text-zinc-800 dark:text-zinc-50",
            compact ? "text-[9px] leading-[1.3]" : "text-[11px] leading-[1.35]"
          )}
        >
          {day.title}
        </p>
        </div>
      </div>
      <span
        className="relative -mt-px flex h-2.5 w-2.5 items-center justify-center"
        aria-hidden
      >
        <span className="absolute h-2.5 w-2.5 rotate-45 rounded-[2px] border border-sky-200/70 bg-white/95 dark:border-sky-500/30 dark:bg-zinc-900/95" />
        <span className="h-1 w-1 rounded-full bg-sky-400/70 blur-[1px]" />
      </span>
    </div>
  )
}

/** Me home — full heatmap grid + sequential title bubbles */
export function MeTimelineHeatmapGrid({
  days,
  cellCount = 35,
  cols = 7,
  onSelectDay,
  sequentialTitles = false,
  size = "md",
  embed = false,
  fullWidth = false,
  className,
}: {
  days: ActivityTimelineDay[]
  cellCount?: number
  cols?: number
  onSelectDay?: (day: ActivityTimelineDay) => void
  sequentialTitles?: boolean
  size?: "xs" | "sm" | "md" | "lg"
  embed?: boolean
  /** Me web left panel — use full column width instead of narrow embed strip */
  fullWidth?: boolean
  className?: string
}) {
  const gridDays = useMemo(
    () => [...days.slice(0, cellCount)].reverse(),
    [days, cellCount]
  )

  const bubbleEligibleIndices = useMemo(
    () =>
      gridDays
        .map((_, i) => i)
        .filter((i) => isBubbleEligibleIndex(i, cols)),
    [gridDays, cols]
  )

  const [activeSlot, setActiveSlot] = useState(0)

  useEffect(() => {
    setActiveSlot(0)
  }, [bubbleEligibleIndices.length])

  useEffect(() => {
    if (!sequentialTitles || bubbleEligibleIndices.length < 2) return
    const id = window.setInterval(() => {
      setActiveSlot((s) => (s + 1) % bubbleEligibleIndices.length)
    }, TIMELINE_CYCLE_MS)
    return () => window.clearInterval(id)
  }, [sequentialTitles, bubbleEligibleIndices.length])

  const activeGridIndex = bubbleEligibleIndices[activeSlot] ?? -1

  const compactGrid = embed || size !== "lg"
  const cellPx =
    size === "lg"
      ? "min-h-[14px]"
      : size === "md"
        ? "min-h-[11px]"
        : size === "sm"
          ? "min-h-[8px]"
          : size === "xs"
            ? "min-h-[5px]"
            : "min-h-[8px]"
  const gridGap =
    size === "lg"
      ? "gap-[3px]"
      : size === "md"
        ? "gap-[2px]"
        : size === "xs"
          ? "gap-[1px]"
          : "gap-[1.5px]"
  const cellRound =
    size === "lg" ? "rounded-[4px]" : size === "xs" ? "rounded-[1.5px]" : "rounded-[2px]"
  const cellClassFn = compactGrid ? activityHeatmapCellClassTiny : activityHeatmapCellClass
  const bubbleCompact = compactGrid

  return (
    <div
      className={cn(
        "relative overflow-visible transition-shadow duration-500",
        embed
          ? "rounded-xl bg-gradient-to-b from-sky-50/30 via-white to-stone-50/50 px-2 pb-2 pt-1.5"
          : "rounded-xl border border-stone-200/80 bg-gradient-to-b from-white to-stone-50/80 dark:border-zinc-700/90 dark:from-zinc-900 dark:to-zinc-950/80",
        sequentialTitles && !embed ? "px-3 pb-3 pt-2" : embed ? "" : "p-3",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute rounded-full blur-2xl",
          embed ? "-right-2 top-0 h-8 w-8 bg-sky-200/20" : "-right-6 top-0 h-20 w-20 bg-sky-200/15"
        )}
        aria-hidden
      />
      <div
        className={cn(
          compactGrid &&
            !fullWidth &&
            (size === "xs"
              ? "mx-auto w-[42%] min-w-[4rem] max-w-[5.25rem]"
              : "mx-auto w-1/2 min-w-[6.5rem] max-w-[11rem]"),
          fullWidth && "w-full max-w-[320px]",
          "relative grid overflow-visible",
          gridGap
        )}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {gridDays.map((day, i) => {
          const canBubble = sequentialTitles && isBubbleEligibleIndex(i, cols)
          const isActive = canBubble && i === activeGridIndex
          const blockClass = cn(
            cellClassFn(day.activity),
            "aspect-square w-full transition-all duration-300",
            cellRound,
            cellPx,
            embed && onSelectDay && "hover:scale-[1.05] hover:z-[1]",
            isActive &&
              "relative z-[2] scale-[1.06] animate-[me-timeline-cell-pop_0.75s_ease-out] !bg-mind/38"
          )
          const cellBody = (
            <div className="relative aspect-square w-full">
              <div className={cn("h-full w-full", blockClass)} />
              {isActive ? (
                <TimelineTitleBubble day={day} activeIdx={activeSlot} compact={bubbleCompact} />
              ) : null}
            </div>
          )

          if (onSelectDay) {
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => onSelectDay(day)}
                className="relative w-full rounded-[4px] focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-300/50"
                aria-label={`${day.homeDateLabel}: ${day.title}`}
              >
                {cellBody}
              </button>
            )
          }

          return (
            <div key={day.id} className="relative w-full">
              {cellBody}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const FLOW_ROW_H = 56
const FLOW_CANVAS_W = 320
/** Left-aligned spine — gentle S-curve, smoothed by dense Catmull–Rom samples */
const FLOW_BASE_X = 54
const FLOW_AMPLITUDE_PRIMARY = 13
const FLOW_AMPLITUDE_SECONDARY = 4
const FLOW_FREQ_PRIMARY = 0.88
const FLOW_FREQ_SECONDARY = 1.72
/** Samples per row for the visible stroke (higher = silkier curve) */
const FLOW_STROKE_SAMPLES_PER_ROW = 12
/** Lower divisor = longer Bézier handles = rounder stroke */
const FLOW_STROKE_TENSION = 2.85

type FlowPoint = { x: number; y: number }

function flowXAt(index: number): number {
  const phase = index * FLOW_FREQ_PRIMARY + 0.35
  const ripple = index * FLOW_FREQ_SECONDARY + 1.05
  const x =
    FLOW_BASE_X +
    FLOW_AMPLITUDE_PRIMARY * Math.sin(phase) +
    FLOW_AMPLITUDE_SECONDARY * Math.sin(ripple)
  return Math.max(28, Math.min(FLOW_CANVAS_W - 28, x))
}

/** One knot per day — dots and labels anchor here. */
function buildFlowPoints(count: number): FlowPoint[] {
  if (count <= 0) return []
  return Array.from({ length: count }, (_, i) => ({
    x: flowXAt(i),
    y: FLOW_ROW_H / 2 + i * FLOW_ROW_H,
  }))
}

/** Dense samples along the continuous wave — stroke only, not day knots. */
function buildFlowStrokeSamples(knotCount: number): FlowPoint[] {
  if (knotCount <= 0) return []
  if (knotCount === 1) return buildFlowPoints(1)

  const maxI = knotCount - 1
  const step = 1 / FLOW_STROKE_SAMPLES_PER_ROW
  const samples: FlowPoint[] = []

  for (let i = 0; i < maxI; i += step) {
    samples.push({
      x: flowXAt(i),
      y: FLOW_ROW_H / 2 + i * FLOW_ROW_H,
    })
  }

  const endY = FLOW_ROW_H / 2 + maxI * FLOW_ROW_H
  const last = samples[samples.length - 1]
  if (!last || last.y < endY - 0.5) {
    samples.push({ x: flowXAt(maxI), y: endY })
  } else {
    last.x = flowXAt(maxI)
    last.y = endY
  }

  return samples
}

/** Catmull–Rom → cubic Bézier through dense stroke samples. */
function buildFlowCurvePath(points: FlowPoint[]) {
  const n = points.length
  if (n === 0) return ""
  if (n === 1) return `M ${points[0].x} ${points[0].y}`
  if (n === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  const k = FLOW_STROKE_TENSION
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(n - 1, i + 2)]
    const c1x = p1.x + (p2.x - p0.x) / k
    const c1y = p1.y + (p2.y - p0.y) / k
    const c2x = p2.x - (p3.x - p1.x) / k
    const c2y = p2.y - (p3.y - p1.y) / k
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`
  }
  return d
}

function buildFlowStrokePath(knotCount: number): string {
  return buildFlowCurvePath(buildFlowStrokeSamples(knotCount))
}

const DOT_LABEL_GAP = 14

function flowDotLeftPercent(x: number) {
  return `${(x / FLOW_CANVAS_W) * 100}%`
}

function TimelineFlowNode({
  prominent,
  style,
}: {
  prominent?: boolean
  style?: CSSProperties
}) {
  return (
    <span
      className="pointer-events-none absolute top-1/2 z-[2] block h-0 w-0 -translate-x-1/2 -translate-y-1/2"
      style={style}
      aria-hidden
    >
      <span
        className={cn(
          "absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/15",
          prominent ? "h-[22px] w-[22px]" : "h-[18px] w-[18px]"
        )}
      />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500",
          prominent ? "h-3.5 w-3.5" : "h-3 w-3"
        )}
      />
    </span>
  )
}

/** Level 2 — curve spine with per-row nodes aligned to titles */
export function MeTimelineVerticalDayList({
  days,
  onSelectDay,
  className,
}: {
  days: ActivityTimelineDay[]
  onSelectDay?: (day: ActivityTimelineDay) => void
  className?: string
}) {
  const flowUid = useId().replace(/:/g, "")
  const points = useMemo(() => buildFlowPoints(days.length), [days.length])
  const curvePath = useMemo(() => buildFlowStrokePath(days.length), [days.length])
  const canvasH = days.length * FLOW_ROW_H

  return (
    <div className={cn("relative overflow-visible", className)}>
      <div className="relative mx-auto w-full max-w-[min(100%,440px)]">
        <svg
          className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full"
          style={{ height: canvasH }}
          viewBox={`0 0 ${FLOW_CANVAS_W} ${canvasH}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id={`${flowUid}-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(139 92 246 / 0.5)" />
              <stop offset="55%" stopColor="rgb(124 58 237 / 0.75)" />
              <stop offset="100%" stopColor="rgb(99 102 241 / 0.4)" />
            </linearGradient>
          </defs>
          {days.length > 1 ? (
            <>
              <path
                d={curvePath}
                fill="none"
                stroke="rgb(139 92 246 / 0.1)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={curvePath}
                fill="none"
                stroke={`url(#${flowUid}-grad)`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : null}
        </svg>

        <div className="relative z-[1]">
          {days.map((day, i) => {
            const p = points[i]
            if (!p) return null
            const dotLeft = flowDotLeftPercent(p.x)
            const labelStart = `calc(${dotLeft} + ${DOT_LABEL_GAP}px)`

            const rowInner = (
              <>
                <TimelineFlowNode prominent={i === 0} style={{ left: dotLeft }} />
                <div
                  className="pointer-events-none absolute top-1/2 flex min-w-0 -translate-y-1/2 items-center gap-2 pr-1 text-left"
                  style={{ left: labelStart, right: 0 }}
                >
                  <div className="min-w-0 flex-1">
                    <span className="block text-[10px] font-medium tabular-nums text-zinc-400 dark:text-zinc-500">
                      {day.homeDateLabel}
                    </span>
                    <p className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug text-zinc-800 dark:text-zinc-100">
                      {day.title}
                    </p>
                  </div>
                </div>
              </>
            )

            if (onSelectDay) {
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => onSelectDay(day)}
                  className="relative block w-full rounded-xl text-left transition-colors hover:bg-sky-50/50 active:bg-sky-50/70 dark:hover:bg-sky-950/25"
                  style={{ height: FLOW_ROW_H }}
                  aria-label={`${day.homeDateLabel}: ${day.title}`}
                >
                  {rowInner}
                </button>
              )
            }

            return (
              <div key={day.id} className="relative w-full" style={{ height: FLOW_ROW_H }}>
                {rowInner}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Me home — grid + bubbles; tap bubble/cell → linear curved timeline only */
export function MeActivityDiaryPreview({
  days,
  onOpenDiary,
  onOpenDay,
  gridCells = 35,
  className,
}: {
  days: ActivityTimelineDay[]
  onOpenDiary: () => void
  /** Tap a day block / bubble → open linear timeline (level 2) */
  onOpenDay: (day: ActivityTimelineDay) => void
  gridCells?: number
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div>
          <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">Daily diary</p>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Tap a bubble for the day list</p>
        </div>
        <button
          type="button"
          onClick={onOpenDiary}
          className="shrink-0 text-[11px] font-medium text-mind hover:underline"
        >
          See all
        </button>
      </div>
      <MeTimelineHeatmapGrid
        days={days}
        cellCount={gridCells}
        sequentialTitles
        size="sm"
        onSelectDay={onOpenDay}
        className=""
      />
    </div>
  )
}

/** Embedded diary grid — lives inside Me settings card on web */
export function MeDiaryTimelineEmbed({
  days,
  onOpenDiary,
  onOpenDay,
  gridCells = 35,
  size = "sm",
  className,
}: {
  days: ActivityTimelineDay[]
  onOpenDiary: () => void
  onOpenDay: (day: ActivityTimelineDay) => void
  gridCells?: number
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <MeTimelineHeatmapGrid
        days={days}
        cellCount={gridCells}
        sequentialTitles
        embed
        size={size}
        onSelectDay={onOpenDay}
      />
      <div className="flex items-center justify-between px-1 pt-0.5">
        <p className="text-[11px] text-zinc-400">Titles cycle · tap a square for detail</p>
        <button
          type="button"
          onClick={onOpenDiary}
          className="text-[12px] font-semibold text-sky-600 transition-colors hover:text-sky-700"
        >
          See all
        </button>
      </div>
    </div>
  )
}

/** Web Me — left column: diary timeline always visible */
export function MeDiaryTimelinePanel({
  days,
  onOpenDiary,
  onOpenDay,
  gridCells = 35,
  className,
}: {
  days: ActivityTimelineDay[]
  onOpenDiary: () => void
  onOpenDay: (day: ActivityTimelineDay) => void
  gridCells?: number
  className?: string
}) {
  const latest = days[0]

  return (
    <section
      className={cn(
        "rounded-2xl bg-white p-5 shadow-sm shadow-sky-100/30 ring-1 ring-black/[0.04]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[16px] font-semibold text-zinc-900">Daily diary</h2>
          <p className="mt-1 text-[13px] leading-snug text-zinc-500">
            {latest
              ? `${latest.homeDateLabel} · ${latest.title}`
              : "Your capture activity over time"}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenDiary}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-mind transition-colors hover:bg-sky-50"
        >
          See all
        </button>
      </div>

      <div className="mt-5">
        <MeTimelineHeatmapGrid
          days={days}
          cellCount={gridCells}
          sequentialTitles
          embed
          fullWidth
          size="sm"
          onSelectDay={onOpenDay}
        />
      </div>

      <p className="mt-4 text-[11px] leading-relaxed text-zinc-400">
        Titles cycle on highlighted days · tap a square to open that day&apos;s timeline
      </p>
    </section>
  )
}

/** Web Me — timeline card */
export function MeCaptureDiaryWebCard({
  days,
  onOpenDiary,
  onOpenDay,
  gridCells = 42,
  className,
}: {
  days: ActivityTimelineDay[]
  onOpenDiary: () => void
  onOpenDay: (day: ActivityTimelineDay) => void
  gridCells?: number
  className?: string
}) {
  return (
    <section
      className={cn(
        "rounded-2xl bg-white p-4 dark:bg-zinc-900",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-zinc-800 dark:text-zinc-100">Daily diary</h2>
          <p className="mt-0.5 text-[12px] text-zinc-500">Grid timeline — titles cycle day by day</p>
        </div>
        <button
          type="button"
          onClick={onOpenDiary}
          className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold text-sky-600 hover:bg-sky-50/80"
        >
          See all
        </button>
      </div>
      <div className="mt-4">
        <MeTimelineHeatmapGrid
          days={days}
          cellCount={gridCells}
          sequentialTitles
          size="sm"
          onSelectDay={onOpenDay}
        />
      </div>
    </section>
  )
}

function TimelineRail({
  year,
  count,
  monthGroups,
  selectedId,
  onSelect,
}: {
  year: number
  count: number
  monthGroups: ReturnType<typeof groupTimelineByMonth>
  selectedId: string
  onSelect: (day: ActivityTimelineDay) => void
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 shrink-0 flex-col",
        "w-[34%] min-w-[112px] max-w-[148px] sm:w-[38%] sm:min-w-[128px] sm:max-w-[168px]",
        "border-r border-stone-200/90 bg-stone-50/80 dark:border-zinc-800 dark:bg-zinc-950/80"
      )}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200/80 px-3 py-2.5 dark:border-zinc-800">
        <span className="text-[13px] font-bold tabular-nums text-zinc-900 dark:text-zinc-100">{year}</span>
        <span className="rounded-full bg-stone-200/90 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {count}
        </span>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {monthGroups.map((group) => (
          <div key={group.monthKey} className="mb-3 last:mb-0">
            <div className="mb-1.5 flex items-center gap-1.5 px-1">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-mind" aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                {group.monthLabel}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 px-0.5">
              {group.days.map((day) => {
                const selected = day.id === selectedId
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => onSelect(day)}
                    className={cn(
                      "aspect-square rounded-[4px] transition-all duration-200",
                      activityHeatmapCellClass(day.activity),
                      selected ? "scale-105 !bg-mind/42" : "hover:opacity-90"
                    )}
                    title={`${day.dateLabel} · ${day.title}`}
                    aria-label={day.title}
                    aria-current={selected ? "date" : undefined}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DayDetailPanel({
  day,
  uploads,
  displayName = "You",
  onShare,
  onSuggestedPrompt,
  webLayout = false,
}: {
  day: ActivityTimelineDay
  uploads: { id: string; title: string; time: string; source: string }[]
  displayName?: string
  onShare?: () => void
  onSuggestedPrompt?: (prompt: string) => void
  webLayout?: boolean
}) {
  const brief = useMemo(
    () =>
      buildDayTimelineBrief({
        displayName,
        weekdayLabel: day.weekdayLabel,
        dateLabel: formatFullDate(day.isoDate),
        summary: day.summary,
        timeRange: day.timeRange,
        location: day.location,
        uploads,
      }),
    [displayName, day, uploads]
  )

  return (
    <div
      className={cn(
        "scrollbar-hide min-h-0 flex-1 overflow-y-auto",
        webLayout ? "bg-white/40 dark:bg-zinc-950" : "bg-white dark:bg-zinc-950"
      )}
    >
      <article className={cn(webLayout ? "px-5 py-4" : "px-3 py-3 pb-6 sm:px-4 sm:py-4 sm:pb-8")}>
        {day.photoCount > 0 ? (
          <div
            className={cn(
              "mb-5 flex items-center gap-3 overflow-hidden rounded-2xl border border-stone-200/80 px-3 py-3",
              "bg-[#0a1530] text-white",
              "dark:border-zinc-800"
            )}
          >
            <HubItemThumb
              kind={hubItemKindFromLabel("Note", day.title)}
              size="lg"
              className="h-14 w-14 shrink-0 rounded-xl ring-1 ring-stone-200/70 dark:ring-zinc-700"
            />
            {day.thumbImages.length > 1 ? (
              <div className="flex -space-x-2" aria-hidden>
                {day.thumbImages.slice(1, 3).map((src, i) => (
                  <span
                    key={`${day.id}-thumb-${i}`}
                    className="block h-10 w-10 rounded-lg bg-cover bg-center ring-2 ring-white dark:ring-zinc-900"
                    style={{ backgroundImage: `url(${src})` }}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <DailyBriefView content={brief} onSuggestedPrompt={onSuggestedPrompt} />

        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className={cn(
              "mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-white",
              "rounded-lg bg-mind text-white hover:bg-[#4534b3] active:bg-[#3a2a99] shadow-sm shadow-[rgba(86,69,212,0.25)]",
              "focus-visible:ring-2 focus-visible:ring-mind/35 focus-visible:ring-offset-2"
            )}
          >
            <Share2 className="h-4 w-4" strokeWidth={2} aria-hidden />
            Share this day
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </article>
    </div>
  )
}

export function MeActivityTimeline({
  days,
  initialDate,
  initialActivity,
  onClose,
  onShare,
  onSuggestedPrompt,
  displayName = "You",
  webLayout = false,
  listFirst = false,
  getUploads,
}: MeActivityTimelineProps) {
  const timelineDays = useMemo(() => {
    if (!days.some((d) => d.isoDate === initialDate)) {
      return [buildActivityTimelineDay(initialDate, initialActivity), ...days].sort((a, b) =>
        b.isoDate.localeCompare(a.isoDate)
      )
    }
    return days
  }, [days, initialDate, initialActivity])

  const monthGroups = useMemo(() => groupTimelineByMonth(timelineDays), [timelineDays])

  const resolveDay = (iso: string, activity: number) =>
    timelineDays.find((d) => d.isoDate === iso) ?? buildActivityTimelineDay(iso, activity)

  const [selected, setSelected] = useState<ActivityTimelineDay>(() =>
    resolveDay(initialDate, initialActivity)
  )

  const [mobilePhase, setMobilePhase] = useState<"list" | "detail">(listFirst ? "list" : "detail")

  useEffect(() => {
    setSelected(resolveDay(initialDate, initialActivity))
    if (listFirst) {
      setMobilePhase("list")
    }
  }, [initialDate, initialActivity, timelineDays, listFirst])

  const year = new Date(selected.isoDate + "T12:00:00").getFullYear()
  const uploads = getUploads?.(selected.isoDate, selected.activity) ?? []

  const showListOnly = listFirst && mobilePhase === "list"
  const showCompactRail = mobilePhase === "detail" && !webLayout && !listFirst

  const header = (
    <header
      className={cn(
        "flex shrink-0 items-center gap-2 border-b border-stone-100/85 bg-white px-3 py-3",
        "dark:border-zinc-800 dark:bg-zinc-900",
        webLayout && "px-4"
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (showListOnly) {
            onClose()
          } else if (listFirst) {
            setMobilePhase("list")
          } else {
            onClose()
          }
        }}
        className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
        aria-label={showListOnly ? "Close" : "Back"}
      >
        <ChevronRight className="h-6 w-6 rotate-180 text-zinc-600 dark:text-zinc-300" />
      </button>
      <h1 className="min-w-0 flex-1 truncate text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">
        {showListOnly ? "Daily diary" : formatFullDate(selected.isoDate)}
      </h1>
      <div className="w-8 shrink-0" aria-hidden />
    </header>
  )

  return (
    <div
      className={cn(
        "absolute inset-0 z-[60] flex flex-col",
        webLayout
          ? cn("animate-in fade-in duration-150", web.canvas)
          : cn("animate-in slide-in-from-right duration-200", "bg-[#fafaf9] dark:bg-zinc-950")
      )}
    >
      {header}
      {showListOnly ? (
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <p className="mb-3 text-[12px] text-zinc-500 dark:text-zinc-400">
            Your capture diary — tap a day for detail.
          </p>
          <MeTimelineVerticalDayList
            days={timelineDays}
            onSelectDay={(day) => {
              setSelected(day)
              setMobilePhase("detail")
            }}
          />
        </div>
      ) : (
        <div className={cn("flex min-h-0 flex-1", webLayout && "gap-0 p-2")}>
          <div
            className={cn(
              "flex min-h-0 min-w-0 flex-1 overflow-hidden",
              webLayout && "rounded-2xl bg-white/90"
            )}
          >
            {webLayout || showCompactRail ? (
              <TimelineRail
                year={year}
                count={timelineDays.length}
                monthGroups={monthGroups}
                selectedId={selected.id}
                onSelect={setSelected}
              />
            ) : null}
            <DayDetailPanel
              day={selected}
              uploads={uploads}
              displayName={displayName}
              onShare={onShare ? () => onShare(selected) : undefined}
              onSuggestedPrompt={onSuggestedPrompt}
              webLayout={webLayout}
            />
          </div>
        </div>
      )}
    </div>
  )
}
