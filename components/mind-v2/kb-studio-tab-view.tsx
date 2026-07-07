"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { MindAddFab } from "@/components/mind-v2/mind-add-button"
import { MinderContentFactoryGrid } from "@/components/mind-v2/minder-content-factory-grid"
import {
  StudioFactoryJobsInline,
  type FactoryJob,
} from "@/components/mind-v2/content-factory-progress-panel"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { StudioCreateSheet } from "@/components/mind-v2/studio-create-sheet"
import { KbEmptyMaterialCta } from "@/components/mind-v2/kb-empty-material-cta"
import { PublicPublishedFactoryFeed } from "@/components/mind-v2/public-factory-output-ui"
import type { PublicFactoryOutput } from "@/lib/public-factory-outputs"

export function KbStudioTabView({
  libraryName,
  materialCount,
  userJobs,
  publishedOutputs = [],
  onOpenPublishedOutput,
  showQuotaBanner,
  onDismissQuotaBanner,
  toastFailedJobId,
  onRetryJob,
  onArchiveToLibrary,
  archivedJobIds,
  onSelectFactory,
  onAddMaterial,
  readOnlyPublisherStudio = false,
}: {
  libraryName: string
  materialCount: number
  userJobs: FactoryJob[]
  /** Publisher-shared Studio outputs (public / subscribed libraries) */
  publishedOutputs?: PublicFactoryOutput[]
  onOpenPublishedOutput?: (output: PublicFactoryOutput) => void
  showQuotaBanner: boolean
  onDismissQuotaBanner: () => void
  toastFailedJobId: string | null
  onRetryJob: (jobId: string) => void
  onArchiveToLibrary?: (job: FactoryJob) => void
  archivedJobIds: string[]
  onSelectFactory: (kind: FactoryModalKind) => void
  onAddMaterial?: () => void
  /** Hide personal generate UI when browsing publisher library only */
  readOnlyPublisherStudio?: boolean
}) {
  const [createOpen, setCreateOpen] = useState(false)
  const hasGeneratedWork = userJobs.some(
    (job) => job.status === "complete" || job.status === "generating"
  )
  const hasPublished = publishedOutputs.length > 0
  const showPublisherFeed = hasPublished && onOpenPublishedOutput

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div className="scrollbar-hide flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-4 pb-10 pt-4 dark:bg-zinc-950">
        {showPublisherFeed ? (
          <PublicPublishedFactoryFeed
            outputs={publishedOutputs}
            onOpen={onOpenPublishedOutput}
            className="mb-5"
          />
        ) : null}

        {hasGeneratedWork ? (
          <StudioFactoryJobsInline
            userJobs={userJobs}
            showQuotaBanner={showQuotaBanner}
            onDismissQuotaBanner={onDismissQuotaBanner}
            toastFailedJobId={toastFailedJobId}
            onRetryJob={onRetryJob}
            onArchiveToLibrary={onArchiveToLibrary}
            archiveTargetLabel={libraryName}
            archivedJobIds={archivedJobIds}
          />
        ) : !readOnlyPublisherStudio || !hasPublished ? (
          <div className="flex min-h-[min(420px,70dvh)] flex-col items-center justify-center py-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mind/10 dark:bg-mind/15">
              <Sparkles className="h-7 w-7 text-mind/70" strokeWidth={1.5} aria-hidden />
            </div>
            <h3 className="text-[17px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {materialCount === 0 ? "Studio is ready when you are" : "Turn sources into something new"}
            </h3>
            <p className="mt-2 max-w-[300px] text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
              {materialCount === 0
                ? "Add files or links in Material first — then generate audio, slides, reports, and more here."
                : "Choose a format below to generate from your library. Results stack here so you can run another anytime."}
            </p>

            {materialCount === 0 && onAddMaterial ? (
              <KbEmptyMaterialCta onAddMaterial={onAddMaterial} className="mt-5 !mx-0 w-full max-w-[360px]" />
            ) : null}

            <div className={cn("w-full max-w-[360px]", materialCount === 0 && onAddMaterial ? "mt-4" : "mt-6")}>
              <MinderContentFactoryGrid
                librarySummary=""
                onSelect={onSelectFactory}
                className="!mt-0"
                surface="filled"
                layout="kb"
                density="compact"
              />
            </div>

            {materialCount > 0 ? (
              <button
                type="button"
                onClick={() => onSelectFactory("report")}
                className={cn("mt-6 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-white", mx.brandCta)}
              >
                Quick generate report
              </button>
            ) : null}
          </div>
        ) : (
          <p className={cn("py-6 text-center", mx.typeBodySecondary)}>
            Tap any item above to browse publisher-made reports, slides, audio, and more.
          </p>
        )}
      </div>

      {hasGeneratedWork && !readOnlyPublisherStudio ? (
        <MindAddFab
          onClick={() => setCreateOpen(true)}
          ariaLabel="Create from library"
          variant="fab-dark"
          wrapperClassName="bottom-[max(1.25rem,env(safe-area-inset-bottom))]"
        />
      ) : null}

      <StudioCreateSheet
        open={createOpen}
        materialCount={materialCount}
        onClose={() => setCreateOpen(false)}
        onSelectFactory={onSelectFactory}
      />
    </div>
  )
}
