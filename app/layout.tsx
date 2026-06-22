import type React from "react"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Geist, Geist_Mono } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ 
  subsets: ["latin"],
  display: 'swap', // 字体加载时使用系统字体，加载完成后切换
  preload: true, // 预加载字体
})
const _geistMono = Geist_Mono({ 
  subsets: ["latin"],
  display: 'swap',
  preload: false, // 非关键字体不预加载
})

export const metadata: Metadata = {
  // 1. Title 页面标签 - 50-60字符，关键词在开头，末尾加域名
  title: "Headcanon Generator - AI-Powered Tool | headcanonforge.com",
  // 2. Description 页面描述 - 150-160字符，包含关键词和行动号召
  description:
    "Generate creative headcanon ideas for any character with our AI-powered headcanon generator. Perfect for writers, fanfiction creators, RPG players, and world-builders. Start creating unique character backstories today!",
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
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
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
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* Google tag (gtag.js) - 使用afterInteractive策略，不阻塞页面渲染 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XE3TDNW61V"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XE3TDNW61V');
          `}
        </Script>
        <Script
          src="https://plausible.shipsolo.io/js/pa-riwWpD-k_a5FGy2mUDmEW.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-analytics" strategy="afterInteractive">
          {`
            window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
            plausible.init({ domain: 'headcanonforge.com' })
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
