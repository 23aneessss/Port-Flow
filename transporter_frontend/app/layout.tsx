import React from "react"
import type { Metadata, Viewport } from "next"
import { Montserrat, Roboto_Condensed } from "next/font/google"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["500", "600", "700", "800"],
})

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
  weight: ["300", "400", "500", "700"],
})

export const metadata: Metadata = {
  title: "PortFlow - Logistics Platform",
  description:
    "Modern web platform for ships and trucks reservations and logistics coordination",
}

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${robotoCondensed.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  )
}
