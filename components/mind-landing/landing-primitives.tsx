import Link from "next/link"
import { Check, ChevronDown } from "lucide-react"
import { LANDING_COPY, LANDING_SIGN_IN_HREF, LANDING_WEB_APP_HREF } from "@/lib/mind-landing-copy"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
/** Glass card — design mock glassmorphism */
export const landingCard = cn(
  "rounded-3xl border border-white/50",
  "bg-white/70 shadow-[0_8px_40px_-12px_rgba(59,130,246,0.1)]",
  "backdrop-blur-xl backdrop-saturate-150"
)

export const landingGlassPanel = cn(
  "rounded-3xl border border-white/45",
  "bg-white/55 backdrop-blur-lg backdrop-saturate-150",
  "shadow-[0_4px_24px_-8px_rgba(99,102,241,0.08)]"
)

export function LandingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen font-sans text-slate-900 antialiased">{children}</div>
  )
}

export function LandingContainer({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1120px] px-5 sm:px-8", className)}>{children}</div>
}

export function SectionBlock({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={cn("relative pt-20 pb-0 sm:pt-28 sm:pb-0", className)}>
      {children}
    </section>
  )
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h2 className="text-[1.65rem] font-semibold leading-tight tracking-tight text-slate-900 sm:text-[2rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-500 sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  )
}

export function BrowserChrome({
  title,
  children,
  className,
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn(landingCard, "overflow-hidden", className)}>
      <div className="flex items-center gap-2 border-b border-white/40 bg-white/50 px-4 py-3 backdrop-blur-md">
        <span className="size-[10px] rounded-full bg-[#ff5f57]" />
        <span className="size-[10px] rounded-full bg-[#febc2e]" />
        <span className="size-[10px] rounded-full bg-[#28c840]" />
        <span className="ml-1 text-xs font-medium text-slate-500">{title}</span>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </div>
  )
}

/** Primary CTA — soft pastels that sit on the lavender/sky mesh background */
export const landingCtaGradient =
  "border border-white/80 bg-gradient-to-r from-white/95 via-teal-50/90 to-sky-50/95 text-slate-800 shadow-[0_4px_20px_-6px_rgba(99,102,241,0.14)] backdrop-blur-md backdrop-saturate-150 hover:border-teal-200/70 hover:from-white hover:via-teal-50 hover:to-violet-50/90 hover:text-teal-900"

export function MindLogoMark({ className }: { className?: string }) {
  return (
    <Link href="/landing" className={cn("flex shrink-0 items-center", className)}>
      <MindarLogo variant="wordmark" priority />
    </Link>
  )
}

export function LandingHeaderNav() {
  const { header } = LANDING_COPY
  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/50 backdrop-blur-2xl backdrop-saturate-150">
      <LandingContainer className="flex h-[72px] items-center gap-6">
        <MindLogoMark />
        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex" aria-label="Main">
          {header.nav.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              {item.label}
              <ChevronDown className="size-3.5 opacity-50" strokeWidth={2.5} aria-hidden />
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-4 sm:gap-6">
          <Link
            href={LANDING_SIGN_IN_HREF}
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            {header.signIn}
          </Link>
          <Button
            asChild
            className={cn("h-10 rounded-full px-5 text-sm font-semibold", landingCtaGradient)}
          >
            <Link href={LANDING_WEB_APP_HREF}>{header.cta}</Link>
          </Button>
        </div>
      </LandingContainer>
    </header>
  )
}

export function CheckRow({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item} className="flex gap-3.5 text-[15px] leading-relaxed text-slate-600">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-200/90 ring-1 ring-teal-300/50">
            <Check className="size-3.5 text-teal-800" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export function MinderAvatar({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white/80", className)}>
      <MindarLogo variant="avatar" className="!h-[70%] !w-[90%]" />
    </div>
  )
}
