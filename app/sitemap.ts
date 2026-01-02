import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // 确保使用完整的URL，包括协议和域名
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.headcanonforge.com'
  
  // 确保baseUrl是完整的URL格式，移除末尾的斜杠
  let siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  siteUrl = siteUrl.replace(/\/$/, '') // 移除末尾的斜杠
  
  // 获取当前日期作为最后修改时间
  const now = new Date()
  
  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${siteUrl}/character-headcanon`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${siteUrl}/relationship-headcanon`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
  ]
}

