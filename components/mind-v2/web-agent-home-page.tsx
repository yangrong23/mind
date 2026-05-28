"use client"

import { useState } from "react"
import { toast } from "sonner"
import { WebPageCanvas } from "@/components/mind-v2/web-app-chrome"
import { MindChatComposer } from "@/components/mind-v2/mind-chat-composer"
import { MINDAR_COPILOT_AGENT, type Agent, type AgentChatLaunchOptions } from "@/components/mind-v2/agent-tab"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"

export function WebAgentHomePage({
  onAgentChat,
  requireAuthThen,
}: {
  onAgentChat: (agent: Agent, options?: AgentChatLaunchOptions) => void
  requireAuthThen?: (run: () => void) => void
}) {
  const runWithAuth = requireAuthThen ?? ((fn: () => void) => fn())
  const [draft, setDraft] = useState("")

  function submit() {
    runWithAuth(() => {
      const q = draft.trim()
      if (!q) {
        toast.error("Add a prompt first")
        return
      }
      onAgentChat(MINDAR_COPILOT_AGENT, { initialPrompt: q })
      setDraft("")
    })
  }

  return (
    <WebPageCanvas>
      <div className="flex h-full min-h-0 flex-col items-center justify-center px-6 pb-0">
        <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row sm:items-center">
          <MindarLogo height={26} className="max-w-[5.5rem]" />
          <div className="text-center sm:text-left">
            <h1 className="text-[28px] font-semibold tracking-tight text-zinc-700">Agents</h1>
            <p className="text-[14px] text-zinc-500">Ask across libraries · opens a three-column chat workspace</p>
          </div>
        </div>
        <div className="w-full max-w-2xl">
          <MindChatComposer
            variant="home"
            value={draft}
            onChange={setDraft}
            onSubmit={submit}
            placeholder="Ask or create content…"
          />
        </div>
        <p className="mt-6 max-w-md text-center text-[12px] text-zinc-400">
          Opens the AI Assistant workspace with conversations, dialogue, and sources — matching the product layout.
        </p>
      </div>
    </WebPageCanvas>
  )
}
