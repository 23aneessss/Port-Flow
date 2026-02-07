import React from "react"
import type { Metadata } from 'next'
import { Montserrat, Roboto_Condensed } from 'next/font/google'

import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '800'],
})

const robotoCondensed = Roboto_Condensed({
  subsets: ['latin'],
  variable: '--font-roboto-condensed',
  weight: ['300', '400', '500', '700'],
})

export const metadata: Metadata = {
  title: 'Port Operations Dashboard',
  description: 'Manage truck bookings and terminal operations',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${robotoCondensed.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
