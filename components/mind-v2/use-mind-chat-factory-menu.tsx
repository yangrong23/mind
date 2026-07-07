"use client"

import { useState } from "react"
import { MindChatFactoryMenu } from "@/components/mind-v2/mind-chat-factory-menu"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"

export function useMindChatFactoryMenu(onSelect: (kind: FactoryModalKind) => void) {
  const [factoryMenuOpen, setFactoryMenuOpen] = useState(false)
  const [selectedFactoryKind, setSelectedFactoryKind] = useState<FactoryModalKind | null>(null)

  return {
    showFactoryButton: true as const,
    factoryMenuOpen,
    onFactoryMenuOpenChange: setFactoryMenuOpen,
    selectedFactoryKind,
    factoryMenu: (
      <MindChatFactoryMenu
        selectedId={selectedFactoryKind}
        onSelect={(kind) => {
          setSelectedFactoryKind(kind)
          setFactoryMenuOpen(false)
          onSelect(kind)
        }}
      />
    ),
  }
}
