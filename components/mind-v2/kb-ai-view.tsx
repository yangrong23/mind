"use client"

import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { KbEmptyMaterialCta } from "@/components/mind-v2/kb-empty-material-cta"
function KnowledgeGraphPreview({ compact }: { compact?: boolean }) {
  const size = compact ? "w-full max-w-[180px] aspect-square" : "w-64 h-64"
  return (
    <div className={cn("relative mx-auto", size)}>
      <div className="absolute top-1/2 left-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-teal-400 text-[11px] font-semibold text-white">
        Core
      </div>
      {[
        { x: 0, y: -48, label: "A", color: "bg-violet-300" },
        { x: 44, y: -26, label: "B", color: "bg-sky-300" },
        { x: 44, y: 26, label: "C", color: "bg-teal-300" },
        { x: 0, y: 48, label: "D", color: "bg-fuchsia-300" },
        { x: -44, y: 26, label: "E", color: "bg-indigo-300" },
        { x: -44, y: -26, label: "F", color: "bg-cyan-300" },
      ].map((node, i) => (
        <div
          key={i}
          className={cn(
            "absolute flex h-9 w-9 items-center justify-center rounded-full text-[10px] font-medium text-white/90",
            node.color
          )}
          style={{
            left: `calc(50% + ${node.x}px - 18px)`,
            top: `calc(50% + ${node.y}px - 18px)`,
          }}
        >
          {node.label}
        </div>
      ))}
    </div>
  )
}

export function KbAiView({
  libraryName,
  sourceCount,
  summary,
  onOpenFullGraph,
  onAddMaterial,
  compact = false,
}: {
  libraryName: string
  sourceCount: number
  summary: string
  onOpenFullGraph?: () => void
  onAddMaterial?: () => void
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-y-auto",
        compact ? "px-4 py-4" : "px-5 py-6"
      )}
    >
      {sourceCount === 0 && onAddMaterial ? <KbEmptyMaterialCta onAddMaterial={onAddMaterial} className="mb-4 !mx-0" /> : null}

      <section className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-mind/12 text-mind">
            <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <div>
            <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50">AI summary</h2>
            <p className="text-[11px] text-zinc-500">
              {sourceCount === 0
                ? "Add material to generate a summary"
                : `From ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}`}
            </p>
          </div>
        </div>
        <p className="mt-3 text-[14px] leading-[1.65] text-zinc-700 dark:text-zinc-300">
          {sourceCount === 0
            ? `Upload files, links, or notes to “${libraryName}” — we’ll synthesize themes, gaps, and suggested questions here.`
            : summary}
        </p>
      </section>

      <section className={cn("mt-6", compact && "mt-5")}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-semibold uppercase tracking-[0.12em] text-zinc-500">Knowledge graph</h3>
          {onOpenFullGraph ? (
            <button
              type="button"
              onClick={onOpenFullGraph}
              className="text-[12px] font-semibold text-mind hover:underline"
            >
              Expand
            </button>
          ) : null}
        </div>
        <div
          className={cn(
            "mt-3 flex flex-col items-center rounded-2xl bg-gradient-to-b from-stone-50/90 to-white px-4 py-6 ring-1 ring-stone-200/60 dark:from-zinc-900/40 dark:to-zinc-950 dark:ring-zinc-800",
            sourceCount === 0 && "opacity-60"
          )}
        >
          <KnowledgeGraphPreview compact />
          <p className="mt-3 max-w-[300px] text-center text-[12px] leading-relaxed text-zinc-500">
            {sourceCount === 0
              ? "The graph fills in as you add material — concepts, people, and documents link automatically."
              : "See how concepts, people, and documents in this library connect."}
          </p>
        </div>
      </section>
    </div>
  )
}
