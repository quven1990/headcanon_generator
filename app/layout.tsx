import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // 1. Title 页面标签 - 50-60字符，关键词在开头，末尾加域名
  title: "Headcanon Generator - Free AI Tool | headcanonforge.com",
  // 2. Description 页面描述 - 150-160字符，包含关键词和行动号召
  description:
    "Generate creative headcanon ideas for any character with our free AI-powered headcanon generator. Perfect for writers, fanfiction creators, RPG players, and world-builders. Start creating unique character backstories today!",
  // 7. robots 元标签
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
  // 8. canonical 标签 - 根layout使用默认值，子页面会覆盖
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/`,
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

// 9. Viewport Meta Tag 视口元标签
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
    <html lang="en" className="dark">
      <body className={`font-sans antialiased`}>
        {/* Google tag (gtag.js) - 使用beforeInteractive策略，Next.js会自动放在head中，紧跟在head元素之后 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XE3TDNW61V"
          strategy="beforeInteractive"
        />
        <Script id="google-analytics" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XE3TDNW61V');
          `}
        </Script>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
