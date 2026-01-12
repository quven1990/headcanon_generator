import type { Metadata } from "next"

// 1. Title 页面标签 - 50-60字符，关键词在开头，末尾加域名
// 2. Description 页面描述 - 150-160字符，包含关键词和行动号召
// 注意：详情页是用户特定页面，使用默认 metadata
export const metadata: Metadata = {
  title: "Headcanon Generation Details | headcanonforge.com",
  description:
    "View detailed headcanon generation including core ideas, character development, and memorable moments. Explore your AI-generated creative content with full details and context.",
  // 7. robots 元标签 - 用户特定页面，不索引
  robots: {
    index: false, // Detail page is user-specific, should not be indexed
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
  // 8. canonical 标签 - 用户特定页面，使用基础路径
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/explore`,
  },
  openGraph: {
    title: "Headcanon Generation Details",
    description: "View detailed headcanon generation with core ideas and development.",
    type: "article",
  },
}

export default function ExploreDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
