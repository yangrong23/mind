import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from './providers'
import './globals.css'

/** Single app typeface — applied on html/body so every screen inherits the same font */
const appFont = Inter({
  subsets: ['latin'],
  variable: '--font-app',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Mindar — Intelligent knowledge workspace',
  description: 'Voice capture · Knowledge graph · Agent collaboration',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/mindar-logo.png',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${appFont.variable} min-h-screen bg-background font-sans`}
    >
      <body className={`${appFont.className} min-h-screen bg-background font-sans text-foreground antialiased`}>
        <Providers>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </Providers>
      </body>
    </html>
  )
}
