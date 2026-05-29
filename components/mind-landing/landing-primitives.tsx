import Link from "next/link"
import { Check } from "lucide-react"
import { MindarLogo } from "@/components/mind-v2/mindar-logo"
import { cn } from "@/lib/utils"
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

/** @deprecated Prefer Button `variant="landing"` — kept for legacy className merges */
export const landingCtaGradient =
  "border border-slate-200/65 bg-white/88 text-slate-700 shadow-[0_4px_18px_-10px_rgba(15,23,42,0.07)] backdrop-blur-md hover:border-slate-300/60 hover:bg-white hover:text-slate-900 !bg-white/88"

export function MindLogoMark({ className }: { className?: string }) {
  return (
    <Link href="/landing" className={cn("flex shrink-0 items-center", className)}>
      <MindarLogo height={36} priority className="max-h-9" />
    </Link>
  )
}

export { LandingHeaderNav } from "@/components/mind-landing/landing-header-nav"

export function CheckRow({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-5">
      {items.map((item) => (
        <li key={item} className="flex gap-3.5 text-[15px] leading-relaxed text-slate-600">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 ring-1 ring-slate-200/80">
            <Check className="size-3.5 text-slate-600" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  )
}

export function MindarAvatar({ className }: { className?: string }) {
  return <MindarLogo height={28} className={cn("ring-2 ring-white/80", className)} />
}
