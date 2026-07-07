"use client"

import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import {
  FACTORY_CARD_RADIUS,
  FACTORY_FIELD_RADIUS,
  FACTORY_ICON_RADIUS,
} from "@/components/mind-v2/factory-card-shape"
import type {
  FactoryGenerationSettings,
  FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import {
  FilePlus2,
  Volume2,
  Layers,
  HelpCircle,
  BarChart3,
  Presentation,
  FolderInput,
  Check,
} from "lucide-react"

export type FactoryJobStatus = "generating" | "complete" | "failed"

export interface FactoryJob {
  id: string
  kind: FactoryModalKind
  status: FactoryJobStatus
  title?: string
  meta?: string
  /** Granular Studio controls chosen when the job was queued. */
  settings?: FactoryGenerationSettings
}

/** First segment of job meta line from numeric Studio settings (e.g. "12 slides"). */
export function factorySettingsLeadMeta(
  kind: FactoryModalKind,
  settings?: FactoryGenerationSettings
): string | null {
  if (!settings) return null
  let lead: string | null = null
  switch (kind) {
    case "audio":
      lead = settings.audioTargetMinutes != null ? `~${settings.audioTargetMinutes} min audio` : null
      break
    case "slides":
      lead = settings.slidesPageCount != null ? `${settings.slidesPageCount} slides` : null
      break
    case "quiz":
      lead = settings.quizQuestionCount != null ? `${settings.quizQuestionCount} questions` : null
      break
    case "flashcards":
      lead = settings.flashcardCount != null ? `${settings.flashcardCount} cards` : null
      break
    case "infographic":
      lead = settings.infographicPanelCount != null ? `${settings.infographicPanelCount} panels` : null
      break
    case "report":
      lead = settings.reportTargetPages != null ? `${settings.reportTargetPages} pages` : null
      break
    default:
      break
  }
  if (lead) return lead
  if (settings.outputLanguage) return settings.outputLanguage
  return null
}

const PASTEL_SHELLS = mx.studioJobShell

/** Demo history (reference data; Studio feed is driven by live `userJobs`). */
export const FACTORY_MEDIA_SEED: FactoryJob[] = [
  {
    id: "seed-1",
    kind: "report",
    status: "complete",
    title: "Library summary report",
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

export function iconForFactoryKind(kind: FactoryModalKind) {
  switch (kind) {
    case "report":
      return <FilePlus2 className="h-5 w-5" strokeWidth={1.75} />
    case "audio":
      return <Volume2 className="h-5 w-5" strokeWidth={1.75} />
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
      return "Audio: key takeaways"
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

export function factoryKindShortLabel(kind: FactoryModalKind): string {
  switch (kind) {
    case "report":
      return "Report"
    case "audio":
      return "Audio"
    case "flashcards":
      return "Flashcards"
    case "quiz":
      return "Quiz"
    case "infographic":
      return "Infographic"
    case "slides":
      return "Slides"
    default:
      return "Studio"
  }
}

export interface StudioFactoryJobsInlineProps {
  userJobs: FactoryJob[]
  showQuotaBanner?: boolean
  onDismissQuotaBanner?: () => void
  toastFailedJobId: string | null
  onRetryJob: (jobId: string) => void
  /** When set, completed rows show “archive to library” and jump into Hub after save (demo). */
  onArchiveToLibrary?: (job: FactoryJob) => void
  /** Shown in archive CTA for context, e.g. current notebook name */
  archiveTargetLabel?: string
  /** Job ids already archived (hide repeat CTA). */
  archivedJobIds?: ReadonlySet<string> | string[]
}

/**
 * Studio tab: quota notice, generating cards, then completed rows.
 * Append new jobs to `userJobs` so the latest run sits at the bottom.
 */
export function StudioFactoryJobsInline({
  userJobs,
  showQuotaBanner,
  onDismissQuotaBanner,
  toastFailedJobId,
  onRetryJob,
  onArchiveToLibrary,
  archiveTargetLabel,
  archivedJobIds,
}: StudioFactoryJobsInlineProps) {
  const generating = userJobs.filter((j) => j.status === "generating")
  const completed = userJobs.filter((j) => j.status === "complete")
  const showFeed = showQuotaBanner || generating.length > 0 || completed.length > 0 || toastFailedJobId

  const archivedSet =
    archivedJobIds == null
      ? null
      : archivedJobIds instanceof Set
        ? archivedJobIds
        : new Set(archivedJobIds)

  const isArchived = (id: string) => archivedSet?.has(id) ?? false

  if (!showFeed) return null

  return (
    <div className={cn("relative", toastFailedJobId ? "pb-16" : "")}>
      {showQuotaBanner ? (
        <div className={cn("mb-4", mx.studioQuotaBanner)}>
          <div className="flex gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center",
                FACTORY_ICON_RADIUS,
                mx.factoryTone.slides.well
              )}
            >
              <span className={cn(mx.factoryTone.slides.icon, "[&>svg]:h-5 [&>svg]:w-5")}>
                <Presentation className="h-5 w-5" strokeWidth={1.75} />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">Presentation</p>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                You have reached the daily generation limit. Try again tomorrow or upgrade now.
              </p>
              <button
                type="button"
                className={cn("mt-2 text-[13px] font-semibold", mx.accentBlue, mx.accentBlueHover)}
                onClick={onDismissQuotaBanner}
              >
                Upgrade now
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {generating.length > 0 ? (
        <ul className="mb-4 space-y-2.5">
          {generating.map((job, idx) => {
            const tc = mx.factoryTone[job.kind]
            const shell = PASTEL_SHELLS[idx % PASTEL_SHELLS.length]
            return (
              <li key={job.id} className={cn("flex items-center gap-3 px-3.5 py-3.5 shadow-sm shadow-stone-900/[0.03]", FACTORY_CARD_RADIUS, shell)}>
                <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center bg-white/80", FACTORY_ICON_RADIUS, tc.icon)}>
                  {iconForFactoryKind(job.kind)}
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

      {completed.length > 0 ? (
        <div className={cn("overflow-hidden border border-stone-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900", FACTORY_CARD_RADIUS)}>
          <h2 className="border-b border-stone-100 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-zinc-500">
            Generated media
          </h2>
          <ul className="divide-y divide-stone-100 px-0">
            {completed.map((job) => {
              const tc = mx.factoryTone[job.kind]
              const archived = isArchived(job.id)
              return (
                <li key={job.id}>
                  <div className="flex items-start gap-3 px-3 py-3.5">
                    <div className={cn("mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center", FACTORY_ICON_RADIUS, tc.well)}>
                      <span className={cn(tc.icon, "[&>svg]:h-[1.15rem] [&>svg]:w-[1.15rem]")}>{iconForFactoryKind(job.kind)}</span>
                    </div>
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-[15px] font-medium leading-snug text-zinc-900">{job.title}</p>
                      {job.meta ? <p className="mt-1 text-[12px] text-zinc-500">{job.meta}</p> : null}
                    </div>
                  </div>
                  {onArchiveToLibrary ? (
                    <div className="flex items-center justify-end gap-2 border-t border-stone-100/90 bg-stone-50/40 px-3 py-2 dark:bg-zinc-900/40">
                      {archived ? (
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
                          <Check className="h-3.5 w-3.5 text-mind dark:text-mind/38" strokeWidth={2.5} aria-hidden />
                          In Hub
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onArchiveToLibrary(job)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-semibold transition-colors",
                            FACTORY_FIELD_RADIUS,
                            mx.accentBlue,
                            mx.accentBlueHover,
                            "hover:bg-mind/90 dark:hover:bg-mind/40"
                          )}
                        >
                          <FolderInput className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
                          {archiveTargetLabel
                            ? `Archive to “${archiveTargetLabel}”`
                            : "Archive to library"}
                        </button>
                      )}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}

      {toastFailedJobId ? (
        <div className={cn("pointer-events-auto fixed bottom-20 left-4 right-4 z-[80] mx-auto flex max-w-md items-center justify-between gap-3 bg-zinc-900 px-4 py-3 text-[14px] text-white shadow-lg shadow-zinc-900/30 sm:left-1/2 sm:right-auto sm:-translate-x-1/2", FACTORY_CARD_RADIUS)}>
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
