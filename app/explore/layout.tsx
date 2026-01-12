import type { Metadata } from "next"

// 1. Title 页面标签 - 50-60字符，关键词在开头，末尾加域名
// 2. Description 页面描述 - 150-160字符，包含关键词和行动号召
export const metadata: Metadata = {
  title: "Explore Headcanon Generations | headcanonforge.com",
  description:
    "Browse and explore all your AI-generated headcanons. View character and relationship headcanons, organize creative content, and revisit favorite generations. Start exploring today!",
  // 7. robots 元标签 - 用户特定页面，不索引
  robots: {
    index: false, // Explore page is user-specific, should not be indexed
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  // 8. canonical 标签
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/explore`,
  },
  openGraph: {
    title: "Explore Headcanon Generations",
    description: "Browse and explore all your AI-generated headcanons.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/explore`,
    type: "website",
  },
}

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
