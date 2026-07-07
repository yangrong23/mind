"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Play } from "lucide-react"
import { LANDING_COPY as t, LANDING_WEB_APP_HREF } from "@/lib/mind-landing-copy"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  CaptureFeaturePreview,
  ChatShot,
  LibraryTableShot,
  NotesEditorShot,
  NotesFeatureStrip,
  PermissionPreview,
  PlatformDevice,
  ResourceLibraryShot,
  TeamCollabShot,
  WorkbenchShot,
} from "@/components/mind-landing/landing-product-shots"
import { USE_CASE_GUIDES } from "@/lib/mind-use-case-guides"
import {
  MindUseCaseGuidePanel,
  UseCaseCard,
} from "@/components/mind-v2/mind-use-case-guide-panel"
import { getUseCaseGuide } from "@/lib/mind-use-case-guides"
import {
  LandingContainer,
  LandingHeaderNav,
  LandingShell,
  SectionBlock,
  SectionTitle,
  landingCard,
  landingCtaGradient,
} from "@/components/mind-landing/landing-primitives"
export function MindLandingPage() {
  const [guideId, setGuideId] = useState<string | null>(null)
  const activeGuide = guideId ? getUseCaseGuide(guideId) : null

  return (
    <LandingShell>
      <LandingHeaderNav />

      {/* Hero */}
      <SectionBlock className="pt-12 sm:pt-16">
        <LandingContainer>
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
            <div className="max-w-[480px]">
              <p className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-teal-200/80 bg-teal-50/80 px-3 py-1 text-xs font-medium text-teal-800">
                <span aria-hidden>✨</span>
                {t.hero.badge}
              </p>
              <h1 className="text-[2.35rem] font-semibold leading-[1.15] tracking-tight text-slate-900 sm:text-[2.75rem]">
                {t.hero.title}
                <br />
                <span className="text-slate-900">{t.hero.titleLine2}</span>
              </h1>
              <p className="mt-6 text-base leading-[1.7] text-slate-500 sm:text-[17px]">{t.hero.description}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Button
                  asChild
                  className={cn("h-12 rounded-full px-7 text-[15px] font-semibold", landingCtaGradient)}
                >
                  <Link href={LANDING_WEB_APP_HREF}>{t.hero.ctaPrimary}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-full border-slate-200/90 bg-white/70 px-7 text-[15px] font-medium text-slate-700 shadow-sm backdrop-blur-md hover:bg-white"
                >
                  <a href="#capture" className="inline-flex items-center gap-2">
                    <Play className="size-4 fill-slate-600 text-slate-600" aria-hidden />
                    {t.hero.ctaSecondary}
                  </a>
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-500">{t.hero.socialProof}</p>
            </div>
            <WorkbenchShot />
          </div>
        </LandingContainer>
      </SectionBlock>

      {/* Knowledge capture */}
      <SectionBlock id="capture">
        <LandingContainer>
          <SectionTitle title={t.capture.title} subtitle={t.capture.subtitle} />
          <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_1.05fr] lg:items-center">
            <div className="flex flex-col gap-4">
              {t.capture.features.map((f) => (
                <div key={f.title} className={`${landingCard} flex items-center gap-5 p-5`}>
                  <CaptureFeaturePreview variant={f.icon === "globe" ? "web" : f.icon === "upload" ? "file" : "mobile"} />
                  <div>
                    <h3 className="text-[17px] font-semibold text-slate-900">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <LibraryTableShot />
          </div>
        </LandingContainer>
      </SectionBlock>

      {/* AI Q&A */}
      <SectionBlock id="features">
        <LandingContainer>
          <SectionTitle title={t.qa.title} subtitle={t.qa.subtitle} />
          <div className="mt-16 grid gap-12 lg:grid-cols-2 lg:items-center">
            <ul className="space-y-5">
              {t.qa.bullets.map((item) => (
                <li key={item} className="flex gap-3.5 text-[15px] leading-relaxed text-slate-600">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-200/90 ring-1 ring-teal-300/50">
                    <Check className="size-3.5 text-teal-800" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <ChatShot />
          </div>
        </LandingContainer>
      </SectionBlock>

      {/* AI Notes */}
      <SectionBlock>
        <LandingContainer>
          <SectionTitle title={t.notes.title} subtitle={t.notes.subtitle} />
          <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:items-center">
            <NotesEditorShot className="order-2 lg:order-1" />
            <div className="order-1 space-y-4 lg:order-2">
              {t.notes.features.map((f, i) => (
                <div key={f.title} className={`${landingCard} overflow-hidden`}>
                  <div className="border-b border-white/40 px-5 pt-4">
                    <NotesFeatureStrip index={i} />
                  </div>
                  <div className="p-5 pt-4">
                    <h3 className="text-[17px] font-semibold text-slate-900">{f.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LandingContainer>
      </SectionBlock>

      {/* Use cases */}
      <SectionBlock id="use-cases">
        <LandingContainer>
          <SectionTitle title={t.useCases.title} subtitle={t.useCases.subtitle} />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {USE_CASE_GUIDES.map((guide) => (
              <UseCaseCard key={guide.id} guide={guide} onOpenGuide={setGuideId} />
            ))}
          </div>
        </LandingContainer>
      </SectionBlock>

      <MindUseCaseGuidePanel
        guide={activeGuide ?? null}
        open={Boolean(activeGuide)}
        onClose={() => setGuideId(null)}
      />

      {/* Collaboration */}
      <SectionBlock>
        <LandingContainer>
          <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-[1.65rem] font-semibold text-slate-900 sm:text-[2rem]">{t.collab.sharedTitle}</h2>
              <ul className="mt-8 space-y-4">
                {t.collab.sharedBullets.map((b) => (
                  <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-slate-600">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-teal-400/80" />
                    {b}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <TeamCollabShot />
              </div>
            </div>
            <div>
              <h2 className="text-[1.65rem] font-semibold text-slate-900 sm:text-[2rem]">
                {t.collab.permissionsTitle}
              </h2>
              <div className="mt-8 space-y-4">
                {(
                  [
                    ["private", t.collab.permissions[0]],
                    ["team", t.collab.permissions[1]],
                    ["public", t.collab.permissions[2]],
                  ] as const
                ).map(([variant, p]) => (
                  <div key={p.title} className={`${landingCard} flex items-center gap-5 px-5 py-4`}>
                    <PermissionPreview variant={variant} />
                    <div>
                      <p className="font-semibold text-slate-900">{p.title}</p>
                      <p className="mt-0.5 text-sm text-slate-500">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </LandingContainer>
      </SectionBlock>

      {/* Platforms + resources */}
      <SectionBlock id="plaza">
        <LandingContainer>
          <SectionTitle title={t.flow.title} subtitle={t.flow.subtitle} />
          <div className="mt-12 flex flex-wrap items-end justify-center gap-6 sm:gap-10">
            {t.flow.platforms.map((label, i) => (
              <PlatformDevice key={label} label={label} platformIndex={i} />
            ))}
          </div>

          <div className="mt-24">
            <SectionTitle title={t.resources.title} subtitle={t.resources.subtitle} />
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {t.resources.cards.map((card, i) => (
                <ResourceLibraryShot
                  key={card.label}
                  label={card.label}
                  stat={card.stat}
                  tint={resourceTint(i)}
                  coverIndex={i}
                />
              ))}
            </div>
          </div>
        </LandingContainer>
      </SectionBlock>

      {/* Footer CTA */}
      <SectionBlock className="border-t border-white/30 pb-0 pt-20">
        <LandingContainer>
          <div className={`${landingCard} flex flex-col items-center px-8 py-14 text-center sm:px-12`}>
            <h2 className="max-w-2xl text-[1.75rem] font-semibold leading-tight text-slate-900 sm:text-[2.1rem]">
              {t.footer.title}
            </h2>
            <p className="mt-4 max-w-xl text-base text-slate-500">{t.footer.subtitle}</p>
            <Button
              asChild
              className={cn("mt-8 h-12 rounded-full px-8 text-[15px] font-semibold", landingCtaGradient)}
            >
              <Link href={LANDING_WEB_APP_HREF}>{t.footer.cta}</Link>
            </Button>
          </div>
        </LandingContainer>

        <footer className="mt-20 border-t border-white/35 bg-white/30 pt-8 pb-0 backdrop-blur-xl">
          <LandingContainer className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-slate-400">{t.footer.copyright}</p>
            <div className="flex flex-wrap gap-6 text-xs text-slate-500">
              {t.footer.links.map((link) => (
                <a key={link} href="#" className="hover:text-slate-800">
                  {link}
                </a>
              ))}
            </div>
          </LandingContainer>
        </footer>
      </SectionBlock>
    </LandingShell>
  )
}

function resourceTint(i: number) {
  const tints = [
    "bg-sky-200/30",
    "bg-emerald-200/30",
    "bg-violet-200/30",
    "bg-amber-200/30",
    "bg-rose-200/30",
    "bg-indigo-200/25",
  ]
  return tints[i % tints.length]
}
