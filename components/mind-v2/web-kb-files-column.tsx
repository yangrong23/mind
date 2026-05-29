"use client"

import { useState } from "react"
import { Network, Search, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import { WebPanelHeader } from "@/components/mind-v2/knowledge-detail-web-shell"
import type { FactoryJob } from "@/components/mind-v2/content-factory-progress-panel"
import { WebStudioOutputsPanel } from "@/components/mind-v2/web-studio-outputs-panel"
import type { PublicFactoryOutput } from "@/lib/public-factory-outputs"

export type WebKbFilesListItem = {
  id: number
  title: string
  source: string
  excerpt?: string
}

type FilesTabId = "sources" | "outputs"

const FILE_TABS: { id: FilesTabId; label: string }[] = [
  { id: "sources", label: "Sources" },
  { id: "outputs", label: "Outputs" },
]

/** Unified left column — sources, studio outputs, AI view entry (public & private KB). */
export function WebKbFilesColumn({
  items,
  selectedIds,
  searchQuery,
  onSearchQueryChange,
  onToggleSelected,
  onToggleAll,
  allSelected,
  onOpenItem,
  onOpenAiView,
  onAddSources,
  readOnly = false,
  userJobs,
  communityOutputs,
  onArchiveOutput,
  archiveTargetLabel,
  archivedJobIds,
  onOpenFactory,
}: {
  items: WebKbFilesListItem[]
  selectedIds: Set<number>
  searchQuery: string
  onSearchQueryChange: (q: string) => void
  onToggleSelected: (id: number) => void
  onToggleAll: () => void
  allSelected: boolean
  onOpenItem: (item: WebKbFilesListItem) => void
  onOpenAiView: () => void
  onAddSources?: () => void
  readOnly?: boolean
  userJobs: FactoryJob[]
  communityOutputs: PublicFactoryOutput[]
  onArchiveOutput?: (job: import("@/components/mind-v2/content-factory-progress-panel").FactoryJob) => void
  archiveTargetLabel?: string
  archivedJobIds?: string[]
  onOpenFactory?: () => void
}) {
  const [tab, setTab] = useState<FilesTabId>("sources")
  const q = searchQuery.trim().toLowerCase()
  const filtered = q
    ? items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q) ||
          (item.excerpt?.toLowerCase().includes(q) ?? false)
      )
    : items

  const outputCount =
    userJobs.filter((j) => j.status === "complete").length + communityOutputs.length

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <WebPanelHeader
        title="Files"
        trailing={
          tab === "sources" && !readOnly && onAddSources ? (
            <button
              type="button"
              onClick={onAddSources}
              className="rounded-lg px-2 py-1 text-[12px] font-semibold text-mind hover:bg-mind/8"
            >
              Add
            </button>
          ) : tab === "outputs" && onOpenFactory ? (
            <button
              type="button"
              onClick={onOpenFactory}
              className="rounded-lg px-2 py-1 text-[12px] font-semibold text-mind hover:bg-mind/8"
            >
              Create
            </button>
          ) : null
        }
      />

      <div className="shrink-0 px-2.5 pb-2">
        <div
          className="flex rounded-xl bg-stone-100/90 p-1 ring-1 ring-black/[0.05]"
          role="tablist"
          aria-label="File categories"
        >
          {FILE_TABS.map((t) => {
            const active = tab === t.id
            const count = t.id === "outputs" ? outputCount : items.length
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className={cn(
                  "min-w-0 flex-1 rounded-lg px-2 py-1.5 text-center text-[12px] font-semibold transition-colors",
                  active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-800"
                )}
              >
                {t.label}
                {count > 0 ? (
                  <span className="ml-1 tabular-nums text-zinc-400">({count})</span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {tab === "sources" ? (
        <>
          <div className="shrink-0 px-2.5 pb-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder="Search sources…"
                className={cn(web.kbInput, "py-2 pl-8 pr-2")}
                aria-label="Search sources"
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end px-3 pb-1">
            <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-zinc-500">
              <input
                type="checkbox"
                className="rounded border-black/[0.12]"
                checked={allSelected && items.length > 0}
                onChange={onToggleAll}
              />
              All in context
            </label>
          </div>
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {filtered.length === 0 ? (
              <p className="px-2 py-6 text-center text-[12px] text-zinc-500">
                {q ? "No sources match your search." : "No sources yet."}
              </p>
            ) : (
              filtered.map((item) => {
                const checked = selectedIds.has(item.id)
                return (
                  <div
                    key={item.id}
                    className={cn("flex items-start gap-2 rounded-lg px-2 py-2", web.kbRowHover)}
                  >
                    <button
                      type="button"
                      onClick={() => onOpenItem(item)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="line-clamp-2 text-[13px] font-medium leading-snug text-zinc-700">
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-zinc-500">{item.source}</p>
                    </button>
                    <input
                      type="checkbox"
                      className="mt-1 shrink-0 rounded border-stone-300"
                      checked={checked}
                      onChange={() => onToggleSelected(item.id)}
                      aria-label={`Include ${item.title}`}
                    />
                  </div>
                )
              })
            )}
          </div>
        </>
      ) : (
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-2 pb-2">
          <WebStudioOutputsPanel
            userJobs={userJobs}
            communityOutputs={communityOutputs}
            onArchiveToLibrary={onArchiveOutput}
            archiveTargetLabel={archiveTargetLabel}
            archivedJobIds={archivedJobIds}
            className="px-0.5"
          />
          {outputCount === 0 ? (
            <p className="mt-4 px-2 text-center text-[12px] leading-relaxed text-zinc-500">
              Studio outputs from chat or the content factory appear here.
            </p>
          ) : null}
        </div>
      )}

      <div className="shrink-0 border-t border-black/[0.05] p-2.5">
        <button
          type="button"
          onClick={onOpenAiView}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl border border-mind/20 bg-gradient-to-br from-mind/8 to-sky-500/5 px-3 py-2.5 text-left transition-colors hover:border-mind/35 hover:from-mind/12"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-mind/15">
            <Network className="h-4 w-4 text-mind" strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-[13px] font-semibold text-zinc-800">
              <Sparkles className="h-3.5 w-3.5 text-mind" strokeWidth={2} aria-hidden />
              AI view
            </span>
            <span className="mt-0.5 block text-[11px] text-zinc-500">
              Topics, graph & library insights
            </span>
          </span>
        </button>
      </div>
    </div>
  )
}
