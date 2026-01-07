import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog - Headcanon Generator Articles & Guides",
  description:
    "Explore our blog for character headcanon ideas, AI generator guides, anime character development tips, and creative writing resources.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

