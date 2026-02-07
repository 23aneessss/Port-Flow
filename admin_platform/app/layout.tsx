import React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat, Roboto_Condensed } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
})

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Port Flow Admin — Logistics Management",
  description: "Enterprise admin platform for port and logistics management",
}

export const viewport: Viewport = {
  themeColor: "#0F172A",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${robotoCondensed.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
