"use client"

import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { LANDING_COPY, LANDING_WEB_APP_HREF } from "@/lib/mind-landing-copy"
import { landingCard, LandingContainer, SectionBlock, SectionTitle } from "@/components/mind-landing/landing-primitives"
import { Button } from "@/components/ui/button"

export function LandingSolutionsSection() {
  const { solutions } = LANDING_COPY.header

  return (
    <SectionBlock id="solutions">
      <LandingContainer>
        <SectionTitle
          title="Solutions for research, learning, and management"
          subtitle="Same Mindar platform — tuned to how your team captures, asks, and delivers knowledge."
        />

        <div className="mt-14 space-y-8">
          {solutions.items.map((item, index) => (
            <article
              key={item.id}
              id={item.id}
              className={cn(
                landingCard,
                "scroll-mt-28 overflow-hidden p-0",
                index % 2 === 1 && "lg:flex-row-reverse"
              )}
            >
              <div className="grid lg:grid-cols-2 lg:items-stretch">
                <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mind">
                    {item.tagline}
                  </p>
                  <h3 className="mt-2 text-[1.5rem] font-semibold text-slate-900 sm:text-[1.65rem]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate-600">{item.description}</p>
                  <ul className="mt-5 space-y-2.5">
                    {item.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5 text-[14px] text-slate-600">
                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-mind/80" aria-hidden />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative min-h-[240px] border-t border-white/50 lg:min-h-[320px] lg:border-l lg:border-t-0">
                  <Image
                    src={item.poster.src}
                    alt={item.poster.alt}
                    fill
                    className="object-cover"
                    style={{ objectPosition: item.poster.objectPosition }}
                    sizes="(max-width: 1024px) 100vw, 560px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/40 to-transparent" />
                  <button
                    type="button"
                    className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-full bg-white/92 px-4 py-2 text-[13px] font-semibold text-slate-800 shadow-md transition hover:bg-white"
                    aria-label={item.videoLabel}
                  >
                    <Play className="size-4 fill-slate-800 text-slate-800" aria-hidden />
                    {item.videoLabel}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="landing" className="h-11 rounded-full px-7">
            <Link href={LANDING_WEB_APP_HREF}>Start with your use case</Link>
          </Button>
        </div>
      </LandingContainer>
    </SectionBlock>
  )
}
