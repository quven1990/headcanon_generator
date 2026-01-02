import type { Metadata } from "next"
import HomePageClient from "./home-page-client"

// 1. Title 页面标签 - 50-60字符，关键词在开头，末尾加域名
export const metadata: Metadata = {
  title: "Headcanon Generator - Free AI Tool | headcanonforge.com",
  // 2. Description 页面描述 - 150-160字符，包含关键词和行动号召
  description:
    "Generate creative headcanon ideas for any character with our free AI-powered headcanon generator. Perfect for writers, fanfiction creators, and RPG players. Start creating unique character backstories today!",
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
  // 8. canonical 标签
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/`,
  },
  keywords: [
    "headcanon generator",
    "character headcanon",
    "AI headcanon",
    "fanfiction generator",
    "character backstory generator",
    "free headcanon tool",
    "headcanon ideas",
    "character story generator",
  ],
}

export default function HomePage() {
  return <HomePageClient />
}
