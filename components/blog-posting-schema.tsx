interface BlogPostingSchemaProps {
  title: string
  description: string
  url: string
  datePublished: string
  author?: string
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"

export function BlogPostingSchema({
  title,
  description,
  url,
  datePublished,
  author,
}: BlogPostingSchemaProps) {
  const authorName = author || "Headcanon Forge Team"

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    url,
    datePublished,
    dateModified: datePublished,
    author: {
      "@type": "Organization",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Headcanon Forge",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
