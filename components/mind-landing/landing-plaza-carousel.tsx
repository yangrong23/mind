"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ArrowRight, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel"
import { LANDING_COPY, LANDING_WEB_APP_HREF } from "@/lib/mind-landing-copy"
import { getLandingPlazaCarouselSlides, type LandingPlazaSlide } from "@/lib/landing-public-kbs"
import { landingCard, LandingContainer, SectionBlock } from "@/components/mind-landing/landing-primitives"

function PlazaSlideCard({ slide, active }: { slide: LandingPlazaSlide; active: boolean }) {
  return (
    <div
      className={cn(
        landingCard,
        "relative flex h-full min-h-[340px] flex-col overflow-hidden p-0 transition-shadow duration-500 sm:min-h-[380px]",
        active && "shadow-[0_20px_56px_-20px_rgba(59,130,246,0.22)]"
      )}
    >
      <div className="relative h-[52%] min-h-[180px] w-full sm:min-h-[200px]">
        <Image
          src={slide.imageSrc}
          alt={slide.imageAlt}
          fill
          className="object-cover"
          style={{ objectPosition: slide.objectPosition ?? "center" }}
          sizes="(max-width: 768px) 100vw, 720px"
          priority={active}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/75">
            {slide.tagline}
          </p>
          <h3 className="mt-1 line-clamp-2 text-[20px] font-semibold leading-snug text-white sm:text-[22px]">
            {slide.title}
          </h3>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="line-clamp-3 text-[14px] leading-relaxed text-slate-600">{slide.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-[12px] font-medium text-slate-500">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
            <Users className="size-3.5" strokeWidth={2} aria-hidden />
            {slide.subscribers}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1">{slide.sources}</span>
        </div>
        <Link
          href={slide.href}
          className="mt-auto inline-flex items-center gap-1 pt-5 text-[14px] font-semibold text-mind hover:text-mind/85"
        >
          Open library
          <ArrowRight className="size-4" strokeWidth={2.25} aria-hidden />
        </Link>
      </div>
    </div>
  )
}

export function LandingPlazaCarouselSection() {
  const t = LANDING_COPY.plazaCarousel
  const slides = getLandingPlazaCarouselSlides(8)
  const [api, setApi] = useState<CarouselApi>()
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!api) return
    setActive(api.selectedScrollSnap())
    api.on("select", () => setActive(api.selectedScrollSnap()))
  }, [api])

  return (
    <SectionBlock id="plaza" className="!pt-14 sm:!pt-20">
      <LandingContainer>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mind">{t.eyebrow}</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2.15rem]">
              {t.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-500 sm:text-[17px]">{t.subtitle}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button asChild variant="landing" className="h-11 rounded-full px-6">
              <Link href={`${LANDING_WEB_APP_HREF}/plaza`}>{t.cta}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full border-slate-200/90 bg-white/70 px-6 backdrop-blur-md"
            >
              <Link href={LANDING_WEB_APP_HREF}>{t.ctaSecondary}</Link>
            </Button>
          </div>
        </div>

        <div className="relative mt-10">
          <Carousel
            setApi={setApi}
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {slides.map((slide, i) => (
                <CarouselItem key={slide.id} className="basis-full pl-4 md:basis-[88%] lg:basis-[72%]">
                  <PlazaSlideCard slide={slide} active={i === active} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 border-white/80 bg-white/90 shadow-md hover:bg-white" />
            <CarouselNext className="right-2 border-white/80 bg-white/90 shadow-md hover:bg-white" />
          </Carousel>

          <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === active ? "w-6 bg-mind" : "w-1.5 bg-slate-300 hover:bg-slate-400"
                )}
                aria-label={`Go to ${slide.title}`}
              />
            ))}
          </div>
        </div>
      </LandingContainer>
    </SectionBlock>
  )
}
