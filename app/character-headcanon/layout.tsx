import type { Metadata } from "next"

// 1. Title 页面标签 - 40-60字符，关键词在开头，末尾加域名
export const metadata: Metadata = {
  title: "Character Headcanon Generator AI | headcanonforge.com",
  // 2. Description 页面描述 - 140-160字符，包含关键词和行动号召
  description:
    "Create unique character headcanons with our free AI-powered generator. Explore backstories, personality traits, and hidden talents. Perfect for writers and fanfiction creators.",
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
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/character-headcanon`,
  },
  keywords: [
    "character headcanon generator",
    "headcanon generator",
    "character backstory generator",
    "AI character headcanon",
    "free headcanon tool",
    "character story generator",
    "headcanon ideas",
    "character development tool",
  ],
}

export default function CharacterHeadcanonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

