"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { ArrowRight, ChevronRight, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx, mxHeatmapCell, mxHeatmapCellTiny } from "@/lib/medrix-design-tokens"
import {
  buildActivityTimelineDay,
  groupTimelineByMonth,
  groupTimelineByYear,
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
  onOutputFileClick?: (file: { id: string; title: string; kindLabel: string }) => void
  displayName?: string
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
  compact = false,
}: {
  day: ActivityTimelineDay
  activeIdx: number
  compact?: boolean
}) {
  return (
    <div
      key={`bubble-${day.id}-${activeIdx}`}
      className={cn(
        "pointer-events-none absolute bottom-full left-1/2 z-30 flex w-max -translate-x-1/2 flex-col items-center",
        compact ? "mb-1 max-w-[min(140px,62vw)]" : "mb-1.5 max-w-[min(188px,68vw)]"
      )}
    >
      <div className="animate-[me-timeline-bubble-float_3s_ease-in-out_infinite]">
        <div
          className={cn(
            "relative overflow-hidden",
            compact ? "rounded-[0.85rem] px-2.5 py-1.5" : "rounded-[1.1rem] px-3.5 py-2",
            "border border-sky-200/70 bg-white/95 shadow-[0_10px_32px_-8px_rgba(56,189,248,0.45),0_4px_14px_rgba(15,23,42,0.08)]",
            "backdrop-blur-md dark:border-sky-500/25 dark:bg-zinc-900/92 dark:shadow-[0_12px_36px_-10px_rgba(56,189,248,0.35)]",
            "animate-[me-timeline-title-bubble_2.8s_cubic-bezier(0.22,1,0.36,1)_forwards]"
          )}
        >
        <span
          className={cn(
            "pointer-events-none absolute rounded-full bg-sky-300/25 blur-md",
            compact ? "-left-2 -top-2 h-7 w-7" : "-left-3 -top-3 h-10 w-10"
          )}
          aria-hidden
        />
        <span
          className={cn(
            "pointer-events-none absolute rounded-full bg-teal-300/20 blur-md",
            compact ? "-right-1 bottom-0 h-5 w-5" : "-right-2 bottom-0 h-8 w-8"
          )}
          aria-hidden
        />
        <span
          className={cn(
            "absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/80 to-transparent",
            compact && "inset-x-2"
          )}
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
            "relative mt-0.5 line-clamp-2 text-center font-semibold leading-[1.35] text-zinc-800 dark:text-zinc-50",
            compact ? "text-[9px]" : "text-[11px]"
          )}
        >
          {day.title}
        </p>
        </div>
      </div>
      <span
        className={cn(
          "relative -mt-px flex items-center justify-center",
          compact ? "h-2 w-2" : "h-2.5 w-2.5"
        )}
        aria-hidden
      >
        <span
          className={cn(
            "absolute rotate-45 rounded-[2px] border border-sky-200/80 bg-white/95 shadow-sm dark:border-sky-500/30 dark:bg-zinc-900/95",
            compact ? "h-2 w-2" : "h-2.5 w-2.5"
          )}
        />
        <span className="h-1 w-1 rounded-full bg-sky-400/80 blur-[1px]" />
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
  showTitleBubbles = true,
  bare = false,
  size = "md",
  selectedDayId,
  onFlowActiveDayChange,
  squareGrid = false,
  className,
}: {
  days: ActivityTimelineDay[]
  cellCount?: number
  cols?: number
  onSelectDay?: (day: ActivityTimelineDay) => void
  sequentialTitles?: boolean
  /** Floating title bubbles on grid cells — off when summary strip is shown above */
  showTitleBubbles?: boolean
  /** Skip outer card chrome when nested inside MeActivityFlowCard */
  bare?: boolean
  size?: "md" | "lg" | "compact" | "xs" | "xxs" | "micro"
  /** Highlights the cell for this day id */
  selectedDayId?: string
  /** Fired when sequential bubble cycle advances to a new day */
  onFlowActiveDayChange?: (day: ActivityTimelineDay) => void
  /** Force equal rows/cols so the full heatmap reads as a square */
  squareGrid?: boolean
  className?: string
}) {
  const effectiveCellCount = squareGrid ? cols * cols : cellCount
  const gridDays = useMemo(
    () => [...days.slice(0, effectiveCellCount)].reverse(),
    [days, effectiveCellCount]
  )
  const contentRows = Math.max(1, Math.ceil(gridDays.length / cols))

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
  const flowActiveDay = activeGridIndex >= 0 ? gridDays[activeGridIndex] ?? null : null

  useEffect(() => {
    if (sequentialTitles && flowActiveDay && onFlowActiveDayChange) {
      onFlowActiveDayChange(flowActiveDay)
    }
  }, [sequentialTitles, flowActiveDay, onFlowActiveDayChange])

  const cellPx =
    size === "lg"
      ? "min-h-[32px]"
      : size === "compact"
        ? "min-h-[18px]"
        : size === "xs"
          ? "min-h-[10px]"
          : size === "xxs" || size === "micro"
            ? ""
            : "min-h-[26px]"
  const gridGap =
    size === "micro"
      ? "gap-px"
      : size === "xxs"
        ? "gap-[1.5px]"
        : size === "xs"
          ? "gap-[2px]"
          : size === "compact"
            ? "gap-[3px]"
            : "gap-[5px]"
  const cellRadius =
    size === "micro"
      ? "rounded-[1px]"
      : size === "xxs" || size === "xs"
        ? "rounded-[2px]"
        : size === "compact"
          ? "rounded-[4px]"
          : "rounded-[5px]"
  const isDense = size === "compact" || size === "xs" || size === "xxs" || size === "micro"

  return (
    <div
      className={cn(
        !bare && mx.elevatedCard,
        "relative overflow-visible",
        !bare &&
          (sequentialTitles
            ? size === "compact" || size === "xs" || size === "xxs" || size === "micro"
              ? "px-2 pb-2 pt-1.5"
              : "px-3 pb-3 pt-2"
            : size === "compact" || size === "xs" || size === "xxs" || size === "micro"
              ? "p-2"
              : "p-3"),
        bare && "p-0",
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute rounded-full bg-mind/10 blur-2xl",
          isDense ? "-right-4 top-0 h-16 w-16" : "-right-6 top-0 h-24 w-24"
        )}
        aria-hidden
      />
      <div
        className={cn("relative", squareGrid && "aspect-square w-full")}
        style={squareGrid ? { aspectRatio: `${cols} / ${contentRows}` } : undefined}
      >
      <div
        className={cn(
          "relative grid overflow-visible",
          squareGrid && "h-full w-full",
          gridGap
        )}
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          ...(squareGrid ? { gridTemplateRows: `repeat(${contentRows}, minmax(0, 1fr))` } : {}),
        }}
      >
        {gridDays.map((day, i) => {
          const canBubble = sequentialTitles && isBubbleEligibleIndex(i, cols)
          const isAutoActive = canBubble && i === activeGridIndex
          const isSelected = selectedDayId != null && day.id === selectedDayId
          const cellShapeClass = squareGrid ? "h-full w-full min-h-0 min-w-0" : "aspect-square w-full"
          const blockClass = cn(
            (size === "xxs" || size === "micro" ? mxHeatmapCellTiny : mxHeatmapCell)(day.activity),
            cellShapeClass,
            (size === "xxs" || size === "micro") && "min-w-0",
            "transition-all duration-200",
            cellRadius,
            cellPx,
            isSelected &&
              cn(
                "relative z-[2] ring-2 ring-zinc-500/80 ring-offset-1 ring-offset-white dark:ring-zinc-400 dark:ring-offset-zinc-900",
                isDense && "ring-1 ring-offset-[0.5px]",
                size === "micro" && "ring-1"
              ),
            isAutoActive &&
              !isSelected &&
              cn(
                "relative z-[2] animate-[me-timeline-cell-pop_0.75s_ease-out] ring-2 ring-sky-300/60 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900",
                isDense && "ring-1 ring-offset-[0.5px]"
              )
          )
          const glow =
            isAutoActive && !isSelected ? (
              <span
                className={cn(
                  "pointer-events-none absolute inset-0 ring-1 ring-mind/30 animate-[me-timeline-cell-glow_2.8s_ease-in-out_infinite]",
                  cellRadius
                )}
                aria-hidden
              />
            ) : null

          const cellBody = (
            <div className={cn("relative", squareGrid ? "h-full w-full" : "aspect-square w-full")}>
              <div className={cn("h-full w-full", blockClass)}>{glow}</div>
              {isAutoActive && !isSelected && showTitleBubbles ? (
                <TimelineTitleBubble
                  day={day}
                  activeIdx={activeSlot}
                  compact={isDense}
                />
              ) : null}
            </div>
          )

          if (onSelectDay) {
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => onSelectDay(day)}
                className={cn(
                  "relative w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-mind/50",
                  squareGrid && "h-full min-h-0",
                  cellRadius
                )}
                aria-label={`${day.homeDateLabel}: ${day.title}`}
              >
                {cellBody}
              </button>
            )
          }

          return (
            <div key={day.id} className={cn("relative w-full", squareGrid && "h-full min-h-0")}>
              {cellBody}
            </div>
          )
        })}
      </div>
      </div>
    </div>
  )
}

const FLOW_ROW_H = 56
const FLOW_CANVAS_W = 320
/** Fixed left spine — straight vertical line */
const STRAIGHT_SPINE_X = 28

type FlowPoint = { x: number; y: number }

function buildStraightSpinePoints(count: number): FlowPoint[] {
  if (count <= 0) return []
  return Array.from({ length: count }, (_, i) => ({
    x: STRAIGHT_SPINE_X,
    y: FLOW_ROW_H / 2 + i * FLOW_ROW_H,
  }))
}

function buildStraightSpinePath(count: number): string {
  if (count <= 0) return ""
  const points = buildStraightSpinePoints(count)
  if (points.length === 1) {
    const p = points[0]
    return `M ${p.x} ${p.y} L ${p.x} ${p.y + 10}`
  }
  const first = points[0]
  const last = points[points.length - 1]
  return `M ${first.x} ${first.y} L ${last.x} ${last.y}`
}

const DOT_LABEL_GAP = 14

function spineDotLeftPercent(x: number) {
  return `${(x / FLOW_CANVAS_W) * 100}%`
}

function TimelineStraightNode({
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
          "absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-200/80 dark:bg-zinc-700/55",
          prominent ? "h-[18px] w-[18px]" : "h-[14px] w-[14px]"
        )}
      />
      <span
        className={cn(
          "absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-400 ring-[2px] ring-white dark:bg-zinc-500 dark:ring-zinc-900",
          prominent ? "h-2.5 w-2.5" : "h-2 w-2"
        )}
      />
    </span>
  )
}

export type TimelineListItem = {
  id: string
  dateLabel: string
  title: string
}

/** Vertical straight-spine timeline — shared by day / month / year views */
export function MeTimelineVerticalList({
  items,
  selectedId,
  onSelectItem,
  className,
}: {
  items: TimelineListItem[]
  selectedId?: string
  onSelectItem?: (item: TimelineListItem) => void
  className?: string
}) {
  const points = useMemo(() => buildStraightSpinePoints(items.length), [items.length])
  const spinePath = useMemo(() => buildStraightSpinePath(items.length), [items.length])
  const canvasH = items.length * FLOW_ROW_H

  return (
    <div className={cn("relative overflow-visible", className)}>
      <div className="relative w-full">
        <svg
          className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full"
          style={{ height: canvasH }}
          viewBox={`0 0 ${FLOW_CANVAS_W} ${canvasH}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          {items.length > 1 ? (
            <path
              d={spinePath}
              fill="none"
              stroke="rgb(161 161 170 / 0.45)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="dark:stroke-zinc-600/55"
            />
          ) : null}
        </svg>

        <div className="relative z-[1]">
          {items.map((item, i) => {
            const p = points[i]
            if (!p) return null
            const isSelected = selectedId === item.id
            const dotLeft = spineDotLeftPercent(p.x)
            const labelStart = `calc(${dotLeft} + ${DOT_LABEL_GAP}px)`

            const rowInner = (
              <>
                <TimelineStraightNode prominent={isSelected} style={{ left: dotLeft }} />
                <div
                  className="pointer-events-none absolute top-1/2 flex min-w-0 -translate-y-1/2 items-center gap-2 pr-1 text-left"
                  style={{ left: labelStart, right: 0 }}
                >
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block text-[10px] font-medium tabular-nums",
                        isSelected ? "text-mind dark:text-mind/80" : "text-zinc-400 dark:text-zinc-500"
                      )}
                    >
                      {item.dateLabel}
                    </span>
                    <p
                      className={cn(
                        "mt-0.5 line-clamp-2 text-[12px] font-semibold leading-snug",
                        isSelected ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-700 dark:text-zinc-200"
                      )}
                    >
                      {item.title}
                    </p>
                  </div>
                  {onSelectItem ? (
                    <ChevronRight
                      className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  ) : null}
                </div>
              </>
            )

            if (onSelectItem) {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectItem(item)}
                  className={cn(
                    "relative block w-full rounded-lg text-left transition-colors",
                    isSelected
                      ? "bg-stone-100/95 dark:bg-zinc-800/70"
                      : "hover:bg-stone-50/80 active:bg-stone-100/80 dark:hover:bg-zinc-900/40"
                  )}
                  style={{ height: FLOW_ROW_H }}
                  aria-label={`${item.dateLabel}: ${item.title}`}
                  aria-current={isSelected ? "true" : undefined}
                >
                  {rowInner}
                </button>
              )
            }

            return (
              <div key={item.id} className="relative w-full" style={{ height: FLOW_ROW_H }}>
                {rowInner}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** Level 2 — straight spine with per-row nodes aligned to day titles */
export function MeTimelineVerticalDayList({
  days,
  selectedId,
  onSelectDay,
  className,
}: {
  days: ActivityTimelineDay[]
  selectedId?: string
  onSelectDay?: (day: ActivityTimelineDay) => void
  className?: string
}) {
  const items = useMemo<TimelineListItem[]>(
    () =>
      days.map((day) => ({
        id: day.id,
        dateLabel: day.homeDateLabel,
        title: day.title,
      })),
    [days]
  )

  return (
    <MeTimelineVerticalList
      items={items}
      selectedId={selectedId}
      className={className}
      onSelectItem={
        onSelectDay
          ? (item) => {
              const day = days.find((d) => d.id === item.id)
              if (day) onSelectDay(day)
            }
          : undefined
      }
    />
  )
}

type TimelineGranularity = "day" | "month" | "year"

function TimelineGranularityTabs({
  value,
  onChange,
}: {
  value: TimelineGranularity
  onChange: (next: TimelineGranularity) => void
}) {
  return (
    <div className="mb-3 flex rounded-lg bg-stone-100/90 p-0.5 dark:bg-zinc-800/80">
      {(
        [
          { id: "day" as const, label: "Daily" },
          { id: "month" as const, label: "Monthly" },
          { id: "year" as const, label: "Yearly" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "flex-1 rounded-md py-1.5 text-[12px] font-medium transition-colors",
            value === tab.id
              ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
              : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

function MeTimelineMonthList({
  monthGroups,
  selectedMonthKey,
  onSelectMonth,
  className,
}: {
  monthGroups: ReturnType<typeof groupTimelineByMonth>
  selectedMonthKey?: string
  onSelectMonth: (monthKey: string) => void
  className?: string
}) {
  const items = useMemo<TimelineListItem[]>(
    () =>
      monthGroups.map((group) => ({
        id: group.monthKey,
        dateLabel: group.monthLabel,
        title:
          group.days.length === 1
            ? "1 active day"
            : `${group.days.length} active days`,
      })),
    [monthGroups]
  )

  return (
    <MeTimelineVerticalList
      items={items}
      selectedId={selectedMonthKey}
      className={className}
      onSelectItem={(item) => onSelectMonth(item.id)}
    />
  )
}

function MeTimelineYearList({
  yearGroups,
  selectedYear,
  onSelectYear,
  className,
}: {
  yearGroups: ReturnType<typeof groupTimelineByYear>
  selectedYear?: number
  onSelectYear: (year: number) => void
  className?: string
}) {
  const items = useMemo<TimelineListItem[]>(
    () =>
      yearGroups.map((group) => {
        const monthCount = groupTimelineByMonth(group.days).length
        return {
          id: String(group.year),
          dateLabel: String(group.year),
          title: `${group.days.length} active days · ${monthCount} month${monthCount === 1 ? "" : "s"}`,
        }
      }),
    [yearGroups]
  )

  return (
    <MeTimelineVerticalList
      items={items}
      selectedId={selectedYear != null ? String(selectedYear) : undefined}
      className={className}
      onSelectItem={(item) => onSelectYear(Number(item.id))}
    />
  )
}

function buildMonthNarrative(days: ActivityTimelineDay[]) {
  if (days.length === 0) return "No active days recorded this month."
  const highlights = days
    .slice(0, 4)
    .map((d) => d.title)
    .join(" · ")
  return `${days.length} active day${days.length === 1 ? "" : "s"} this month. Through-line: ${highlights}${days.length > 4 ? "…" : "."}`
}

function buildYearNarrative(days: ActivityTimelineDay[], year: number) {
  const months = groupTimelineByMonth(days).length
  if (days.length === 0) return `No captures logged in ${year}.`
  return `${year} spans ${months} active month${months === 1 ? "" : "s"} and ${days.length} logged day${days.length === 1 ? "" : "s"}. Your timeline stayed in motion—review monthly slices for the full arc.`
}

function PeriodDetailPanel({
  title,
  subtitle,
  body,
  stats,
  drillLabel,
  onDrill,
}: {
  title: string
  subtitle: string
  body: string
  stats: { label: string; value: string }[]
  drillLabel?: string
  onDrill?: () => void
}) {
  return (
    <div
      className={cn(
        "scrollbar-hide min-h-0 flex-1 overflow-y-auto",
        "bg-white dark:bg-zinc-950"
      )}
    >
      <article className={cn("px-4 py-4 pb-8")}>
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{subtitle}</p>
        <h2 className="mt-1 text-[20px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-xl border border-stone-100 bg-stone-50/80 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{s.label}</p>
              <p className="mt-0.5 text-[15px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{s.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-[14px] leading-[1.72] text-zinc-600 dark:text-zinc-300">{body}</p>
        {drillLabel && onDrill ? (
          <button
            type="button"
            onClick={onDrill}
            className={cn(
              "mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-white",
              mx.brandCta,
              mx.brandFocusRing
            )}
          >
            {drillLabel}
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </article>
    </div>
  )
}

function MonthDetailPanel({
  monthKey,
  monthLabel,
  days,
  onDrillToDays,
}: {
  monthKey: string
  monthLabel: string
  days: ActivityTimelineDay[]
  onDrillToDays: () => void
}) {
  const totalActivity = days.reduce((sum, d) => sum + d.activity, 0)
  return (
    <PeriodDetailPanel
      title={monthLabel}
      subtitle="Monthly overview"
      body={buildMonthNarrative(days)}
      stats={[
        { label: "Active days", value: String(days.length) },
        { label: "Activity level", value: String(totalActivity) },
      ]}
      drillLabel="View daily timeline"
      onDrill={onDrillToDays}
     
    />
  )
}

function YearDetailPanel({
  year,
  days,
  onDrillToMonths,
}: {
  year: number
  days: ActivityTimelineDay[]
  onDrillToMonths: () => void
}) {
  const months = groupTimelineByMonth(days).length
  return (
    <PeriodDetailPanel
      title={String(year)}
      subtitle="Yearly overview"
      body={buildYearNarrative(days, year)}
      stats={[
        { label: "Active days", value: String(days.length) },
        { label: "Active months", value: String(months) },
      ]}
      drillLabel="View monthly timeline"
      onDrill={onDrillToMonths}
     
    />
  )
}

/** Summary strip above the heatmap — reflects the flowing or selected day */
function ActivityDaySummaryStrip({
  day,
  onOpen,
  className,
  flat = false,
}: {
  day: ActivityTimelineDay
  onOpen?: () => void
  className?: string
  flat?: boolean
}) {
  const body = (
    <div
      key={day.id}
      className="animate-[me-timeline-summary-in_0.55s_cubic-bezier(0.22,1,0.36,1)_forwards]"
    >
      <p className="text-[10px] font-medium tabular-nums uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
        {day.homeDateLabel}
        {day.activity <= 0 ? " · Quiet day" : null}
      </p>
      <p className="mt-1 line-clamp-1 text-[13px] font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
        {day.title}
      </p>
      <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        {day.previewLine}
      </p>
    </div>
  )

  const shellClass = cn(
    !flat && mx.elevatedCard,
    flat && "rounded-xl bg-stone-50/80 dark:bg-zinc-900/40",
    "px-3 py-2.5 transition-colors",
    onOpen && "hover:border-[#E9ECEF] dark:hover:border-zinc-600",
    className
  )

  if (onOpen) {
    return (
      <button type="button" onClick={onOpen} className={cn(shellClass, "w-full text-left")}>
        {body}
      </button>
    )
  }

  return <div className={shellClass}>{body}</div>
}

function pickDefaultGridDay(days: ActivityTimelineDay[], cellCount: number) {
  const gridDays = [...days.slice(0, cellCount)].reverse()
  if (gridDays.length === 0) return days[0] ?? null
  const todayIso = new Date().toISOString().slice(0, 10)
  return (
    gridDays.find((d) => d.isoDate === todayIso) ??
    [...gridDays].reverse().find((d) => d.activity > 0) ??
    gridDays[gridDays.length - 1]
  )
}

/** Me home — square heatmap density (cols × cols cells) */
export const ME_ACTIVITY_SQUARE_COLS = 12

/** Me home — unified activity card: email, flowing summary, heatmap grid */
export function MeActivityFlowCard({
  days,
  onOpenDiary,
  onOpenDay,
  gridCols = ME_ACTIVITY_SQUARE_COLS,
  className,
}: {
  days: ActivityTimelineDay[]
  onOpenDiary: () => void
  onOpenDay: (day: ActivityTimelineDay) => void
  /** Square grid side length — total cells = gridCols² */
  gridCols?: number
  className?: string
}) {
  const gridCells = gridCols * gridCols
  const defaultDay = pickDefaultGridDay(days, gridCells) ?? days[0]
  const [flowDay, setFlowDay] = useState<ActivityTimelineDay>(defaultDay)

  const displayDay = flowDay

  const shellClass = cn(mx.elevatedCard, "overflow-hidden", className)

  return (
    <section className={shellClass}>
      <div className="flex items-start justify-between gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="min-w-0">
          <p className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200">Activity</p>
        </div>
        <button
          type="button"
          onClick={onOpenDiary}
          className={cn(
            "shrink-0 font-medium text-mind hover:underline",
            "text-[11px]"
          )}
        >
          See all
        </button>
      </div>

      <div className="space-y-2 px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4">
        <ActivityDaySummaryStrip day={displayDay} flat onOpen={() => onOpenDay(displayDay)} />
        <MeTimelineHeatmapGrid
          days={days}
          cellCount={gridCells}
          cols={gridCols}
          size="micro"
          bare
          squareGrid
          sequentialTitles
          showTitleBubbles={false}
          selectedDayId={displayDay.id}
          onFlowActiveDayChange={setFlowDay}
          onSelectDay={onOpenDay}
        />
      </div>
    </section>
  )
}

/** @deprecated Use MeActivityFlowCard */
export function MeActivityDiaryPreview({
  days,
  onOpenDiary,
  onOpenDay,
  gridCols = ME_ACTIVITY_SQUARE_COLS,
  className,
}: {
  days: ActivityTimelineDay[]
  onOpenDiary: () => void
  onOpenDay: (day: ActivityTimelineDay) => void
  gridCols?: number
  className?: string
}) {
  return (
    <MeActivityFlowCard
      days={days}
      onOpenDiary={onOpenDiary}
      onOpenDay={onOpenDay}
      gridCols={gridCols}
      className={className}
    />
  )
}

/** @deprecated Use MeActivityFlowCard */
export function MeCaptureDiaryWebCard({
  days,
  onOpenDiary,
  onOpenDay,
  gridCols = ME_ACTIVITY_SQUARE_COLS,
  className,
}: {
  days: ActivityTimelineDay[]
  onOpenDiary: () => void
  onOpenDay: (day: ActivityTimelineDay) => void
  gridCols?: number
  className?: string
}) {
  return (
    <MeActivityFlowCard
      days={days}
      onOpenDiary={onOpenDiary}
      onOpenDay={onOpenDay}
      gridCols={gridCols}
      className={className}
    />
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
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-stone-200/80 px-3 py-2 dark:border-zinc-800">
        <span className="text-[12px] font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">{year}</span>
        <span className="rounded-full bg-stone-200/90 px-1.5 py-0.5 text-[9px] font-semibold tabular-nums text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          {count}
        </span>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {monthGroups.map((group) => (
          <div key={group.monthKey} className="mb-3 last:mb-0">
            <div className="mb-1.5 flex items-center gap-1.5 px-1">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-400 dark:bg-zinc-500" aria-hidden />
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
                      mxHeatmapCell(day.activity),
                      selected
                        ? "ring-2 ring-zinc-500 ring-offset-1 ring-offset-stone-50 dark:ring-zinc-400 dark:ring-offset-zinc-950"
                        : "hover:opacity-90"
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
  onOutputFileClick,
}: {
  day: ActivityTimelineDay
  uploads: { id: string; title: string; time: string; source: string }[]
  displayName?: string
  onShare?: () => void
  onOutputFileClick?: (file: { id: string; title: string; kindLabel: string }) => void
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
        "bg-white dark:bg-zinc-950"
      )}
    >
      <article className={cn("px-3 py-3 pb-6 sm:px-4 sm:py-4 sm:pb-8")}>
        <DailyBriefView
          content={brief}
          onOutputFileClick={onOutputFileClick}
        />

        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className={cn(
              "mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold text-white",
              mx.brandCta,
              mx.brandFocusRing
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

type TimelineView = "browse" | "detail"

export function MeActivityTimeline({
  days,
  initialDate,
  initialActivity,
  onClose,
  onShare,
  onOutputFileClick,
  displayName = "You",
  listFirst: _listFirst = true,
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
  const yearGroups = useMemo(() => groupTimelineByYear(timelineDays), [timelineDays])

  const resolveDay = (iso: string, activity: number) =>
    timelineDays.find((d) => d.isoDate === iso) ?? buildActivityTimelineDay(iso, activity)

  const [view, setView] = useState<TimelineView>("browse")
  const [granularity, setGranularity] = useState<TimelineGranularity>("day")
  const [selectedDay, setSelectedDay] = useState<ActivityTimelineDay>(() =>
    resolveDay(initialDate, initialActivity)
  )
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(
    () => resolveDay(initialDate, initialActivity).monthKey
  )
  const [selectedYear, setSelectedYear] = useState<number>(() =>
    new Date(initialDate + "T12:00:00").getFullYear()
  )
  const [yearFilter, setYearFilter] = useState<number | null>(null)
  const [dayFilterMonthKey, setDayFilterMonthKey] = useState<string | null>(null)

  const filteredMonthGroups = useMemo(() => {
    if (yearFilter == null) return monthGroups
    return monthGroups.filter((g) => g.monthKey.startsWith(String(yearFilter)))
  }, [monthGroups, yearFilter])

  const visibleDays = useMemo(() => {
    if (dayFilterMonthKey) {
      return timelineDays.filter((d) => d.monthKey === dayFilterMonthKey)
    }
    return timelineDays
  }, [timelineDays, dayFilterMonthKey])

  const selectedMonthGroup = useMemo(
    () => monthGroups.find((g) => g.monthKey === selectedMonthKey) ?? filteredMonthGroups[0] ?? monthGroups[0],
    [monthGroups, filteredMonthGroups, selectedMonthKey]
  )

  const selectedYearGroup = useMemo(
    () => yearGroups.find((g) => g.year === selectedYear) ?? yearGroups[0],
    [yearGroups, selectedYear]
  )

  useEffect(() => {
    const day = resolveDay(initialDate, initialActivity)
    setSelectedDay(day)
    setSelectedMonthKey(day.monthKey)
    setSelectedYear(new Date(day.isoDate + "T12:00:00").getFullYear())
    setGranularity("day")
    setYearFilter(null)
    setDayFilterMonthKey(null)
    setView("browse")
  }, [initialDate, initialActivity, timelineDays])

  const uploads = getUploads?.(selectedDay.isoDate, selectedDay.activity) ?? []

  const headerTitle = "Activity"

  function handleBack() {
    if (view === "detail") {
      setView("browse")
      return
    }
    onClose()
  }

  function handleGranularityChange(next: TimelineGranularity) {
    setGranularity(next)
    setYearFilter(null)
    setDayFilterMonthKey(null)
    setView("browse")
    if (next === "day") {
      setSelectedDay(timelineDays[0] ?? selectedDay)
    } else if (next === "month") {
      setSelectedMonthKey(monthGroups[0]?.monthKey ?? selectedMonthKey)
    } else {
      setSelectedYear(yearGroups[0]?.year ?? selectedYear)
    }
  }

  function openDayDetail(day: ActivityTimelineDay) {
    setSelectedDay(day)
    setView("detail")
  }

  function openMonthDetail(monthKey: string) {
    setSelectedMonthKey(monthKey)
    setView("detail")
  }

  function openYearDetail(year: number) {
    setSelectedYear(year)
    setView("detail")
  }

  function drillToMonthDays(monthKey: string) {
    const daysInMonth = timelineDays.filter((d) => d.monthKey === monthKey)
    setDayFilterMonthKey(monthKey)
    setGranularity("day")
    setSelectedDay(daysInMonth[0] ?? selectedDay)
    setView("browse")
  }

  function drillToYearMonths(year: number) {
    const monthsInYear = monthGroups.filter((g) => g.monthKey.startsWith(String(year)))
    setYearFilter(year)
    setGranularity("month")
    setSelectedMonthKey(monthsInYear[0]?.monthKey ?? selectedMonthKey)
    setView("browse")
  }

  return (
    <div
      className={cn(
        "absolute inset-0 z-[60] flex flex-col",
        "animate-in slide-in-from-right duration-200",
        mx.pageBg
      )}
    >
      <header
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-stone-100/85 bg-white px-3 py-3",
          "dark:border-zinc-800 dark:bg-zinc-900",
                  )}
      >
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full p-1.5 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label={view === "detail" ? "Back to timeline" : "Close"}
        >
          <ChevronRight className="h-6 w-6 rotate-180 text-zinc-600 dark:text-zinc-300" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[17px] font-semibold text-zinc-900 dark:text-zinc-100">{headerTitle}</h1>
        </div>
        <div className="w-8 shrink-0" aria-hidden />
      </header>

      {view === "browse" ? (
        <>
          <div className="shrink-0 border-b border-stone-100/80 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900 sm:px-4">
            <TimelineGranularityTabs value={granularity} onChange={handleGranularityChange} />
          </div>

          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto bg-white px-3 py-3 dark:bg-zinc-950 sm:px-4">
            {granularity === "day" ? (
              <MeTimelineVerticalDayList
                days={visibleDays}
                selectedId={selectedDay.id}
                onSelectDay={openDayDetail}
              />
            ) : null}
            {granularity === "month" ? (
              <MeTimelineMonthList
                monthGroups={filteredMonthGroups}
                selectedMonthKey={selectedMonthKey}
                onSelectMonth={openMonthDetail}
              />
            ) : null}
            {granularity === "year" ? (
              <MeTimelineYearList
                yearGroups={yearGroups}
                selectedYear={selectedYear}
                onSelectYear={openYearDetail}
              />
            ) : null}
          </div>
        </>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col bg-white dark:bg-zinc-950">
          {granularity === "day" ? (
            <DayDetailPanel
              day={selectedDay}
              uploads={uploads}
              displayName={displayName}
              onShare={onShare ? () => onShare(selectedDay) : undefined}
              onOutputFileClick={onOutputFileClick}
            />
          ) : null}
          {granularity === "month" && selectedMonthGroup ? (
            <MonthDetailPanel
              monthKey={selectedMonthGroup.monthKey}
              monthLabel={selectedMonthGroup.monthLabel}
              days={selectedMonthGroup.days}
              onDrillToDays={() => drillToMonthDays(selectedMonthGroup.monthKey)}
            />
          ) : null}
          {granularity === "year" && selectedYearGroup ? (
            <YearDetailPanel
              year={selectedYearGroup.year}
              days={selectedYearGroup.days}
              onDrillToMonths={() => drillToYearMonths(selectedYearGroup.year)}
            />
          ) : null}
        </div>
      )}
    </div>
  )
}
