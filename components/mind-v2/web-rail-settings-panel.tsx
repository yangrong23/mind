"use client"

import { useCallback, useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { X } from "lucide-react"
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
  WebCloudSyncView,
  WebContactSupportView,
  WebDataCollectedView,
  WebDevicesView,
  WebModelSettingsView,
  WebPersonalizationView,
  WebPrivacyGuideView,
  WebPrivacySettingsView,
  WebRateMindarView,
  WebStorageView,
  WebThirdPartyView,
  WebUserGuideView,
  modelHint,
} from "@/components/mind-v2/web-settings-views"
import {
  clearAppCacheExceptEssentials,
  readWebSettingsPrefs,
  writeWebSettingsPrefs,
  type AiModelId,
  type WebSettingsPrefs,
} from "@/lib/mind-web-settings-prefs"
import {
  clampFontZoomPercent,
  MIND_FONT_ZOOM_MAX,
  MIND_FONT_ZOOM_MIN,
  writeStoredFontZoomPercent,
} from "@/lib/mind-display-prefs"

type ThemePreference = "system" | "light" | "dark"

type SettingsView =
  | null
  | "model"
  | "storage"
  | "cloud-sync"
  | "privacy-guide"
  | "privacy-settings"
  | "data-collected"
  | "third-party"
  | "devices"
  | "personalization"
  | "user-guide"
  | "contact"
  | "rate"

export function WebRailSettingsPanel({
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
  const theme = useTheme()
  const [mounted, setMounted] = useState(false)
  const [themePref, setThemePref] = useState<ThemePreference>("system")
  const [prefs, setPrefs] = useState<WebSettingsPrefs>(() => readWebSettingsPrefs())
  const [view, setView] = useState<SettingsView>(null)

  useEffect(() => {
    setMounted(true)
    const t = theme.theme
    if (t === "light" || t === "dark") setThemePref(t)
    else setThemePref("system")
  }, [])

  useEffect(() => {
    if (!open) setView(null)
  }, [open])

  useEffect(() => {
    setPrefs(readWebSettingsPrefs())
  }, [open])

  useEffect(() => {
    if (!mounted) return
    if (themePref === "system") theme.setTheme("system")
    else theme.setTheme(themePref)
  }, [themePref, mounted, theme])

  const patchPrefs = useCallback((patch: Partial<WebSettingsPrefs>) => {
    const next = writeWebSettingsPrefs(patch)
    setPrefs(next)
    return next
  }, [])

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

  const mainList = (
    <WebSettingsPage>
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
              patchPrefs({ language: v })
              toast.success(v === "zh" ? "语言已保存" : "Language saved")
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
              patchPrefs({ notifCaptureReady: !prefs.notifCaptureReady })
              toast.success("Saved")
            }}
            aria-label="Recording ready notifications"
          />
        </WebSettingsRow>
        <WebSettingsRow label="Weekly digest">
          <WebSettingsToggle
            checked={prefs.notifDigest}
            onChange={() => {
              patchPrefs({ notifDigest: !prefs.notifDigest })
              toast.success("Saved")
            }}
            aria-label="Weekly digest"
          />
        </WebSettingsRow>
      </WebSettingsSection>

      <WebSettingsSection title="AI">
        <WebSettingsRow
          label="Default model"
          hint={modelHint(prefs.aiModel)}
          onClick={() => setView("model")}
        />
        <WebSettingsRow label="Frontier insights">
          <WebSettingsToggle
            checked={prefs.frontierInsights}
            onChange={() => {
              patchPrefs({ frontierInsights: !prefs.frontierInsights })
              toast.success("Saved")
            }}
            aria-label="Frontier insights"
          />
        </WebSettingsRow>
        <WebSettingsRow label="Auto-save captures to library">
          <WebSettingsToggle
            checked={prefs.autoSaveNotes}
            onChange={() => {
              patchPrefs({ autoSaveNotes: !prefs.autoSaveNotes })
              toast.success("Saved")
            }}
            aria-label="Auto-save captures"
          />
        </WebSettingsRow>
      </WebSettingsSection>

      <WebSettingsSection title="Storage & sync">
        <WebSettingsRow label="Storage breakdown" onClick={() => setView("storage")} />
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
        <WebSettingsRow
          label="Cloud sync"
          hint={prefs.cloudSyncEnabled ? "On" : "Off"}
          onClick={() => setView("cloud-sync")}
        />
      </WebSettingsSection>

      <WebSettingsSection title="Privacy & account">
        <WebSettingsRow label="Protection guide" onClick={() => setView("privacy-guide")} />
        <WebSettingsRow label="Privacy settings" onClick={() => setView("privacy-settings")} />
        <WebSettingsRow label="Data collected" onClick={() => setView("data-collected")} />
        <WebSettingsRow label="Third-party sharing" onClick={() => setView("third-party")} />
        <WebSettingsRow label="Send crash reports">
          <WebSettingsToggle
            checked={prefs.privacyCrashReports}
            onChange={() => {
              patchPrefs({ privacyCrashReports: !prefs.privacyCrashReports })
              toast.success("Saved")
            }}
            aria-label="Send crash reports"
          />
        </WebSettingsRow>
        <WebSettingsRow label="Devices" onClick={() => setView("devices")} />
        <WebSettingsRow label="Personalization" onClick={() => setView("personalization")} />
      </WebSettingsSection>

      <WebSettingsSection title="Help">
        <WebSettingsRow label="User guide" onClick={() => setView("user-guide")} />
        <WebSettingsRow label="Contact support" onClick={() => setView("contact")} />
        <WebSettingsRow label="Rate Mindar" onClick={() => setView("rate")} />
      </WebSettingsSection>
    </WebSettingsPage>
  )

  const subView = (() => {
    const back = () => setView(null)
    switch (view) {
      case "model":
        return (
          <WebModelSettingsView
            onBack={back}
            model={prefs.aiModel}
            onModelChange={(m: AiModelId) => patchPrefs({ aiModel: m })}
          />
        )
      case "storage":
        return <WebStorageView onBack={back} />
      case "cloud-sync":
        return <WebCloudSyncView onBack={back} prefs={prefs} onPrefsChange={patchPrefs} />
      case "privacy-guide":
        return <WebPrivacyGuideView onBack={back} />
      case "privacy-settings":
        return (
          <WebPrivacySettingsView
            onBack={back}
            crashReportsEnabled={prefs.privacyCrashReports}
            onCrashReportsChange={(v) => patchPrefs({ privacyCrashReports: v })}
          />
        )
      case "data-collected":
        return <WebDataCollectedView onBack={back} />
      case "third-party":
        return <WebThirdPartyView onBack={back} />
      case "devices":
        return <WebDevicesView onBack={back} />
      case "personalization":
        return <WebPersonalizationView onBack={back} />
      case "user-guide":
        return <WebUserGuideView onBack={back} />
      case "contact":
        return <WebContactSupportView onBack={back} />
      case "rate":
        return <WebRateMindarView onBack={back} />
      default:
        return null
    }
  })()

  const body = view ? subView : mainList

  if (embedded) {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-white">
        {!view ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-6 top-6 z-10 rounded-lg p-2 text-zinc-400 hover:bg-stone-100 hover:text-zinc-600"
            aria-label="Close settings"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">{body}</div>
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[1px]"
        aria-label="Close settings"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed left-[7rem] top-0 z-[95] flex h-full w-[min(480px,calc(100vw-7rem))] flex-col border-r border-black/[0.04] bg-white shadow-lg"
        )}
        role="dialog"
        aria-label="Settings"
      >
        <div className="flex shrink-0 justify-end px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-400 hover:bg-stone-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">{body}</div>
      </aside>
    </>
  )
}
