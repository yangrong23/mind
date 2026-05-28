"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import {
  factoryKindShortLabel,
  type FactoryJob,
} from "@/components/mind-v2/content-factory-progress-panel"
import type { PublicFactoryOutput } from "@/lib/public-factory-outputs"
import {
  StudioOutputArchiveRow,
  StudioOutputListRow,
} from "@/components/mind-v2/studio-output-row"
import { Eye } from "lucide-react"

export type StudioOutputFilterId = "all" | FactoryModalKind

const FILTER_CHIPS: { id: StudioOutputFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "report", label: "Report" },
  { id: "audio", label: "Audio" },
  { id: "slides", label: "Slides" },
  { id: "quiz", label: "Quiz" },
  { id: "flashcards", label: "Cards" },
  { id: "infographic", label: "Visual" },
]

type OutputRow =
  | { source: "job"; job: FactoryJob }
  | { source: "community"; item: PublicFactoryOutput }

export function WebStudioOutputsPanel({
  userJobs,
  communityOutputs = [],
  onArchiveToLibrary,
  archiveTargetLabel,
  archivedJobIds,
  className,
}: {
  userJobs: FactoryJob[]
  communityOutputs?: PublicFactoryOutput[]
  onArchiveToLibrary?: (job: FactoryJob) => void
  archiveTargetLabel?: string
  archivedJobIds?: ReadonlySet<string> | string[]
  className?: string
}) {
  const [filter, setFilter] = useState<StudioOutputFilterId>("all")

  const completedJobs = useMemo(
    () => userJobs.filter((j) => j.status === "complete"),
    [userJobs]
  )

  const rows = useMemo(() => {
    const list: OutputRow[] = [
      ...completedJobs.map((job) => ({ source: "job" as const, job })),
      ...communityOutputs.map((item) => ({ source: "community" as const, item })),
    ]
    if (filter === "all") return list
    return list.filter((row) =>
      row.source === "job" ? row.job.kind === filter : row.item.kind === filter
    )
  }, [completedJobs, communityOutputs, filter])

  const archivedSet =
    archivedJobIds == null
      ? null
      : archivedJobIds instanceof Set
        ? archivedJobIds
        : new Set(archivedJobIds)

  const isArchived = (id: string) => archivedSet?.has(id) ?? false

  if (completedJobs.length === 0 && communityOutputs.length === 0) {
    return null
  }

  return (
    <section className={cn("mt-3 border-t border-black/[0.06] pt-3", className)} aria-label="Studio outputs">
      <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
        <h3 className="text-[14px] font-semibold tracking-tight text-zinc-800">Outputs</h3>
        <span className="text-[11px] font-medium tabular-nums text-zinc-400">{rows.length} shown</span>
      </div>

      <div
        className="scrollbar-hide -mx-0.5 flex gap-1.5 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Filter by output type"
      >
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.id
          const count =
            chip.id === "all"
              ? completedJobs.length + communityOutputs.length
              : completedJobs.filter((j) => j.kind === chip.id).length +
                communityOutputs.filter((o) => o.kind === chip.id).length
          if (chip.id !== "all" && count === 0) return null
          return (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(chip.id)}
              className={cn(
                "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
                active
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "bg-white text-zinc-600 ring-1 ring-black/[0.06] hover:bg-zinc-50"
              )}
            >
              {chip.label}
              {count > 0 ? (
                <span className={cn("ml-1 tabular-nums", active ? "text-white/80" : "text-zinc-400")}>
                  {count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 px-1 text-center text-[12px] text-zinc-500">No outputs for this type yet.</p>
      ) : (
        <ul className="mt-2.5 space-y-2">
          {rows.map((row) => {
            if (row.source === "job") {
              const job = row.job
              const archived = isArchived(job.id)
              return (
                <li
                  key={`job-${job.id}`}
                  className={cn(
                    "overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-[0_2px_12px_-6px_rgba(15,23,42,0.12)]",
                    web.kbRowHover
                  )}
                >
                  <StudioOutputListRow
                    kind={job.kind}
                    title={job.title ?? factoryKindShortLabel(job.kind)}
                    meta={job.meta}
                    subtitle={factoryKindShortLabel(job.kind)}
                    className="px-3 py-3"
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
            }

            const item = row.item
            return (
              <li
                key={`pub-${item.id}`}
                className={cn(
                  "overflow-hidden rounded-xl border border-black/[0.07] bg-white shadow-[0_2px_12px_-6px_rgba(15,23,42,0.12)]",
                  web.kbRowHover
                )}
              >
                <StudioOutputListRow
                  kind={item.kind}
                  title={item.title}
                  meta={`${item.author} · ${item.createdAt}`}
                  subtitle={item.excerpt}
                  className="px-3 py-3"
                  onClick={() =>
                    toast.message(item.title, {
                      description: `${factoryKindShortLabel(item.kind)} · ${item.excerpt.slice(0, 100)}… (demo)`,
                    })
                  }
                  onPlayClick={
                    item.kind === "audio"
                      ? () =>
                          toast.message("Play audio", {
                            description: "Demo — community audio briefing.",
                          })
                      : undefined
                  }
                  onMenuClick={() =>
                    toast.message("Actions", { description: "View, share, or report (demo)." })
                  }
                  trailing={
                    <span className="mr-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-zinc-400">
                      <Eye className="h-3 w-3" aria-hidden />
                      {item.viewCount.toLocaleString()}
                    </span>
                  }
                />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
