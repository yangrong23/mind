"use client"

import { ChevronLeft, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import { FACTORY_CARD_RADIUS, FACTORY_ICON_RADIUS } from "@/components/mind-v2/factory-card-shape"
import {
  factoryKindShortLabel,
  iconForFactoryKind,
} from "@/components/mind-v2/content-factory-progress-panel"
import type { PublicFactoryOutput } from "@/lib/public-factory-outputs"
import { bodyForPublicFactoryOutput } from "@/lib/public-factory-outputs"

function formatViews(n: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
}

export function PublicPublishedFactoryFeed({
  outputs,
  onOpen,
  className,
  compact = false,
}: {
  outputs: PublicFactoryOutput[]
  onOpen: (output: PublicFactoryOutput) => void
  className?: string
  /** Shorter rows for Material tab teaser */
  compact?: boolean
}) {
  if (outputs.length === 0) return null

  return (
    <section className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-2 px-0.5">
        <h2 className="text-[13px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          From Studio
        </h2>
        <span className={cn("text-[11px]", mx.shellMuted)}>{outputs.length} ready to browse</span>
      </div>
      <div
        className={cn(
          "overflow-hidden border border-stone-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900",
          FACTORY_CARD_RADIUS
        )}
      >
        <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
          {outputs.map((output) => {
            const tc = mx.factoryTone[output.kind]
            return (
              <li key={output.id}>
                <button
                  type="button"
                  onClick={() => onOpen(output)}
                  className={cn(
                    "flex w-full items-start gap-3 px-3 text-left transition-colors",
                    compact ? "py-2.5" : "py-3.5",
                    "hover:bg-stone-50/90 active:bg-stone-100/60 dark:hover:bg-zinc-800/50 dark:active:bg-zinc-800/80"
                  )}
                >
                  <div
                    className={cn(
                      "flex shrink-0 items-center justify-center",
                      compact ? "mt-0.5 h-9 w-9" : "mt-0.5 h-10 w-10",
                      FACTORY_ICON_RADIUS,
                      tc.well
                    )}
                  >
                    <span className={cn(tc.icon, "[&>svg]:h-[1.1rem] [&>svg]:w-[1.1rem]")}>
                      {iconForFactoryKind(output.kind)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium leading-snug text-zinc-900 dark:text-zinc-100">
                      {output.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
                      {factoryKindShortLabel(output.kind)} · {output.author} · {output.createdAt}
                    </p>
                    {!compact ? (
                      <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-zinc-500 dark:text-zinc-400">
                        {output.excerpt}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "mt-1 inline-flex shrink-0 items-center gap-0.5 tabular-nums",
                      mx.typeCaption
                    )}
                  >
                    <Eye className="h-3 w-3 opacity-70" strokeWidth={2} aria-hidden />
                    {formatViews(output.viewCount)}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function PublicFactoryOutputDetailScreen({
  output,
  libraryName,
  onBack,
}: {
  output: PublicFactoryOutput
  libraryName: string
  onBack: () => void
}) {
  const tc = mx.factoryTone[output.kind]

  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-zinc-950">
      <div className="flex items-center justify-between border-b border-stone-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <button
          type="button"
          onClick={onBack}
          className="-ml-2 rounded-full p-2 hover:bg-stone-50 dark:hover:bg-zinc-900"
          aria-label="Back"
        >
          <ChevronLeft className="h-6 w-6 text-zinc-700 dark:text-zinc-200" />
        </button>
        <span className={cn("text-[12px] font-medium", mx.shellMuted)}>
          {factoryKindShortLabel(output.kind)}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 pb-10">
        <div
          className={cn(
            "mb-5 flex h-40 w-full flex-col items-center justify-center gap-2",
            FACTORY_CARD_RADIUS,
            tc.well,
            "ring-1 ring-stone-200/80 dark:ring-zinc-700/80"
          )}
        >
          <span className={cn(tc.icon, "[&>svg]:h-10 [&>svg]:w-10")}>{iconForFactoryKind(output.kind)}</span>
          <p className="text-[12px] font-medium text-zinc-600 dark:text-zinc-300">
            {factoryKindShortLabel(output.kind)} preview
          </p>
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-50">
          {output.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-500">
          <span>{output.author}</span>
          <span>·</span>
          <span>{output.createdAt}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Eye className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {formatViews(output.viewCount)} views
          </span>
        </div>
        <p className="mt-1 text-[12px] text-zinc-400 dark:text-zinc-500">From “{libraryName}”</p>

        <div className="mt-6 space-y-4 text-[15px] leading-[1.7] text-zinc-600 dark:text-zinc-300">
          {bodyForPublicFactoryOutput(output).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </div>
    </div>
  )
}
