"use client"

import { Eye, FileText, Volume2, Layers, HelpCircle, Presentation, BarChart3, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { factoryKindShortLabel } from "@/components/mind-v2/content-factory-progress-panel"
import type { PublicFactoryOutput } from "@/lib/public-factory-outputs"
import { toast } from "sonner"

const KIND_ICON: Record<FactoryModalKind, LucideIcon> = {
  report: FileText,
  audio: Volume2,
  flashcards: Layers,
  quiz: HelpCircle,
  slides: Presentation,
  infographic: BarChart3,
}

export function WebPublicFactoryGallery({
  outputs,
  className,
}: {
  outputs: PublicFactoryOutput[]
  className?: string
}) {
  if (outputs.length === 0) return null

  return (
    <section className={cn("mt-5 border-t border-stone-100 pt-4 dark:border-zinc-800", className)}>
      <div className="mb-3 flex items-baseline justify-between gap-2 px-0.5">
        <h3 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">Community Studio outputs</h3>
        <span className="text-[11px] text-zinc-400">Visible to all users</span>
      </div>
      <ul className="space-y-2">
        {outputs.map((item) => {
          const Icon = KIND_ICON[item.kind]
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() =>
                  toast.message(item.title, {
                    description: `${factoryKindShortLabel(item.kind)} · ${item.excerpt.slice(0, 100)}… (demo)`,
                  })
                }
                className="flex w-full gap-3 rounded-xl border border-stone-200/90 bg-white p-3 text-left transition-colors hover:border-teal-200/80 hover:bg-stone-50/80 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-teal-900/50 dark:hover:bg-zinc-800/60"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-100">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
                    {item.excerpt}
                  </p>
                  <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-400">
                    <span>{factoryKindShortLabel(item.kind)}</span>
                    <span aria-hidden>·</span>
                    <span>{item.author}</span>
                    <span aria-hidden>·</span>
                    <span>{item.createdAt}</span>
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-[11px] text-zinc-400">
                  <span className="inline-flex items-center gap-0.5">
                    <Eye className="h-3 w-3" aria-hidden />
                    {item.viewCount.toLocaleString()}
                  </span>
                </div>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
