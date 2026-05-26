"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { ExternalLink, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  WebSettingsFontSlider,
  WebSettingsPage,
  WebSettingsRow,
  WebSettingsSection,
  WebSettingsSelect,
  WebSettingsToggle,
} from "@/components/mind-v2/web-settings-layout"
import {
  clearAppCacheExceptEssentials,
  readWebSettingsPrefs,
  writeWebSettingsPrefs,
} from "@/lib/mind-web-settings-prefs"
import {
  clampFontZoomPercent,
  MIND_FONT_ZOOM_MAX,
  MIND_FONT_ZOOM_MIN,
  writeStoredFontZoomPercent,
} from "@/lib/mind-display-prefs"
import { useWebData } from "@/web-api/WebDataProvider"

type ThemePreference = "system" | "light" | "dark"

/** Appearance & prefs in rail; full system admin opens React `/platform/settings` (Vue panels bridged). */
export function WebRailSettingsConnected({
  open = true,
  onClose,
  fontZoomPercent,
  onFontZoomPercentChange,
  embedded = false,
}: {
  open?: boolean
  onClose: () => void
  fontZoomPercent: number
  onFontZoomPercentChange: (pct: number) => void
  embedded?: boolean
}) {
  const { openSystemSettings } = useWebData()
  const [themePref, setThemePref] = useState<ThemePreference>(() => {
    try {
      const t = localStorage.getItem("WeKnora_theme")
      if (t === "light" || t === "dark") return t
    } catch {
      /* ignore */
    }
    return "system"
  })
  const [prefs, setPrefs] = useState(() => readWebSettingsPrefs())

  useEffect(() => {
    if (!open) return
    setPrefs(readWebSettingsPrefs())
  }, [open])

  useEffect(() => {
    try {
      localStorage.setItem("WeKnora_theme", themePref)
      const resolved =
        themePref === "system"
          ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
          : themePref
      document.documentElement.setAttribute("theme-mode", resolved)
    } catch {
      /* ignore */
    }
  }, [themePref])

  if (!open) return null

  const appearanceOptions: { value: ThemePreference; label: string }[] = [
    { value: "system", label: "Follow system" },
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ]

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "zh", label: "Chinese" },
  ]

  const cacheLabel = `${prefs.cacheMb.toFixed(1)} MB`

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden bg-white/95",
        embedded ? "" : "fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-xl ring-1 ring-black/5"
      )}
    >
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3">
        <h2 className="text-[15px] font-semibold text-zinc-800">Settings</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-zinc-500 hover:bg-stone-100"
          aria-label="Close"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <WebSettingsPage>
          <WebSettingsSection title="Workspace admin">
            <WebSettingsRow
              label="System settings"
              hint="Models, MCP, tenant, Ollama"
              onClick={() => openSystemSettings()}
            >
              <ExternalLink className="size-4 text-zinc-400" aria-hidden />
            </WebSettingsRow>
            <p className="px-3 pb-2 text-[12px] leading-relaxed text-zinc-500">
              Knowledge base chunking, embeddings, and data sources open in the classic admin view for each library.
            </p>
          </WebSettingsSection>

          <WebSettingsSection title="General">
            <WebSettingsRow label="Appearance">
              <WebSettingsSelect
                value={themePref}
                options={appearanceOptions}
                onChange={(v) => {
                  setThemePref(v as ThemePreference)
                  toast.success("Appearance updated")
                }}
                aria-label="Appearance"
              />
            </WebSettingsRow>
            <WebSettingsRow label="Language">
              <WebSettingsSelect
                value={prefs.language}
                options={languageOptions}
                onChange={(v) => {
                  writeWebSettingsPrefs({ language: v })
                  setPrefs(readWebSettingsPrefs())
                  toast.success("Language saved")
                }}
                aria-label="Language"
              />
            </WebSettingsRow>
            <WebSettingsRow label="Font size">
              <WebSettingsFontSlider
                value={fontZoomPercent}
                min={MIND_FONT_ZOOM_MIN}
                max={MIND_FONT_ZOOM_MAX}
                onChange={(next) => {
                  const clamped = clampFontZoomPercent(next)
                  onFontZoomPercentChange(clamped)
                  writeStoredFontZoomPercent(clamped)
                }}
              />
            </WebSettingsRow>
          </WebSettingsSection>

          <WebSettingsSection title="Notifications">
            <WebSettingsRow label="Recording ready">
              <WebSettingsToggle
                checked={prefs.notifCaptureReady}
                onChange={() => {
                  writeWebSettingsPrefs({ notifCaptureReady: !prefs.notifCaptureReady })
                  setPrefs(readWebSettingsPrefs())
                  toast.success("Saved")
                }}
                aria-label="Recording ready notifications"
              />
            </WebSettingsRow>
          </WebSettingsSection>

          <WebSettingsSection title="Storage">
            <WebSettingsRow
              label="Clear cache"
              hint={cacheLabel}
              onClick={() => {
                if (!window.confirm(`Clear ${cacheLabel} of cached data? Your libraries stay intact.`)) return
                clearAppCacheExceptEssentials()
                setPrefs(readWebSettingsPrefs())
                toast.success("Cache cleared")
              }}
            />
          </WebSettingsSection>
        </WebSettingsPage>
      </div>
    </div>
  )
}
