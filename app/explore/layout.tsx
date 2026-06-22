import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"

export const metadata: Metadata = {
  title: "Explore Community Headcanons | headcanonforge.com",
  description:
    "Browse AI-generated headcanons shared by the community. Discover character and relationship stories from creators around the world.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: `${siteUrl}/explore`,
  },
  openGraph: {
    title: "Explore Community Headcanons",
    description: "Browse AI-generated headcanons shared by the community.",
    url: `${siteUrl}/explore`,
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
