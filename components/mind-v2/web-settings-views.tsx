"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  WebSettingsSection,
  WebSettingsRow,
  WebSettingsSelect,
  WebSettingsSubpage,
  WebSettingsToggle,
} from "@/components/mind-v2/web-settings-layout"
import {
  MeCollectedPersonalInfoPanel,
  MePrivacyGuideSummaryPanel,
  MePrivacySettingsPanel,
  MeStorageSpacePanel,
  MeThirdPartySharingPanel,
} from "@/components/mind-v2/me-settings-panels"
import {
  AI_MODEL_LABELS,
  type AiModelId,
  type WebSettingsPrefs,
  writeWebSettingsPrefs,
} from "@/lib/mind-web-settings-prefs"
import { Cloud, ExternalLink, Puzzle } from "lucide-react"

export function WebSettingsPanelHost({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="relative h-full min-h-0 w-full">{children}</div>
}

export function WebStorageView({ onBack }: { onBack: () => void }) {
  return (
    <WebSettingsPanelHost>
      <MeStorageSpacePanel onBack={onBack} />
    </WebSettingsPanelHost>
  )
}

export function WebPrivacyGuideView({ onBack }: { onBack: () => void }) {
  return (
    <WebSettingsPanelHost>
      <MePrivacyGuideSummaryPanel onBack={onBack} />
    </WebSettingsPanelHost>
  )
}

export function WebPrivacySettingsView({
  onBack,
  crashReportsEnabled,
  onCrashReportsChange,
}: {
  onBack: () => void
  crashReportsEnabled: boolean
  onCrashReportsChange: (v: boolean) => void
}) {
  return (
    <WebSettingsPanelHost>
      <MePrivacySettingsPanel
        onBack={onBack}
        crashReportsEnabled={crashReportsEnabled}
        onCrashReportsChange={onCrashReportsChange}
      />
    </WebSettingsPanelHost>
  )
}

export function WebDataCollectedView({ onBack }: { onBack: () => void }) {
  return (
    <WebSettingsPanelHost>
      <MeCollectedPersonalInfoPanel onBack={onBack} />
    </WebSettingsPanelHost>
  )
}

export function WebThirdPartyView({ onBack }: { onBack: () => void }) {
  return (
    <WebSettingsPanelHost>
      <MeThirdPartySharingPanel onBack={onBack} />
    </WebSettingsPanelHost>
  )
}

export function WebModelSettingsView({
  onBack,
  model,
  onModelChange,
}: {
  onBack: () => void
  model: AiModelId
  onModelChange: (m: AiModelId) => void
}) {
  const options: { id: AiModelId; title: string; desc: string }[] = [
    { id: "light", title: "Light", desc: "Fast answers, lower credit use" },
    { id: "balanced", title: "Balanced", desc: "Default for library Q&A" },
    { id: "frontier", title: "Frontier", desc: "Deeper reasoning and longer context" },
  ]

  return (
    <WebSettingsSubpage title="Default model" onBack={onBack}>
      <div className="mx-auto max-w-[720px] space-y-3 px-10 py-6">
        {options.map((opt) => {
          const active = model === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                onModelChange(opt.id)
                toast.success(`Model set to ${opt.title}`)
              }}
              className={cn(
                "flex w-full flex-col rounded-xl border px-4 py-4 text-left transition-colors",
                active
                  ? "border-teal-200 bg-gradient-to-br from-teal-50/95 to-sky-50/75"
                  : "border-stone-200 bg-white hover:border-stone-300"
              )}
            >
              <span className="text-[15px] font-semibold text-zinc-800">{opt.title}</span>
              <span className="mt-1 text-[13px] text-zinc-500">{opt.desc}</span>
            </button>
          )
        })}
        <p className="pt-2 text-[13px] text-zinc-500">
          Custom API endpoints and team routing can be configured when your workspace admin enables
          them.
        </p>
      </div>
    </WebSettingsSubpage>
  )
}

export function WebCloudSyncView({
  onBack,
  prefs,
  onPrefsChange,
}: {
  onBack: () => void
  prefs: WebSettingsPrefs
  onPrefsChange: (patch: Partial<WebSettingsPrefs>) => WebSettingsPrefs
}) {
  const sync = () => {
    const at = new Date().toISOString()
    onPrefsChange({ lastSyncedAt: at, cloudSyncEnabled: true })
    toast.success("Sync complete", { description: "Libraries and notes are up to date." })
  }

  return (
    <WebSettingsSubpage title="Cloud sync" onBack={onBack}>
      <div className="mx-auto max-w-[720px] px-10 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-50 to-sky-50">
            <Cloud className="h-10 w-10 text-teal-600" strokeWidth={1.5} />
          </div>
          <h3 className="text-[22px] font-semibold text-zinc-800">Private cloud sync</h3>
          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-zinc-500">
            Automatic backups and cross-device access for your libraries and captures.
          </p>
        </div>

        <WebSettingsSection title="Sync">
          <WebSettingsRow label="Enable cloud sync">
            <WebSettingsToggle
              checked={prefs.cloudSyncEnabled}
              onChange={() => {
                const next = !prefs.cloudSyncEnabled
                onPrefsChange({
                  cloudSyncEnabled: next,
                  ...(next && !prefs.lastSyncedAt ? { lastSyncedAt: new Date().toISOString() } : {}),
                })
                toast.success(next ? "Cloud sync on" : "Cloud sync off")
              }}
              aria-label="Enable cloud sync"
            />
          </WebSettingsRow>
          <WebSettingsRow label="Sync on Wi‑Fi only">
            <WebSettingsToggle
              checked={prefs.cloudSyncWifiOnly}
              onChange={() => {
                onPrefsChange({ cloudSyncWifiOnly: !prefs.cloudSyncWifiOnly })
                toast.success("Saved")
              }}
              aria-label="Wi-Fi only sync"
            />
          </WebSettingsRow>
          <WebSettingsRow
            label="Sync now"
            hint={
              prefs.lastSyncedAt
                ? `Last: ${new Date(prefs.lastSyncedAt).toLocaleString()}`
                : "Never"
            }
            onClick={sync}
          />
        </WebSettingsSection>
      </div>
    </WebSettingsSubpage>
  )
}

export function WebPersonalizationView({ onBack }: { onBack: () => void }) {
  const [focus, setFocus] = useState("")
  const [instructions, setInstructions] = useState("")

  return (
    <WebSettingsSubpage title="Personalization" onBack={onBack}>
      <div className="mx-auto max-w-[720px] space-y-8 px-10 py-6">
        <section>
          <h3 className="text-[15px] font-semibold text-zinc-800">Focus areas</h3>
          <input
            type="text"
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            placeholder="What should outputs emphasize?"
            className="mt-3 w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] outline-none focus:border-teal-300"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {["Key takeaways", "Risks & open questions", "Actions & next steps"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setFocus(tag)
                  toast.success("Focus area saved", { description: tag })
                }}
                className="rounded-full bg-stone-100 px-3 py-1.5 text-[13px] text-zinc-700 hover:bg-stone-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-[15px] font-semibold text-zinc-800">Custom instructions</h3>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Tone and style for explanations"
            rows={3}
            className="mt-3 w-full resize-none rounded-xl border border-stone-200 px-4 py-3 text-[15px] outline-none focus:border-teal-300"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {["Concise", "Formal & professional", "Structured"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setInstructions(tag)
                  toast.success("Style applied", { description: tag })
                }}
                className="rounded-full bg-stone-100 px-3 py-1.5 text-[13px] text-zinc-700 hover:bg-stone-200"
              >
                {tag}
              </button>
            ))}
          </div>
        </section>

        <button
          type="button"
          onClick={() => toast.success("Personalization saved")}
          className="rounded-xl bg-zinc-900 px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-zinc-800"
        >
          Save preferences
        </button>
      </div>
    </WebSettingsSubpage>
  )
}

export function WebDevicesView({ onBack }: { onBack: () => void }) {
  const [connected, setConnected] = useState(true)

  return (
    <WebSettingsSubpage title="Devices" onBack={onBack}>
      <div className="mx-auto max-w-[720px] space-y-4 px-10 py-6">
        <div
          className={cn(
            "rounded-2xl border-2 p-5",
            connected
              ? "border-teal-200/80 bg-gradient-to-br from-teal-50/80 to-sky-50/50"
              : "border-dashed border-stone-300 bg-stone-50"
          )}
        >
          <p className="text-[16px] font-semibold text-zinc-800">
            {connected ? "Mindar Note · Connected" : "No device connected"}
          </p>
          {connected ? (
            <ul className="mt-3 space-y-1 text-[13px] text-zinc-600">
              <li>Battery · 78%</li>
              <li>Storage · 12.4 GB free</li>
              <li>Last sync · Just now</li>
            </ul>
          ) : (
            <p className="mt-2 text-[13px] text-zinc-500">Pair a recorder to capture on the go.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setConnected((v) => !v)
            toast.success(connected ? "Device disconnected" : "Device connected")
          }}
          className="w-full rounded-xl border border-stone-200 py-3 text-[14px] font-semibold text-zinc-700 hover:bg-stone-50"
        >
          {connected ? "Disconnect" : "Pair device"}
        </button>
      </div>
    </WebSettingsSubpage>
  )
}

export function WebExtensionView({
  onBack,
  linked,
  onLinkedChange,
}: {
  onBack: () => void
  linked: boolean
  onLinkedChange: (v: boolean) => void
}) {
  return (
    <WebSettingsSubpage title="Browser extension" onBack={onBack}>
      <div className="mx-auto max-w-[720px] px-10 py-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
            <Puzzle className="h-8 w-8 text-teal-600" />
          </div>
          <h3 className="text-[20px] font-semibold text-zinc-800">Mindar for Chrome</h3>
          <p className="mt-2 max-w-sm text-[14px] text-zinc-500">
            Clip pages, highlight passages, and send them to your active library from any tab.
          </p>
        </div>
        {linked ? (
          <div className="mt-8 rounded-xl bg-teal-50 px-4 py-3 text-center text-[14px] font-medium text-teal-800">
            Extension connected · Quick capture is active
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              onLinkedChange(true)
              toast.success("Extension linked", {
                description: "Install from the store, then click the Mindar icon on any page.",
              })
            }}
            className="mt-8 w-full rounded-xl bg-zinc-900 py-3 text-[14px] font-semibold text-white hover:bg-zinc-800"
          >
            Connect extension
          </button>
        )}
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-1 text-[13px] font-medium text-teal-600 hover:underline"
        >
          Open Chrome Web Store
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </WebSettingsSubpage>
  )
}

export function WebUserGuideView({ onBack }: { onBack: () => void }) {
  return (
    <WebSettingsSubpage title="User guide" onBack={onBack}>
      <div className="mx-auto max-w-[720px] space-y-4 px-10 py-6">
        <p className="text-[15px] leading-relaxed text-zinc-600">
          Learn how libraries, grounded Q&A, Studio outputs, and capture flows work together in Mindar.
        </p>
        <Link
          href="/landing"
          className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-[14px] font-semibold text-white hover:bg-zinc-800"
        >
          Open product guide
          <ExternalLink className="h-4 w-4" />
        </Link>
        <Link
          href="/landing#use-cases"
          className="block text-[14px] font-medium text-teal-600 hover:underline"
        >
          Browse use cases
        </Link>
      </div>
    </WebSettingsSubpage>
  )
}

export function WebContactSupportView({ onBack }: { onBack: () => void }) {
  return (
    <WebSettingsSubpage title="Contact support" onBack={onBack}>
      <div className="mx-auto max-w-[720px] space-y-4 px-10 py-6">
        <p className="text-[15px] text-zinc-600">We typically reply within one business day.</p>
        <a
          href="mailto:support@mindar.app?subject=Mindar%20Web%20Support"
          className="inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-[14px] font-semibold text-white hover:bg-zinc-800"
        >
          Email support@mindar.app
        </a>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText("support@mindar.app")
            toast.success("Email copied")
          }}
          className="block text-[14px] font-medium text-teal-600 hover:underline"
        >
          Copy address
        </button>
      </div>
    </WebSettingsSubpage>
  )
}

export function WebRateMindarView({ onBack }: { onBack: () => void }) {
  const [rating, setRating] = useState(0)

  return (
    <WebSettingsSubpage title="Rate Mindar" onBack={onBack}>
      <div className="mx-auto max-w-[720px] px-10 py-8 text-center">
        <p className="text-[15px] text-zinc-600">How is your experience so far?</p>
        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => {
                setRating(n)
                toast.success("Thanks for your feedback!", { description: `${n} stars` })
              }}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl text-[20px] transition-colors",
                rating >= n ? "bg-amber-100 text-amber-600" : "bg-stone-100 text-stone-400 hover:bg-stone-200"
              )}
              aria-label={`${n} stars`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
    </WebSettingsSubpage>
  )
}

export function modelHint(model: AiModelId) {
  return AI_MODEL_LABELS[model]
}
