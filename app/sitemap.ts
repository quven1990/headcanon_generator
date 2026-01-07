import { MetadataRoute } from 'next'
import { getAllBlogPosts } from '@/lib/blog'

/**
 * Sitemap 配置
 * 
 * 此文件会自动生成网站的 sitemap.xml
 * 
 * 添加新页面的方法：
 * 1. 静态页面：在 staticPages 数组中添加新条目
 * 2. 博客文章：自动从 headcanon-generator-blogs/ 目录读取，无需手动添加
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
]

export default function sitemap(): MetadataRoute.Sitemap {
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
  const blogPagesSitemap: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  
  // 合并所有页面
  return [...staticPagesSitemap, ...blogPagesSitemap]
}

