"use client"

import { FileUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"

/** Shown on AI view / Studio when a personal library has no material yet. */
export function KbEmptyMaterialCta({
  onAddMaterial,
  className,
}: {
  onAddMaterial: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "mx-4 mt-4 rounded-2xl border border-dashed border-stone-200/90 bg-stone-50/80 px-4 py-5 text-center dark:border-zinc-700 dark:bg-zinc-900/40",
        className
      )}
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-mind shadow-sm ring-1 ring-stone-200/80 dark:bg-zinc-900 dark:ring-zinc-700">
        <FileUp className="h-5 w-5" strokeWidth={1.85} aria-hidden />
      </div>
      <p className="mt-3 text-[14px] font-semibold text-zinc-900 dark:text-zinc-50">Start in Material</p>
      <p className="mt-1 text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
        Upload personal files or paste a link — then AI view, Ask, and Studio can use your sources.
      </p>
      <button
        type="button"
        onClick={onAddMaterial}
        className={cn("mt-4 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white", mx.brandCta, mx.brandFocusRing)}
      >
        Add sources
      </button>
    </div>
  )
}
