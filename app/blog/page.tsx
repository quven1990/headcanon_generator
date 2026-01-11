import type { Metadata } from "next"
import Link from "next/link"
import { getAllBlogPosts } from "@/lib/blog"
import { Calendar, User, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { SEOBreadcrumb } from "@/components/seo-breadcrumb"

export const metadata: Metadata = {
  title: "Headcanon Blog - AI Generator Guides & Tips | headcanonforge.com",
  description:
    "Discover expert guides on character headcanon creation, AI generator tips, anime character development, and fanfiction writing. Learn how to build compelling character backstories with our comprehensive blog articles and start creating today.",
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
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/blog`,
  },
  keywords: [
    "headcanon blog",
    "character development",
    "anime headcanon ideas",
    "AI generator guide",
    "fanfiction tips",
    "character backstory",
  ],
  openGraph: {
    title: "Blog - Headcanon Generator Articles & Guides",
    description: "Explore our blog for character headcanon ideas, AI generator guides, and creative writing resources.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://www.headcanonforge.com"}/blog`,
    type: "website",
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20">
        <SEOBreadcrumb />
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Headcanon Generator Blog
            </span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Discover expert guides on character headcanon creation, AI generator tips, and creative writing techniques
          </p>
        </div>

        {/* Blog List */}
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blog posts available yet.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => {
              let postDate: Date | null = null
              if (post.date) {
                const date = new Date(post.date)
                postDate = !isNaN(date.getTime()) ? date : null
              }
              
              return (
                <article
                  key={post.slug}
                  className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <Link href={`/blog/${post.slug}`} className="block h-full">
                    <div className="p-6 h-full flex flex-col">
                      {/* Date and Author */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        {postDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={post.date}>
                              {format(postDate, "MMM d, yyyy")}
                            </time>
                          </div>
                        )}
                        {post.author && (
                          <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>{post.author}</span>
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h2 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {post.title}
                      </h2>

                      {/* Excerpt */}
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Read More */}
                      <div className="flex items-center text-blue-600 font-medium text-sm mt-auto">
                        Read more
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </article>
              )
            })}
          </div>
        )}

        {/* SEO Content Section */}
        <div className="max-w-4xl mx-auto mt-12 prose prose-lg">
          <section className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Master Character Headcanon Creation with Expert Guides
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to the Headcanon Generator Blog, your ultimate resource for creating compelling character backstories, developing rich personality traits, and exploring relationship dynamics. Whether you're a fanfiction writer, role-playing game enthusiast, or creative writer, our comprehensive guides will help you master the art of character development.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our blog features in-depth articles covering everything from basic character development techniques to advanced AI-powered headcanon generation strategies. Learn how to use our free AI headcanon generator effectively, discover creative headcanon ideas for anime characters, and explore relationship dynamics that bring your stories to life.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Each article is carefully crafted to provide actionable insights, practical examples, and step-by-step guidance. From understanding the psychology behind character motivations to creating authentic dialogue and building emotional connections, our content covers all aspects of character headcanon creation.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
              What You'll Learn
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-4">
              <li>Essential character development techniques and best practices</li>
              <li>How to use AI headcanon generators effectively for inspiration</li>
              <li>Creative headcanon ideas for anime, fanfiction, and original characters</li>
              <li>Relationship headcanon development strategies</li>
              <li>Tips for writing compelling character backstories</li>
              <li>Advanced techniques for character psychology and motivation</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Browse our articles above to find the perfect guide for your creative journey. Each post is designed to help you create more engaging, authentic, and memorable characters that resonate with your audience.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}

