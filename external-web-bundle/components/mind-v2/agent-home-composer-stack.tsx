"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { AgentExamplePromptRail } from "@/components/mind-v2/agent-example-prompt-rail"
import {
  MindChatFactoryRail,
  resolveFactoryRailSelection,
  type FactoryRailItem,
} from "@/components/mind-v2/mind-chat-factory-rail"
import type { FactoryModalKind } from "@/components/mind-v2/content-factory-modals"
import type { AgentExamplePrompt } from "@/lib/agent-chat-example-prompts"

export type AgentHomeComposerStackProps = {
  composer: ReactNode
  onFactorySelect: (kind: FactoryModalKind) => void
  selectedFactoryId?: FactoryModalKind | null
  examplePrompts?: AgentExamplePrompt[]
  onExampleSelect?: (prompt: string) => void
  /** Hide content-factory rail (e.g. note AI co-writing). */
  showFactoryRail?: boolean
  /** @default "scroll" — horizontal chips above the composer */
  factoryRailLayout?: "grid" | "scroll"
  /** `inside` — factory lives in composer toolbar (web); `above` — mobile pill rail */
  factoryPlacement?: "above" | "inside"
  /** `stack` — mobile vertical; `wrap` — web multi-row suggestions above composer */
  promptLayout?: "stack" | "scroll" | "wrap"
  className?: string
}

export function AgentHomeComposerStack({
  composer,
  onFactorySelect,
  selectedFactoryId = null,
  examplePrompts,
  onExampleSelect,
  showFactoryRail = true,
  factoryRailLayout = "scroll",
  factoryPlacement = "above",
  promptLayout = "stack",
  className,
}: AgentHomeComposerStackProps) {
  const handleRail = (id: FactoryRailItem["id"]) => {
    onFactorySelect(resolveFactoryRailSelection(id))
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      {examplePrompts?.length && onExampleSelect ? (
        <AgentExamplePromptRail
          layout={promptLayout}
          prompts={examplePrompts}
          onSelect={onExampleSelect}
        />
      ) : null}
      {showFactoryRail && factoryPlacement !== "inside" ? (
        <MindChatFactoryRail
          layout={factoryRailLayout}
          railStyle="pill"
          density="compact"
          selectedId={selectedFactoryId}
          onSelect={handleRail}
        />
      ) : null}
      {composer}
    </div>
  )
}
