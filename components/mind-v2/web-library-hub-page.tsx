"use client"

import { useCallback, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { web } from "@/components/mind-v2/web-design"
import {
  WebLibraryHubHeader,
  type LibraryHubPrimary,
} from "@/components/mind-v2/web-library-hub-header"
import { WebKnowledgeBrowser, type LibraryHubSectionId } from "@/components/mind-v2/web-knowledge-browser"
import { WebPlazaDiscoverPage } from "@/components/mind-v2/web-plaza-discover-page"
import type { LibraryChatLaunchContext } from "@/components/mind-v2/knowledge-detail"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"
import type { PlazaCategoryId, PlazaLibraryRow } from "@/lib/mock-plaza-libraries"
import { PLAZA_CATEGORY_TABS } from "@/lib/mock-plaza-libraries"
import { LIBRARY_HUB_SECTIONS } from "@/lib/library-hub-sections"

const LIBRARY_SECTION_TABS: { id: LibraryHubSectionId; label: string }[] = LIBRARY_HUB_SECTIONS.map(
  (s) => ({ id: s.id, label: s.label })
)

const PLAZA_SUB_TABS = PLAZA_CATEGORY_TABS.map((t) => ({ id: t.id, label: t.label }))

export function WebLibraryHubPage({
  selectedKbId,
  onSelectKb,
  onDeselectKb,
  onOpenWorkspace,
  requireAuthThen,
  extraSubscribedKbs,
  recentKbIds,
  pinnedKbIds,
  onTogglePinKb,
  onKbCreated,
  onLibraryPublished,
  onOpenLibraryChat,
  onBrowseLibraryFromPlaza,
  onStartThreadFromPlaza,
  extraPlazaRows,
  initialPrimary = "plaza",
  primary: controlledPrimary,
  onPrimaryChange,
}: {
  selectedKbId: number | null
  onSelectKb: (kb: KnowledgeBase) => void
  onDeselectKb?: () => void
  onOpenWorkspace: (kb: KnowledgeBase) => void
  requireAuthThen?: (run: () => void) => void
  extraSubscribedKbs?: KnowledgeBase[]
  recentKbIds?: number[]
  pinnedKbIds?: number[]
  onTogglePinKb?: (kbId: number) => void
  onKbCreated?: (kb: KnowledgeBase) => void
  onLibraryPublished?: (kb: KnowledgeBase) => void
  onOpenLibraryChat?: (kb: KnowledgeBase, context: LibraryChatLaunchContext) => void
  onBrowseLibraryFromPlaza: (row: PlazaLibraryRow) => void
  onStartThreadFromPlaza: (row: PlazaLibraryRow, prompt?: string) => void
  extraPlazaRows?: PlazaLibraryRow[]
  initialPrimary?: LibraryHubPrimary
  primary?: LibraryHubPrimary
  onPrimaryChange?: (next: LibraryHubPrimary) => void
}) {
  const [internalPrimary, setInternalPrimary] = useState<LibraryHubPrimary>(initialPrimary)
  const primary = controlledPrimary ?? internalPrimary
  const setPrimary = onPrimaryChange ?? setInternalPrimary
  const [librarySection, setLibrarySection] = useState<LibraryHubSectionId>("mine")
  const [plazaCategory, setPlazaCategory] = useState<PlazaCategoryId>("recommended")
  const [searchOpen, setSearchOpen] = useState(false)
  const [plazaQuery, setPlazaQuery] = useState("")
  const sidebarSearchRef = useRef<HTMLInputElement | null>(null)

  const subTabs = primary === "plaza" ? PLAZA_SUB_TABS : LIBRARY_SECTION_TABS
  const activeSubId = primary === "plaza" ? plazaCategory : librarySection

  const handlePrimaryChange = useCallback((next: LibraryHubPrimary) => {
    setPrimary(next)
    setSearchOpen(false)
  }, [])

  const handleSubChange = useCallback(
    (id: string) => {
      if (primary === "plaza") {
        setPlazaCategory(id as PlazaCategoryId)
      } else {
        setLibrarySection(id as LibraryHubSectionId)
        onDeselectKb?.()
      }
    },
    [onDeselectKb, primary]
  )

  const handleSearchClick = useCallback(() => {
    setSearchOpen((o) => {
      const next = !o
      if (next && primary === "libraries") {
        window.setTimeout(() => sidebarSearchRef.current?.focus(), 0)
      }
      return next
    })
  }, [primary])

  return (
    <div className={cn("flex h-full min-h-0 flex-col", web.canvas)}>
      <WebLibraryHubHeader
        primary={primary}
        onPrimaryChange={handlePrimaryChange}
        subTabs={subTabs}
        activeSubId={activeSubId}
        onSubChange={handleSubChange}
        onSearchClick={primary === "libraries" ? handleSearchClick : undefined}
        searchActive={primary === "libraries" && searchOpen}
      />

      <div className="min-h-0 flex-1 overflow-hidden">
        {primary === "plaza" ? (
          <WebPlazaDiscoverPage
            embedded
            category={plazaCategory}
            onCategoryChange={setPlazaCategory}
            query={plazaQuery}
            onQueryChange={setPlazaQuery}
            onBrowseLibrary={onBrowseLibraryFromPlaza}
            onStartThread={onStartThreadFromPlaza}
            extraPlazaRows={extraPlazaRows}
          />
        ) : (
          <WebKnowledgeBrowser
            integratedNav
            selectedKbId={selectedKbId}
            onSelectKb={onSelectKb}
            onDeselectKb={onDeselectKb}
            onOpenWorkspace={onOpenWorkspace}
            requireAuthThen={requireAuthThen}
            extraSubscribedKbs={extraSubscribedKbs}
            recentKbIds={recentKbIds}
            onKbCreated={onKbCreated}
            onLibraryPublished={onLibraryPublished}
            onBrowsePlaza={() => setPrimary("plaza")}
          />
        )}
      </div>
    </div>
  )
}
