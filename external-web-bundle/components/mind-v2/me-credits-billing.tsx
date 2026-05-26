"use client"

import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { ChevronRight, CreditCard, Download, Plus, Receipt, Trash2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  SettingsGroup,
  SettingsLinkRow,
  SettingsScreenShell,
} from "@/components/mind-v2/me-settings-ui"
import {
  MEMBERSHIP_BENEFIT_ROWS,
  MEMBERSHIP_PLANS,
  membershipBenefitValue,
  membershipPlanById,
  type MembershipPlan,
  type MembershipPlanId,
} from "@/lib/mind-membership-plans"

export type { MembershipPlan, MembershipPlanId }
export { MEMBERSHIP_PLANS }

type PaymentBrand = "visa" | "mastercard" | "amex"

type PaymentMethod = {
  id: string
  brand: PaymentBrand
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

type BillingInvoice = {
  id: string
  date: string
  description: string
  amount: string
  status: "paid" | "refunded"
}

type CreditsStats = {
  creditsRemaining: number
  creditsMonthlyAllowance: number
}

type Screen = "main" | "payment-methods" | "add-payment" | "billing"

/** Matches Me tab diary / settings glass cards on mobile */
const meMobileGlassCard =
  "rounded-xl border border-stone-200 bg-white/55 shadow-sm shadow-stone-900/5 backdrop-blur-sm dark:border-zinc-700/90 dark:bg-zinc-900/55"

function MeMobileSectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className={cn("mb-2 px-0.5 text-[12px] font-semibold", "text-[#1a1a1a] dark:text-zinc-100")}>{children}</p>
  )
}

function MeMobileSectionHint({ children }: { children: ReactNode }) {
  return <p className={cn("mb-3 text-[12px] leading-relaxed", "text-[#787671] dark:text-zinc-400")}>{children}</p>
}

const BRAND_LABEL: Record<PaymentBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
}

const MOCK_INVOICES: BillingInvoice[] = [
  {
    id: "inv_2026_03",
    date: "Mar 12, 2026",
    description: "Standard membership",
    amount: "$49.00",
    status: "paid",
  },
  {
    id: "inv_2026_01",
    date: "Jan 8, 2026",
    description: "Standard membership",
    amount: "$49.00",
    status: "paid",
  },
  {
    id: "inv_2025_11",
    date: "Nov 2, 2025",
    description: "Starter membership",
    amount: "$19.00",
    status: "paid",
  },
]

function formatCardLabel(method: PaymentMethod) {
  return `${BRAND_LABEL[method.brand]} ···· ${method.last4}`
}

function detectBrand(digits: string): PaymentBrand {
  if (digits.startsWith("34") || digits.startsWith("37")) return "amex"
  if (digits.startsWith("5")) return "mastercard"
  return "visa"
}

export function MeCreditsPlansScreen({
  onClose,
  stats,
  currentPlanId = "standard",
  membershipPlans = MEMBERSHIP_PLANS,
}: {
  onClose: () => void
  stats: CreditsStats
  currentPlanId?: MembershipPlanId
  membershipPlans?: readonly MembershipPlan[]
}) {
  const currentPlan = membershipPlanById(currentPlanId)
  const [screen, setScreen] = useState<Screen>("main")
  const [billingEmail, setBillingEmail] = useState("dorothy@example.com")
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "pm_default",
      brand: "visa",
      last4: "4242",
      expMonth: 12,
      expYear: 2027,
      isDefault: true,
    },
  ])
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")

  const defaultMethod = useMemo(
    () => paymentMethods.find((m) => m.isDefault) ?? paymentMethods[0] ?? null,
    [paymentMethods]
  )

  const updateBillingEmail = () => {
    const next = window.prompt("Billing email for receipts", billingEmail)
    if (next?.trim()) {
      setBillingEmail(next.trim())
      toast.success("Billing email updated")
    }
  }

  const handleSubscribe = (plan: MembershipPlan) => {
    if (plan.id === currentPlanId) {
      toast.message("Current plan", { description: `You are on ${plan.name}.` })
      return
    }
    if (!defaultMethod) {
      toast.message("Add a payment method", {
        description: "Link a card before subscribing.",
      })
      setScreen("add-payment")
      return
    }
    toast.success("Subscription updated (demo)", {
      description: `${plan.name} · ${plan.priceLabel} · ${formatCardLabel(defaultMethod)}`,
    })
  }

  const handleSavePaymentMethod = () => {
    const digits = cardNumber.replace(/\D/g, "")
    if (digits.length < 15) {
      toast.error("Enter a valid card number")
      return
    }
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
      toast.error("Use MM/YY for expiry")
      return
    }
    if (cardCvc.replace(/\D/g, "").length < 3) {
      toast.error("Enter a valid security code")
      return
    }
    const [mm, yy] = cardExpiry.split("/").map((p) => parseInt(p, 10))
    const last4 = digits.slice(-4)
    const brand = detectBrand(digits)
    const id = `pm_${Date.now()}`
    setPaymentMethods((prev) => [
      ...prev.map((m) => ({ ...m, isDefault: false })),
      {
        id,
        brand,
        last4,
        expMonth: mm,
        expYear: 2000 + yy,
        isDefault: true,
      },
    ])
    setCardNumber("")
    setCardExpiry("")
    setCardCvc("")
    setCardName("")
    toast.success("Payment method saved")
    setScreen("payment-methods")
  }

  const setDefaultMethod = (id: string) => {
    setPaymentMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })))
    toast.success("Default payment method updated")
  }

  const removeMethod = (id: string) => {
    setPaymentMethods((prev) => {
      const next = prev.filter((m) => m.id !== id)
      if (next.length > 0 && !next.some((m) => m.isDefault)) {
        next[0] = { ...next[0], isDefault: true }
      }
      return next
    })
    toast.success("Payment method removed")
  }

  if (screen === "payment-methods") {
    return (
      <SettingsScreenShell title="Payment methods" onBack={() => setScreen("main")} zClass="z-50">
        <MeMobileSectionHint>
          Cards are stored with your billing provider. Mind never stores full card numbers on device.
        </MeMobileSectionHint>

        <PaymentMethodsList
          paymentMethods={paymentMethods}
          onAdd={() => setScreen("add-payment")}
          onSetDefault={setDefaultMethod}
          onRemove={removeMethod}
        />

        <button
          type="button"
          onClick={() => setScreen("add-payment")}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white/60 py-3 text-[13px] font-semibold text-zinc-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/90 dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100",
            "focus-visible:ring-2 focus-visible:ring-mind/35 focus-visible:ring-offset-2"
          )}
        >
          <Plus className="h-4 w-4" />
          Add payment method
        </button>
      </SettingsScreenShell>
    )
  }

  if (screen === "add-payment") {
    return (
      <SettingsScreenShell title="Add card" onBack={() => setScreen("payment-methods")} zClass="z-50">
        <SettingsGroup className="mb-4">
          <label className="block border-b border-stone-100/90 px-4 py-3.5 dark:border-zinc-800">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500">Card number</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-100"
            />
          </label>
          <div className="grid grid-cols-2 border-b border-stone-100/90 dark:border-zinc-800">
            <label className="block px-4 py-3.5">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">Expiry</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="w-full bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-100"
              />
            </label>
            <label className="block border-l border-stone-100/90 px-4 py-3.5 dark:border-zinc-800">
              <span className="mb-1.5 block text-xs font-medium text-zinc-500">CVC</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="123"
                value={cardCvc}
                onChange={(e) => setCardCvc(e.target.value)}
                className="w-full bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-100"
              />
            </label>
          </div>
          <label className="block px-4 py-3.5">
            <span className="mb-1.5 block text-xs font-medium text-zinc-500">Name on card</span>
            <input
              type="text"
              autoComplete="cc-name"
              placeholder="Full name"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full bg-transparent text-[15px] text-zinc-900 outline-none placeholder:text-zinc-300 dark:text-zinc-100"
            />
          </label>
        </SettingsGroup>

        <p className="mb-4 text-xs leading-relaxed text-zinc-400">
          Demo only — connect Stripe, Apple Pay, or your PSP to tokenize cards in production.
        </p>

        <button
          type="button"
          onClick={handleSavePaymentMethod}
          className={cn("w-full rounded-xl py-3 text-[15px] font-semibold transition-colors", "rounded-lg bg-mind text-white hover:bg-[#4534b3] active:bg-[#3a2a99] shadow-sm shadow-[rgba(86,69,212,0.25)]")}
        >
          Save payment method
        </button>
      </SettingsScreenShell>
    )
  }

  if (screen === "billing") {
    return (
      <SettingsScreenShell title="Records" onBack={() => setScreen("main")} zClass="z-50">
        <SettingsGroup className="mb-5">
          <SettingsLinkRow
            label="Payment methods"
            value={defaultMethod ? formatCardLabel(defaultMethod) : "Add card"}
            onClick={() => setScreen("payment-methods")}
          />
          <SettingsLinkRow label="Billing email" value={billingEmail} onClick={updateBillingEmail} />
          <SettingsLinkRow
            label="Tax information"
            value="Not set"
            onClick={() =>
              toast.message("Tax details", {
                description: "Collect VAT/GST IDs via your billing provider at checkout.",
              })
            }
            last
          />
        </SettingsGroup>

        <MeMobileSectionTitle>Invoice history</MeMobileSectionTitle>
        <MeMobileSectionHint>Download PDF receipts for accounting or reimbursement.</MeMobileSectionHint>

        <div className="space-y-2">
          {MOCK_INVOICES.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      </SettingsScreenShell>
    )
  }

  return (
    <SettingsScreenShell
      title="Membership"
      onBack={onClose}
      zClass="z-50"
      headerRight={
        <button
          type="button"
          onClick={() => setScreen("billing")}
          className="whitespace-nowrap px-1 text-[13px] font-medium text-mind"
        >
          Records
        </button>
      }
    >
      <div className={cn("min-w-0 max-w-full space-y-4", "bg-[#fafaf9] dark:bg-zinc-950")}>
        <BalanceCard stats={stats} currentPlanName={currentPlan?.name} />
        <MembershipComparisonSection
          plans={membershipPlans}
          currentPlanId={currentPlanId}
          onSubscribe={handleSubscribe}
        />
      </div>
    </SettingsScreenShell>
  )
}

function BalanceCard({
  stats,
  currentPlanName,
}: {
  stats: CreditsStats
  currentPlanName?: string
}) {
  const pct = Math.min(
    100,
    Math.round((stats.creditsRemaining / stats.creditsMonthlyAllowance) * 100)
  )
  return (
    <div className={cn(meMobileGlassCard, "min-w-0 overflow-hidden p-4")}>
      <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
        <span className={cn("shrink-0 text-[12px] font-medium", "text-[#787671] dark:text-zinc-400")}>Available balance</span>
        {currentPlanName ? (
          <span className="max-w-[45%] shrink-0 truncate rounded-md bg-mind/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mind">
            {currentPlanName}
          </span>
        ) : null}
      </div>
      <div className="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        <span className={cn("text-[26px] font-bold leading-none tracking-tight tabular-nums", "text-[#1a1a1a] dark:text-zinc-100")}>
          {stats.creditsRemaining.toLocaleString("en-US")}
        </span>
        <span className={cn("text-[14px] font-semibold", "text-[#787671] dark:text-zinc-400")}>credits</span>
      </div>
      <p className={cn("mt-2.5 text-[12px] leading-snug tabular-nums", "text-[#787671] dark:text-zinc-400")}>
        {stats.creditsMonthlyAllowance.toLocaleString("en-US")} included this cycle · resets monthly
      </p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-200/90 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-mind/90 to-mind"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function MembershipPlanCard({
  plan,
  selected,
  isCurrent,
  onSelect,
}: {
  plan: MembershipPlan
  selected: boolean
  isCurrent: boolean
  onSelect: () => void
}) {
  const isHighlight = plan.highlight
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "box-border flex w-full min-w-0 flex-col rounded-xl border p-3.5 text-left transition-colors",
        selected
          ? "border-2 border-mind bg-mind/[0.06] shadow-sm shadow-mind/10"
          : "border border-stone-200/90 bg-white/70 hover:border-stone-300 dark:border-zinc-700 dark:bg-zinc-900/70 dark:hover:border-zinc-600",
        isHighlight && !selected && "border-blue-300/70 dark:border-blue-800/60"
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-2">
        <p className={cn("min-w-0 truncate text-[15px] font-bold", isHighlight ? "text-mind" : "text-[#1a1a1a] dark:text-zinc-100")}>
          {plan.name}
        </p>
        {isCurrent ? (
          <span className="shrink-0 rounded bg-mind/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-mind">
            Current
          </span>
        ) : null}
      </div>
      <p className={cn("mt-2 text-[18px] font-semibold tabular-nums", "text-[#1a1a1a] dark:text-zinc-100")}>{plan.priceLabel}</p>
      <p className={cn("mt-1 text-[12px]", "text-[#787671] dark:text-zinc-400")}>{plan.monthlyCreditsLabel} credits / month</p>
      <p className={cn("mt-2 line-clamp-2 text-[12px] leading-snug", "text-[#787671] dark:text-zinc-400")}>{plan.blurb}</p>
    </button>
  )
}

function MembershipComparisonSection({
  plans,
  currentPlanId,
  onSubscribe,
}: {
  plans: readonly MembershipPlan[]
  currentPlanId: MembershipPlanId
  onSubscribe: (plan: MembershipPlan) => void
}) {
  const highlightPlan = plans.find((p) => p.highlight) ?? plans[plans.length - 1]
  const [selectedId, setSelectedId] = useState<MembershipPlanId>(highlightPlan?.id ?? "pro")
  const [termsAccepted, setTermsAccepted] = useState(true)
  const selectedPlan = membershipPlanById(selectedId) ?? highlightPlan
  const isCurrent = selectedPlan?.id === currentPlanId

  if (!selectedPlan) return null

  return (
    <section className="min-w-0 max-w-full">
      <MeMobileSectionTitle>Choose a plan</MeMobileSectionTitle>
      <div className="flex min-w-0 flex-col gap-2.5">
        {plans.map((plan) => (
          <MembershipPlanCard
            key={plan.id}
            plan={plan}
            selected={selectedId === plan.id}
            isCurrent={currentPlanId === plan.id}
            onSelect={() => setSelectedId(plan.id)}
          />
        ))}
      </div>

      <div className={cn(meMobileGlassCard, "mt-4 min-w-0 overflow-hidden p-4")}>
        <p className={cn("text-[12px] font-semibold", "text-[#1a1a1a] dark:text-zinc-100")}>{selectedPlan.name} · benefits</p>
        <ul className="mt-3 space-y-0">
          {MEMBERSHIP_BENEFIT_ROWS.map((row) => {
            const value = membershipBenefitValue(row, selectedPlan.id)
            const isDash = value === "—"
            return (
              <li
                key={row.id}
                className="grid grid-cols-1 gap-0.5 border-b border-stone-100/90 py-2.5 last:border-0 dark:border-zinc-800/80"
              >
                <span className={cn("min-w-0 text-[12px] leading-snug", "text-[#787671] dark:text-zinc-400")}>{row.label}</span>
                <span
                  className={cn(
                    "min-w-0 text-[12px] font-medium leading-snug",
                    isDash ? "text-zinc-300 dark:text-zinc-600" : selectedPlan.highlight ? "text-mind" : "text-[#1a1a1a] dark:text-zinc-100"
                  )}
                >
                  {value}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <label className="mt-4 flex min-w-0 cursor-pointer items-start gap-2.5">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-stone-300 accent-mind"
        />
        <span className={cn("min-w-0 text-[11px] leading-relaxed", "text-[#787671] dark:text-zinc-400")}>
          I agree to the membership terms and auto-renewal policy (demo).
        </span>
      </label>

      <button
        type="button"
        disabled={isCurrent || !termsAccepted}
        onClick={() => onSubscribe(selectedPlan)}
        className={cn(
          "mt-3 w-full min-w-0 rounded-xl px-3 py-3.5 text-center text-[15px] font-semibold leading-snug transition-colors",
          isCurrent || !termsAccepted
            ? "cursor-default bg-stone-200/90 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500"
            : "rounded-lg bg-mind text-white hover:bg-[#4534b3] active:bg-[#3a2a99] shadow-sm shadow-[rgba(86,69,212,0.25)]",
          "focus-visible:ring-2 focus-visible:ring-mind/35 focus-visible:ring-offset-2"
        )}
      >
        {isCurrent ? (
          <>Current plan · {selectedPlan.name}</>
        ) : (
          <>
            Subscribe · {selectedPlan.name}
            <span className="mt-0.5 block text-[13px] font-medium opacity-90">{selectedPlan.priceLabel}</span>
          </>
        )}
      </button>

      <p
        className={cn(
          "mt-4 flex min-w-0 items-start justify-center gap-1.5 text-center text-[11px] leading-relaxed",
          "text-[#a4a097] dark:text-zinc-500"
        )}
      >
        <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-mind" aria-hidden />
        <span>Tap a plan to compare · prices approximate (demo)</span>
      </p>
    </section>
  )
}

function PaymentMethodsList({
  paymentMethods,
  onAdd,
  onSetDefault,
  onRemove,
}: {
  paymentMethods: PaymentMethod[]
  onAdd: () => void
  onSetDefault: (id: string) => void
  onRemove: (id: string) => void
}) {
  if (paymentMethods.length === 0) {
    return (
      <div
        className={cn(
          meMobileGlassCard,
          "border-dashed p-6 text-center"
        )}
      >
        <CreditCard className={cn("mx-auto h-8 w-8", "text-[#a4a097] dark:text-zinc-500")} />
        <p className={cn("mt-2 text-[14px] font-medium", "text-[#1a1a1a] dark:text-zinc-100")}>No cards on file</p>
        <p className={cn("mt-1 text-[12px]", "text-[#787671] dark:text-zinc-400")}>Add a payment method to subscribe.</p>
        <button
          type="button"
          onClick={onAdd}
          className={cn("mt-4 rounded-xl px-4 py-2.5 text-[13px] font-semibold", "rounded-lg bg-mind text-white hover:bg-[#4534b3] active:bg-[#3a2a99] shadow-sm shadow-[rgba(86,69,212,0.25)]")}
        >
          Add card
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {paymentMethods.map((method) => (
        <PaymentMethodCard
          key={method.id}
          method={method}
          onSetDefault={() => onSetDefault(method.id)}
          onRemove={() => onRemove(method.id)}
          canRemove={paymentMethods.length > 1 || !method.isDefault}
        />
      ))}
    </div>
  )
}

function PaymentMethodCard({
  method,
  onSetDefault,
  onRemove,
  canRemove,
}: {
  method: PaymentMethod
  onSetDefault: () => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className={cn(meMobileGlassCard, "min-w-0 overflow-hidden p-4")}>
      <div className="flex min-w-0 items-start gap-3">
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", "bg-[#f0eeec] dark:bg-zinc-800")}>
          <CreditCard className={cn("h-5 w-5", "text-zinc-600 dark:text-zinc-300")} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            <span className="min-w-0 truncate text-[14px] font-semibold text-zinc-900 dark:text-zinc-100">
              {formatCardLabel(method)}
            </span>
            {method.isDefault ? (
              <span className="shrink-0 rounded-full bg-mind/12 px-2 py-0.5 text-[10px] font-semibold uppercase text-mind">
                Default
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Expires {String(method.expMonth).padStart(2, "0")}/{String(method.expYear).slice(-2)}
          </p>
        </div>
      </div>
      {!method.isDefault || canRemove ? (
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-stone-100/90 pt-3 dark:border-zinc-800/80">
          {!method.isDefault ? (
            <button type="button" onClick={onSetDefault} className="text-xs font-medium text-mind">
              Set default
            </button>
          ) : null}
          {canRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-0.5 text-xs text-zinc-400 hover:text-red-600"
              aria-label="Remove card"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function InvoiceCard({ invoice }: { invoice: BillingInvoice }) {
  return (
    <div className={cn(meMobileGlassCard, "min-w-0 overflow-hidden p-4")}>
      <div className="flex min-w-0 items-start gap-3">
        <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", "bg-[#f0eeec] dark:bg-zinc-800")}>
          <Receipt className={cn("h-4 w-4", "text-zinc-600 dark:text-zinc-300")} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-[15px] font-medium leading-snug text-zinc-900 dark:text-zinc-100">
            {invoice.description}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">{invoice.date}</p>
        </div>
        <span className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {invoice.amount}
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs capitalize text-zinc-500">{invoice.status}</span>
        <button
          type="button"
          onClick={() =>
            toast.success("Invoice downloaded", {
              description: `${invoice.id}.pdf (demo)`,
            })
          }
          className="inline-flex items-center gap-1 text-xs font-medium text-mind"
        >
          <Download className="h-3.5 w-3.5" />
          PDF
        </button>
      </div>
    </div>
  )
}
