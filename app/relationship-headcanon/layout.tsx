import type { Metadata } from "next"

// 1. Title 页面标签 - 50-60字符，关键词在开头，末尾加域名
export const metadata: Metadata = {
  title: "Relationship Headcanon Generator AI | headcanonforge.com",
  // 2. Description 页面描述 - 150-160字符，包含关键词和行动号召
  description:
    "Generate relationship headcanons for characters with our free AI tool. Explore friendships, romances, and rivalries. Perfect for fanfiction and creative writing. Create unique bonds today!",
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
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/relationship-headcanon`,
  },
  keywords: [
    "relationship headcanon generator",
    "character relationship generator",
    "headcanon generator",
    "friendship headcanon",
    "romance headcanon generator",
    "free headcanon tool",
    "character bond generator",
    "relationship story generator",
  ],
}

export default function RelationshipHeadcanonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

