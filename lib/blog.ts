import { ALL_BLOG_POSTS } from "./blog-data.generated"

export type { BlogPost } from "./blog-types"
export { ALL_BLOG_POSTS }

export function getAllBlogPosts() {
  return ALL_BLOG_POSTS
}

export function getBlogPostBySlug(slug: string) {
  return ALL_BLOG_POSTS.find((post) => post.slug === slug) ?? null
}

export function getAllBlogSlugs(): string[] {
  return ALL_BLOG_POSTS.map((post) => post.slug)
}
