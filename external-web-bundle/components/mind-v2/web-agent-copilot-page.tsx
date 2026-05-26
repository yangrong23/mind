"use client"

import { useEffect, useState } from "react"
import { USE_CASE_GUIDES } from "@/lib/mind-use-case-guides"
import { getUseCaseGuide } from "@/lib/mind-use-case-guides"
import {
  MindUseCaseGuidePanel,
  UseCaseCard,
} from "@/components/mind-v2/mind-use-case-guide-panel"
import { USE_CASE_SECTION } from "@/lib/mind-use-case-guides"
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
import { SectionTitle } from "@/components/mind-landing/landing-primitives"

/** Mindar Agent home — centered copilot + landing use cases */
export function WebAgentCopilotPage({
  onAgentChat,
  requireAuthThen,
  draftSeed,
  onDraftSeedConsumed,
}: {
  onAgentChat: (agent: Agent, options?: AgentChatLaunchOptions) => void
  requireAuthThen?: (run: () => void) => void
  draftSeed?: string | null
  onDraftSeedConsumed?: () => void
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [draft, setDraft] = useState("")
  const [factoryModal, setFactoryModal] = useState<FactoryModalKind | null>(null)
  const [selectedFactory, setSelectedFactory] = useState<FactoryModalKind | null>(null)
  const examplePrompts = getAgentExamplePrompts(0)
  const [guideId, setGuideId] = useState<string | null>(null)
  const activeGuide = guideId ? getUseCaseGuide(guideId) : null

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
        "flex h-full min-h-0 flex-col overflow-y-auto overscroll-y-contain bg-[#fafafa]",
        webNavMotion.contentEnter
      )}
    >
        <section aria-label="Agent home hero" className="shrink-0 px-6 pb-8 pt-8 sm:pt-10">
          <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
            <div className="flex flex-col items-center px-2 pb-6">
              <MindarLogo height={26} priority className="max-w-[5.5rem]" />
              <h2 className="mt-6 text-center text-[22px] font-semibold tracking-tight text-zinc-800 sm:text-[26px]">
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
            <SectionTitle
              title={USE_CASE_SECTION.title}
              subtitle={USE_CASE_SECTION.subtitle}
            />
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {USE_CASE_GUIDES.map((guide) => (
                <UseCaseCard key={guide.id} guide={guide} onOpenGuide={setGuideId} />
              ))}
            </div>
          </div>
        </section>

        <MindUseCaseGuidePanel
          guide={activeGuide ?? null}
          open={Boolean(activeGuide)}
          onClose={() => setGuideId(null)}
          onUsePrompt={(prompt) => setDraft(prompt)}
        />
    </div>
  )
}
