import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getBlogPostBySlug, getAllBlogSlugs } from "@/lib/blog"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Calendar, User, ArrowLeft, ExternalLink } from "lucide-react"
import { format } from "date-fns"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

// 生成静态路径
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs()
  return slugs.map((slug) => ({
    slug,
  }))
}

// 生成 metadata
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"
  const postUrl = `${siteUrl}/blog/${slug}`
  
  // 提取摘要，移除 markdown 格式
  let excerpt = post.excerpt || post.content
  // 移除 markdown 标题标记
  excerpt = excerpt.replace(/^#+\s+/gm, '')
  // 移除 markdown 链接，保留文本
  excerpt = excerpt.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  // 移除 markdown 粗体标记
  excerpt = excerpt.replace(/\*\*([^*]+)\*\*/g, '$1')
  // 移除多余空白
  excerpt = excerpt.trim().replace(/\s+/g, ' ')
  // 取前 160 字符
  if (excerpt.length > 160) {
    excerpt = excerpt.substring(0, 157) + "..."
  }
  
  // 优化 title 长度，确保不超过 60 字符（包括域名）
  let title = post.title
  const domainSuffix = " | headcanonforge.com"
  const maxTitleLength = 60 - domainSuffix.length
  if (title.length > maxTitleLength) {
    title = title.substring(0, maxTitleLength - 3) + "..."
  }
  const fullTitle = `${title}${domainSuffix}`
  
  // 确保 description 在 150-160 字符之间
  let description = excerpt
  if (description.length < 150) {
    const additional = " Learn more about character headcanon creation, AI generator tips, and creative writing techniques."
    description = (description + additional).substring(0, 160)
  }

  return {
    title: fullTitle,
    description: description,
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
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: post.title,
      description: excerpt,
      url: postUrl,
      type: "article",
      publishedTime: post.date,
      authors: post.author ? [post.author] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: excerpt,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  let postDate: Date | null = null
  if (post.date) {
    const date = new Date(post.date)
    postDate = !isNaN(date.getTime()) ? date : null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <article className="mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:py-20">
        {/* Back Button */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Blog</span>
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
            {post.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            {postDate && (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <time dateTime={post.date}>
                  {format(postDate, "MMMM d, yyyy")}
                </time>
              </div>
            )}
            {post.author && (
              <div className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
            )}
            {post.source && (
              <a
                href={post.source}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Original Source</span>
              </a>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Footer Navigation */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>View All Blog Posts</span>
          </Link>
        </div>
      </article>
    </div>
  )
}

