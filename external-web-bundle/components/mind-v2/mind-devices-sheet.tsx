"use client"

import type { ReactNode } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Bluetooth, X, Battery, HardDrive, RefreshCw, Wifi } from "lucide-react"

export interface MindDevicesSheetProps {
  open: boolean
  onClose: () => void
  isDeviceConnected: boolean
  onSetDeviceConnected: (connected: boolean) => void
  /** When set, tapping the connected device card opens full device settings (e.g. hardware detail). */
  onConnectedDeviceOpen?: () => void
  /** Stack above full-screen overlays (e.g. recording) */
  zOverlayClass?: string
  /** Extra device-related settings (e.g. hardware summary, lexicon, offline capture) — Me tab only */
  children?: ReactNode
}

export function MindDevicesSheet({
  open,
  onClose,
  isDeviceConnected,
  onSetDeviceConnected,
  onConnectedDeviceOpen,
  zOverlayClass = "z-[59]",
  children,
}: MindDevicesSheetProps) {
  if (!open) return null

  return (
    <div className={cn("absolute inset-0 flex min-h-0 flex-col", zOverlayClass)}>
      <button
        type="button"
        className="absolute inset-0 bg-zinc-900/25"
        aria-label="Close devices"
        onClick={onClose}
      />
      <div className="relative z-10 mt-auto flex min-h-0 max-h-[min(92%,calc(100%-8px))] w-full animate-in slide-in-from-bottom flex-col rounded-t-3xl bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] duration-300 dark:bg-zinc-900">
        <div className="sticky top-0 z-10 shrink-0 rounded-t-3xl bg-white dark:bg-zinc-900">
          <div className="flex justify-center pb-2 pt-3">
            <div className="h-1 w-10 rounded-full bg-stone-400 dark:bg-zinc-600" />
          </div>
          <div className="flex items-center justify-between border-b border-stone-100/90 px-5 pb-3 dark:border-zinc-800">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Devices</h3>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-200 dark:hover:bg-zinc-800"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
            </button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="px-5 pb-4">
          <div
            role={isDeviceConnected && onConnectedDeviceOpen ? "button" : undefined}
            tabIndex={isDeviceConnected && onConnectedDeviceOpen ? 0 : undefined}
            onClick={() => {
              if (!isDeviceConnected || !onConnectedDeviceOpen) return
              onConnectedDeviceOpen()
              onClose()
            }}
            onKeyDown={(e) => {
              if (!isDeviceConnected || !onConnectedDeviceOpen) return
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onConnectedDeviceOpen()
                onClose()
              }
            }}
            className={cn(
              "rounded-2xl border-2 p-4 transition-all",
              isDeviceConnected
                ? "border-stone-300/80 bg-gradient-to-br from-stone-100 to-stone-50"
                : "border-stone-300 bg-stone-100",
              isDeviceConnected && onConnectedDeviceOpen && "cursor-pointer active:scale-[0.99]"
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
        </div>

        <div className="space-y-2 px-5 pb-4">
          {isDeviceConnected ? (
            <>
              <button
                type="button"
                onClick={() => {
                  toast.success("Sync started", {
                    description: "Recordings and metadata upload to this library (demo).",
                  })
                }}
                className={cn("flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white", "rounded-lg bg-mind text-white hover:bg-[#4534b3] active:bg-[#3a2a99] shadow-sm shadow-[rgba(86,69,212,0.25)]")}
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
              className={cn("flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium text-white", "rounded-lg bg-mind text-white hover:bg-[#4534b3] active:bg-[#3a2a99] shadow-sm shadow-[rgba(86,69,212,0.25)]")}
            >
              <Bluetooth className="h-5 w-5" />
              Search & connect
            </button>
          )}
        </div>

        {children ? (
          <div className="border-t border-stone-100 px-5 pb-6 pt-2">{children}</div>
        ) : null}
        </div>
      </div>
    </div>
  )
}
