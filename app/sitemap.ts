import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog'
import { createClient } from '@supabase/supabase-js'

/**
 * Sitemap 配置
 * 
 * 此文件会自动生成网站的 sitemap.xml
 * 
 * 添加新页面的方法：
 * 1. 静态页面：在 staticPages 数组中添加新条目
 * 2. 博客文章：自动从 blog-posts/ 目录读取，无需手动添加
 *    - 所有 blog-posts/ 目录下的 .md 文件会自动出现在 sitemap 中
 *    - headcanon-generator-blogs/ 目录用于存放抓取的文章，不会出现在 sitemap 中
 * 3. 动态页面：在相应的位置添加生成逻辑
 */

// 静态页面配置
const staticPages: Array<{
  path: string
  priority: number
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
}> = [
  {
    path: '/',
    priority: 1.0,
    changeFrequency: 'weekly',
  },
  {
    path: '/character-headcanon',
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  {
    path: '/relationship-headcanon',
    priority: 0.9,
    changeFrequency: 'weekly',
  },
  {
    path: '/blog',
    priority: 0.8,
    changeFrequency: 'weekly',
  },
  {
    path: '/explore',
    priority: 0.7,
    changeFrequency: 'daily',
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 确保使用完整的URL，包括协议和域名
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.headcanonforge.com'
  
  // 确保baseUrl是完整的URL格式，移除末尾的斜杠
  let siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  siteUrl = siteUrl.replace(/\/$/, '') // 移除末尾的斜杠
  
  // 获取当前日期作为最后修改时间
  const now = new Date()
  
  // 生成静态页面
  const staticPagesSitemap: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${siteUrl}${page.path}`,
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
  
  // 自动获取所有博客文章并生成 sitemap 条目
  // 注意：当你在 blog-posts/ 目录添加新的 .md 文件时，
  // 这些博客会自动出现在 sitemap 中，无需手动修改此文件
  // headcanon-generator-blogs/ 目录用于存放抓取的文章，不会出现在 sitemap 中
  const blogPosts = getAllBlogPosts()
  const blogPagesSitemap: MetadataRoute.Sitemap = blogPosts.map((post) => {
    // 根据文章日期设置优先级：新文章（30天内）优先级更高
    const postDate = post.date ? new Date(post.date) : null
    const daysSincePost = postDate ? (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24) : Infinity
    const priority = daysSincePost <= 30 ? 0.8 : 0.7 // 新文章优先级0.8，旧文章0.7
    
    return {
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: postDate || now,
      changeFrequency: 'monthly' as const,
      priority,
    }
  })
  
  // 自动获取所有 explore 记录并生成 sitemap 条目
  // 注意：当有新的 headcanon 生成记录时，会自动出现在 sitemap 中
  // 使用 service_role key 绕过 RLS 策略，获取所有未删除的记录
  let explorePagesSitemap: MetadataRoute.Sitemap = []
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && serviceRoleKey) {
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      })
      
      // 获取所有未删除的记录，按创建时间倒序排列
      const { data: records, error } = await adminSupabase
        .from("headcanon_generations")
        .select("id, created_at")
        .eq("is_deleted", 0)
        .order("created_at", { ascending: false })
      
      if (!error && records && records.length > 0) {
        explorePagesSitemap = records.map((record) => ({
          url: `${siteUrl}/explore/${record.id}`,
          lastModified: record.created_at ? new Date(record.created_at) : now,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }))
      }
    }
  } catch (error) {
    // 如果获取 explore 记录失败，不影响其他页面的 sitemap 生成
    console.error('Error fetching explore records for sitemap:', error)
  }
  
  // 合并所有页面
  return [...staticPagesSitemap, ...blogPagesSitemap, ...explorePagesSitemap]
}

