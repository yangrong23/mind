"use client"

import { MinderContentFactoryGrid } from "@/components/mind-v2/minder-content-factory-grid"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"

export function StudioCreateSheet({
  open,
  materialCount,
  onClose,
  onSelectFactory,
}: {
  open: boolean
  materialCount: number
  onClose: () => void
  onSelectFactory: (kind: FactoryModalKind) => void
}) {
  if (!open) return null

  function handleSelect(kind: FactoryModalKind) {
    onClose()
    onSelectFactory(kind)
  }

  return (
    <div className="absolute inset-0 z-[70] flex flex-col justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        className="relative z-10 flex max-h-[min(88dvh,640px)] w-full flex-col overflow-hidden rounded-t-[1.25rem] bg-white shadow-2xl dark:bg-zinc-950"
        role="dialog"
        aria-modal
        aria-labelledby="studio-create-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pb-1 pt-2.5">
          <div className="h-1 w-10 rounded-full bg-stone-200 dark:bg-zinc-700" aria-hidden />
        </div>

        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-1">
          <h2 id="studio-create-title" className="text-center text-[17px] font-semibold text-zinc-900 dark:text-zinc-50">
            Create from library
          </h2>
          <p className="mt-1.5 text-center text-[13px] leading-relaxed text-zinc-500 dark:text-zinc-400">
            {materialCount === 0
              ? "Add material first, then pick a format below."
              : "Pick a format — runs and results stay on Studio."}
          </p>
          <MinderContentFactoryGrid
            librarySummary=""
            onSelect={handleSelect}
            className="!mt-4"
            surface="filled"
            layout="kb"
            density="compact"
          />
        </div>
      </div>
    </div>
  )
}
