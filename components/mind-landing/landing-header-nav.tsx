"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ChevronDown, Play } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LANDING_COPY,
  LANDING_SIGN_IN_HREF,
  LANDING_WEB_APP_HREF,
  type LandingSolutionId,
} from "@/lib/mind-landing-copy"
import { USE_CASE_GUIDES } from "@/lib/mind-use-case-guides"
import { LandingContainer, MindLogoMark } from "@/components/mind-landing/landing-primitives"

export function LandingHeaderNav() {
  const { header } = LANDING_COPY
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const [activeSolution, setActiveSolution] = useState<LandingSolutionId>("research")
  const panelRef = useRef<HTMLDivElement>(null)

  const active =
    header.solutions.items.find((s) => s.id === activeSolution) ?? header.solutions.items[0]

  useEffect(() => {
    if (!solutionsOpen) return
    function onPointerDown(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) setSolutionsOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSolutionsOpen(false)
    }
    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [solutionsOpen])

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/55 backdrop-blur-2xl backdrop-saturate-150">
      <LandingContainer className="flex h-[72px] items-center gap-4">
        <MindLogoMark />

        <nav className="hidden flex-1 items-center justify-center gap-7 lg:gap-9 md:flex" aria-label="Main">
          <a
            href={header.product.href}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            {header.product.label}
          </a>

          <div ref={panelRef} className="relative">
            <button
              type="button"
              onClick={() => setSolutionsOpen((v) => !v)}
              aria-expanded={solutionsOpen}
              aria-haspopup="true"
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium transition",
                solutionsOpen ? "text-slate-900" : "text-slate-600 hover:text-slate-900"
              )}
            >
              {header.solutions.label}
              <ChevronDown
                className={cn("size-3.5 transition", solutionsOpen && "rotate-180")}
                strokeWidth={2.5}
                aria-hidden
              />
            </button>

            {solutionsOpen ? (
              <div
                className="absolute left-1/2 top-[calc(100%+10px)] z-50 w-[min(92vw,720px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-[0_24px_64px_-24px_rgba(15,23,42,0.22)] backdrop-blur-xl"
                role="menu"
              >
                <div className="flex border-b border-slate-100">
                  {header.solutions.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      onMouseEnter={() => setActiveSolution(item.id)}
                      onFocus={() => setActiveSolution(item.id)}
                      onClick={() => setActiveSolution(item.id)}
                      className={cn(
                        "flex-1 px-4 py-3 text-left text-[13px] font-semibold transition",
                        activeSolution === item.id
                          ? "bg-slate-50 text-slate-900"
                          : "text-slate-500 hover:bg-slate-50/80"
                      )}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
                <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {active.tagline}
                    </p>
                    <h3 className="mt-1 text-[18px] font-semibold text-slate-900">{active.title}</h3>
                    <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{active.description}</p>
                    <ul className="mt-4 space-y-2">
                      {active.bullets.map((b) => (
                        <li key={b} className="flex gap-2 text-[13px] text-slate-600">
                          <span className="mt-1.5 size-1 shrink-0 rounded-full bg-slate-400" aria-hidden />
                          {b}
                        </li>
                      ))}
                    </ul>
                    <a
                      href={header.solutions.href}
                      onClick={() => setSolutionsOpen(false)}
                      className="mt-4 inline-flex text-[13px] font-semibold text-mind hover:text-mind/85"
                    >
                      See solution overview →
                    </a>
                  </div>
                  <a
                    href={`${header.solutions.href}#${active.id}`}
                    onClick={() => setSolutionsOpen(false)}
                    className="group relative min-h-[200px] border-t border-slate-100 md:border-l md:border-t-0"
                  >
                    <Image
                      src={active.poster.src}
                      alt={active.poster.alt}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.02]"
                      style={{ objectPosition: active.poster.objectPosition }}
                      sizes="360px"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/55 via-slate-900/10 to-transparent" />
                    <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-semibold text-slate-800 shadow-sm">
                      <Play className="size-3.5 fill-slate-700 text-slate-700" aria-hidden />
                      {active.videoLabel}
                    </span>
                  </a>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a
              href={header.resources.href}
              className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {header.resources.label}
            </a>
            <span className="hidden h-3 w-px bg-slate-200 lg:inline" aria-hidden />
            <div className="hidden items-center gap-3 lg:flex">
              {USE_CASE_GUIDES.slice(0, 4).map((guide) => (
                <a
                  key={guide.id}
                  href={`${header.resources.href}#use-case-${guide.id}`}
                  className="text-[12px] font-medium text-slate-500 transition hover:text-slate-800"
                >
                  {guide.title}
                </a>
              ))}
            </div>
          </div>

          <a
            href={header.help.href}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            {header.help.label}
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <Link
            href={LANDING_SIGN_IN_HREF}
            className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline"
          >
            {header.signIn}
          </Link>
          <Button asChild variant="landing" className="h-10 rounded-full px-5 text-sm font-semibold">
            <Link href={LANDING_WEB_APP_HREF}>{header.cta}</Link>
          </Button>
        </div>
      </LandingContainer>
    </header>
  )
}
