"use client"

import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { SettingsGroup } from "@/components/mind-v2/me-settings-ui"
import {
  Battery,
  Bluetooth,
  HardDrive,
  RefreshCw,
  Wifi,
} from "lucide-react"

export interface MeDevicesSettingsPanelProps {
  isDeviceConnected: boolean
  onSetDeviceConnected: (connected: boolean) => void
  lexiconDraft: string
  onLexiconDraftChange: (value: string) => void
  lexiconTags: string[]
  onLexiconTagsChange: (tags: string[]) => void
  offlineOnly: boolean
  onRequestOfflineEnable: () => void
  onOfflineDisable: () => void
}

export function MeDevicesSettingsPanel({
  isDeviceConnected,
  onSetDeviceConnected,
  lexiconDraft,
  onLexiconDraftChange,
  lexiconTags,
  onLexiconTagsChange,
  offlineOnly,
  onRequestOfflineEnable,
  onOfflineDisable,
}: MeDevicesSettingsPanelProps) {
  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-2xl border-2 p-4",
          isDeviceConnected
            ? "border-stone-300/80 bg-gradient-to-br from-stone-100 to-stone-50"
            : "border-stone-300 bg-stone-100"
        )}
      >
        <div className="mb-4 flex items-center gap-4">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              isDeviceConnected ? "bg-gradient-to-br from-mind to-mind" : "bg-stone-400"
            )}
          >
            <Bluetooth className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-semibold text-zinc-900">Mind Recorder</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  isDeviceConnected ? "bg-zinc-700 text-white" : "bg-stone-300 text-zinc-700"
                )}
              >
                {isDeviceConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
            <span className="text-sm text-zinc-600">SN: MR-2024-001234</span>
          </div>
        </div>

        {isDeviceConnected && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/80 p-3 text-center">
              <Battery className={cn("mx-auto mb-1 h-5 w-5", "text-white dark:text-[#1a1a1a]")} />
              <div className="text-lg font-semibold text-zinc-900">85%</div>
              <div className="text-xs text-zinc-600">Battery</div>
            </div>
            <div className="rounded-xl bg-white/80 p-3 text-center">
              <HardDrive className={cn("mx-auto mb-1 h-5 w-5", "text-white dark:text-[#1a1a1a]")} />
              <div className="text-lg font-semibold text-zinc-900">2.3G</div>
              <div className="text-xs text-zinc-600">Free</div>
            </div>
            <div className="rounded-xl bg-white/80 p-3 text-center">
              <Wifi className={cn("mx-auto mb-1 h-5 w-5", "text-white dark:text-[#1a1a1a]")} />
              <div className="text-lg font-semibold text-zinc-900">v2.1</div>
              <div className="text-xs text-zinc-600">Firmware</div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {isDeviceConnected ? (
          <>
            <button
              type="button"
              onClick={() => {
                toast.success("Sync started", {
                  description: "Recordings and metadata upload to this library (demo).",
                })
              }}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white",
                "mind-btn rounded-lg"
              )}
            >
              <RefreshCw className="h-5 w-5" />
              Sync now
            </button>
            <button
              type="button"
              onClick={() => onSetDeviceConnected(false)}
              className="w-full rounded-xl bg-stone-200 py-3 font-medium text-zinc-700 hover:bg-stone-300"
            >
              Disconnect
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onSetDeviceConnected(true)}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white",
              "mind-btn rounded-lg"
            )}
          >
            <Bluetooth className="h-5 w-5" />
            Search & connect
          </button>
        )}
      </div>

      <div className="space-y-2">
        <p className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          On this device
        </p>
        <SettingsGroup>
          <div className="flex items-center gap-3 px-4 py-3">
            <div
              className="relative h-[52px] w-11 shrink-0 rounded-xl bg-gradient-to-b from-stone-100 to-stone-300/90 ring-1 ring-stone-200/80"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-zinc-900">Medrix Mind</p>
              <p className="mt-0.5 text-[13px] text-zinc-500">
                <span className="font-medium text-zinc-600">78%</span>
                <span className="text-zinc-400"> · </span>
                ~42h storage
              </p>
            </div>
          </div>

          <div className="border-t border-stone-100/90 px-4 py-3">
            <p className="text-[14px] font-medium text-zinc-900">Lexicon</p>
            <textarea
              value={lexiconDraft}
              onChange={(e) => onLexiconDraftChange(e.target.value)}
              onBlur={() => {
                const raw = lexiconDraft.trim()
                if (!raw) return
                const parts = raw.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
                if (parts.length) {
                  onLexiconTagsChange(
                    Array.from(new Set([...lexiconTags, ...parts])).slice(0, 24)
                  )
                  onLexiconDraftChange("")
                }
              }}
              placeholder="Add terms (comma or new line) to bias transcription and search"
              rows={2}
              className="mt-2 w-full resize-none rounded-lg border border-stone-200/90 bg-stone-50/50 px-3 py-2 text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400/80 focus:outline-none focus:ring-1 focus:ring-zinc-400/20"
            />
            {lexiconTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {lexiconTags.map((tag) => (
                  <span key={tag} className="rounded-md bg-stone-100 px-2 py-0.5 text-[11px] text-zinc-600">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-stone-100/90 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-medium text-zinc-900">Offline-only processing</p>
              <p className="mt-0.5 text-[12px] leading-snug text-zinc-500">
                Fully offline: cloud Claw and advanced skills are unavailable
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={offlineOnly}
              onClick={() => {
                if (!offlineOnly) onRequestOfflineEnable()
                else onOfflineDisable()
              }}
              className={cn(
                "relative h-7 w-[44px] shrink-0 rounded-full p-0.5 transition-colors",
                offlineOnly ? "bg-mind" : "bg-stone-200"
              )}
            >
              <span
                className={cn(
                  "block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
                  offlineOnly ? "translate-x-[18px]" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </SettingsGroup>
      </div>
    </div>
  )
}
