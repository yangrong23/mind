"use client"

import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { MindarContentFactoryGrid } from "@/components/mind-v2/mindar-content-factory-grid"
import {
  StudioFactoryJobsInline,
  type FactoryJob,
  type StudioFactoryJobsInlineProps,
} from "@/components/mind-v2/content-factory-progress-panel"
import { WebPublicFactoryGallery } from "@/components/mind-v2/web-public-factory-gallery"
import type { PublicFactoryOutput } from "@/lib/public-factory-outputs"

export type StudioWorkspacePanelProps = {
  librarySummary: string
  onSelectFactory: (kind: FactoryModalKind) => void
  userJobs: FactoryJob[]
  communityOutputs?: PublicFactoryOutput[]
  className?: string
  emptyHint?: string
} & Pick<
  StudioFactoryJobsInlineProps,
  | "showQuotaBanner"
  | "onDismissQuotaBanner"
  | "toastFailedJobId"
  | "onRetryJob"
  | "onArchiveToLibrary"
  | "archiveTargetLabel"
  | "archivedJobIds"
>

/** Studio column: intro tiles when empty; outputs first + icon toolbar after generations exist. */
export function StudioWorkspacePanel({
  librarySummary,
  onSelectFactory,
  userJobs,
  communityOutputs = [],
  className,
  emptyHint = "Pick a format to generate audio, slides, quizzes, and more from your sources.",
  showQuotaBanner,
  onDismissQuotaBanner,
  toastFailedJobId,
  onRetryJob,
  onArchiveToLibrary,
  archiveTargetLabel,
  archivedJobIds,
}: StudioWorkspacePanelProps) {
  const hasOutputs = userJobs.length > 0 || communityOutputs.length > 0

  if (hasOutputs) {
    return (
      <div className={cn("flex min-h-0 flex-col", className)}>
        <StudioFactoryJobsInline
          userJobs={userJobs}
          showQuotaBanner={showQuotaBanner}
          onDismissQuotaBanner={onDismissQuotaBanner}
          toastFailedJobId={toastFailedJobId}
          onRetryJob={onRetryJob}
          onArchiveToLibrary={onArchiveToLibrary}
          archiveTargetLabel={archiveTargetLabel}
          archivedJobIds={archivedJobIds}
        />
        <WebPublicFactoryGallery outputs={communityOutputs} className="px-0.5" />
        <MindarContentFactoryGrid
          librarySummary={librarySummary}
          onSelect={onSelectFactory}
          surface="filled"
          layout="kb"
          studioCompact
          className="!mt-2 px-0.5 pb-1"
        />
      </div>
    )
  }

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <MindarContentFactoryGrid
        librarySummary={librarySummary}
        onSelect={onSelectFactory}
        surface="filled"
        layout="kb"
        studioCompact
        className="!mt-0"
      />
      <StudioFactoryJobsInline
        userJobs={userJobs}
        showQuotaBanner={showQuotaBanner}
        onDismissQuotaBanner={onDismissQuotaBanner}
        toastFailedJobId={toastFailedJobId}
        onRetryJob={onRetryJob}
        onArchiveToLibrary={onArchiveToLibrary}
        archiveTargetLabel={archiveTargetLabel}
        archivedJobIds={archivedJobIds}
      />
      <div className="mt-5 flex flex-col items-center px-2 text-center">
        <Sparkles className="mb-2 h-6 w-6 text-violet-400/80" strokeWidth={1.75} aria-hidden />
        <p className="max-w-[240px] text-[11px] leading-relaxed text-zinc-500">{emptyHint}</p>
      </div>
    </div>
  )
}
