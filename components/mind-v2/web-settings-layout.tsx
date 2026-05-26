"use client"

import type { ReactNode } from "react"
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function WebSettingsPage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[720px] px-10 pt-10 pb-0", className)}>
      <h1 className="text-[28px] font-semibold tracking-tight text-zinc-900">Settings</h1>
      <div className="mt-10 space-y-12">{children}</div>
    </div>
  )
}

export function WebSettingsSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="text-[13px] font-medium text-zinc-400">{title}</h2>
      <div className="mt-4 divide-y divide-stone-100">{children}</div>
    </section>
  )
}

export function WebSettingsRow({
  label,
  children,
  onClick,
  hint,
}: {
  label: string
  children?: ReactNode
  onClick?: () => void
  hint?: string
}) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-6 py-4 text-left",
        onClick && "transition-colors hover:bg-stone-50/80"
      )}
    >
      <span className="shrink-0 text-[15px] text-zinc-800">{label}</span>
      <div className="flex min-w-0 items-center justify-end gap-2">
        {hint ? <span className="truncate text-[13px] text-zinc-400">{hint}</span> : null}
        {children}
        {onClick ? <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" /> : null}
      </div>
    </Comp>
  )
}

export function WebSettingsSelect({
  value,
  options,
  onChange,
  "aria-label": ariaLabel,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  "aria-label"?: string
}) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={ariaLabel}
        className="appearance-none rounded-lg border border-stone-200 bg-white py-1.5 pl-3 pr-8 text-[14px] text-zinc-700 outline-none focus:border-zinc-300 focus:ring-2 focus:ring-stone-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
    </div>
  )
}

export function WebSettingsToggle({
  checked,
  onChange,
  "aria-label": ariaLabel,
}: {
  checked: boolean
  onChange: () => void
  "aria-label"?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors",
        checked ? "bg-zinc-800" : "bg-stone-200"
      )}
    >
      <span
        className={cn(
          "block h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5" : "translate-x-0"
        )}
      />
    </button>
  )
}

export function WebSettingsFontSlider({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (n: number) => void
}) {
  const marks = [
    { pct: min, label: "Small" },
    { pct: 100, label: "Standard" },
    { pct: max, label: "Large" },
  ]

  return (
    <div className="w-full min-w-[12rem] max-w-[220px]">
      <div className="flex items-center justify-end gap-2">
        <span className="tabular-nums text-[14px] font-medium text-zinc-600">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-stone-200 accent-zinc-800 [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-zinc-800"
        aria-label="Font size"
      />
      <div className="relative mt-2 h-4">
        {marks.map((m) => {
          const left = ((m.pct - min) / (max - min)) * 100
          return (
            <span
              key={m.label}
              className="absolute -translate-x-1/2 text-[11px] text-zinc-400"
              style={{ left: `${left}%` }}
            >
              {m.label}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function WebSettingsShortcut({
  keys,
}: {
  keys: string[]
}) {
  return (
    <span className="inline-flex items-center gap-1">
      {keys.map((key, i) => (
        <span key={`${key}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 ? <span className="text-[12px] text-zinc-300">+</span> : null}
          <kbd className="rounded-md bg-stone-100 px-2 py-1 text-[12px] font-medium text-zinc-600 ring-1 ring-stone-200/80">
            {key}
          </kbd>
        </span>
      ))}
    </span>
  )
}

/** Full-page drill-down inside embedded settings */
export function WebSettingsSubpage({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-stone-100 px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg py-1 pr-2 text-[14px] font-medium text-zinc-600 hover:bg-stone-100"
        >
          <ChevronLeft className="h-5 w-5" />
          Settings
        </button>
        <span className="text-zinc-300">/</span>
        <h2 className="min-w-0 flex-1 truncate text-[17px] font-semibold text-zinc-800">{title}</h2>
      </div>
      <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  )
}

export function WebSettingsActionButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white hover:bg-zinc-800"
    >
      {label}
    </button>
  )
}
