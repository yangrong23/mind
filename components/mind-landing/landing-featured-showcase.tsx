"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { LANDING_COPY } from "@/lib/mind-landing-copy"
import { landingCard, LandingContainer, SectionBlock } from "@/components/mind-landing/landing-primitives"

export function LandingFeaturedShowcase() {
  const { featured } = LANDING_COPY
  const items = featured.items

  return (
    <SectionBlock id="highlights" className="!pt-12 sm:!pt-16">
      <LandingContainer>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[1.75rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.1rem]">
            {featured.title}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">
            {featured.subtitle}
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <a
              key={item.title}
              href={item.href}
              className={cn(
                landingCard,
                "group relative overflow-hidden p-0 transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-16px_rgba(59,130,246,0.18)]",
                i === 0 && "sm:col-span-2 lg:row-span-1"
              )}
            >
              <div
                className={cn(
                  "relative w-full overflow-hidden",
                  i === 0 ? "h-[220px] sm:h-[260px]" : "h-[160px] sm:h-[180px]"
                )}
              >
                <Image
                  src={item.image.src}
                  alt={item.image.alt}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  style={{ objectPosition: item.image.objectPosition }}
                  sizes="(max-width: 640px) 100vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/15 to-transparent" />
                <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-sm transition group-hover:opacity-100">
                  <ArrowUpRight className="size-4" strokeWidth={2.25} aria-hidden />
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-[17px] font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-slate-500">{item.subtitle}</p>
              </div>
            </a>
          ))}
        </div>
      </LandingContainer>
    </SectionBlock>
  )
}
