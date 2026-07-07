"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
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
  onFactorySelect?: (kind: FactoryModalKind) => void
  selectedFactoryId?: FactoryModalKind | null
  examplePrompts?: AgentExamplePrompt[]
  onExampleSelect?: (prompt: string) => void
  /** Show horizontal content-factory chips around the composer. */
  showFactoryRail?: boolean
  factoryRailLayout?: "grid" | "scroll"
  factoryPlacement?: "above" | "below" | "inside"
  factoryRailDensity?: "default" | "compact" | "tight"
  /** `stack` — mobile vertical; `wrap` — web multi-row suggestions above composer */
  promptLayout?: "stack" | "scroll" | "wrap"
  /** Elevated shadow on composer when factory sits below (in-thread agent home). */
  elevateComposer?: boolean
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
  factoryPlacement = "below",
  factoryRailDensity = "compact",
  promptLayout = "stack",
  elevateComposer = false,
  className,
}: AgentHomeComposerStackProps) {
  const handleRail = (id: FactoryRailItem["id"]) => {
    onFactorySelect?.(resolveFactoryRailSelection(id))
  }

  const factoryRail =
    showFactoryRail && factoryPlacement !== "inside" ? (
      <MindChatFactoryRail
        layout={factoryRailLayout}
        railStyle="pill"
        density={factoryRailDensity}
        selectedId={selectedFactoryId}
        onSelect={handleRail}
      />
    ) : null

  const factoryAbove = factoryPlacement === "above" && factoryRail
  const factoryBelow = factoryPlacement === "below" && factoryRail

  const hasExamplePrompts = Boolean(examplePrompts?.length && onExampleSelect)

  return (
    <div className={cn("w-full", className)}>
      {hasExamplePrompts ? (
        <AgentExamplePromptRail
          layout={promptLayout}
          prompts={examplePrompts!}
          onSelect={onExampleSelect!}
          className={cn(
            factoryAbove ? "mb-2.5" : "mb-0",
            !factoryAbove && "mb-4 sm:mb-5"
          )}
        />
      ) : null}

      {factoryAbove ? (
        <div className="flex flex-col">
          <div className="px-0.5 pb-2">{factoryRail}</div>
          <div
            className={cn(
              mx.composerThreadDock,
              "[&_.composer-shell]:border-0 [&_.composer-shell]:bg-transparent [&_.composer-shell]:shadow-none",
              "dark:[&_.composer-shell]:bg-transparent"
            )}
          >
            {composer}
          </div>
        </div>
      ) : factoryBelow ? (
        <>
          <div
            className={cn(
              elevateComposer &&
                cn(
                  mx.composerThreadDock,
                  "[&_.composer-shell]:border-0 [&_.composer-shell]:bg-transparent [&_.composer-shell]:shadow-none",
                  "dark:[&_.composer-shell]:bg-transparent"
                )
            )}
          >
            {composer}
          </div>
          <div className="px-0.5 pt-2">{factoryRail}</div>
        </>
      ) : (
        composer
      )}
    </div>
  )
}
