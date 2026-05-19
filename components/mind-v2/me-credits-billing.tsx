"use client"

import { useMemo, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { ChevronRight, CreditCard, Download, Plus, Receipt, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { mx } from "@/lib/medrix-design-tokens"
import {
  SettingsGroup,
  SettingsLinkRow,
  SettingsScreenShell,
} from "@/components/mind-v2/me-settings-ui"

export type CreditPlan = {
  id: string
  name: string
  credits: number
  price: string
  blurb: string
  highlight: boolean
}

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

const BRAND_LABEL: Record<PaymentBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
}

const MOCK_INVOICES: BillingInvoice[] = [
  {
    id: "inv_2026_03",
    date: "Mar 12, 2026",
    description: "Standard credit pack",
    amount: "$19.99",
    status: "paid",
  },
  {
    id: "inv_2026_01",
    date: "Jan 8, 2026",
    description: "Lite refill",
    amount: "$4.99",
    status: "paid",
  },
  {
    id: "inv_2025_11",
    date: "Nov 2, 2025",
    description: "Pro pack",
    amount: "$79.99",
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
  creditPlans,
}: {
  onClose: () => void
  stats: CreditsStats
  creditPlans: readonly CreditPlan[]
}) {
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

  const handlePurchase = (plan: CreditPlan) => {
    if (!defaultMethod) {
      toast.message("Add a payment method", {
        description: "Link a card before purchasing credits.",
      })
      setScreen("add-payment")
      return
    }
    toast.success("Purchase complete (demo)", {
      description: `${plan.name} · charged ${plan.price} to ${formatCardLabel(defaultMethod)}`,
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
        <p className="mb-4 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          Cards are stored with your billing provider. Mind never stores full card numbers on device.
        </p>

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
            "mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors",
            mx.commerceSecondaryCta
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
          className={cn(
            "w-full rounded-xl py-3 text-sm font-semibold transition-colors",
            mx.commercePrimaryCta
          )}
        >
          Save payment method
        </button>
      </SettingsScreenShell>
    )
  }

  if (screen === "billing") {
    return (
      <SettingsScreenShell title="Billing & invoices" onBack={() => setScreen("main")} zClass="z-50">
        <SettingsGroup className="mb-5">
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

        <h2 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">Invoice history</h2>
        <p className="mb-3 text-xs text-zinc-500">Download PDF receipts for accounting or reimbursement.</p>

        <div className="space-y-2">
          {MOCK_INVOICES.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      </SettingsScreenShell>
    )
  }

  return (
    <CreditsShell onClose={onClose}>
      <BalanceCard stats={stats} />
      <PaymentSection
        defaultMethod={defaultMethod}
        onOpenMethods={() => setScreen("payment-methods")}
        onAddCard={() => setScreen("add-payment")}
      />
      <BillingSection
        billingEmail={billingEmail}
        invoiceCount={MOCK_INVOICES.length}
        onOpenBilling={() => setScreen("billing")}
        onEditEmail={updateBillingEmail}
      />
      <PlansSection creditPlans={creditPlans} onPurchase={handlePurchase} />
    </CreditsShell>
  )
}

function CreditsShell({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-50 flex animate-in flex-col bg-white duration-200 slide-in-from-right dark:bg-zinc-950">
      <div className="flex shrink-0 items-center justify-between border-b border-stone-100/85 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 hover:bg-stone-100 dark:hover:bg-zinc-800"
          aria-label="Back"
        >
          <ChevronRight className="h-6 w-6 rotate-180 text-zinc-600 dark:text-zinc-300" />
        </button>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Credits & plans</h1>
        <div className="w-8" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pb-8">{children}</div>
    </div>
  )
}

function BalanceCard({ stats }: { stats: CreditsStats }) {
  const pct = Math.min(
    100,
    Math.round((stats.creditsRemaining / stats.creditsMonthlyAllowance) * 100)
  )
  return (
    <div className={cn("mx-5 mt-4 rounded-2xl p-4 shadow-sm", mx.creditsCard)}>
      <div className="mb-1 text-sm text-zinc-500">Available balance</div>
      <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {stats.creditsRemaining.toLocaleString("en-US")}
        <span className="ml-1.5 text-lg font-semibold text-zinc-500">credits</span>
      </div>
      <div className="mt-3 text-xs text-zinc-500">
        Included this cycle: {stats.creditsMonthlyAllowance.toLocaleString("en-US")} credits · resets monthly
      </div>
      <div className={cn("mt-3 h-2 overflow-hidden rounded-full", mx.creditsProgressTrack)}>
        <div className={cn("h-full rounded-full", mx.creditsProgressFill)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function PaymentSection({
  defaultMethod,
  onOpenMethods,
  onAddCard,
}: {
  defaultMethod: PaymentMethod | null
  onOpenMethods: () => void
  onAddCard: () => void
}) {
  return (
    <section className="mt-6 px-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Payment</h2>
      <p className="mt-1 text-xs text-zinc-500">Used for credit packs and future subscriptions.</p>
      <SettingsGroup className="mt-3">
        <button
          type="button"
          onClick={onOpenMethods}
          className="flex w-full items-center gap-3 border-b border-stone-100/90 px-4 py-3.5 text-left transition-colors hover:bg-stone-50 active:bg-stone-100/80 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
            <CreditCard className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium text-zinc-900 dark:text-zinc-100">
              {defaultMethod ? formatCardLabel(defaultMethod) : "No payment method"}
            </span>
            <span className="mt-0.5 block text-xs text-zinc-500">
              {defaultMethod
                ? `Expires ${String(defaultMethod.expMonth).padStart(2, "0")}/${String(defaultMethod.expYear).slice(-2)} · Default`
                : "Add a card to complete purchases"}
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300 dark:text-zinc-600" />
        </button>
        {!defaultMethod ? (
          <SettingsLinkRow label="Add payment method" onClick={onAddCard} last />
        ) : (
          <SettingsLinkRow label="Manage payment methods" onClick={onOpenMethods} last />
        )}
      </SettingsGroup>
    </section>
  )
}

function BillingSection({
  billingEmail,
  invoiceCount,
  onOpenBilling,
  onEditEmail,
}: {
  billingEmail: string
  invoiceCount: number
  onOpenBilling: () => void
  onEditEmail: () => void
}) {
  return (
    <section className="mt-6 px-5">
      <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Billing</h2>
      <p className="mt-1 text-xs text-zinc-500">Receipts, billing contact, and invoice history.</p>
      <SettingsGroup className="mt-3">
        <SettingsLinkRow
          label="Billing & invoices"
          value={`${invoiceCount} receipts`}
          onClick={onOpenBilling}
        />
        <SettingsLinkRow label="Billing email" value={billingEmail} onClick={onEditEmail} last />
      </SettingsGroup>
    </section>
  )
}

function PlansSection({
  creditPlans,
  onPurchase,
}: {
  creditPlans: readonly CreditPlan[]
  onPurchase: (plan: CreditPlan) => void
}) {
  return (
    <>
      <div className="mb-2 mt-8 px-5">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Buy more credits</h2>
        <p className="mt-1 text-xs text-zinc-500">
          One-time packs. Credits apply to transcription, AI summaries, and agents.
        </p>
      </div>
      <div className="space-y-3 px-5">
        {creditPlans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onPurchase={() => onPurchase(plan)} />
        ))}
      </div>
      <p className="mt-6 px-5 pb-2 text-center text-xs leading-relaxed text-zinc-400">
        Payments are processed securely by your billing provider. This screen is a UI prototype — wire Stripe or
        App Store billing before production.
      </p>
    </>
  )
}

function PlanCard({ plan, onPurchase }: { plan: CreditPlan; onPurchase: () => void }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white p-4 shadow-sm dark:bg-zinc-900",
        plan.highlight ? mx.commercePopularRing : "border-stone-100/85 dark:border-zinc-800"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">{plan.name}</span>
            {plan.highlight ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  mx.commercePopularBadge
                )}
              >
                Popular
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-zinc-500">{plan.blurb}</p>
          <p className="mt-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
            +{plan.credits.toLocaleString("en-US")} credits
          </p>
        </div>
        <div className="shrink-0 text-right text-lg font-bold text-zinc-900 dark:text-zinc-50">{plan.price}</div>
      </div>
      <button
        type="button"
        className={cn(
          "mt-4 w-full rounded-xl py-3 text-sm font-semibold transition-colors",
          plan.highlight ? mx.commercePrimaryCta : mx.commerceSecondaryCta
        )}
        onClick={onPurchase}
      >
        Purchase
      </button>
    </div>
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
      <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
        <CreditCard className="mx-auto h-8 w-8 text-zinc-300" />
        <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">No cards on file</p>
        <p className="mt-1 text-xs text-zinc-500">Add a payment method to buy credit packs.</p>
        <button
          type="button"
          onClick={onAdd}
          className={cn("mt-4 rounded-xl px-4 py-2 text-sm font-semibold", mx.commercePrimaryCta)}
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
    <div className="rounded-2xl border border-stone-100/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 dark:bg-zinc-800">
          <CreditCard className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCardLabel(method)}</span>
            {method.isDefault ? (
              <span className="rounded-full bg-mind/12 px-2 py-0.5 text-[10px] font-semibold uppercase text-mind">
                Default
              </span>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs text-zinc-500">
            Expires {String(method.expMonth).padStart(2, "0")}/{String(method.expYear).slice(-2)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
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
      </div>
    </div>
  )
}

function InvoiceCard({ invoice }: { invoice: BillingInvoice }) {
  return (
    <div className="rounded-2xl border border-stone-100/90 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 dark:bg-zinc-800">
          <Receipt className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-medium text-zinc-900 dark:text-zinc-100">{invoice.description}</p>
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
