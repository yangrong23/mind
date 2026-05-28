import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 disabled:bg-[#e5e3df] disabled:text-[#bbb8b1] [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'mind-btn text-primary-foreground border-0',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-[#c8c4be] bg-transparent text-[#1a1a1a] hover:bg-[#f6f5f4] dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-800/60',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-[#f0eeec] dark:hover:bg-zinc-800',
        ghost:
          'rounded-md text-[#1a1a1a] hover:bg-[#f6f5f4] dark:text-zinc-100 dark:hover:bg-zinc-800/60',
        link: 'rounded-none p-0 text-[#0075de] hover:text-[#005bab] hover:underline underline-offset-4',
        /** Marketing / landing — soft surface, no saturated mesh gradient */
        landing:
          'border border-slate-200/65 bg-white/88 text-slate-700 shadow-[0_4px_18px_-10px_rgba(15,23,42,0.07)] backdrop-blur-md hover:border-slate-300/60 hover:bg-white hover:text-slate-900 hover:shadow-[0_6px_22px_-10px_rgba(15,23,42,0.09)] active:scale-[0.99]',
        dark: 'bg-black text-white hover:bg-zinc-800 active:bg-zinc-900',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
