import fs from 'fs'
import path from 'path'

export interface BlogPost {
  slug: string
  title: string
  author: string
  date: string
  source?: string
  content: string
  excerpt?: string
}

// 解析 frontmatter
function parseFrontmatter(content: string): { frontmatter: Record<string, string>, body: string } {
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)
  
  if (!match) {
    return { frontmatter: {}, body: content }
  }
  
  const frontmatterText = match[1]
  const body = match[2]
  const frontmatter: Record<string, string> = {}
  
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim()
      let value = line.substring(colonIndex + 1).trim()
      // 移除引号
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1)
      }
      frontmatter[key] = value
    }
  })
  
  return { frontmatter, body }
}

// 从文件名生成 slug
function getSlugFromFilename(filename: string): string {
  // 移除序号和日期前缀，例如: "01-2025-08-29-50-headcanon-ideas-anime-fanfiction.md"
  // 提取: "50-headcanon-ideas-anime-fanfiction"
  const match = filename.match(/^\d+-\d{4}-\d{2}-\d{2}-(.+)\.md$/)
  if (match) {
    return match[1]
  }
  // 如果没有匹配，移除扩展名
  return filename.replace(/\.md$/, '')
}

// 获取所有博客文章
export function getAllBlogPosts(): BlogPost[] {
  const blogsDirectory = path.join(process.cwd(), 'headcanon-generator-blogs')
  
  if (!fs.existsSync(blogsDirectory)) {
    return []
  }
  
  const fileNames = fs.readdirSync(blogsDirectory)
  const allPosts: BlogPost[] = []
  
  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md') || fileName === 'README.md') {
      continue
    }
    
    const fullPath = path.join(blogsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { frontmatter, body } = parseFrontmatter(fileContents)
    
    const slug = getSlugFromFilename(fileName)
    
    // 提取摘要（第一段或前200字符）
    const excerptMatch = body.match(/^[^\n]+/)
    const excerpt = excerptMatch 
      ? excerptMatch[0].substring(0, 200).replace(/^#+\s*/, '')
      : body.substring(0, 200)
    
    allPosts.push({
      slug,
      title: frontmatter.title || fileName.replace(/\.md$/, ''),
      author: frontmatter.author || '',
      date: frontmatter.date || '',
      source: frontmatter.source,
      content: body,
      excerpt: excerpt.length < body.length ? excerpt + '...' : excerpt,
    })
  }
  
  // 按日期排序，最新的在前
  return allPosts.sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return dateB - dateA
  })
}

// 根据 slug 获取单篇博客
export function getBlogPostBySlug(slug: string): BlogPost | null {
  const posts = getAllBlogPosts()
  return posts.find(post => post.slug === slug) || null
}

// 获取所有博客的 slug（用于静态生成）
export function getAllBlogSlugs(): string[] {
  const posts = getAllBlogPosts()
  return posts.map(post => post.slug)
}

