"use client"

import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import { MindarContentFactoryGrid } from "@/components/mind-v2/mindar-content-factory-grid"

/** Web notebook Studio — same six factory tiles as mobile Knowledge Studio */
export function WebStudioPanel({
  onSelectFactory,
  librarySummary = "",
}: {
  onSelectFactory: (kind: FactoryModalKind) => void
  librarySummary?: string
}) {
  return (
    <MindarContentFactoryGrid
      librarySummary={librarySummary}
      onSelect={onSelectFactory}
      surface="filled"
      layout="kb"
      className="!mt-0"
    />
  )
}
