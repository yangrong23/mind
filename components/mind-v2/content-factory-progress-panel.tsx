"use client"

import { cn } from "@/lib/utils"
import { agentFactoryTone } from "@/lib/factory-tone-classes"
import { FACTORY_CARD_RADIUS, FACTORY_ICON_RADIUS } from "@/components/mind-v2/factory-card-shape"
import type {
  FactoryGenerationSettings,
  FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import {
  StudioOutputArchiveRow,
  StudioOutputListRow,
  studioOutputVisual,
} from "@/components/mind-v2/studio-output-row"
import { Presentation } from "lucide-react"
import { toast } from "sonner"

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

/** @deprecated Prefer `StudioOutputKindIcon` — kept for legacy call sites. */
export function iconForFactoryKind(kind: FactoryModalKind) {
  const { Icon, icon } = studioOutputVisual(kind)
  return <Icon className={cn("h-5 w-5", icon)} strokeWidth={1.85} />
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
  /** When false, completed rows render in `WebStudioOutputsPanel` instead */
  showCompletedOutputs?: boolean
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
  showCompletedOutputs = true,
}: StudioFactoryJobsInlineProps) {
  const generating = userJobs.filter((j) => j.status === "generating")
  const completed = userJobs.filter((j) => j.status === "complete")
  const showFeed =
    showQuotaBanner ||
    generating.length > 0 ||
    (showCompletedOutputs && completed.length > 0) ||
    toastFailedJobId

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
        <div className={cn("mb-4", "rounded-2xl border border-stone-200/90 bg-stone-50/95 p-4 shadow-sm shadow-stone-900/[0.04] dark:border-zinc-700 dark:bg-zinc-900/90")}>
          <div className="flex gap-3">
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center",
                FACTORY_ICON_RADIUS,
                agentFactoryTone("slides").well
              )}
            >
              <span className={cn(agentFactoryTone("slides").icon, "[&>svg]:h-5 [&>svg]:w-5")}>
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
                className={cn("mt-2 text-[13px] font-semibold", "text-mind", "hover:text-mind/90")}
                onClick={onDismissQuotaBanner}
              >
                Upgrade now
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {generating.length > 0 ? (
        <ul className="mb-3 space-y-0.5">
          {generating.map((job) => (
            <li key={job.id}>
              <StudioOutputListRow
                kind={job.kind}
                title="Generating…"
                meta={factoryKindShortLabel(job.kind)}
                subtitle="Check back in a few minutes"
                trailing={
                  <span className="mr-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-mind/70" aria-hidden />
                }
              />
            </li>
          ))}
        </ul>
      ) : null}

      {showCompletedOutputs && completed.length > 0 ? (
        <section className="mt-1" aria-label="Studio outputs">
          <ul className="space-y-0.5">
            {completed.map((job) => {
              const archived = isArchived(job.id)
              return (
                <li
                  key={job.id}
                  className="overflow-hidden rounded-xl transition-colors hover:bg-zinc-900/[0.02]"
                >
                  <StudioOutputListRow
                    kind={job.kind}
                    title={job.title ?? mockTitleForFactoryKind(job.kind)}
                    meta={job.meta}
                    onClick={() =>
                      toast.message(job.title ?? "Studio output", {
                        description: `${factoryKindShortLabel(job.kind)} (demo preview)`,
                      })
                    }
                    onPlayClick={
                      job.kind === "audio"
                        ? () =>
                            toast.message("Play audio", {
                              description: "Demo — opens the generated briefing player.",
                            })
                        : undefined
                    }
                    onMenuClick={() =>
                      toast.message("Actions", {
                        description: "Rename, share, or delete this output (demo).",
                      })
                    }
                  />
                  {onArchiveToLibrary ? (
                    <StudioOutputArchiveRow
                      archived={archived}
                      archiveLabel={
                        archiveTargetLabel ? `Archive to “${archiveTargetLabel}”` : "Archive to library"
                      }
                      onArchive={() => onArchiveToLibrary(job)}
                    />
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>
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
