import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

export const metadata: Metadata = {
  title: {
    default: "Free Headcanon Generator - AI Tool | headcanonforge.com",
    template: "%s | headcanonforge.com",
  },
  description:
    "Generate creative headcanon ideas for any character with our AI-powered headcanon generator. Sign in with Google to create; browse community creations for free.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/`,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    siteName: "Headcanon Forge",
    type: "website",
    locale: "en_US",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:shadow-lg focus:ring-2 focus:ring-blue-500"
        >
          Skip to main content
        </a>
        <Script
          src="https://plausible.shipsolo.io/js/pa-riwWpD-k_a5FGy2mUDmEW.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-analytics" strategy="afterInteractive">
          {`
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init({ domain: 'www.headcanonforge.com' })
          `}
        </Script>
        <Navbar />
        {children}
        <Footer />
        <Toaster />
      </body>
    </html>
  )
}
