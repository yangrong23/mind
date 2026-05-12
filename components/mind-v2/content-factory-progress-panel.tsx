"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  ChevronLeft,
  MoreHorizontal,
  FilePlus2,
  Volume2,
  Video,
  Layers,
  HelpCircle,
  BarChart3,
  Presentation,
  Play,
} from "lucide-react"

export type FactoryJobStatus = "generating" | "complete" | "failed"

export interface FactoryJob {
  id: string
  kind: FactoryModalKind
  status: FactoryJobStatus
  title?: string
  meta?: string
}

const PASTEL_SHELLS = ["bg-[#fdece8]", "bg-[#fce8f4]", "bg-[#f3e8fc]"] as const

/** Demo history so the list matches reference screens before first completion. */
export const FACTORY_MEDIA_SEED: FactoryJob[] = [
  {
    id: "seed-1",
    kind: "video",
    status: "complete",
    title: "Digital degree: parsing a verification report",
    meta: "3 sources · 3 days ago",
  },
  {
    id: "seed-2",
    kind: "flashcards",
    status: "complete",
    title: "Degree verification flashcards",
    meta: "3 sources · 3 days ago",
  },
  {
    id: "seed-3",
    kind: "audio",
    status: "complete",
    title: "When a degree becomes code",
    meta: "2 sources · 5 days ago",
  },
  {
    id: "seed-4",
    kind: "quiz",
    status: "complete",
    title: "Quiz: report essentials",
    meta: "4 sources · 1 week ago",
  },
]

function iconForKind(kind: FactoryModalKind) {
  switch (kind) {
    case "report":
      return <FilePlus2 className="h-5 w-5" strokeWidth={1.75} />
    case "audio":
      return <Volume2 className="h-5 w-5" strokeWidth={1.75} />
    case "video":
      return <Video className="h-5 w-5" strokeWidth={1.75} />
    case "flashcards":
      return <Layers className="h-5 w-5" strokeWidth={1.75} />
    case "quiz":
      return <HelpCircle className="h-5 w-5" strokeWidth={1.75} />
    case "infographic":
      return <BarChart3 className="h-5 w-5" strokeWidth={1.75} />
    case "slides":
      return <Presentation className="h-5 w-5" strokeWidth={1.75} />
    default:
      return <FilePlus2 className="h-5 w-5" strokeWidth={1.75} />
  }
}

export function mockTitleForFactoryKind(kind: FactoryModalKind): string {
  switch (kind) {
    case "report":
      return "Library summary report"
    case "audio":
      return "Audio overview: key takeaways"
    case "video":
      return "Video brief: sources walkthrough"
    case "flashcards":
      return "Core concept flashcards"
    case "quiz":
      return "Practice quiz set"
    case "infographic":
      return "Key points infographic"
    case "slides":
      return "Slide deck draft"
    default:
      return "Studio output"
  }
}

interface ContentFactoryProgressPanelProps {
  open: boolean
  onBack: () => void
  libraryTitle: string
  /** User-triggered jobs (prepend newest). */
  userJobs: FactoryJob[]
  showQuotaBanner?: boolean
  onDismissQuotaBanner?: () => void
  /** When set, bottom snackbar is shown (job stays `failed` until retry). */
  toastFailedJobId: string | null
  onRetryJob: (jobId: string) => void
}

export function ContentFactoryProgressPanel({
  open,
  onBack,
  libraryTitle,
  userJobs,
  showQuotaBanner,
  onDismissQuotaBanner,
  toastFailedJobId,
  onRetryJob,
}: ContentFactoryProgressPanelProps) {
  if (!open) return null

  const generating = userJobs.filter((j) => j.status === "generating")
  const userComplete = userJobs.filter((j) => j.status === "complete")
  const completedMedia = [...userComplete, ...FACTORY_MEDIA_SEED]

  return (
    <div className="absolute inset-0 z-[71] flex flex-col bg-[#faf7f6]">
      <header className="flex shrink-0 items-center justify-between border-b border-stone-200/80 bg-[#faf7f6]/95 px-2 py-2 backdrop-blur-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-200/60"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6 text-zinc-800" />
        </button>
        <h1 className="min-w-0 flex-1 px-2 text-center text-[15px] font-semibold tracking-tight text-zinc-900 truncate">
          {libraryTitle}
        </h1>
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full hover:bg-stone-200/60"
          aria-label="More"
        >
          <MoreHorizontal className="h-5 w-5 text-zinc-600" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4">
        {showQuotaBanner ? (
          <div className="mb-4 rounded-2xl bg-[#ffe8dc] p-4 shadow-sm shadow-orange-950/5">
            <div className="flex gap-3">
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  mx.factoryTone.slides.well
                )}
              >
                <span className={cn(mx.factoryTone.slides.icon, "[&>svg]:h-5 [&>svg]:w-5")}>
                  <Presentation className="h-5 w-5" strokeWidth={1.75} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-zinc-900">Presentation</p>
                <p className="mt-1 text-[13px] leading-relaxed text-zinc-700">
                  You have reached the daily generation limit. Try again tomorrow or upgrade now.
                </p>
                <button
                  type="button"
                  className="mt-2 text-[13px] font-semibold text-violet-700 hover:text-violet-800"
                  onClick={onDismissQuotaBanner}
                >
                  Upgrade now
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {generating.length > 0 ? (
          <ul className="space-y-2.5">
            {generating.map((job, idx) => {
              const tc = mx.factoryTone[job.kind]
              const shell = PASTEL_SHELLS[idx % PASTEL_SHELLS.length]
              return (
                <li key={job.id} className={cn("flex items-center gap-3 rounded-2xl px-3.5 py-3.5 shadow-sm shadow-stone-900/[0.03]", shell)}>
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80", tc.icon)}>
                    {iconForKind(job.kind)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-medium text-zinc-900">Generating…</p>
                    <p className="mt-0.5 text-[13px] text-zinc-600">Check back in a few minutes.</p>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : null}

        <h2 className={cn("text-[13px] font-semibold uppercase tracking-wide text-zinc-500", generating.length ? "mt-6 mb-2" : "mb-2")}>
          Generated media
        </h2>
        <ul className="space-y-0 divide-y divide-stone-100">
          {completedMedia.map((job) => {
            const tc = mx.factoryTone[job.kind]
            const showPlay = job.id === "seed-3"
            return (
              <li key={job.id} className="flex items-start gap-3 py-3.5 first:pt-0">
                <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", tc.well)}>
                  <span className={cn(tc.icon, "[&>svg]:h-[1.15rem] [&>svg]:w-[1.15rem]")}>{iconForKind(job.kind)}</span>
                </div>
                <div className="min-w-0 flex-1 pr-2">
                  <p className="text-[15px] font-medium leading-snug text-zinc-900">{job.title}</p>
                  {job.meta ? <p className="mt-1 text-[12px] text-zinc-500">{job.meta}</p> : null}
                </div>
                {showPlay ? (
                  <button
                    type="button"
                    className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600 text-white shadow-md shadow-violet-900/20"
                    aria-label="Play"
                  >
                    <Play className="ml-0.5 h-4 w-4 fill-current" />
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      </div>

      {toastFailedJobId ? (
        <div className="pointer-events-auto fixed bottom-4 left-4 right-4 z-[80] flex items-center justify-between gap-3 rounded-xl bg-zinc-900 px-4 py-3 text-[14px] text-white shadow-lg shadow-zinc-900/30 sm:left-auto sm:right-4 sm:mx-auto sm:max-w-md">
          <span className="min-w-0 flex-1 leading-snug">Generation failed. Please try again.</span>
          <button
            type="button"
            className="shrink-0 font-semibold text-white/95 hover:text-white"
            onClick={() => onRetryJob(toastFailedJobId)}
          >
            Retry
          </button>
        </div>
      ) : null}
    </div>
  )
}
