"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import {
  Battery,
  Bluetooth,
  ChevronRight,
  HardDrive,
  RefreshCw,
  Wifi,
} from "lucide-react"

/** Notes header — recorder silhouette with optional battery strip */
export function RecorderGlyph({
  className,
  batteryPercent,
}: {
  className?: string
  batteryPercent?: number | null
}) {
  const pct =
    batteryPercent != null && Number.isFinite(batteryPercent)
      ? Math.round(Math.max(0, Math.min(100, batteryPercent)))
      : null
  const connected = pct != null

  return (
    <span
      className={cn(
        "relative inline-flex h-[27px] overflow-hidden rounded-[6px] border-[1.5px] border-current",
        connected ? "w-[22px]" : "w-[17px]",
        className
      )}
      aria-hidden
    >
      {connected ? (
        <span className="flex w-[3px] shrink-0 flex-col justify-end border-r border-white/20 bg-black/[0.06] py-[3px] pl-[2px] dark:border-black/10 dark:bg-white/[0.08]">
          <span
            className="w-[2px] max-h-full min-h-[2px] rounded-[1px] bg-gradient-to-t from-emerald-500/90 to-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.45)]"
            style={{ height: `${pct}%` }}
          />
        </span>
      ) : null}
      <span className="flex min-w-0 flex-1 flex-col items-center justify-end gap-[3px] pb-[4px] pt-[3px]">
        <span
          className={cn(
            "h-[3px] w-[3px] rounded-full",
            connected ? "bg-current opacity-90 shadow-[0_0_6px_currentColor]" : "bg-current opacity-50"
          )}
        />
        <span className="h-[7px] w-[9px] rounded-[2px] bg-current opacity-[0.88]" />
      </span>
      {connected ? (
        <span
          className="pointer-events-none absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border border-white bg-emerald-400 shadow-[0_0_0_2px_rgba(52,211,153,0.35)] dark:border-zinc-900"
          aria-hidden
        />
      ) : null}
    </span>
  )
}

export function DeviceConnectionBadge({ connected }: { connected: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        connected
          ? "bg-emerald-500/12 text-emerald-800 ring-1 ring-emerald-500/20 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-emerald-400/25"
          : "bg-stone-200/80 text-stone-600 ring-1 ring-stone-300/50 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700"
      )}
    >
      {connected ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </span>
      ) : null}
      {connected ? "Connected" : "Offline"}
    </span>
  )
}

function DeviceStatTile({
  icon: Icon,
  value,
  label,
  tone = "default",
}: {
  icon: typeof Battery
  value: string
  label: string
  tone?: "default" | "battery"
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-white/70 bg-white/65 px-2 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_3px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-white/[0.06] dark:bg-white/[0.04] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      <span
        className={cn(
          "mb-2 flex h-8 w-8 items-center justify-center rounded-xl",
          tone === "battery"
            ? "bg-gradient-to-br from-emerald-500/15 to-teal-500/5 text-emerald-700 dark:text-emerald-300"
            : "bg-gradient-to-br from-zinc-900/[0.06] to-zinc-900/[0.02] text-zinc-600 dark:text-zinc-300"
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.85} aria-hidden />
      </span>
      <span className="text-[17px] font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-400">
        {label}
      </span>
    </div>
  )
}

export function DeviceHeroCard({
  connected,
  onOpen,
  batteryPercent = 85,
  storageFree = "2.3G",
  firmware = "v2.1",
  serial = "MR-2024-001234",
  deviceName = "Mind Recorder",
}: {
  connected: boolean
  onOpen?: () => void
  batteryPercent?: number
  storageFree?: string
  firmware?: string
  serial?: string
  deviceName?: string
}) {
  const interactive = connected && onOpen

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onOpen : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onOpen?.()
              }
            }
          : undefined
      }
      className={cn(
        "relative overflow-hidden rounded-[1.35rem] p-[1px]",
        connected
          ? "bg-gradient-to-br from-white/90 via-stone-100/50 to-mind/20 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35),0_1px_0_rgba(255,255,255,0.8)_inset]"
          : "bg-gradient-to-br from-stone-200/80 to-stone-300/40 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.2)]",
        interactive && "cursor-pointer transition-transform active:scale-[0.995]"
      )}
    >
      <div
        className={cn(
          "relative rounded-[1.3rem] px-4 py-4",
          connected
            ? "bg-gradient-to-br from-white via-stone-50/95 to-mind/[0.04] dark:from-zinc-900 dark:via-zinc-900 dark:to-mind/[0.08]"
            : "bg-gradient-to-br from-stone-50 to-stone-100/90 dark:from-zinc-900 dark:to-zinc-800/90"
        )}
      >
        {connected ? (
          <div
            className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--mind-blue)_22%,transparent)_0%,transparent_68%)] opacity-80"
            aria-hidden
          />
        ) : null}

        <div className="relative flex items-start gap-3.5">
          <div
            className={cn(
              "relative flex h-[3.75rem] w-[3.75rem] shrink-0 items-center justify-center rounded-2xl shadow-[0_8px_20px_-10px_rgba(15,23,42,0.35)]",
              connected
                ? "bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 ring-1 ring-white/10"
                : "bg-gradient-to-br from-stone-400 to-stone-500 ring-1 ring-black/[0.06]"
            )}
          >
            {connected ? (
              <span
                className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.22)_0%,transparent_42%)]"
                aria-hidden
              />
            ) : null}
            <Bluetooth
              className={cn("relative h-7 w-7", connected ? "text-white/95" : "text-white/80")}
              strokeWidth={1.65}
            />
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[16px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                {deviceName}
              </span>
              <DeviceConnectionBadge connected={connected} />
            </div>
            <p className="mt-1 font-mono text-[11px] tracking-wide text-zinc-500 dark:text-zinc-400">
              SN · {serial}
            </p>
            {interactive ? (
              <p className="mt-2 flex items-center gap-0.5 text-[12px] font-medium text-mind dark:text-mind/90">
                Device settings
                <ChevronRight className="h-3.5 w-3.5 opacity-70" strokeWidth={2.25} />
              </p>
            ) : null}
          </div>
        </div>

        {connected ? (
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <DeviceStatTile icon={Battery} value={`${batteryPercent}%`} label="Battery" tone="battery" />
            <DeviceStatTile icon={HardDrive} value={storageFree} label="Free" />
            <DeviceStatTile icon={Wifi} value={firmware} label="Firmware" />
          </div>
        ) : (
          <p className="relative mt-4 rounded-xl border border-dashed border-stone-300/70 bg-white/40 px-3 py-2.5 text-center text-[12px] leading-relaxed text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950/30 dark:text-zinc-400">
            Pair your recorder to sync captures and see battery & storage here.
          </p>
        )}
      </div>
    </div>
  )
}

export function DeviceActionButtons({
  connected,
  onConnect,
  onDisconnect,
  onSync,
}: {
  connected: boolean
  onConnect: () => void
  onDisconnect: () => void
  onSync: () => void
}) {
  if (connected) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={onSync}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white",
            "mind-btn shadow-[0_10px_28px_-12px_var(--mind-shadow)]"
          )}
        >
          <RefreshCw className="h-[18px] w-[18px]" strokeWidth={2} />
          Sync now
        </button>
        <button
          type="button"
          onClick={onDisconnect}
          className="w-full rounded-2xl border border-stone-200/90 bg-white/80 py-3 text-[15px] font-medium text-zinc-600 shadow-sm transition-colors hover:bg-stone-50 active:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onConnect}
      className={cn(
        "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-[15px] font-semibold text-white",
        "mind-btn shadow-[0_10px_28px_-12px_var(--mind-shadow)]"
      )}
    >
      <Bluetooth className="h-[18px] w-[18px]" strokeWidth={2} />
      Search & connect
    </button>
  )
}

export function DeviceSheetScrim({
  onClose,
  zClassName = "z-[59]",
  children,
}: {
  onClose: () => void
  zClassName?: string
  children: ReactNode
}) {
  return (
    <div className={cn("absolute inset-0 flex min-h-0 flex-col", zClassName)}>
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      {children}
    </div>
  )
}

export function DeviceSheetPanel({
  title,
  onClose,
  children,
  footer,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="relative z-10 mt-auto flex min-h-0 max-h-[min(92%,calc(100%-8px))] w-full animate-in slide-in-from-bottom flex-col rounded-t-[1.35rem] border border-white/20 bg-white/95 shadow-[0_-24px_80px_-20px_rgba(15,23,42,0.28)] backdrop-blur-xl duration-300 dark:border-zinc-800/80 dark:bg-zinc-950/95">
      <div className="sticky top-0 z-10 shrink-0 rounded-t-[1.35rem] bg-white/90 backdrop-blur-md dark:bg-zinc-950/90">
        <div className="flex justify-center pb-2 pt-3">
          <div className="h-1 w-9 rounded-full bg-stone-300/90 dark:bg-zinc-600" />
        </div>
        <div className="flex items-center justify-between px-5 pb-3.5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
              Hardware
            </p>
            <h3 className="text-[18px] font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100/90 text-zinc-600 transition-colors hover:bg-stone-200/90 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            aria-label="Close"
          >
            <span className="sr-only">Close</span>
            <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden>
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="px-5 pb-4">{children}</div>
        {footer ? <div className="space-y-2 px-5 pb-5">{footer}</div> : null}
      </div>
    </div>
  )
}

/** Full-screen hardware settings — device hero visual */
export function HardwareDeviceVisual({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[148px]", className)}>
      <div
        className="absolute -inset-x-6 top-1/2 h-[70%] -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,color-mix(in_oklch,var(--mind-blue)_18%,transparent)_0%,transparent_72%)] blur-2xl"
        aria-hidden
      />
      <div
        className="relative overflow-hidden rounded-[1.65rem] p-[3px] shadow-[0_28px_60px_-24px_rgba(15,23,42,0.55),0_1px_0_rgba(255,255,255,0.25)_inset]"
        style={{ aspectRatio: "2 / 3.15" }}
      >
        <div className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-zinc-300 via-zinc-500 to-zinc-800" />
        <div className="relative flex h-full flex-col rounded-[1.35rem] bg-gradient-to-b from-zinc-700 via-zinc-900 to-black p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
          <div className="flex items-center justify-between px-0.5">
            <span className="h-1.5 w-8 rounded-full bg-white/10" />
            <span className="flex gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-400/90 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
              <span className="h-1 w-1 rounded-full bg-white/20" />
            </span>
          </div>
          <div className="mt-3 flex flex-1 flex-col items-center justify-center gap-2">
            <span className="h-2 w-2 rounded-full bg-zinc-600 ring-2 ring-zinc-800" />
            <span className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-950 ring-1 ring-white/10 shadow-inner" />
            <span className="mt-1 h-1 w-12 rounded-full bg-zinc-800" />
          </div>
          <div className="flex justify-center gap-2 pb-0.5">
            <span className="h-1 w-6 rounded-full bg-zinc-800" />
            <span className="h-1 w-6 rounded-full bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function HardwareSettingsGroup({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-zinc-800 dark:bg-zinc-900/40",
        className
      )}
    >
      <p className="px-4 pb-1 pt-3.5 text-[12px] font-semibold uppercase tracking-[0.1em] text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
      <div className="divide-y divide-stone-100/90 dark:divide-zinc-800/80">{children}</div>
    </section>
  )
}

export function HardwareSettingsRow({
  label,
  value,
  action,
  onClick,
  danger,
}: {
  label: string
  value?: ReactNode
  action?: boolean
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      disabled={!onClick}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors",
        onClick && "active:bg-stone-50/90 dark:active:bg-zinc-800/50",
        !onClick && "cursor-default",
        danger && "text-red-600"
      )}
    >
      <span className={cn("text-[15px] font-medium text-zinc-900 dark:text-zinc-100", danger && "text-red-600")}>
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-1 text-[14px] text-zinc-500 dark:text-zinc-400">
        {value}
        {action ? <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" strokeWidth={2} /> : null}
      </span>
    </button>
  )
}
