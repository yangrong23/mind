"use client"

import Link from "next/link"
import { LANDING_COPY } from "@/lib/mind-landing-copy"
import { landingCard, LandingContainer, SectionBlock, SectionTitle } from "@/components/mind-landing/landing-primitives"

export function LandingHelpSection() {
  const { helpSection } = LANDING_COPY

  return (
    <SectionBlock id="help">
      <LandingContainer>
        <SectionTitle title={helpSection.title} subtitle={helpSection.subtitle} />

        <div className="mt-12 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className={cnPad()}>
            <h3 className="text-[17px] font-semibold text-slate-900">{helpSection.faq.title}</h3>
            <dl className="mt-5 space-y-5">
              {helpSection.faq.items.map((item) => (
                <div key={item.q}>
                  <dt className="text-[14px] font-semibold text-slate-800">{item.q}</dt>
                  <dd className="mt-1.5 text-[14px] leading-relaxed text-slate-600">{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={cnPad()}>
            <h3 className="text-[17px] font-semibold text-slate-900">{helpSection.guides.title}</h3>
            <p className="mt-2 text-[14px] leading-relaxed text-slate-500">
              Step-by-step paths through the web app — from first library to plaza subscribe and Studio.
            </p>
            <ul className="mt-5 space-y-2">
              {helpSection.guides.items.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between rounded-xl border border-slate-100/90 bg-white/60 px-4 py-3 text-[14px] font-medium text-slate-700 transition hover:border-slate-200 hover:bg-white"
                  >
                    {item.label}
                    <span className="text-slate-400" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </LandingContainer>
    </SectionBlock>
  )
}

function cnPad() {
  return `${landingCard} p-6 sm:p-7`
}
