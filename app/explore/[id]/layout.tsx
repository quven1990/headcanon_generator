import type { Metadata } from "next"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params

  return {
    title: `Community Headcanon #${id} | headcanonforge.com`,
    description:
      "Read a community-shared AI headcanon including core ideas, character development, and memorable moments.",
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${siteUrl}/explore/${id}`,
    },
    openGraph: {
      title: `Community Headcanon #${id}`,
      description: "Community-shared AI headcanon generation details.",
      type: "article",
      url: `${siteUrl}/explore/${id}`,
    },
  }
}

export default function ExploreDetailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
