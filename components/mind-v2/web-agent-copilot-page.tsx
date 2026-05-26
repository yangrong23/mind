"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { webNavMotion } from "@/components/mind-v2/web-nav-motion"
import { AgentExamplePromptRail } from "@/components/mind-v2/agent-example-prompt-rail"
import { AgentHomeComposerStack } from "@/components/mind-v2/agent-home-composer-stack"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import {
  MindChatFactoryRail,
  resolveFactoryRailSelection,
} from "@/components/mind-v2/mind-chat-factory-rail"
import {
  ContentFactoryModals,
  type FactoryModalKind,
} from "@/components/mind-v2/content-factory-modals"
import { getAgentExamplePrompts } from "@/lib/agent-chat-example-prompts"
import { MINDAR_COPILOT_AGENT, type Agent, type AgentChatLaunchOptions } from "@/components/mind-v2/agent-tab"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { MindUseCasesSection } from "@/components/mind-v2/mind-use-case-guide-panel"
import { WebQuickRecentsPanel } from "@/components/mind-v2/web-quick-recents-panel"
import type { KnowledgeBase } from "@/lib/mock-knowledge-bases"

/** Mindar Agent home — composer + landing-aligned use cases */
export function WebAgentCopilotPage({
  onAgentChat,
  requireAuthThen,
  draftSeed,
  onDraftSeedConsumed,
  recentKbs = [],
  recentAgents = [],
  onOpenLibrary,
  onSeeAllLibraries,
  onSeeAllAgents,
}: {
  onAgentChat: (agent: Agent, options?: AgentChatLaunchOptions) => void
  requireAuthThen?: (run: () => void) => void
  draftSeed?: string | null
  onDraftSeedConsumed?: () => void
  recentKbs?: KnowledgeBase[]
  recentAgents?: Agent[]
  onOpenLibrary?: (kb: KnowledgeBase) => void
  onSeeAllLibraries?: () => void
  onSeeAllAgents?: () => void
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [draft, setDraft] = useState("")
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [selectedFactory, setSelectedFactory] = useState<FactoryModalKind | null>(null)
  const examplePrompts = getAgentExamplePrompts(0)

  useEffect(() => {
    if (!draftSeed) return
    setDraft(draftSeed)
    onDraftSeedConsumed?.()
  }, [draftSeed, onDraftSeedConsumed])

  function submit() {
    runWithAuth(() => {
      const q = draft.trim()
      if (!q) {
        toast.error("Add a question first")
        return
      }
      onAgentChat(MINDAR_COPILOT_AGENT, { initialPrompt: q })
      setDraft("")
    })
  }

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-y-auto overscroll-y-contain bg-gradient-to-b from-sky-50/35 via-[#fafafa] to-[#fafafa]",
        webNavMotion.contentEnter
      )}
    >
      <section aria-label="Agent home" className="shrink-0 px-6 pb-8 pt-6 sm:pt-8">
        <WebQuickRecentsPanel
          recentKbs={recentKbs}
          recentAgents={recentAgents}
          onOpenKb={(kb) => runWithAuth(() => onOpenLibrary?.(kb))}
          onOpenAgent={(agent) => runWithAuth(() => onAgentChat(agent))}
          onSeeAllLibraries={() => onSeeAllLibraries?.()}
          onSeeAllAgents={() => onSeeAllAgents?.()}
          className="mb-8"
        />
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          <div className="flex flex-col items-center px-2 pb-8 pt-2">
            <MindarLogo height={40} priority className="max-w-[7.5rem]" />
            <h2 className="mt-4 text-center text-[22px] font-semibold tracking-tight text-zinc-800 sm:text-[26px]">
              What can I help you with?
            </h2>
            <AgentExamplePromptRail
              layout="wrap"
              prompts={examplePrompts}
              onSelect={(prompt) => runWithAuth(() => setDraft(prompt))}
              className="mt-6 w-full max-w-3xl"
            />
          </div>

          <div className="w-full shrink-0 text-left">
            <AgentHomeComposerStack
              factoryPlacement="inside"
              selectedFactoryId={selectedFactory}
              onFactorySelect={(kind) =>
                runWithAuth(() => {
                  setSelectedFactory(kind)
                  setFactoryModal(kind)
                })
              }
              composer={
                <MindChatComposer
                  variant="home"
                  className="max-w-none"
                  value={draft}
                  onChange={setDraft}
                  onSubmit={submit}
                  placeholder="Ask anything…"
                  factoryToolbar={
                    <MindChatFactoryRail
                      railStyle="inline"
                      density="compact"
                      selectedId={selectedFactory}
                      onSelect={(id) =>
                        runWithAuth(() => {
                          const kind = resolveFactoryRailSelection(id)
                          setSelectedFactory(kind)
                          setFactoryModal(kind)
                        })
                      }
                    />
                  }
                  onUploadClick={() =>
                    runWithAuth(() =>
                      toast.message("Upload file", { description: "Demo — pick a file from your device." })
                    )
                  }
                  onAtClick={() =>
                    runWithAuth(() =>
                      toast.message("Mention", {
                        description: "Pick a library or source to ground this turn (demo).",
                      })
                    )
                  }
                  atTitle="Libraries & sources"
                />
              }
            />
          </div>
        </div>
      </section>

      <ContentFactoryModals
        open={factoryModal}
        onClose={() => setFactoryModal(null)}
        modalDensity="compact"
        onGenerateSubmit={(kind) => {
          setFactoryModal(null)
          toast.success("Queued", {
            description: `${kind} generation queued (demo).`,
          })
        }}
      />

      <section
        id="use-cases"
        className="shrink-0 px-6 py-12 sm:py-14"
      >
        <div className="mx-auto w-full max-w-5xl">
          <MindUseCasesSection
            compactCards
            onUsePrompt={(prompt) => runWithAuth(() => setDraft(prompt))}
          />
        </div>
      </section>
    </div>
  )
}
